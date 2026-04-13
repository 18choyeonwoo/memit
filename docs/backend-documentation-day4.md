# Memit Backend Documentation - Day 4

Memit 프로젝트의 백엔드 개발 4일차 진행 내역 및 신규 기능 사양을 정리합니다.
4일차에는 **밈 검색·수정 API 완성**, **커뮤니티(익명 게시판) 기능 전체 구현**, 그리고 **검색 결과 UI 개선**이 이루어졌습니다.

---

## 0. 진행 상황 업데이트

| 구분 | 기능 | 상태 |
| :--- | :--- | :--- |
| **Meme** | 밈 검색 API (제목·설명·태그 OR 검색) | ✔️ 완료 |
| **Meme** | 밈 수정 API (제목·설명·태그 부분 업데이트) | ✔️ 완료 |
| **Community** | 커뮤니티 게시글 작성 / 목록 조회 / 삭제 | ✔️ 완료 |
| **Community** | 게시글 댓글 작성 / 삭제 | ✔️ 완료 |
| **Community** | 익명/실명 선택 (게시글·댓글 공통) | ✔️ 완료 |
| **Frontend** | 커뮤니티 탭 UI (목록·상세·작성 모달) | ✔️ 완료 |
| **Frontend** | 검색 결과 — 밈 + 커뮤니티 섹션 분리 | ✔️ 완료 |

---

## 1. 시스템 아키텍처 변경

커뮤니티 기능 추가로 모델과 API 라우터가 확장되었습니다.

```text
backend/
├── app/
│   ├── api/
│   │   ├── auth.py
│   │   ├── memes.py      # [Updated] 검색(search), 수정(PUT) 엔드포인트 추가
│   │   ├── likes.py
│   │   ├── users.py
│   │   ├── galleries.py
│   │   └── posts.py      # [NEW] 커뮤니티 게시글 + 댓글 CRUD
│   ├── models/
│   │   ├── user.py       # [Updated] posts, comments 관계 필드 추가
│   │   ├── meme.py
│   │   ├── gallery.py
│   │   ├── like.py
│   │   └── post.py       # [NEW] Post, PostComment 테이블 정의
│   ├── schemas/
│   │   ├── user.py
│   │   ├── meme.py
│   │   ├── gallery.py
│   │   └── post.py       # [NEW] PostCreate, CommentCreate, 응답 스키마
│   └── main.py           # [Updated] posts 라우터 등록
```

---

## 2. DB 스키마 확장

### **post** 테이블

| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **title** | String | 게시글 제목 |
| **content** | String | 게시글 본문 |
| **is_anonymous** | Boolean | 익명 여부 (기본값: `false`) |
| **image_url** | String | 첨부 이미지 경로 (Optional) |
| **created_at** | DateTime | 작성 시각 (자동 생성) |
| **user_id** | Integer | 작성자 ID (FK → user.id) |

### **post_comment** 테이블

| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **content** | String | 댓글 본문 |
| **is_anonymous** | Boolean | 익명 여부 (기본값: `false`) |
| **created_at** | DateTime | 작성 시각 (자동 생성) |
| **user_id** | Integer | 작성자 ID (FK → user.id) |
| **post_id** | Integer | 게시글 ID (FK → post.id) |

> [!NOTE]
> 테이블명을 `comment` 대신 `post_comment`로 지정한 이유: PostgreSQL에서 `comment`는 예약어(Reserved Keyword)로 충돌 가능성이 있어 명시적으로 `__tablename__ = "post_comment"`를 설정했습니다.

### **관계 모델 업데이트**

`User` 모델에 아래 두 개의 Relationship 필드가 추가되었습니다.

```python
posts: List["Post"] = Relationship(back_populates="author")
comments: List["PostComment"] = Relationship(back_populates="author")
```

---

## 3. API 명세서 업데이트 내역 (신규 추가)

### **밈 (Memes) — 업데이트**

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/memes/search?q={query}` | 제목·설명·태그 기준 OR 검색 (대소문자 무시) | No |
| `PUT` | `/memes/{meme_id}` | 밈 제목·설명·태그 부분 수정 (작성자 본인만) | Yes |

---

#### `GET /memes/search`

> 검색어(`q`)를 밈의 **제목(title)**, **설명(description)**, **태그(tag name)** 중 하나라도 포함하면 결과에 포함합니다. (OR 조건, ILIKE 대소문자 무시)
> 검색어 앞의 `#`은 자동으로 제거되어 태그 검색에 사용됩니다.

