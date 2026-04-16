"""
meme_new/ 폴더를 감시하다가 새 이미지가 생기면 자동으로 서버에 업로드

흐름:
  1. meme_new/ 에 이미지 저장
  2. 이 스크립트가 감지 → 10초 대기 (파일 추가 중일 수 있으니) → 배치 업로드
  3. devuser 작성자, 새 갤러리(밈카드배치N) 자동 생성
  4. 웹에서 밈 수정 후 meme_new/ → meme/ 로 직접 이동
  5. 다음 배치 반복

사용법:
  python3 watch_meme_new.py
  (종료: Ctrl+C)
"""
import os
import time
import json
import requests
from pathlib import Path
from dotenv import dotenv_values

# ── .env.local 로드 ──────────────────────────────
_env = dotenv_values(Path(__file__).parent / ".env.local")
def _e(key: str, default: str = "") -> str:
    return _env.get(key) or os.environ.get(key) or default

# ── 설정 ────────────────────────────────────────
MEME_DIR    = Path(__file__).parent / "meme_new"
STATE_FILE  = Path(__file__).parent / ".meme_watch_state.json"
EMAIL       = _e("SEED_EMAIL",    "dev@memit.com")
PASSWORD    = _e("SEED_PASSWORD", "memit1234")
IMAGE_EXTS  = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
POLL_SEC    = 5
DEBOUNCE    = 10
# ────────────────────────────────────────────────


# ── 상태 파일 (업로드 완료된 파일명 저장) ─────────
def load_state() -> set:
    if STATE_FILE.exists():
        return set(json.loads(STATE_FILE.read_text(encoding="utf-8")))
    return set()

def save_state(uploaded: set):
    STATE_FILE.write_text(json.dumps(sorted(uploaded), ensure_ascii=False, indent=2), encoding="utf-8")
# ──────────────────────────────────────────────


def resolve_base_url() -> str:
    for scheme in ("https", "http"):
        try:
            requests.get(f"{scheme}://memit.cloud/api/memes/?limit=1", timeout=5)
            return f"{scheme}://memit.cloud/api"
        except requests.exceptions.ConnectionError:
            pass
    raise RuntimeError("memit.cloud 에 연결할 수 없어요")


def login(s: requests.Session, base: str) -> str:
    r = s.post(f"{base}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    r.raise_for_status()
    return r.json()["access_token"]


def next_gallery_name(s: requests.Session, base: str, token: str) -> str:
    """기존 갤러리에서 '밈카드배치N' 최대 N 찾아 +1"""
    headers = {"Authorization": f"Bearer {token}"}
    r = s.get(f"{base}/galleries/my", headers=headers)
    r.raise_for_status()
    max_n = 0
    for g in r.json():
        name = g.get("name", "")
        if name.startswith("밈카드배치"):
            try:
                max_n = max(max_n, int(name[5:]))
            except ValueError:
                pass
    return f"밈카드배치{max_n + 1}"


def next_card_number(s: requests.Session, base: str) -> int:
    """기존 밈카드N 최대값 +1"""
    r = s.get(f"{base}/memes/?limit=500")
    r.raise_for_status()
    max_n = 0
    for m in r.json():
        t = m.get("title", "")
        if t.startswith("밈카드"):
            try:
                max_n = max(max_n, int(t[3:]))
            except ValueError:
                pass
    return max_n + 1


def upload_batch(files: list[Path]):
    print(f"\n[업로드 시작] {len(files)}개 파일")
    base = resolve_base_url()
    s = requests.Session()

    token = login(s, base)
    headers = {"Authorization": f"Bearer {token}"}

    gallery_name = next_gallery_name(s, base, token)
    r = s.post(f"{base}/galleries/", json={"name": gallery_name}, headers=headers)
    r.raise_for_status()
    gallery_id = r.json()["id"]
    print(f"[갤러리] '{gallery_name}' 생성 (id={gallery_id})")

    start_n = next_card_number(s, base)
    uploaded = []

    for i, path in enumerate(sorted(files)):
        title = f"밈카드{start_n + i}"
        mime  = "image/png" if path.suffix.lower() == ".png" else "image/jpeg"

        with open(path, "rb") as f:
            r = s.post(
                f"{base}/memes/upload",
                headers=headers,
                data={"title": title, "tags": ""},
                files={"file": (path.name, f, mime)},
            )
        if not r.ok:
            print(f"  [실패] {path.name} → {r.status_code}")
            continue

        meme_id = r.json()["id"]
        s.post(f"{base}/galleries/{gallery_id}/memes/{meme_id}", headers=headers)
        uploaded.append(path.name)
        print(f"  [+] {path.name} → '{title}'")

    print(f"[완료] {len(uploaded)}/{len(files)}개 → 갤러리 '{gallery_name}'")
    print(f"  → 웹에서 밈 수정 후 meme_new/ 이미지를 meme/ 로 옮겨주세요\n")
    return uploaded


def main():
    print("=== meme_new 워처 시작 ===")
    print(f"  감시 폴더: {MEME_DIR}")
    print(f"  업로드 대기: {DEBOUNCE}초 (새 파일 발견 후)")
    print("  종료: Ctrl+C\n")

    uploaded_set = load_state()
    pending_since: float | None = None  # 새 파일 처음 발견한 시각

    while True:
        try:
            current_files = {
                f.name for f in MEME_DIR.iterdir()
                if f.suffix.lower() in IMAGE_EXTS
            }
        except FileNotFoundError:
            time.sleep(POLL_SEC)
            continue

        new_files = current_files - uploaded_set

        if new_files:
            if pending_since is None:
                pending_since = time.time()
                print(f"[감지] 새 파일 {len(new_files)}개 — {DEBOUNCE}초 후 업로드합니다...")

            elif time.time() - pending_since >= DEBOUNCE:
                # 디바운스 완료 → 업로드
                paths = [MEME_DIR / name for name in new_files if (MEME_DIR / name).exists()]
                if paths:
                    done = upload_batch(paths)
                    uploaded_set.update(done)
                    save_state(uploaded_set)
                pending_since = None
        else:
            if pending_since is not None:
                # 파일이 사라졌으면 (meme/로 옮겨진 경우) 카운트 리셋
                pending_since = None

        # meme/ 로 옮겨진 파일은 상태에서도 제거 (다음 배치 준비)
        moved_away = uploaded_set - current_files
        if moved_away:
            uploaded_set -= moved_away
            save_state(uploaded_set)
            print(f"[정리] {len(moved_away)}개 파일이 meme_new/ 에서 제거됨 → 다음 배치 준비 완료")

        time.sleep(POLL_SEC)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n워처 종료")
