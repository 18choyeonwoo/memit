# Memit 배포 문서 - Day 5

GCP VM(Ubuntu) 환경에 Docker Compose 기반으로 Memit 서비스를 배포한 전 과정을 정리합니다.
GCS 이미지 스토리지 연동, 로컬 DB 데이터 이전, 트러블슈팅 포함.

---

## 0. 배포 아키텍처

```
인터넷
  │
  ▼
[GCP VM : 104.197.144.27]
  │
  ▼
[Nginx :80]  ← 리버스 프록시
  ├── /api/*  →  [FastAPI backend :8000]  →  [PostgreSQL :5432]
  │                      │
  │                      └── GCS (이미지 업/다운로드)
  └── /*      →  [React (Nginx) :80]
```

### 사용 스택
| 구분 | 기술 |
|------|------|
| 컨테이너 오케스트레이션 | Docker Compose |
| 웹 서버 / 리버스 프록시 | Nginx (alpine) |
| 백엔드 | FastAPI + Uvicorn |
| 프론트엔드 | React (Vite) → Nginx로 정적 서빙 |
| DB | PostgreSQL 15 |
| 이미지 스토리지 | Google Cloud Storage (memit-bucket-yay) |

---

## 1. 배포 준비 — 코드 수정 사항

### 1-1. 환경변수 분리

| 파일 | 용도 |
|------|------|
| `frontend/.env` | 로컬 개발용 (`VITE_API_BASE_URL=http://localhost:8000`) |
| `frontend/.env.production` | 빌드 시 자동 적용 (`VITE_API_BASE_URL=/api`) |
| `backend/.env` | 로컬 개발용 |
| `backend/.env.production` | VM 배포용 (Docker Compose가 읽음) |

**`backend/.env.production`**
```env
DATABASE_URL=postgresql://postgres:password@db:5432/memit_db
SECRET_KEY=<랜덤 시크릿>
GCS_BUCKET_NAME=memit-bucket-yay
GOOGLE_APPLICATION_CREDENTIALS=/app/iam-key.json
ALLOWED_ORIGINS=http://104.197.144.27
```

### 1-2. CORS 동적 설정 (`backend/app/config.py`)

```python
class Settings(BaseSettings):
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]
```

`main.py`에서 `settings.allowed_origins_list` 사용 → 환경변수 하나로 복수 오리진 관리.

### 1-3. GCS 이미지 업로드 분기 (`backend/app/core/storage.py`)

```python
def upload_to_gcs(file_bytes, original_filename, folder="uploads"):
    ext = os.path.splitext(original_filename)[1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    blob_path = f"{folder}/{filename}"

    client = gcs.Client()   # GOOGLE_APPLICATION_CREDENTIALS 자동 인식
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    blob = bucket.blob(blob_path)
    blob.upload_from_string(file_bytes, content_type=...)

    return f"https://storage.googleapis.com/{settings.GCS_BUCKET_NAME}/{blob_path}"
```

> **주의**: `blob.make_public()` 은 uniform bucket-level access 환경에서 사용 불가.
> 대신 버킷 IAM에 `allUsers: roles/storage.objectViewer` 정책을 설정하고 URL을 직접 조합.

업로드 분기 (`memes.py`, `users.py`):
```python
if settings.GCS_BUCKET_NAME:
    image_url = upload_to_gcs(contents, file.filename)
else:
    # 로컬 static/uploads/ 저장
    ...
```

### 1-4. Frontend API Base URL (`frontend/src/api/apiClient.js`)

```js
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
```

Vite 빌드 시 `.env.production`의 `/api` 값이 번들에 포함됨.

---

## 2. Docker 구성

### `docker-compose.yml` (루트)

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: memit_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    env_file: ./backend/.env.production
    environment:
      GOOGLE_APPLICATION_CREDENTIALS: /app/iam-key.json
    volumes:
      - ./backend/iam-key.json:/app/iam-key.json:ro
      - ./backend/static:/app/static
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_BASE_URL: /api

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
```

### `nginx/default.conf`

```nginx
server {
    listen 80;
    server_name 104.197.144.27;

    location /api/ {
        proxy_pass http://backend:8000/;   # 뒤 슬래시가 /api/ 접두사를 제거
    }

    location /static/ {
        proxy_pass http://backend:8000/static/;
    }

    location / {
        proxy_pass http://frontend:80/;
    }
}
```

> **핵심**: `proxy_pass` 에 trailing slash(`/`) 가 있어야 `/api/` 접두사가 제거된 채로 백엔드에 전달됨.

### `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `frontend/Dockerfile` (멀티스테이지)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

