"""
meme_new/ 이미지를 memit.cloud API를 통해 업로드하는 스크립트
- 제목: 밈카드N (기존 DB에 이어서 번호 매김)
- 갤러리: '밈카드2' (없으면 자동 생성)
- 작성자: devuser

사용법 (프로젝트 루트에서):
  python3 seed_meme_new.py
"""
import os
import requests
from pathlib import Path
from dotenv import dotenv_values

# ── .env.local 로드 (없으면 환경변수에서 읽음) ────────
_env = dotenv_values(Path(__file__).parent / ".env.local")
def _e(key: str, default: str = "") -> str:
    return _env.get(key) or os.environ.get(key) or default

# ── 설정 ──────────────────────────────────────────
def _resolve_base_url() -> str:
    for scheme in ("https", "http"):
        try:
            requests.get(f"{scheme}://memit.cloud/api/memes/?limit=1", timeout=5)
            print(f"[INFO] {scheme}://memit.cloud 연결 확인")
            return f"{scheme}://memit.cloud/api"
        except requests.exceptions.ConnectionError:
            pass
    raise RuntimeError("memit.cloud 에 연결할 수 없어요 (http/https 모두 실패)")

BASE_URL   = _resolve_base_url()
EMAIL      = _e("SEED_EMAIL",    "dev@memit.com")
PASSWORD   = _e("SEED_PASSWORD", "memit1234")
USERNAME   = _e("SEED_USERNAME", "devuser")
GALLERY    = _e("SEED_GALLERY",  "밈카드2")
MEME_DIR   = Path(__file__).parent / "meme_new"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
# ────────────────────────────────────────────────


def login_or_signup(session: requests.Session) -> str:
    """토큰 반환. 계정 없으면 먼저 회원가입."""
    r = session.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    if r.status_code == 200:
        token = r.json()["access_token"]
        print(f"[AUTH] devuser 로그인 완료")
        return token

    if r.status_code == 401:
        r2 = session.post(f"{BASE_URL}/auth/signup", json={
            "email": EMAIL, "username": USERNAME, "password": PASSWORD
        })
        r2.raise_for_status()
        r3 = session.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
        r3.raise_for_status()
        token = r3.json()["access_token"]
        print(f"[AUTH] devuser 회원가입 & 로그인 완료")
        return token

    r.raise_for_status()


def get_or_create_gallery(session: requests.Session, token: str) -> int:
    """갤러리 ID 반환. 없으면 생성."""
    headers = {"Authorization": f"Bearer {token}"}

    r = session.get(f"{BASE_URL}/galleries/my", headers=headers)
    r.raise_for_status()
    for g in r.json():
        if g["name"] == GALLERY:
            print(f"[갤러리] '{GALLERY}' 확인 (id={g['id']})")
            return g["id"]

    r2 = session.post(f"{BASE_URL}/galleries/", json={"name": GALLERY}, headers=headers)
    r2.raise_for_status()
    gid = r2.json()["id"]
    print(f"[갤러리] '{GALLERY}' 생성 완료 (id={gid})")
    return gid


def next_card_number(session: requests.Session) -> int:
    """DB에 있는 밈카드N 중 가장 큰 N+1"""
    r = session.get(f"{BASE_URL}/memes/?limit=500")
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


def main():
    image_files = sorted(
        f for f in MEME_DIR.iterdir()
        if f.suffix.lower() in IMAGE_EXTS
    )
    if not image_files:
        print("[ERROR] meme_new/ 에 이미지가 없어요.")
        return
    print(f"[INFO] 이미지 {len(image_files)}개 발견")

    s = requests.Session()

    token      = login_or_signup(s)
    gallery_id = get_or_create_gallery(s, token)
    start_n    = next_card_number(s)
    headers    = {"Authorization": f"Bearer {token}"}

    added = 0
    for i, path in enumerate(image_files):
        title = f"밈카드{start_n + i}"
        mime  = "image/png" if path.suffix.lower() == ".png" else "image/jpeg"

        # 밈 업로드
        with open(path, "rb") as f:
            r = s.post(
                f"{BASE_URL}/memes/upload",
                headers=headers,
                data={"title": title, "tags": ""},
                files={"file": (path.name, f, mime)},
            )
        if not r.ok:
            print(f"  [실패] {path.name} → {r.status_code} {r.text}")
            continue

        meme_id = r.json()["id"]

        # 갤러리에 추가
        r2 = s.post(f"{BASE_URL}/galleries/{gallery_id}/memes/{meme_id}", headers=headers)
        if r2.status_code not in (200, 409):
            print(f"  [갤러리 추가 실패] meme_id={meme_id} → {r2.status_code}")
        else:
            added += 1
            print(f"  [+] {path.name} → '{title}'")

    print(f"\n완료! {added}/{len(image_files)}개 추가됨 → 갤러리 '{GALLERY}'")


if __name__ == "__main__":
    main()
