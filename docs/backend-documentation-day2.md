# Memit Backend Documentation - Day 2

Memit 프로젝트의 백엔드 개발 2일차 진행 내역 & 고도화된 기술 사양을 정리합니다.
2일차에는 핵심 콘텐츠인 **밈(Meme) 관리**와 **사용자 상호작용(좋아요, 갤러리)** 기능이 중점적으로 구현되었습니다.

## 0. 진행 상황 업데이트

| 구분 | 기능 | 상태 |
| :--- | :--- | :--- |
| **User** | 프로필 수정 (Bio, 상태 메시지) | ✔️ 완료 |
| **User** | 프로필 사진(아바타) 업로드 및 동기화 | ✔️ 완료 |
| **Meme** | 이미지 업로드 및 서버 저장 (static) | ✔️ 완료 |
| **Meme** | 최신/추천 피드 조회 API | ✔️ 완료 |
| **Meme** | 단건 조회 API | ✔️ 완료 |
| **Interaction** | 밈 좋아요(Like) 토글 시스템 | ✔️ 완료 |
| **Gallery** | 사용자 커스텀 갤러리 생성 | ✔️ 완료 |
| **Gallery** | 내 갤러리 목록 조회 | ✔️ 완료 |
| **Gallery** | 갤러리에 밈 추가(Scrap) | ✔️ 완료 |
| **Tag** | 태그 자동 생성 및 밈-태그 연결 | ✔️ 완료 |

## 1. 시스템 아키텍처

프로젝트 규모 확장에 따라 라우터와 모델이 세분화되었습니다.

```text
backend/
├── app/
│   ├── api/          # 기능별 엔드포인트 (auth, memes, likes, users, galleries)
│   ├── core/         # 보안(JWT, bcrypt) 및 인증 의존성
│   ├── models/       # DB 테이블 정의 (user, meme, gallery, like, tag)
│   ├── schemas/      # 데이터 검증 스키마 (Pydantic)
│   ├── main.py       # 애플리케이션 진입점 (CORS, 정적 파일 서버 설정)
│   ├── config.py     # 환경변수 기반 전역 설정
│   └── database.py   # DB 연결 및 세션 관리
├── static/           # [NEW] 업로드된 이미지 저장소 (uploads/)
├── docker-compose.yml
└── requirements.txt
```

## 2. DB 스키마 확장

SQLModel을 통해 밈 엔진을 위한 핵심 테이블들이 추가되었습니다.

### **meme** 테이블

| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **title** | String | 밈 제목 |
| **description** | String | 밈 설명 (Optional) |
| **image_url** | String | 저장된 이미지 경로 |
| **likes_count** | Integer | 좋아요 합계 (Cache) |
| **created_at** | DateTime | 업로드 시각 (자동 생성) |
| **user_id** | Integer | 작성자 ID (FK) |

### **gallery** 테이블

| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **name** | String | 갤러리 이름 |
| **description** | String | 갤러리 설명 (Optional) |
| **created_at** | DateTime | 생성 시각 (자동 생성) |
| **user_id** | Integer | 소유자 ID (FK) |

> [!NOTE]
> 문서에 기재된 `is_public` 필드는 현재 DB 모델에 미구현 상태입니다. 추후 공개/비공개 갤러리 기능 추가 시 마이그레이션이 필요합니다.

### **관계 모델**

- **MemeLike**: User와 Meme 간의 M:N 관계 모델 (좋아요 관리, created_at 포함)
- **Tag**: 밈 분류를 위한 태그 테이블 (name 중복 방지, 자동 생성)
- **MemeTagLink**: Meme ↔ Tag 연결 테이블
- **MemeGalleryLink**: Meme ↔ Gallery 연결 테이블 (갤러리 내 밈 스크랩)

## 3. API 명세서

2일차에 추가된 핵심 API 리스트입니다.

### **인증 (Auth)**

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | 회원가입 (email, username, password) | No |
| `POST` | `/auth/login` | 로그인 → JWT 토큰 발급 (유효기간: 30일) | No |

### **사용자 (Users)**

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | 현재 사용자 정보 조회 | Yes |
| `PUT` | `/users/me` | 프로필(Bio, 상태메시지) 업데이트 | Yes |
| `POST` | `/users/avatar` | 프로필 사진 업로드 및 URL 반영 | Yes |