- **Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `q` | string | ✅ | 검색어 (빈 문자열이면 빈 배열 반환) |

- **Response:** `200 OK` — `MemeResponse[]`

**검색 로직:**
```python
tag_meme_ids = select(MemeTagLink.meme_id).join(Tag).where(Tag.name.ilike(tag_pattern))

memes = select(Meme).where(
    or_(
        Meme.title.ilike(pattern),
        Meme.description.ilike(pattern),
        Meme.id.in_(tag_meme_ids),
    )
).order_by(Meme.created_at.desc())
```

---

#### `PUT /memes/{meme_id}`

> 밈의 제목, 설명, 태그를 부분 업데이트합니다. 전달된 필드만 수정되며, 태그는 기존 연결을 모두 제거 후 재등록합니다.

- **Request Body:**

```json
{
  "title": "새 제목",
  "description": "새 설명",
  "tags": "태그1,태그2,태그3"
}
```

| 필드 | 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `title` | string \| null | ❌ | 수정할 제목 |
| `description` | string \| null | ❌ | 수정할 설명 |
| `tags` | string \| null | ❌ | 쉼표로 구분된 태그 문자열 (기존 태그 전체 교체) |

- **Response:** `200 OK` — `MemeResponse`

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| :--- | :--- | :--- |
| `404` | `"Meme not found"` | 존재하지 않는 meme_id |
| `403` | `"Not your meme"` | 본인 소유가 아닌 밈 수정 시도 |

---

### **커뮤니티 (Posts) — 신규**

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/posts/` | 게시글 작성 (익명 선택 가능) | Yes |
| `GET` | `/posts/` | 게시글 목록 조회 (최신순, 댓글 포함) | No |
| `DELETE` | `/posts/{post_id}` | 게시글 삭제 (작성자 본인만, 댓글 일괄 삭제) | Yes |
| `POST` | `/posts/{post_id}/comments` | 댓글 작성 (익명 선택 가능) | Yes |
| `DELETE` | `/posts/{post_id}/comments/{comment_id}` | 댓글 삭제 (작성자 본인만) | Yes |

---

#### `POST /posts/`

- **Request Body:**

```json
{
  "title": "이 밈 어디서 나온 건지 아는 분?",
  "content": "친구가 보내줬는데 출처를 모르겠어요.",
  "is_anonymous": true
}
```

| 필드 | 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `title` | string | ✅ | 게시글 제목 |
| `content` | string | ✅ | 게시글 본문 |
| `is_anonymous` | boolean | ❌ | 익명 여부 (기본값: `false`) |

- **Response:** `200 OK`

```json
{
  "id": 1,
  "title": "이 밈 어디서 나온 건지 아는 분?",
  "content": "친구가 보내줬는데 출처를 모르겠어요.",
  "is_anonymous": true,
  "image_url": null,
  "created_at": "2026-04-13T15:00:00",
  "user_id": 2,
  "author": {
    "id": 2,
    "username": "devuser",
    "email": "dev@memit.com",
    "avatar_url": null,
    "bio": null,
    "status_message": null
  },
  "comments": []
}
```

---

#### `GET /posts/`

> 게시글 목록을 최신순으로 반환합니다. 각 게시글에 댓글 목록이 포함됩니다.

- **Response:** `200 OK` — `PostResponse[]`

---

#### `DELETE /posts/{post_id}`

> 게시글을 삭제합니다. 삭제 시 해당 게시글의 모든 댓글(`PostComment`)도 함께 삭제됩니다.

- **Response:** `204 No Content`

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| :--- | :--- | :--- |
| `404` | `"Post not found"` | 존재하지 않는 post_id |
| `403` | `"Not your post"` | 본인 소유가 아닌 게시글 삭제 시도 |

---

#### `POST /posts/{post_id}/comments`

- **Request Body:**

```json
{
  "content": "저도 모르겠네요 ㅠㅠ",
  "is_anonymous": false
}
```

| 필드 | 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `content` | string | ✅ | 댓글 내용 |
| `is_anonymous` | boolean | ❌ | 익명 여부 (기본값: `false`) |

- **Response:** `200 OK`

```json
{
  "id": 5,
  "content": "저도 모르겠네요 ㅠㅠ",
  "is_anonymous": false,
  "created_at": "2026-04-13T15:05:00",
  "user_id": 1,
  "author": { "id": 1, "username": "testuser", ... }
}
```

---

#### `DELETE /posts/{post_id}/comments/{comment_id}`

- **Response:** `204 No Content`

**에러 케이스:**

| 상태코드 | detail | 발생 조건 |
| :--- | :--- | :--- |
| `404` | `"Comment not found"` | 존재하지 않거나 해당 게시글 소속이 아닌 댓글 |
| `403` | `"Not your comment"` | 본인이 작성하지 않은 댓글 삭제 시도 |

---

## 4. 익명 처리 설계

서버는 항상 실제 `user_id`와 `author` 정보를 저장하지만, `is_anonymous: true`인 경우 **프론트엔드 어댑터**(`communityService.js`)에서 `author` 필드를 `null`로 마스킹하여 표시합니다.

```
[서버 응답]  author: { id: 2, username: "devuser", ... }  is_anonymous: true
      ↓  adaptPost() 처리
