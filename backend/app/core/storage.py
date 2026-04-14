import uuid
import os
from google.cloud import storage as gcs
from ..config import settings


def upload_to_gcs(file_bytes: bytes, original_filename: str, folder: str = "uploads") -> str:
    """
    파일을 GCS 버킷에 업로드하고 공개 URL을 반환합니다.
    GOOGLE_APPLICATION_CREDENTIALS 환경변수가 자동으로 인증에 사용됩니다.
    """
    ext = os.path.splitext(original_filename)[1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    blob_path = f"{folder}/{filename}"

    client = gcs.Client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    blob = bucket.blob(blob_path)

    content_type = "image/jpeg" if ext in (".jpg", ".jpeg") else f"image/{ext.lstrip('.')}"
    blob.upload_from_string(file_bytes, content_type=content_type)

    return f"https://storage.googleapis.com/{settings.GCS_BUCKET_NAME}/{blob_path}"
