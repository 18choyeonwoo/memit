import MemeCard from '../MemeCard';
import MemeCardSkeleton from '../MemeCard/MemeCardSkeleton';
import styles from './MemeGrid.module.css';

export default function MemeGrid({ memeCards, isLoading, onMemeClick, onToggleLike, onAuthorClick, currentUserId, onEdit, onDelete, compact = false }) {
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
          compact={compact}
        />
      ))}
    </div>
  );
}