## 3. GCS 버킷 설정

### IAM 공개 읽기 허용 (Python)

```python
from google.cloud import storage
client = storage.Client()
bucket = client.bucket('memit-bucket-yay')
policy = bucket.get_iam_policy(requested_policy_version=3)
policy.bindings.append({
    'role': 'roles/storage.objectViewer',
    'members': {'allUsers'}
})
bucket.set_iam_policy(policy)
```

> uniform bucket-level access가 켜진 버킷은 Object ACL 불가 → IAM 정책으로만 공개 설정 가능.

---

## 4. 기존 로컬 이미지 → GCS 마이그레이션

### 배경
- 로컬 개발 중 `static/uploads/`에 저장된 밈 이미지 106개 + 아바타 1개
- DB의 `image_url`이 `/static/uploads/filename` 형태 → GCS URL로 일괄 변환 필요

### 마이그레이션 스크립트 (`backend/migrate_to_gcs.py`)

실행 방법:
```bash
cd backend
GOOGLE_APPLICATION_CREDENTIALS=./iam-key.json \
GCS_BUCKET_NAME=memit-bucket-yay \
.venv/bin/python migrate_to_gcs.py
```

동작:
1. DB에서 `image_url LIKE '/static/uploads/%'` 인 Meme 레코드 조회
2. 로컬 파일을 GCS `uploads/` 폴더에 업로드
3. DB의 `image_url`을 GCS 공개 URL로 업데이트
4. User 테이블의 `avatar_url`도 동일하게 처리

> **주의**: User 모델이 Post와 관계를 맺고 있어 `Post, PostComment`도 임포트해야 SQLAlchemy 관계 해석 오류 방지.

### 이미지 폴더 git 정리

```bash
# .gitignore에 추가
meme/
meme_new/

# git 트래킹 해제 (로컬 파일은 유지)
git rm --cached -r meme/ meme_new/
git commit -m "Remove meme image folders from tracking (migrated to GCS)"
git push origin dev
```

---

## 5. VM 배포 절차

### 5-1. VM에 코드 올리기

```bash
# 로컬에서
git push origin dev

# VM에서
git pull
```

### 5-2. IAM 키 파일 전달

`iam-key.json`은 `.gitignore`에 있어 git으로 전송 불가. 대안:

**방법 A — GCS 경유 (gsutil)**
```bash
# 로컬
gcloud compute scp ./backend/iam-key.json <user>@<instance>:~/memit/backend/iam-key.json --project=memit

# 또는 Python으로 GCS 업로드 후 VM에서 다운로드
gsutil cp gs://memit-bucket-yay/temp/iam-key.json ~/memit/backend/iam-key.json
```

**방법 B — VM 콘솔에서 직접 붙여넣기**
```bash
# VM 콘솔에서
cat > ~/memit/backend/iam-key.json << 'EOF'
{ ... JSON 내용 붙여넣기 ... }
EOF
```

> **주의**: Docker volume mount 대상 파일이 없으면 Docker가 자동으로 **디렉토리**를 생성함.
> 이 상태에서 컨테이너 기동 시 `IsADirectoryError` 발생 → 반드시 파일이 먼저 존재해야 함.

### 5-3. 서비스 기동

```bash
cd ~/memit
docker compose up -d --build
```

### 5-4. VM에서 초기 계정 생성

```bash
docker compose exec backend python -c "
from app.models.post import Post, PostComment  # 관계 해석용
from app.database import engine
from app.models.user import User
from app.core.security import get_password_hash
from sqlmodel import Session

with Session(engine) as s:
    u = User(
        email='dev@memit.com',
        username='devuser',
        hashed_password=get_password_hash('memit1234')
    )
    s.add(u)
    s.commit()
    print('계정 생성 완료:', u.email)
"
```

### 5-5. 로컬 DB → VM DB 이전