### **밈 (Memes)**

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/memes/upload` | 밈 이미지 업로드 및 태그 저장 | Yes |
| `GET` | `/memes/` | 전체 밈 목록 조회 (skip/limit 페이지네이션) | No |
| `GET` | `/memes/recommended` | 인기/추천 밈 목록 조회 (likes_count 기준 정렬) | No |
| `GET` | `/memes/{id}` | 밈 단건 조회 | No |
| `DELETE` | `/memes/{id}` | 밈 삭제 (이미지 파일 포함, 작성자 본인만) | Yes |
| `POST` | `/memes/{id}/like` | 좋아요 토글 (Like/Unlike) | Yes |

### **갤러리 (Galleries)**

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/galleries/` | 신규 갤러리 생성 | Yes |
| `GET` | `/galleries/my` | 내 갤러리 목록 전체 조회 | Yes |
| `GET` | `/galleries/{id}` | 갤러리 단건 조회 (포함된 밈 목록 포함) | No |
| `POST` | `/galleries/{id}/memes/{meme_id}` | 갤러리에 밈 추가 (소유자만, 중복 방지) | Yes |

## 4. 파일 관리

- **저장소**: 서버 로컬의 `static/uploads` 경로를 사용합니다.
- **이미지 서빙**: FastAPI StaticFiles를 사용하여 `/static` 경로로 클라이언트가 직접 이미지에 접근할 수 있도록 구성되었습니다. (추후 S3으로 확장 예정)
- **유니크 네이밍**: 업로드된 파일은 UUID를 사용하여 파일명 충돌을 방지합니다. 아바타 파일은 `avatar_{user_id}_{random}` 형식으로 저장됩니다.
- **파일 타입 검증**: 업로드 시 `Content-Type`이 `image/*`인지 서버에서 검증합니다.

## 5. 프론트엔드 연동 & 동기화

- **전역 상태 동기화**: AuthContext를 통해 프로필 수정/아바타 변경 시 앱 전체의 유저 정보가 실시간으로 업데이트되도록 프론트엔드 로직이 동기화되었습니다.
- **설정 탭 통합**: 기존 하드코딩된 설정 탭을 실제 API 데이터 기반으로 전환하고, 프로필 수정 모달을 통합하였습니다.

## 6. 현재 사용자가 쓸 수 있는 기능 요약

지금 당장 프론트엔드에서 연동하여 사용할 수 있는 기능입니다.

### **계정**
- 이메일/사용자명/비밀번호로 회원가입
- 로그인하면 30일짜리 JWT 토큰 발급 → 이후 모든 인증 요청에 사용

### **내 프로필**
- 내 정보(bio, 상태 메시지) 수정
- 프로필 사진(아바타) 이미지 업로드 및 변경
- 현재 내 프로필 정보 조회

### **밈**
- 이미지 파일 + 제목/설명/태그를 함께 업로드
- 전체 밈 목록을 최신순으로 조회 (페이지네이션: skip/limit 지원)
- 좋아요 많은 순으로 추천 밈 조회
- 특정 밈 단건 조회
- 본인이 올린 밈 삭제 (서버 이미지 파일도 함께 삭제)

### **좋아요**
- 밈에 좋아요 누르기 / 취소하기 (토글 방식)
- 실시간으로 해당 밈의 좋아요 수 반영

### **갤러리**
- 나만의 갤러리(컬렉션) 생성
- 내 갤러리 목록 전체 조회
- 원하는 밈을 갤러리에 추가해서 스크랩 (중복 방지)
- 갤러리 단건 조회 시 담긴 밈 목록도 함께 반환

### **태그**
- 밈 업로드 시 쉼표(,)로 구분하여 태그 자동 등록 (신규면 생성, 기존이면 재사용)
- 밈 응답 데이터에 태그 목록 포함

---

## 📅 향후 계획

### **3차 - 소셜 기능 & 알림**
- 유저 간 **Follow/Unfollow** 시스템 구축
- 좋아요 및 팔로우 발생 시 **실시간 알림(Notification)** 로그 구현
- 갤러리 공개/비공개(`is_public`) 설정 기능 추가

### **4차 - 최적화 & 검색**
- 태그 기반 **검색 알고리즘** 구현
- 대량의 밈 데이터 처리를 위한 **Pagination (Cursor-based)** 도입
- 프론트엔드 성능 최적화 (Lazy Loading, Skeleton UI)
- 이미지 저장소 AWS S3 마이그레이션
