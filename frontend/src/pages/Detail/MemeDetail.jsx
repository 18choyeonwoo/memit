import { useState, useEffect } from 'react';
import { FiArrowLeft, FiCopy, FiShare2, FiBookmark, FiTrash2, FiEdit2 } from 'react-icons/fi';
import FeedMemeCard from '../../components/meme/FeedMemeCard/FeedMemeCard';
import MemeCardSkeleton from '../../components/meme/MemeCard/MemeCardSkeleton';
import AddToGalleryModal from '../../components/shared/AddToGalleryModal/AddToGalleryModal';
import MemeEditModal from '../../components/shared/MemeEditModal/MemeEditModal';
import { memeService } from '../../services/memeService';
import styles from './MemeDetail.module.css';

const SKELETON_HEIGHTS = ['240px', '320px', '180px', '280px'];

export default function MemeDetail({ meme, onBack, onMemeClick, currentUserId, onDelete, onEdit }) {
  const isOwn = currentUserId != null && meme.userId === currentUserId;
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [similarMemes, setSimilarMemes] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(true);

  useEffect(() => {
    setSimilarLoading(true);
    memeService.getSimilarMemes(meme.id)
      .then(setSimilarMemes)
      .catch(() => {})
      .finally(() => setSimilarLoading(false));
  }, [meme.id]);

  const handleDelete = () => {
    if (window.confirm(`"${meme.title}" 밈을 삭제할까요?`)) {
      onDelete?.(meme.id);
    }
  };

  const handleEdit = async (updates) => {
    await onEdit?.(meme.id, updates);
    setShowEditModal(false);
  };

  return (
    <>
      <section className={styles['meme-detail-area']}>
        <button className={styles['back-btn']} onClick={onBack}>
          <FiArrowLeft />
        </button>

        <div className={styles['detail-container']}>
          {/* 왼쪽: 이미지 + 액션 버튼 */}
          <div className={styles['detail-image-side']}>
            <img
              src={meme.image}
              alt={meme.title}
              className={styles['detail-large-image']}
            />
            <div className={styles['detail-actions']}>
              <button className={`${styles['action-btn']} ${styles['action-primary']}`}>
                <FiCopy />
                <span>원클릭 복사하기</span>
              </button>
              <button className={`${styles['action-btn']} ${styles['action-secondary']}`}>
                <FiShare2 />
                <span>공유</span>
              </button>
              <button
                className={`${styles['action-btn']} ${styles['action-secondary']}`}
                onClick={() => setShowGalleryModal(true)}
              >
                <FiBookmark />
                <span>내 갤러리에 추가</span>
              </button>
              {isOwn && (
                <>
                  <button
                    className={`${styles['action-btn']} ${styles['action-secondary']}`}
                    onClick={() => setShowEditModal(true)}
                  >
                    <FiEdit2 />
                    <span>수정</span>
                  </button>
                  <button
                    className={`${styles['action-btn']} ${styles['action-danger']}`}
                    onClick={handleDelete}
                  >
                    <FiTrash2 />
                    <span>삭제</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 오른쪽: 정보 */}
          <div className={styles['detail-info-side']}>
            <div className={styles['detail-user-header']}>
              <div className={styles['detail-avatar']} />
              <span className={styles['detail-author']}>{meme.author}</span>
              <span className={styles['detail-time']}>• {meme.timeAgo}</span>
            </div>

            <h1 className={styles['detail-title']}>{meme.title}</h1>

            <div className={styles['detail-tags']}>
              {meme.tags.map((tag) => (
                <span key={tag} className={styles['detail-tag']}>
                  {tag}
                </span>
              ))}
            </div>

            <p className={styles['detail-description']}>{meme.description}</p>
          </div>
        </div>

        {/* Similar Memits */}
        {(similarLoading || similarMemes.length > 0) && (
          <div className={styles['similar-section']}>
            <h2 className={styles['similar-title']}>Similar Memits</h2>
            <div className={styles['similar-grid']}>
              {similarLoading
                ? SKELETON_HEIGHTS.map((h, i) => (
                    <MemeCardSkeleton key={i} imageHeight={h} />
                  ))
                : similarMemes.map((item) => (
                    <FeedMemeCard
                      key={item.id}
                      meme={item}
                      onClick={() => onMemeClick?.(item)}
                    />
                  ))}
            </div>
          </div>
        )}
      </section>

      {showGalleryModal && (
        <AddToGalleryModal
          memeId={meme.id}
          onClose={() => setShowGalleryModal(false)}
        />
      )}

      {showEditModal && (
        <MemeEditModal
          meme={meme}
          onSave={handleEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
