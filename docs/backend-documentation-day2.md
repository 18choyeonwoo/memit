# Memit Backend Documentation - Day 2

Memit 프로젝트의 백엔드 개발 2일차 진행 내역 & 고도화된 기술 사양을 정리합니다. 2일차에는 핵심 콘텐츠인 **밈(Meme) 관리**와 **사용자 상호작용(좋아요, 갤러리)** 기능이 중점적으로 구현되었습니다.

## 0. 진행 상황 업데이트

| 구분 | 기능 | 상태 |
| :--- | :--- | :--- |
| **User** | 프로필 수정 (Bio, 상태 메시지) | ✔️ 완료 |
| **User** | 프로필 사진(아바타) 업로드 및 동기화 | ✔️ 완료 |
| **Meme** | 이미지 업로드 및 서버 저장 (static) | ✔️ 완료 |
| **Meme** | 최신/추천 피드 조회 API | ✔️ 완료 |
| **Interaction** | 밈 좋아요(Like) 토글 시스템 | ✔️ 완료 |
| **Gallery** | 사용자 커스텀 갤러리 생성 | ✔️ 완료 |

## 1. 시스템 아키텍처 (System Architecture)

프로젝트 규모 확장에 따라 라우터와 모델이 세분화되었습니다.

```text
backend/
├── app/
│   ├── api/          # 기능별 엔드포인트 (auth, memes, users, galleries, likes)
│   ├── core/         # 보안 및 전역 설정
│   ├── models/       # DB 테이블 정의 (user, meme, gallery, like, tag)
│   ├── schemas/      # 데이터 검증 스키마
│   ├── main.py       # 애플리케이션 진입점 (정적 파일 서버 설정 추가)
│   └── database.py   # DB 연결 및 세션 관리
├── static/           # [NEW] 업로드된 이미지 저장소 (uploads/)
├── docker-compose.yml
└── requirements.txt
```

## 2. 데이터베이스 스키마 확장 (Database Schema)

SQLModel을 통해 밈 엔진을 위한 핵심 테이블들이 추가되었습니다.

### **meme** 테이블
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **title** | String | 밈 제목 |
| **description** | String | 밈 설명 (Optional) |
| **image_url** | String | 저장된 이미지 경로 |
| **likes_count** | Integer | 좋아요 합계 (Cache) |
| **user_id** | Integer | 작성자 ID (FK) |

### **gallery** 테이블
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **name** | String | 갤러리 이름 |
| **is_public** | Boolean | 공개 여부 |
| **user_id** | Integer | 소유자 ID (FK) |

### **관계 모델**
- **MemeLike**: User와 Meme 간의 M:N 관계 모델 (좋아요 관리)
- **Tag**: 밈 분류를 위한 태그 테이블 및 MemeTagLink 연결 모델

## 3. API 명세 (API Specification)

2일차에 추가된 핵심 API 리스트입니다.

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
| `GET` | `/memes/` | 전체 밈 목록 조회 | No |
| `GET` | `/memes/recommended` | 인기/추천 밈 목록 조회 | No |
| `POST` | `/memes/{id}/like` | 좋아요 토글 (Like/Unlike) | Yes |
| `DELETE` | `/memes/{id}` | 밈 삭제 (이미지 파일 포함) | Yes |

### **갤러리 (Galleries)**
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/galleries/` | 신규 갤러리 생성 | Yes |

## 4. 파일 관리 & 서빙 (File Management)

- **저장소**: 서버 로컬의 `static/uploads` 경로를 사용합니다.
- **이미지 서빙**: `FastAPI.staticfiles`를 사용하여 `/static` 경로로 클라이언트가 직접 이미지에 접근할 수 있도록 구성되었습니다.
- **유니크 네이밍**: 업로드된 파일은 `UUID`를 사용하여 파일명 충돌을 방지합니다.

## 5. 프론트엔드 연동 & 동기화

- **전역 상태 동기화**: `AuthContext`를 통해 프로필 수정/아바타 변경 시 앱 전체의 유저 정보가 실시간으로 업데이트되도록 프론트엔드 로직이 동기화되었습니다.
- **설정 탭 통합**: 기존 하드코딩된 설정 탭을 실제 API 데이터 기반으로 전환하고, 프로필 수정 모달을 통합하였습니다.

---

## 📅 향후 계획

### **Day 3: 소셜 기능 & 알림**
- 유저 간 **Follow/Unfollow** 시스템 구축
- 좋아요 및 팔로우 발생 시 **실시간 알림(Notification)** 로그 구현
- 갤러리에 밈 담기(Scrap) 기능 고도화

### **Day 4: 최적화 & 검색**
- 태그 기반 **검색 알고리즘** 구현
- 대량의 밈 데이터 처리를 위한 **Pagination(Cursor-based)** 도입
- 프론트엔드 성능 최적화 (Lazy Loading, Skeleton UI)
