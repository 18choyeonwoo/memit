# Memit Backend — 기능 현황 및 로드맵

> 기준일: 2026-04-10  
> 스택: FastAPI · SQLModel · PostgreSQL · JWT (HS256)

---

## 1. 현재 구현된 기능

### 1-1. 인증 (Auth) `/auth`

| Method | Endpoint | 인증 필요 | 설명 |
|--------|----------|-----------|------|
| POST | `/auth/signup` | ✗ | 회원가입 (이메일 · 유저네임 중복 검사) |
| POST | `/auth/login` | ✗ | 로그인 → JWT 액세스 토큰 발급 |

**세부 사항**
- 비밀번호: bcrypt 해싱 저장
- 토큰: HS256 JWT, 기본 만료 30일 (`ACCESS_TOKEN_EXPIRE_MINUTES=43200`)
- 토큰 payload: `{ "sub": "<email>", "exp": <timestamp> }`

---

### 1-2. 밈 (Memes) `/memes`

| Method | Endpoint | 인증 필요 | 설명 |
|--------|----------|-----------|------|
| POST | `/memes/upload` | ✓ | 이미지 업로드 + 밈 생성 (multipart/form-data) |
| GET | `/memes/` | ✗ | 전체 밈 목록 (최신순, pagination) |
| GET | `/memes/recommended` | ✗ | 추천 밈 (좋아요 많은 순, 기본 10개) |
| GET | `/memes/{meme_id}` | ✗ | 밈 단건 조회 |

**업로드 상세**
- 파일 검증: `Content-Type: image/*` 여부 확인
- 저장 경로: `backend/static/uploads/{uuid}.{ext}`
- DB 저장 URL: `/static/uploads/{uuid}.{ext}`
- 태그: 쉼표 구분 문자열 입력 → Tag 테이블에 upsert 후 N:M 연결

**DB 컬럼 (Meme)**
```
id, title, image_url, description, likes_count, created_at, user_id
```

---

### 1-3. 좋아요 (Likes) `/memes/{meme_id}/like`

| Method | Endpoint | 인증 필요 | 설명 |
|--------|----------|-----------|------|
| POST | `/memes/{meme_id}/like` | ✓ | 좋아요 토글 (없으면 추가 / 있으면 취소) |

**응답 예시**
```json
{ "liked": true, "likes_count": 42 }
```

**구현 방식**
- `MemeLike` 테이블: `(user_id, meme_id)` 복합 PK
- 좋아요 추가 시 `Meme.likes_count += 1`, 취소 시 `-1` (최솟값 0)
- 단일 트랜잭션으로 처리

---

### 1-4. 갤러리 (Galleries) `/galleries`

| Method | Endpoint | 인증 필요 | 설명 |
|--------|----------|-----------|------|
| POST | `/galleries/` | ✓ | 갤러리 생성 |
| GET | `/galleries/my` | ✓ | 내 갤러리 목록 조회 |
| GET | `/galleries/{gallery_id}` | ✗ | 갤러리 상세 + 포함된 밈 목록 |
| POST | `/galleries/{gallery_id}/memes/{meme_id}` | ✓ | 갤러리에 밈 추가 |

**권한 규칙**
- 갤러리에 밈 추가: 본인 갤러리만 가능 (403 반환)
- 중복 추가 시 409 반환

---

### 1-5. 데이터베이스 스키마

```
User
├── id, email(unique), username(unique), hashed_password
├── avatar_url, bio, status_message
├── likes_received, followers_count, following_count
└── → memes (1:N), liked_memes (N:M via MemeLike), galleries (1:N)

Meme
├── id, title, image_url, description, likes_count, created_at
├── user_id (FK → User)
└── → tags (N:M via MemeTagLink), likes (N:M via MemeLike)

Tag
└── id, name(unique)

MemeLike       (user_id PK, meme_id PK, created_at)
MemeTagLink    (meme_id PK, tag_id PK)

Gallery
├── id, name, description, created_at
├── user_id (FK → User)
└── → memes (N:M via MemeGalleryLink)

MemeGalleryLink (gallery_id PK, meme_id PK)
```

---

### 1-6. 인프라 · 공통

| 항목 | 내용 |
|------|------|
| 인증 미들웨어 | `core/deps.py` — `get_current_user` (OAuth2PasswordBearer) |
| 정적 파일 서빙 | `GET /static/uploads/*` (FastAPI StaticFiles) |
| CORS | 전체 허용 (`*`) — 개발 환경 전용 |
| DB 초기화 | 서버 startup 이벤트에서 `SQLModel.metadata.create_all()` |

---

## 2. 추가 구현 추천 기능

### 우선순위 높음 (서비스 기본 동작에 필요)

#### 2-1. 유저 프로필 API
현재 User 모델에 필드는 존재하지만 수정/조회 엔드포인트가 없음.

```
GET  /users/me            — 내 프로필 조회
PUT  /users/me            — 프로필 수정 (bio, status_message)
POST /users/me/avatar     — 아바타 이미지 업로드
GET  /users/{username}    — 타 유저 프로필 + 업로드한 밈 목록
```

