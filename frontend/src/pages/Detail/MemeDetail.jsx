import { FiArrowLeft, FiCopy, FiShare2, FiBookmark, FiTrash2 } from 'react-icons/fi';
import { similarMemes } from '../../data';
import MemeCard from '../../components/meme/MemeCard';
import styles from './MemeDetail.module.css';

export default function MemeDetail({ meme, onBack, onMemeClick, currentUserId, onDelete }) {
  const isOwn = currentUserId != null && meme.userId === currentUserId;

  const handleDelete = () => {
    if (window.confirm(`"${meme.title}" 밈을 삭제할까요?`)) {
      onDelete?.(meme.id);
    }
  };

  return (
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
            <button className={`${styles['action-btn']} ${styles['action-secondary']}`}>
              <FiBookmark />
              <span>내 앨범에 추가</span>
            </button>
            {isOwn && (
              <button
                className={`${styles['action-btn']} ${styles['action-danger']}`}
                onClick={handleDelete}
              >
                <FiTrash2 />
                <span>삭제</span>
              </button>
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
      <div className={styles['similar-section']}>
        <h2 className={styles['similar-title']}>Similar Memits</h2>
        <div className={styles['similar-grid']}>
          {similarMemes.map((item) => (
            <MemeCard
              key={item.id}
              meme={item}
              onClick={() => onMemeClick?.(item)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
