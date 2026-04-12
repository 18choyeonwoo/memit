# Memit Backend API 명세서

> 이 문서는 **Memit 프로젝트 백엔드 REST API** 명세입니다.
> 프론트엔드 ↔︎ 백엔드 간의 통신 규약을 정의합니다.

---

## 전체 흐름 요약

```
[프론트엔드]
    ↓  요청 (JWT 토큰 포함 또는 미포함)
[백엔드 FastAPI]
    ↓  1. JWT 인증/권한 검증 (인증 필요 라우트)
    ↓  2. Pydantic 스키마 유효성 검사
    ↓  3. SQLModel을 통해 SQLite DB 조회/수정
    ↓  4. 응답 포맷으로 변환 후 반환
[프론트엔드]
```

### 핵심 역할 분리

| 주체 | 역할 |
| --- | --- |
| **프론트엔드** | UI 렌더링, JWT 토큰 로컬 저장, API 요청 발송 |
| **백엔드** | 인증/권한 검증, DB CRUD, 파일 업로드/서빙, 비즈니스 로직 |

---

## 공통 규칙

### Base URL

```
http://localhost:8000
```

### 인증 방식

인증이 필요한 엔드포인트는 요청 헤더에 JWT Bearer 토큰을 포함해야 합니다.

```
Authorization: Bearer {access_token}
```

토큰은 `POST /auth/login` 응답의 `access_token` 값을 사용합니다.

### 공통 요청 헤더

```
Content-Type: application/json   # JSON 요청 시
Content-Type: multipart/form-data  # 파일 업로드 시
```

### 공통 에러 응답

```json
{
  "detail": "에러 설명 메시지"
}
```

| HTTP 상태코드 | 설명 |
| --- | --- |
| `400` | 잘못된 요청 (중복 이메일/사용자명, 이미지 아닌 파일 등) |
| `401` | 인증 실패 (토큰 없음, 유효하지 않은 토큰, 잘못된 비밀번호) |
| `403` | 권한 없음 (본인 소유가 아닌 리소스 수정/삭제 시도) |
| `404` | 리소스를 찾을 수 없음 |
| `409` | 충돌 (갤러리에 이미 추가된 밈 재추가 시도) |
| `422` | 유효성 검사 실패 (Pydantic 스키마 오류) |

---

## API 명세

---

## 1. 인증 (Auth)

---

### 1-1. 회원가입

### `POST /auth/signup`

> 이메일, 사용자명, 비밀번호로 신규 계정을 생성합니다. 이메일과 사용자명은 고유해야 합니다.

- **Auth Required:** No

- **Request Body:**

```json
{
  "email": "user@example.com",
  "username": "memit_user",
  "password": "securepassword123"
}
```

**필드 설명:**

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `email` | string (EmailStr) | ✅ | 사용자 이메일 (고유값) |
| `username` | string | ✅ | 사용자명 (고유값) |
| `password` | string | ✅ | 비밀번호 (bcrypt 해시 저장) |

- **Response:** `201 Created`

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "memit_user",
  "avatar_url": null,
  "bio": null,
  "status_message": null
}
```

**필드 설명:**

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | integer | 사용자 고유 ID |
| `email` | string | 이메일 |
| `username` | string | 사용자명 |
| `avatar_url` | string \| null | 프로필 사진 URL (초기값 null) |
| `bio` | string \| null | 자기소개 (초기값 null) |
| `status_message` | string \| null | 상태 메시지 (초기값 null) |

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| --- | --- | --- |
| `400` | `"Email already registered"` | 이미 사용 중인 이메일 |
| `400` | `"Username already taken"` | 이미 사용 중인 사용자명 |

---

### 1-2. 로그인

### `POST /auth/login`

> 이메일과 비밀번호로 로그인하여 JWT 액세스 토큰을 발급받습니다.

- **Auth Required:** No

- **Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**필드 설명:**

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `email` | string (EmailStr) | ✅ | 가입된 이메일 |
| `password` | string | ✅ | 비밀번호 |

- **Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "memit_user",
    "avatar_url": null,
    "bio": null,
    "status_message": null
  }
}
```

**필드 설명:**

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `access_token` | string | JWT 토큰 (유효기간: 30일) |
| `token_type` | string | 항상 `"bearer"` |
| `user` | object | 로그인한 사용자 정보 |

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| --- | --- | --- |
| `401` | `"Incorrect email or password"` | 이메일 또는 비밀번호 불일치 |

---

## 2. 사용자 (Users)

---

### 2-1. 내 정보 조회

### `GET /users/me`

> 현재 로그인한 사용자의 프로필 정보를 조회합니다.

- **Auth Required:** Yes