[프론트엔드]  author: null  →  UI에서 "익명" 표시
```

이 방식으로 서버는 신고·제재 기능을 위한 실제 작성자 정보를 보유하면서, 클라이언트에는 익명으로 표시하는 구조를 유지합니다.

---

## 5. 프론트엔드 연동 구조

```
App.jsx (communityPosts 전역 상태)
├── communityService.getPosts()      ← 앱 마운트 시 전체 로드
├── communityService.createPost()    ← 글 작성 후 상태에 prepend
├── communityService.deletePost()    ← 삭제 후 상태에서 제거
├── communityService.createComment() ← 해당 post.comments에 push
└── communityService.deleteComment() ← 해당 post.comments에서 제거

CommunityPage  (list ↔ detail 내부 뷰 전환)
├── PostCard           ← 목록 카드 (본인 글이면 삭제 버튼 노출)
├── PostDetailView     ← 글 본문 + 댓글 섹션
└── PostWriteModal     ← 제목/본문/사진첨부/익명 선택 폼

SearchResultsPage
├── 밈 섹션     ← GET /memes/search?q= 결과
└── 커뮤니티 섹션 ← communityPosts 제목 기준 클라이언트 필터링
```

---

## 6. 전체 엔드포인트 최신 요약표

| 메서드 | 엔드포인트 | 설명 | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | 회원가입 | No |
| `POST` | `/auth/login` | 로그인 → JWT 토큰 발급 | No |
| `GET` | `/users/me` | 내 프로필 조회 | Yes |
| `PUT` | `/users/me` | 프로필 수정 | Yes |
| `POST` | `/users/avatar` | 프로필 사진 업로드 | Yes |
| `POST` | `/memes/upload` | 밈 업로드 | Yes |
| `GET` | `/memes/` | 전체 밈 목록 (최신순) | No |
| `GET` | `/memes/search?q=` | 밈 검색 (제목·설명·태그) | No |
| `GET` | `/memes/recommended` | 추천 밈 (좋아요순) | No |
| `GET` | `/memes/{meme_id}` | 밈 단건 조회 | No |
| `PUT` | `/memes/{meme_id}` | 밈 수정 (본인만) | Yes |
| `DELETE` | `/memes/{meme_id}` | 밈 삭제 (본인만) | Yes |
| `POST` | `/memes/{meme_id}/like` | 좋아요 토글 | Yes |
| `POST` | `/galleries/` | 갤러리 생성 | Yes |
| `GET` | `/galleries/my` | 내 갤러리 목록 | Yes |
| `GET` | `/galleries/{gallery_id}` | 갤러리 단건 조회 | No |
| `POST` | `/galleries/{gallery_id}/memes/{meme_id}` | 갤러리에 밈 추가 | Yes |
| `DELETE` | `/galleries/{gallery_id}/memes/{meme_id}` | 갤러리에서 밈 제거 | Yes |
| `POST` | `/posts/` | 커뮤니티 글 작성 | Yes |
| `GET` | `/posts/` | 커뮤니티 글 목록 | No |
| `DELETE` | `/posts/{post_id}` | 커뮤니티 글 삭제 (본인만) | Yes |
| `POST` | `/posts/{post_id}/comments` | 댓글 작성 | Yes |
| `DELETE` | `/posts/{post_id}/comments/{comment_id}` | 댓글 삭제 (본인만) | Yes |

---

## 📅 향후 계획

### **5차 - 소셜 기능 & UX 고도화**
- 게시글 및 댓글 **좋아요** 기능 추가
- 커뮤니티 게시글에 **이미지 첨부** 백엔드 연동 (현재 프론트 UI만 존재)
- 커뮤니티 게시글 **제목 외 본문·태그 검색** 확장
- 유저 간 **Follow/Unfollow** 시스템
- 갤러리 **공개/비공개** 설정 (`is_public`) 기능