```bash
# 로컬: 로컬 DB 컨테이너에서 덤프
docker exec <db_container> pg_dump -U postgres memit_db > memit_dump.sql

# 로컬: GCS에 업로드
python -c "
from google.cloud import storage
client = storage.Client()
bucket = client.bucket('memit-bucket-yay')
bucket.blob('temp/memit_dump.sql').upload_from_filename('memit_dump.sql')
"

# VM: 다운로드 후 복원
gsutil cp gs://memit-bucket-yay/temp/memit_dump.sql ~/memit_dump.sql

docker compose stop backend
docker compose exec db psql -U postgres -c "DROP DATABASE memit_db;"
docker compose exec db psql -U postgres -c "CREATE DATABASE memit_db;"
docker compose exec -T db psql -U postgres memit_db < ~/memit_dump.sql
docker compose start backend

# GCS 임시 파일 삭제
gsutil rm gs://memit-bucket-yay/temp/memit_dump.sql
```

> **주의**: `DROP DATABASE` 실행 전 반드시 백엔드를 먼저 내려야 함.
> 백엔드가 살아있으면 DB 세션이 물려 있어 `ERROR: database is being accessed by other users` 발생.

---

## 6. 트러블슈팅

### 6-1. `IsADirectoryError: /app/iam-key.json`

**원인**: `iam-key.json`이 VM에 없는 상태에서 Docker가 디렉토리를 자동 생성.

**해결**:
```bash
rm -rf ~/memit/backend/iam-key.json   # 잘못 생성된 디렉토리 제거
# 파일 생성 후
docker compose down && docker compose up -d
```

### 6-2. GCS `blob.make_public()` → `400 BadRequest`

**원인**: 버킷에 uniform bucket-level access 활성화 → Object ACL 사용 불가.

**해결**: `make_public()` 제거, URL 직접 조합 + 버킷 IAM에 allUsers 읽기 권한 부여.

```python
# 변경 전
blob.make_public()
return blob.public_url

# 변경 후
return f"https://storage.googleapis.com/{BUCKET_NAME}/{blob_path}"
```

### 6-3. SQLAlchemy `InvalidRequestError: 'Post' failed to locate a name`

**원인**: User 모델이 Post와 관계를 갖는데, Post 모델을 임포트하지 않으면 관계 해석 실패.

**해결**: 스크립트 실행 시 Post 모델도 함께 임포트.
```python
from app.models.post import Post, PostComment  # noqa
```

### 6-4. `passlib` bcrypt 버전 충돌

**원인**: 최신 bcrypt 라이브러리와 passlib 호환 문제. `module 'bcrypt' has no attribute '__about__'`

**해결**: passlib 대신 앱에서 실제 사용하는 `app.core.security.get_password_hash` 함수 직접 사용.

### 6-5. `ERROR: database is being accessed by other users`

**원인**: 백엔드 컨테이너가 DB 연결을 유지한 채 DROP 시도.

**해결**:
```bash
docker compose stop backend
docker compose exec db psql -U postgres -c "DROP DATABASE memit_db;"
```

### 6-6. pg_dump 결과가 26줄 (빈 DB)

**원인**: `docker compose up -d db`를 다른 디렉토리에서 실행 → 새 볼륨 생성.
실제 데이터는 `backend_postgres_data` 볼륨에 존재.

**해결**: 볼륨 이름 확인 후 해당 볼륨을 마운트한 임시 컨테이너에서 덤프.
```bash
docker volume ls | grep postgres

docker run --rm -d --name temp_pg \
  -e POSTGRES_DB=memit_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -v backend_postgres_data:/var/lib/postgresql/data \
  postgres:15

docker exec temp_pg pg_dump -U postgres memit_db > memit_dump.sql
docker stop temp_pg
```

---

## 7. .gitignore 정책

```gitignore
# 인증 키 (절대 커밋 금지)
iam-key.json

# 업로드 이미지 (GCS로 이전 완료)
backend/static/uploads/*
!backend/static/uploads/.gitkeep
meme/
meme_new/

# 기타
backend/.env
backend/.venv/
frontend/node_modules/
frontend/dist/
```

---

## 8. 유용한 명령어 모음

```bash
# 전체 서비스 기동 (이미지 재빌드 포함)
docker compose up -d --build

# 특정 서비스만 재시작
docker compose restart backend

# 로그 확인
docker compose logs backend --tail=50
docker compose logs -f nginx

# 컨테이너 내부 접속
docker compose exec backend bash
docker compose exec db psql -U postgres memit_db

# 볼륨 목록
docker volume ls

# 전체 중단 (볼륨 유지)
docker compose down

# 전체 중단 + 볼륨 삭제 (주의!)
docker compose down -v

# GCS 파일 복사
gsutil cp <로컬파일> gs://<버킷>/경로
gsutil cp gs://<버킷>/경로 <로컬파일>
gsutil rm gs://<버킷>/경로
```