- **Response:** `200 OK`

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "memit_user",
  "avatar_url": "/static/uploads/avatar_1_a3b4c5d6.png",
  "bio": "밈을 사랑하는 사람",
  "status_message": "오늘도 밈 탐험 중 🌊"
}
```

---

### 2-2. 프로필 수정

### `PUT /users/me`

> 로그인한 사용자의 프로필(자기소개, 상태 메시지, 아바타 URL)을 수정합니다. 모든 필드는 선택사항이며, 전달된 필드만 업데이트됩니다.

- **Auth Required:** Yes

- **Request Body:**

```json
{
  "bio": "밈을 사랑하는 사람",
  "status_message": "오늘도 밈 탐험 중"
}
```

**필드 설명:**

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `bio` | string \| null | ❌ | 자기소개 |
| `status_message` | string \| null | ❌ | 상태 메시지 |
| `avatar_url` | string \| null | ❌ | 아바타 이미지 URL (직접 URL 지정 시) |

> 💡 아바타 이미지 파일을 업로드하려면 `PUT /users/me` 대신 `POST /users/avatar`를 사용하세요.

- **Response:** `200 OK`

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "memit_user",
  "avatar_url": "/static/uploads/avatar_1_a3b4c5d6.png",
  "bio": "밈을 사랑하는 사람",
  "status_message": "오늘도 밈 탐험 중"
}
```

---

### 2-3. 프로필 사진(아바타) 업로드

### `POST /users/avatar`

> 프로필 사진을 이미지 파일로 업로드합니다. 서버에 파일을 저장하고 사용자의 `avatar_url`을 자동으로 업데이트합니다.

- **Auth Required:** Yes
- **Request Body:** `multipart/form-data`

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `file` | File | ✅ | 업로드할 이미지 파일 (Content-Type이 `image/*`이어야 함) |

