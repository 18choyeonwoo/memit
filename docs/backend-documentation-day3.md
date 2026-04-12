# Memit Backend Documentation - Day 3

Memit 프로젝트의 백엔드 개발 3일차 진행 내역 및 트러블슈팅(Troubleshooting) 과정을 정리합니다.
이번 3일차에는 기존에 구현된 API의 버그를 수정하고 관계형 데이터베이스에서 발생하는 제약 조건 충돌 문제를 해결하는 데 집중했습니다.

## 1. 진행된 트러블슈팅 핵심 요약

### 1️⃣ 중복되어있는 밈카드 다수 발견 문제
- **원인 식별**: 시드 스크립트(`seed_memes.py`)가 실행될 때마다 DB에 저장된 내역을 확인하지 않고 `meme/` 폴더 내의 이미지를 새롭게 업로드(`Insert`)하여, 여러 번 스크립트를 실행할 시 동일한 밈 리스트가 중복으로 쌓이게 되었습니다.
- **해결 방안**: 시드 스크립트를 수정하여, 사전에 DB 로부터 가져온 기존의 `image_url` 리스트(`existing_urls`)와 비교하는 로직을 추가했습니다. 이미 등록된 파일은 자동으로 **스킵(Skip)** 처리하도록 구현하여 데이터 중복을 방지했습니다.

### 2️⃣ 추천 탭의 밈 삭제가 안되는 현상
- **원인 식별**: 밈(`Meme`) 삭제 시 해당 밈과 연관된 태그(`MemeTagLink`), 좋아요(`MemeLike`), 그리고 갤러리에 저장된 내역(`MemeGalleryLink`) 데이터들이 DB 상에서 외래키(Foreign Key) 제약 조건에 어긋나 오류를 뱉었습니다. 특히 추천 탭의 밈들은 대부분 좋아요가 달린 데이터이므로 이 제약 조건 충돌이 두드러지게 발생했습니다.
- **해결 방안**: `/memes/{id}` 삭제(DELETE) 엔드포인트 수정. 밈 레코드 자체를 삭제하기 전에 연관된 링크 테이블들(`MemeTagLink`, `MemeLike`, `MemeGalleryLink`)에서 해당 `meme_id`를 가진 레코드들을 우선 순차적으로 삭제(`delete`)하도록 종속성 삭제(Cascade Delete) 패턴을 컨트롤러 상에서 적용했습니다.

### 3️⃣ 갤러리에 밈 추가 시 개수가 0개로 표시되는 문제
- **원인 식별**: 사용자가 특정 갤러리에 밈을 추가했음에도 해당 갤러리를 조회 시 밈 리스트가 비어 있거나 직렬화(Serialization)되지 않는 문제였습니다.
- **해결 방안**: 
  - `GalleryResponse` Pydantic 스키마에 `memes: List[MemeResponse] = []` 필드를 명시.
  - `Config` 내 `from_attributes = True` 설정을 추가하여, SQLModel 내부의 `Relationship`으로 설정된 `memes` 속성이 JSON 객체로 제대로 파싱되고 응답 객체에 담기도록 스키마 맵핑 및 직렬화를 개선했습니다.

### 4️⃣ 갤러리 내의 개별 밈 삭제 처리 불가능
- **원인 식별**: 갤러리에 추가한(스크랩) 밈을 갤러리에서만 제거(연결 해제)하기 위한 전용 API 엔드포인트가 부재했습니다.
- **해결 방안**: 갤러리와 밈을 잇고 있는 연결 테이블인 `MemeGalleryLink`의 레코드를 직접 삭제하는 새로운 API 엔드포인트인 `DELETE /galleries/{gallery_id}/memes/{meme_id}`를 신규 작업했습니다.

---

## 2. API 명세서 업데이트 내역 (신규 추가)

### **갤러리 (Galleries)**

트러블슈팅 과정 내 (4번 이슈)를 해결하기 위해 추가된 API 명세입니다.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `DELETE` | `/galleries/{gallery_id}/memes/{meme_id}` | 특정 갤러리에 추가되어 있는 밈의 스크랩을 취소하고 연결 테이블(`MemeGalleryLink`)에서 삭제합니다. 작성자(소유자) 본인만 삭제 가능합니다. (상태코드: 204) | Yes |

---

## 3. 코드 단위 개선 사항 (Code Highlights)

**밈 삭제 시 연결 레코드 선제적 삭제 (Cascade on Controller)**
```python
@router.delete("/{meme_id}", status_code=204)
def delete_meme(...):
    # 중략 (권한 확인)
    
    # 1. FK 제약 위반 방지 방비: 연관 모델(관계 링크) 먼저 일괄 삭제
    for link in session.exec(select(MemeTagLink).where(MemeTagLink.meme_id == meme_id)).all():
        session.delete(link)
    for link in session.exec(select(MemeLike).where(MemeLike.meme_id == meme_id)).all():
        session.delete(link)
    for link in session.exec(select(MemeGalleryLink).where(MemeGalleryLink.meme_id == meme_id)).all():
        session.delete(link)
    session.flush()

    # 2. 이미지 파일 시스템에서 삭제 
    # 3. Meme 모델 (원본) 영구 삭제
    # ...
    session.delete(meme)
    session.commit()
```

이로서 데이터베이스 무결성(Integrity) 오류를 방지하고 연관 데이터를 안전하게 클린업하는 안정적인 환경이 구축되었습니다.
