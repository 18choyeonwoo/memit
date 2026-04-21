# UI 개선 요청 — 추천 피드 화면

## 프로젝트 개요
밈(meme) 공유 플랫폼 "Memit"의 추천 피드 화면 UI 개선 요청입니다.
React + CSS Modules 기반 프로젝트입니다.

## 기술 스택 조건 (반드시 지켜주세요)
- React + CSS Modules (`styles['class-name']` 방식 유지)
- 기존 CSS 변수: `--accent-orange`, `--yellow-light` 사용 가능
- PC 전체화면 + 모바일 반응형 (max-width: 768px) 모두 개선
- JSX 파일과 CSS 파일 **둘 다** 수정된 전체 코드로 제공
- 아이콘은 `react-icons` 라이브러리 사용 중 (변경 가능)

## 화면 구성
- 좌측: 사이드바 (별도 파일, 수정 불필요)
- 상단: 헤더 검색바 (별도 파일, 수정 불필요)
- 중앙: 밈 카드 그리드 (핀터레스트 스타일 masonry layout)
- 우측: "핫한 밈" 리더보드 사이드바

## 개선 목표
0. 핀터레스트를 지나치게 모방하지 않은 느낌
1. 전체적으로 더 세련되고 모던한 느낌
2. MemeCard에 hover 인터랙션 강화
3. 좋아요 버튼 UX 개선 (눌렀을 때 더 명확한 피드백)
4. 리더보드 디자인 개선
5. 전체 여백, 타이포그래피, 색상 조화 개선

---

## 현재 코드

### `HomePage.jsx`
```jsx
import MemeGrid from '../../components/meme/MemeGrid';
import Leaderboard from '../../components/feature/Leaderboard';
import Footer from '../../components/layout/Footer';

export default function HomePage({ memeCards, isLoading, handleMemeClick, toggleLike, handleProfileView, currentUserId, onEdit, onDelete }) {
  return (
    <>
      <div className="content-row">
        <main className="feed-area">
          <MemeGrid
            memeCards={memeCards}
            isLoading={isLoading}
            onMemeClick={handleMemeClick}
            onToggleLike={toggleLike}
            onAuthorClick={handleProfileView}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </main>
        <Leaderboard />
      </div>
      <Footer />
    </>
  );
}
```

---

### `MemeCard.jsx`
```jsx
import { useState, useRef, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FiEdit2, FiTrash2, FiMoreVertical, FiMinus } from 'react-icons/fi';
import MemeEditModal from '../../shared/MemeEditModal/MemeEditModal';
import styles from './MemeCard.module.css';

export default function MemeCard({ meme, onClick, onToggleLike, onAuthorClick, currentUserId, onDelete, onEdit, onRemoveFromGallery }) {
  const isOwn = currentUserId != null && meme.userId === currentUserId;
  const showMenu = isOwn || !!onRemoveFromGallery;
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onToggleLike?.();
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    onAuthorClick?.(meme.author);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setShowEditModal(true);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm(`"${meme.title}" 밈을 삭제할까요?`)) {
      onDelete?.();
    }
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm(`"${meme.title}"을 갤러리에서 제거할까요?`)) {
      onRemoveFromGallery?.();
    }
  };

  return (
    <>
      <div className={styles['meme-card']} onClick={onClick}>
        <div className={styles['meme-image-wrapper']}>
          <img src={meme.image} alt={meme.title} className={styles['meme-image']} />
        </div>

        <div className={styles['meme-info']}>
          <div className={styles['meme-info-top']}>
            <h3 className={styles['meme-title']}>{meme.title}</h3>
            {showMenu && (
              <div className={styles['menu-wrap']} ref={menuRef}>
                <button
                  className={styles['menu-btn']}
                  onClick={handleMenuToggle}
                  title="더보기"
                >
                  <FiMoreVertical />
                </button>
                {menuOpen && (
                  <div className={styles['dropdown']}>
                    {isOwn && (
                      <button className={styles['dropdown-item']} onClick={handleEditClick}>
                        <FiEdit2 />
                        <span>수정하기</span>
                      </button>
                    )}
                    {isOwn && (
                      <button className={`${styles['dropdown-item']} ${styles['danger']}`} onClick={handleDeleteClick}>
                        <FiTrash2 />
                        <span>삭제하기</span>
                      </button>
                    )}
                    {onRemoveFromGallery && (
                      <button className={`${styles['dropdown-item']} ${styles['remove']}`} onClick={handleRemoveClick}>
                        <FiMinus />
                        <span>갤러리에서 제거</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles['meme-likes']} onClick={handleLikeClick}>
            {meme.liked ? (
              <FaHeart className={`${styles['heart-icon']} ${styles['liked']}`} />
            ) : (
              <FaRegHeart className={styles['heart-icon']} />
            )}
            <span className={styles['likes-count']}>{meme.likes.toLocaleString()}</span>
          </div>
          <div className={styles['meme-tags']}>
            {meme.tags.map((tag) => (
              <span key={tag} className={styles['meme-tag']}>{tag}</span>
            ))}
          </div>
          <div className={styles['meme-author']} onClick={handleAuthorClick}>
            {meme.author}
          </div>
        </div>
      </div>

      {showEditModal && (
        <MemeEditModal
          meme={meme}
          onSave={async (updates) => { await onEdit?.(meme.id, updates); }}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
```

