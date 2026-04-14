"""
로컬 static/uploads/ 에 저장된 밈/아바타 이미지를 GCS로 이전하고
DB의 image_url / avatar_url 을 GCS 공개 URL로 업데이트합니다.

실행 방법 (backend/ 폴더에서):
    GOOGLE_APPLICATION_CREDENTIALS=./iam-key.json \
    GCS_BUCKET_NAME=memit-bucket-yay \
    .venv/bin/python migrate_to_gcs.py
"""

import os
import sys

# 프로젝트 루트를 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from google.cloud import storage as gcs
from sqlmodel import Session, select
from app.database import engine
from app.models.meme import Meme
from app.models.user import User
from app.models.post import Post, PostComment  # noqa: F401 — needed for SQLAlchemy relationship resolution

BUCKET_NAME = os.environ.get("GCS_BUCKET_NAME", "memit-bucket-yay")
LOCAL_DIR = "static/uploads"


def upload_file(client: gcs.Client, local_path: str, blob_path: str) -> str:
    ext = os.path.splitext(local_path)[1].lower()
    content_type = "image/jpeg" if ext in (".jpg", ".jpeg") else f"image/{ext.lstrip('.')}"

    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(blob_path)
    with open(local_path, "rb") as f:
        blob.upload_from_file(f, content_type=content_type)
    return f"https://storage.googleapis.com/{BUCKET_NAME}/{blob_path}"


def migrate():
    client = gcs.Client()

    with Session(engine) as session:
        # ── 밈 이미지 마이그레이션 ───────────────────────────────
        memes = session.exec(
            select(Meme).where(Meme.image_url.startswith("/static/uploads/"))
        ).all()

        print(f"\n[밈] {len(memes)}개 발견")
        for i, meme in enumerate(memes, 1):
            filename = meme.image_url.removeprefix("/static/uploads/")
            local_path = os.path.join(LOCAL_DIR, filename)

            if not os.path.exists(local_path):
                print(f"  [{i}/{len(memes)}] SKIP (파일 없음): {filename}")
                continue

            gcs_url = upload_file(client, local_path, f"uploads/{filename}")
            meme.image_url = gcs_url
            session.add(meme)
            print(f"  [{i}/{len(memes)}] OK  {filename}")
            print(f"              → {gcs_url}")

        # ── 아바타 이미지 마이그레이션 ──────────────────────────
        users = session.exec(
            select(User).where(User.avatar_url.startswith("/static/uploads/"))
        ).all()

        print(f"\n[아바타] {len(users)}개 발견")
        for i, user in enumerate(users, 1):
            filename = user.avatar_url.removeprefix("/static/uploads/")
            local_path = os.path.join(LOCAL_DIR, filename)

            if not os.path.exists(local_path):
                print(f"  [{i}/{len(users)}] SKIP (파일 없음): {filename}")
                continue

            gcs_url = upload_file(client, local_path, f"avatars/{filename}")
            user.avatar_url = gcs_url
            session.add(user)
            print(f"  [{i}/{len(users)}] OK  {filename}")
            print(f"              → {gcs_url}")

        session.commit()
        print("\n마이그레이션 완료!")


if __name__ == "__main__":
    migrate()
