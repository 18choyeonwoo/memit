import { FiArrowLeft } from 'react-icons/fi';
import MemeCard from '../../components/meme/MemeCard';
import styles from './GalleryDetailPage.module.css';

export default function GalleryDetailPage({
  gallery,
  memes,
  onBack,
  onMemeClick,
  onToggleLike,
  onDeleteMeme,
  currentUserId,
  isOwn,
}) {
  // 실제 밈 데이터가 없으면 갤러리 previewImages를 그리드로 표시
  const hasRealMemes = memes && memes.length > 0;
  const hasPreviewImages = gallery.previewImages && gallery.previewImages.length > 0;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={onBack}>
        <FiArrowLeft />
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>{gallery.name}</h1>
        {gallery.description && (
          <p className={styles.description}>{gallery.description}</p>
        )}
        <span className={styles.meta}>
          핀 {gallery.count ?? memes?.length ?? 0}개
          {gallery.updatedAt && ` · ${gallery.updatedAt} 업데이트`}
        </span>
      </div>

      {hasRealMemes ? (
        <div className={styles.grid}>
          {memes.map((meme) => (
            <MemeCard
              key={meme.id}
              meme={meme}
              onClick={() => onMemeClick(meme)}
              onToggleLike={() => onToggleLike(meme.id)}
              currentUserId={currentUserId}
              onDelete={() => onDeleteMeme(meme.id)}
            />
          ))}
        </div>
      ) : hasPreviewImages ? (
        <div className={styles.previewGrid}>
          {gallery.previewImages.map((src, i) => (
            <div key={i} className={styles.previewCard}>
              <img src={src} alt="" />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>이 갤러리에 아직 밈이 없습니다.</p>
          {isOwn && (
            <p className={styles.emptyHint}>
              밈 상세 페이지에서 "내 앨범에 추가"를 눌러 밈을 담아보세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
