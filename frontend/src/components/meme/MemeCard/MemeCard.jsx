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
