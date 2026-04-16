# 밈 시딩 자동화 스크립트

`meme_new/` 폴더에 이미지를 저장하면 GCS 업로드 → DB 등록 → 갤러리 연결까지 자동으로 처리하는 스크립트 정리.

---

## 스크립트 목록

| 파일 | 용도 |
|------|------|
| `seed_meme_new.py` | 수동 1회 업로드 (일괄 처리) |
| `watch_meme_new.py` | 자동 감시 — meme_new/ 에 파일 추가되면 자동 업로드 |

---

## 워크플로우

```
① meme_new/ 에 이미지 저장
        ↓ (watch_meme_new.py 가 10초 대기 후 자동 감지)
② GCS 업로드 + DB 등록 (제목: 밈카드N, 작성자: devuser)
        ↓
③ 새 갤러리 '밈카드배치N' 자동 생성 및 연결
        ↓
④ memit.cloud 웹에서 밈 제목 / 태그 수정
        ↓
⑤ meme_new/ 이미지를 meme/ 로 이동 (수동)
        ↓ (스크립트가 자동으로 다음 배치 준비)
⑥ 다시 ① 반복
```

---

## 공통 설정값

두 스크립트 모두 상단 설정 블록에서 변경 가능.

```python
BASE_URL  = "http(s)://memit.cloud/api"  # https → http 자동 폴백
EMAIL     = "dev@memit.com"
PASSWORD  = "memit1234"
GALLERY   = "밈카드2"          # seed_meme_new.py 에서 사용
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
```

---

## 1. seed_meme_new.py — 수동 1회 업로드

### 동작

1. `meme_new/` 의 모든 이미지를 GCS에 업로드
2. DB에 `밈카드N` 제목으로 등록 (기존 최대 번호 이어서)
3. 지정한 갤러리에 연결 (없으면 자동 생성)

### 실행

```bash
# 프로젝트 루트에서
source backend/.venv/bin/activate
python3 seed_meme_new.py
```

### 출력 예시

```
[INFO] http://memit.cloud 연결 확인
[INFO] 이미지 28개 발견
[AUTH] devuser 로그인 완료
[갤러리] '밈카드2' 생성 완료 (id=5)
  [+] abc.jpg → '밈카드1'
  [+] def.jpg → '밈카드2'
  ...
완료! 28/28개 추가됨 → 갤러리 '밈카드2'
```

---

## 2. watch_meme_new.py — 자동 감시 워처

### 동작

| 항목 | 내용 |
|------|------|
| 감시 주기 | 5초마다 `meme_new/` 폴더 확인 |
| 디바운스 | 새 파일 발견 후 10초 대기 (여러 파일 한 배치로 묶기 위해) |
| 갤러리 이름 | `밈카드배치1`, `밈카드배치2` … 자동 증가 |
| 상태 저장 | `.meme_watch_state.json` — 이미 업로드된 파일 추적 (중복 방지) |
| 다음 배치 준비 | `meme_new/` 에서 파일이 사라지면 상태에서 제거 → 다음 배치 자동 준비 |

### 실행

```bash
# 프로젝트 루트에서 (스크립트를 켜두는 동안 계속 감시)
source backend/.venv/bin/activate
python3 watch_meme_new.py

# 종료
Ctrl+C
```

### 출력 예시

```
=== meme_new 워처 시작 ===
  감시 폴더: .../meme_new
  업로드 대기: 10초 (새 파일 발견 후)
  종료: Ctrl+C

[감지] 새 파일 3개 — 10초 후 업로드합니다...

[업로드 시작] 3개 파일
[갤러리] '밈카드배치2' 생성 (id=6)
  [+] abc.jpg → '밈카드29'
  [+] def.jpg → '밈카드30'
  [+] ghi.png → '밈카드31'
[완료] 3/3개 → 갤러리 '밈카드배치2'
  → 웹에서 밈 수정 후 meme_new/ 이미지를 meme/ 로 옮겨주세요

[정리] 3개 파일이 meme_new/ 에서 제거됨 → 다음 배치 준비 완료
```

---

## 생성 파일

| 파일 | 설명 |
|------|------|
| `.meme_watch_state.json` | 업로드 완료된 파일명 목록 (자동 생성, gitignore 권장) |

`.gitignore` 에 추가 권장:
```
.meme_watch_state.json
```

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `Connection refused` | HTTPS 미지원 | 스크립트가 자동으로 http로 폴백 |
| `400 Bad Request` (signup) | devuser 이미 존재 | 정상 — 로그인으로 처리됨 |
| `401 Unauthorized` | 비밀번호 불일치 | 스크립트 상단 `PASSWORD` 수정 |
| 파일이 감지 안 됨 | 확장자가 목록에 없음 | `IMAGE_EXTS` 에 추가 |
| 중복 업로드됨 | 상태 파일 손상 | `.meme_watch_state.json` 삭제 후 재실행 |