### `MemeCard.module.css`
```css
.meme-card {
  break-inside: avoid;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 14px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.meme-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.meme-image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 14px;
}

.meme-image {
  width: 100%;
  display: block;
  object-fit: cover;
  border-radius: 14px;
}

.meme-info {
  padding: 10px 4px 6px;
}

.meme-info-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 6px;
}

.meme-title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

.menu-wrap {
  position: relative;
  flex-shrink: 0;
}

.menu-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: none;
  border: none;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.15s, color 0.15s;
}

.menu-btn:hover {
  background: #f3f4f6;
  color: #555;
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 130px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}

.dropdown-item:hover {
  background: #f9fafb;
}

.dropdown-item.danger {
  color: #dc2626;
}

.dropdown-item.danger:hover {
  background: #fff1f1;
}

.dropdown-item.remove {
  color: #d97706;
}

.dropdown-item.remove:hover {
  background: #fffbeb;
}

.meme-likes {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
}

.heart-icon {
  font-size: 14px;
  color: #ccc;
}

.heart-icon.liked {
  color: #e74c6f;
}

.likes-count {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.meme-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.meme-tag {
  font-size: 11px;
  color: #999;
  font-weight: 400;
}

.meme-author {
  font-size: 11px;
  color: #888;
  margin-top: 8px;
  font-weight: 500;
  display: inline-block;
  cursor: pointer;
  transition: color 0.1s;
}

.meme-author:hover {
  color: #facc15;
  text-decoration: underline;
}
```

---

### `MemeGrid.jsx`
```jsx
import MemeCard from '../MemeCard';
import MemeCardSkeleton from '../MemeCard/MemeCardSkeleton';
import styles from './MemeGrid.module.css';

export default function MemeGrid({ memeCards, isLoading, onMemeClick, onToggleLike, onAuthorClick, currentUserId, onEdit, onDelete }) {
  const skeletonHeights = ['240px', '320px', '180px', '280px', '220px', '350px', '200px', '300px'];

  if (isLoading) {
    return (
      <div className={styles['meme-grid']}>
        {skeletonHeights.map((h, i) => (
          <MemeCardSkeleton key={i} imageHeight={h} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles['meme-grid']}>
      {memeCards.map((meme) => (
        <MemeCard
          key={meme.id}
          meme={meme}
          onClick={() => onMemeClick(meme)}
          onToggleLike={() => onToggleLike(meme.id)}
          onAuthorClick={onAuthorClick}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={() => onDelete?.(meme.id)}
        />
      ))}
    </div>
  );
}
```

