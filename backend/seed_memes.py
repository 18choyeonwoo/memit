"""
meme/ 폴더 이미지를 DB에 등록하는 시드 스크립트
사용법: backend/ 디렉터리에서 실행
  python seed_memes.py
"""
import os
import shutil
import sys
from pathlib import Path

# backend/ 디렉터리를 기준으로 경로 설정
BASE_DIR = Path(__file__).parent
MEME_SOURCE_DIR = BASE_DIR.parent / "meme"
UPLOAD_DIR = BASE_DIR / "static" / "uploads"

def make_title(filename: str) -> str:
    """파일명에서 사람이 읽기 좋은 제목 생성"""
    stem = Path(filename).stem
    # meme_ 접두사 제거
    if stem.startswith("meme_"):
        stem = stem[5:]
    # 언더스코어/하이픈 → 공백, 첫 글자 대문자
    title = stem.replace("_", " ").replace("-", " ").strip()
    return title.capitalize() if title else stem

def main():
    if not MEME_SOURCE_DIR.exists():
        print(f"[ERROR] meme/ 폴더를 찾을 수 없어요: {MEME_SOURCE_DIR}")
        sys.exit(1)

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # DB 연결 (backend/ 내부 모듈 사용)
    sys.path.insert(0, str(BASE_DIR))
    os.chdir(BASE_DIR)  # .env 파일을 찾기 위해 backend/ 디렉터리로 이동

    from sqlmodel import Session, select
    from app.database import engine, init_db
    from app.models.meme import Meme
    from app.models.user import User
    from app.core.security import get_password_hash

    init_db()

    image_exts = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".JPG", ".JPEG", ".PNG"}
    image_files = [f for f in MEME_SOURCE_DIR.iterdir() if f.suffix in image_exts]

    if not image_files:
        print("[INFO] meme/ 폴더에 이미지가 없어요.")
        return

    with Session(engine) as session:
        # 시드용 유저 확보 (첫 번째 유저 또는 새로 생성)
        seed_user = session.exec(select(User)).first()
        if not seed_user:
            seed_user = User(
                email="seed@memit.app",
                username="memit",
                hashed_password=get_password_hash("memit1234!"),
            )
            session.add(seed_user)
            session.commit()
            session.refresh(seed_user)
            print(f"[INFO] 시드 유저 생성: {seed_user.username} (id={seed_user.id})")
        else:
            print(f"[INFO] 기존 유저 사용: {seed_user.username} (id={seed_user.id})")

        # 이미 등록된 image_url 목록 (중복 방지)
        existing_urls = set(
            row[0] for row in session.exec(
                select(Meme.image_url)
            ).all()
        )

        added = 0
        skipped = 0

        for src_path in sorted(image_files):
            dest_name = src_path.name
            dest_path = UPLOAD_DIR / dest_name
            image_url = f"/static/uploads/{dest_name}"

            # 이미 DB에 같은 경로로 등록되어 있으면 스킵
            if image_url in existing_urls:
                skipped += 1
                continue

            # 파일 복사 (이미 있어도 덮어쓰기)
            shutil.copy2(src_path, dest_path)

            meme = Meme(
                title=make_title(src_path.name),
                image_url=image_url,
                user_id=seed_user.id,
            )
            session.add(meme)
            existing_urls.add(image_url)
            added += 1
            print(f"  [+] {src_path.name} → '{meme.title}'")

        session.commit()

    print(f"\n완료! 추가: {added}개 / 스킵(중복): {skipped}개")

if __name__ == "__main__":
    main()