- **Response:** `200 OK`

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "memit_user",
  "avatar_url": "/static/uploads/avatar_1_a3b4c5d6.png",
  "bio": "밈을 사랑하는 사람",
  "status_message": "오늘도 밈 탐험 중"
}
```

> 💡 저장 파일명 규칙: `avatar_{user_id}_{8자리_랜덤}{확장자}` (예: `avatar_1_a3b4c5d6.png`)

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| --- | --- | --- |
| `400` | `"File must be an image"` | 이미지가 아닌 파일 업로드 시도 |

---

## 3. 밈 (Memes)

---

### 3-1. 밈 업로드

### `POST /memes/upload`

> 이미지 파일과 함께 밈을 업로드합니다. 태그를 함께 등록할 수 있습니다.

- **Auth Required:** Yes
- **Request Body:** `multipart/form-data`

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `file` | File | ✅ | 밈 이미지 파일 (Content-Type이 `image/*`이어야 함) |
| `title` | string | ✅ | 밈 제목 |
| `description` | string | ❌ | 밈 설명 |
| `tags` | string | ❌ | 태그 목록 (쉼표로 구분, 예: `"재밌음,고양이,짤"`) |

- **Response:** `200 OK`

```json
{
  "id": 42,
  "title": "회의 중 졸음",
  "image_url": "/static/uploads/a1b2c3d4e5f6.jpg",
  "description": "월요일 오전 9시의 현실",
  "likes_count": 0,
  "created_at": "2026-04-10T10:30:00",
  "tags": [
    { "id": 1, "name": "회사" },
    { "id": 2, "name": "졸음" }
  ],
  "author": {
    "id": 1,
    "email": "user@example.com",
    "username": "memit_user",
    "avatar_url": null,
    "bio": null,
    "status_message": null
  }
}
```

**필드 설명:**

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | integer | 밈 고유 ID |
| `title` | string | 밈 제목 |
| `image_url` | string | 서버에 저장된 이미지 접근 경로 |
| `description` | string \| null | 밈 설명 |
| `likes_count` | integer | 좋아요 총 개수 |
| `created_at` | datetime | 업로드 시각 (ISO 8601) |
| `tags` | array | 연결된 태그 목록 |
| `author` | object \| null | 작성자 정보 |

> 💡 태그 처리: 쉼표로 구분된 각 태그를 소문자로 변환 후 DB에 저장합니다. 이미 존재하는 태그는 재사용합니다.

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| --- | --- | --- |
| `400` | `"File must be an image"` | 이미지가 아닌 파일 업로드 |

---

### 3-2. 전체 밈 목록 조회

### `GET /memes/`

> 업로드된 밈을 최신순으로 조회합니다. 페이지네이션(skip/limit)을 지원합니다.

- **Auth Required:** No

- **Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `skip` | integer | `0` | 건너뛸 항목 수 (오프셋) |
| `limit` | integer | `20` | 한 번에 가져올 항목 수 |

- **Response:** `200 OK`

```json
[
  {
    "id": 42,
    "title": "회의 중 졸음",
    "image_url": "/static/uploads/a1b2c3d4e5f6.jpg",
    "description": "월요일 오전 9시의 현실",
    "likes_count": 128,
    "created_at": "2026-04-10T10:30:00",
    "tags": [
      { "id": 1, "name": "회사" }
    ],
    "author": {
      "id": 1,
      "email": "user@example.com",
      "username": "memit_user",
      "avatar_url": null,
      "bio": null,
      "status_message": null
    }
  }
]
```

---

### 3-3. 추천 밈 목록 조회

### `GET /memes/recommended`

> 좋아요 수 기준으로 인기 밈을 내림차순 조회합니다.

- **Auth Required:** No

- **Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `limit` | integer | `10` | 가져올 추천 밈 수 |

- **Response:** `200 OK`

```json
[
  {
    "id": 7,
    "title": "이게 맞나...",
    "image_url": "/static/uploads/xyz123.png",
    "description": null,
    "likes_count": 512,
    "created_at": "2026-04-08T14:00:00",
    "tags": [],
    "author": { ... }
  }
]
```

---

### 3-4. 밈 단건 조회

### `GET /memes/{meme_id}`

> 특정 밈의 상세 정보를 조회합니다.

- **Auth Required:** No

- **Path Parameters:**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `meme_id` | integer | 조회할 밈의 ID |

- **Response:** `200 OK`

```json
{
  "id": 42,
  "title": "회의 중 졸음",
  "image_url": "/static/uploads/a1b2c3d4e5f6.jpg",
  "description": "월요일 오전 9시의 현실",
  "likes_count": 128,
  "created_at": "2026-04-10T10:30:00",
  "tags": [
    { "id": 1, "name": "회사" },
    { "id": 2, "name": "졸음" }
  ],
  "author": { ... }
}
```

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| --- | --- | --- |
| `404` | `"Meme not found"` | 존재하지 않는 meme_id |

---

### 3-5. 밈 삭제

### `DELETE /memes/{meme_id}`

> 본인이 업로드한 밈을 삭제합니다. 서버에 저장된 이미지 파일도 함께 삭제됩니다.

- **Auth Required:** Yes

- **Path Parameters:**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `meme_id` | integer | 삭제할 밈의 ID |

- **Response:** `204 No Content`

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| --- | --- | --- |
| `404` | `"Meme not found"` | 존재하지 않는 meme_id |
| `403` | `"Not authorized to delete this meme"` | 본인 소유가 아닌 밈 삭제 시도 |

---

## 4. 좋아요 (Likes)

---

### 4-1. 좋아요 토글

### `POST /memes/{meme_id}/like`

> 특정 밈에 좋아요를 토글합니다. 이미 좋아요한 상태면 취소, 아니면 추가합니다.

- **Auth Required:** Yes

- **Path Parameters:**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `meme_id` | integer | 좋아요를 토글할 밈의 ID |

- **Response:** `200 OK`

```json
{
  "liked": true,
  "likes_count": 129
}
```

**필드 설명:**

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `liked` | boolean | `true`: 좋아요 추가됨, `false`: 좋아요 취소됨 |
| `likes_count` | integer | 토글 후 해당 밈의 총 좋아요 수 |

**동작 방식:**

| 이전 상태 | 요청 후 | `liked` | `likes_count` 변화 |
| --- | --- | --- | --- |
| 좋아요 없음 | 좋아요 추가 | `true` | +1 |
| 좋아요 있음 | 좋아요 취소 | `false` | -1 |

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| --- | --- | --- |
| `404` | `"Meme not found"` | 존재하지 않는 meme_id |

---

## 5. 갤러리 (Galleries)

---

### 5-1. 갤러리 생성

### `POST /galleries/`

> 나만의 갤러리(밈 컬렉션)를 생성합니다.

- **Auth Required:** Yes

- **Request Body:**

```json
{
  "name": "최애 고양이 밈",
  "description": "내가 모은 고양이 관련 밈 모음집"
}
```

**필드 설명:**

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `name` | string | ✅ | 갤러리 이름 |
| `description` | string \| null | ❌ | 갤러리 설명 |

- **Response:** `200 OK`

```json
{
  "id": 5,
  "name": "최애 고양이 밈",
  "description": "내가 모은 고양이 관련 밈 모음집",
  "created_at": "2026-04-10T11:00:00",
  "user_id": 1,
  "memes": []
}
```

**필드 설명:**

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | integer | 갤러리 고유 ID |
| `name` | string | 갤러리 이름 |
| `description` | string \| null | 갤러리 설명 |
| `created_at` | datetime | 생성 시각 (ISO 8601) |
| `user_id` | integer | 소유자 사용자 ID |
| `memes` | array | 갤러리에 담긴 밈 목록 (생성 직후 빈 배열) |

---

### 5-2. 내 갤러리 목록 조회

### `GET /galleries/my`

> 로그인한 사용자가 소유한 모든 갤러리를 조회합니다.

- **Auth Required:** Yes

- **Response:** `200 OK`

```json
[
  {
    "id": 5,
    "name": "최애 고양이 밈",
    "description": "내가 모은 고양이 관련 밈 모음집",
    "created_at": "2026-04-10T11:00:00",
    "user_id": 1,
    "memes": [
      {
        "id": 42,
        "title": "고양이의 월요병",
        "image_url": "/static/uploads/cat001.jpg",
        ...
      }
    ]
  }
]
```

---

### 5-3. 갤러리 단건 조회

### `GET /galleries/{gallery_id}`

> 특정 갤러리의 상세 정보와 포함된 밈 목록을 조회합니다.

- **Auth Required:** No

- **Path Parameters:**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `gallery_id` | integer | 조회할 갤러리의 ID |

- **Response:** `200 OK`

```json
{
  "id": 5,
  "name": "최애 고양이 밈",
  "description": "내가 모은 고양이 관련 밈 모음집",
  "created_at": "2026-04-10T11:00:00",
  "user_id": 1,
  "memes": [
    {
      "id": 42,
      "title": "고양이의 월요병",
      "image_url": "/static/uploads/cat001.jpg",
      "description": null,
      "likes_count": 88,
      "created_at": "2026-04-09T09:00:00",
      "tags": [{ "id": 3, "name": "고양이" }],
      "author": { ... }
    }
  ]
}
```

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| --- | --- | --- |
| `404` | `"Gallery not found"` | 존재하지 않는 gallery_id |

---

### 5-4. 갤러리에 밈 추가 (스크랩)

### `POST /galleries/{gallery_id}/memes/{meme_id}`

> 내 갤러리에 특정 밈을 스크랩합니다. 같은 밈을 중복으로 추가할 수 없습니다.

- **Auth Required:** Yes

- **Path Parameters:**

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `gallery_id` | integer | 밈을 추가할 갤러리의 ID |
| `meme_id` | integer | 추가할 밈의 ID |

- **Response:** `200 OK`

```json
{
  "detail": "Meme added to gallery"
}
```

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| --- | --- | --- |
| `404` | `"Gallery not found"` | 존재하지 않는 gallery_id |
| `403` | `"Not authorized"` | 본인 소유가 아닌 갤러리에 추가 시도 |
| `404` | `"Meme not found"` | 존재하지 않는 meme_id |
| `409` | `"Meme already in gallery"` | 이미 갤러리에 추가된 밈 재추가 시도 |

---

## 정적 파일 서빙

업로드된 이미지는 다음 경로로 직접 접근할 수 있습니다.

```
GET /static/uploads/{filename}
```

**예시:**

```
GET http://localhost:8000/static/uploads/avatar_1_a3b4c5d6.png
GET http://localhost:8000/static/uploads/a1b2c3d4e5f67890.jpg
```

---

## 전체 엔드포인트 요약표

| 메서드 | 엔드포인트 | 설명 | Auth |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | 회원가입 | No |
| `POST` | `/auth/login` | 로그인 → JWT 토큰 발급 | No |
| `GET` | `/users/me` | 내 프로필 조회 | Yes |
| `PUT` | `/users/me` | 프로필 수정 (bio, 상태 메시지) | Yes |
| `POST` | `/users/avatar` | 프로필 사진 업로드 | Yes |
| `POST` | `/memes/upload` | 밈 이미지 업로드 | Yes |
| `GET` | `/memes/` | 전체 밈 목록 (최신순, skip/limit) | No |
| `GET` | `/memes/recommended` | 추천 밈 목록 (좋아요순) | No |
| `GET` | `/memes/{meme_id}` | 밈 단건 조회 | No |
| `DELETE` | `/memes/{meme_id}` | 밈 삭제 (작성자 본인만) | Yes |
| `POST` | `/memes/{meme_id}/like` | 좋아요 토글 | Yes |
| `POST` | `/galleries/` | 갤러리 생성 | Yes |
| `GET` | `/galleries/my` | 내 갤러리 목록 조회 | Yes |
| `GET` | `/galleries/{gallery_id}` | 갤러리 단건 조회 | No |
| `POST` | `/galleries/{gallery_id}/memes/{meme_id}` | 갤러리에 밈 추가 (스크랩) | Yes |