### `MemeGrid.module.css`
```css
.meme-grid {
  columns: 5;
  column-gap: 18px;
  padding: 8px 0 24px;
}

@media (max-width: 1400px) {
  .meme-grid { columns: 4; }
}

@media (max-width: 1100px) {
  .meme-grid { columns: 3; }
}

@media (max-width: 800px) {
  .meme-grid { columns: 2; }
}
```

---

### `Leaderboard.jsx`
```jsx
import { HiFire, HiHeart } from 'react-icons/hi';
import { leaderboardItems } from '../../../data';
import styles from './Leaderboard.module.css';

export default function Leaderboard() {
  return (
    <aside className={styles['leaderboard']}>
      <div className={styles['leaderboard-header']}>
        <HiFire className={styles['fire-icon']} />
        <h2 className={styles['leaderboard-title']}>핫한 밈</h2>
      </div>

      <ol className={styles['leaderboard-list']}>
        {leaderboardItems.map((item) => (
          <li key={item.rank} className={styles['leaderboard-item']}>
            <span className={styles['leaderboard-rank']}>{item.rank}</span>
            <div className={styles['leaderboard-info']}>
              <p className={styles['leaderboard-name']}>{item.title}</p>
              <p className={styles['leaderboard-tags']}>{item.tags}</p>
            </div>
            <div className={styles['leaderboard-likes']}>
              <HiHeart className={styles['like-icon']} />
              <span>{item.likes}</span>
            </div>
          </li>
        ))}
      </ol>

      <a href="#" className={styles['leaderboard-link']}>
        View Full Leaderboard
      </a>
    </aside>
  );
}
```

### `Leaderboard.module.css`
```css
.leaderboard {
  width: 260px;
  min-width: 260px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 22px 20px 18px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.leaderboard-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.fire-icon {
  font-size: 22px;
  color: #e8a020;
}

.leaderboard-title {
  font-size: 17px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.leaderboard-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.leaderboard-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.leaderboard-rank {
  font-size: 16px;
  font-weight: 700;
  color: #ccc;
  min-width: 22px;
  padding-top: 1px;
}

.leaderboard-info {
  flex: 1;
  min-width: 0;
}

.leaderboard-name {
  font-size: 13px;
  font-weight: 600;
  color: #222;
  margin: 0 0 3px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leaderboard-tags {
  font-size: 11px;
  color: #aaa;
  margin: 0;
  font-weight: 400;
}

.leaderboard-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #888;
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;
  margin-top: 2px;
}

.like-icon {
  color: #ee5253;
  font-size: 16px;
}

.leaderboard-link {
  display: block;
  text-align: center;
  margin-top: 22px;
  font-size: 12px;
  color: #999;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.leaderboard-link:hover {
  color: #555;
}

@media (max-width: 800px) {
  .leaderboard {
    width: 100%;
    min-width: 100%;
    order: -1;
    position: static;
    margin-bottom: 0px;
    padding: 16px 20px;
    border: none;
  }

  .leaderboard-list {
    flex-direction: column;
    gap: 14px;
  }

  .leaderboard-item {
    background: transparent;
    padding: 0;
    border-radius: 0;
    border: none;
    min-width: auto;
    flex-shrink: 1;
  }

  .leaderboard-tags {
    display: none;
  }

  .leaderboard-link {
    margin-top: 16px;
  }
}
```

---

### `App.css` (전체 레이아웃)
```css
.app {
  display: flex;
  min-height: 100vh;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0 32px;
}

.content-row {
  display: flex;
  gap: 28px;
  flex: 1;
}

.feed-area {
  flex: 1;
  min-width: 0;
}

@media (max-width: 800px) {
  .content-row {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .app {
    flex-direction: column;
  }

  .main-wrapper {
    padding: 0 16px;
    padding-bottom: 80px;
  }
}
```

---

## 결과물 요청 형식
아래 파일들을 각각 수정된 전체 코드로 제공해주세요:
1. `MemeCard.jsx`
2. `MemeCard.module.css`
3. `MemeGrid.module.css`
4. `Leaderboard.jsx`
5. `Leaderboard.module.css`
6. `App.css` (레이아웃 변경이 필요한 경우)