#### 2-2. 밈 수정 · 삭제
현재 업로드(생성)만 가능하며, 본인 밈 관리 불가.

```
PUT    /memes/{meme_id}   — 제목 · 설명 · 태그 수정 (본인만)
DELETE /memes/{meme_id}   — 밈 삭제 + 업로드 파일 제거 (본인만)
```

#### 2-3. 태그 기반 검색 · 필터링
Tag 테이블이 이미 존재하지만 활용 엔드포인트가 없음.

```
GET /memes/?tag=funny            — 태그로 필터링
GET /memes/?q=고양이              — 제목/설명 키워드 검색
GET /tags/                       — 태그 목록 + 사용 빈도
GET /tags/{name}/memes           — 특정 태그의 밈 목록
```

#### 2-4. 갤러리 수정 · 삭제 · 밈 제거

```
PUT    /galleries/{id}                          — 이름 · 설명 수정
DELETE /galleries/{id}                          — 갤러리 삭제
DELETE /galleries/{id}/memes/{meme_id}          — 갤러리에서 밈 제거
```

---

### 우선순위 중간 (사용자 경험 향상)

#### 2-5. 팔로우 시스템
User 모델에 `followers_count`, `following_count` 필드가 이미 있으나 로직 없음.

```
POST   /users/{username}/follow    — 팔로우
DELETE /users/{username}/follow    — 언팔로우
GET    /users/{username}/followers — 팔로워 목록
GET    /users/{username}/following — 팔로잉 목록
GET    /memes/feed                 — 팔로잉한 유저의 최신 밈 피드
```

**필요한 모델**: `UserFollow (follower_id PK, following_id PK, created_at)`

#### 2-6. 댓글 시스템

```
POST   /memes/{id}/comments        — 댓글 작성
GET    /memes/{id}/comments        — 댓글 목록 (페이지네이션)
DELETE /comments/{comment_id}      — 댓글 삭제 (본인 또는 밈 작성자)
```

**필요한 모델**: `Comment (id, content, created_at, user_id, meme_id)`

#### 2-7. 좋아요 상태 확인
현재 좋아요 토글만 있어 클라이언트에서 현재 상태 파악 불가.

```
GET /memes/{id}/like/status    — 로그인 유저의 좋아요 여부 반환
```

또는 `GET /memes/{id}` 응답에 `is_liked: bool` 필드 추가.

#### 2-8. 토큰 갱신 · 로그아웃

```
POST /auth/refresh     — Refresh Token으로 Access Token 재발급
POST /auth/logout      — 토큰 블랙리스트 등록 (Redis 필요)
```

---

### 우선순위 낮음 (확장 · 최적화)

#### 2-9. 알림 시스템
```
GET  /notifications          — 알림 목록 (좋아요, 팔로우, 댓글)
POST /notifications/read-all — 전체 읽음 처리
```
**필요한 모델**: `Notification (id, type, actor_id, target_id, is_read, created_at)`

#### 2-10. 관리자 API
```
GET    /admin/users          — 전체 유저 관리
DELETE /admin/memes/{id}     — 신고된 밈 강제 삭제
```
**필요한 처리**: User 모델에 `role: Enum("user", "admin")` 필드 추가

#### 2-11. 이미지 스토리지 마이그레이션
현재 로컬 `static/uploads/` 저장 방식 → 배포 시 필요.

- **AWS S3** 또는 **Cloudflare R2** 로 전환
- 업로드 시 `boto3` / `httpx` 로 버킷에 직접 저장
- DB에는 CDN URL 저장

#### 2-12. 속도 제한 (Rate Limiting)
```python
# 예: slowapi 라이브러리 활용
@limiter.limit("10/minute")
async def upload_meme(...):
```
업로드, 좋아요 토글 등 남용 가능한 엔드포인트에 적용.

#### 2-13. 페이지네이션 표준화
현재 `skip/limit` 방식 → Cursor 기반 페이지네이션으로 개선 시 대용량 데이터에서 성능 향상.

```json
{
  "data": [...],
  "next_cursor": "eyJpZCI6IDUwfQ==",
  "has_more": true
}
```

---

## 3. 기술 부채

| 항목 | 현황 | 권장 조치 |
|------|------|-----------|
| DB 마이그레이션 | `create_all()` 직접 실행 (스키마 변경 추적 불가) | Alembic 마이그레이션 도입 (`alembic init`, `revision --autogenerate`) |
| 테스트 | 없음 | `pytest` + `httpx.AsyncClient` + 테스트 전용 DB 설정 |
| CORS | 전체 허용 (`*`) | 프론트엔드 도메인만 허용하도록 변경 |
| 파일 크기 제한 | 없음 | 업로드 파일 최대 크기 제한 추가 (예: 10MB) |
| `likes_received` 타입 | `str = "0"` (문자열) | `int = 0` 으로 통일 |
