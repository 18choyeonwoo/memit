import Skeleton from '../../shared/Skeleton';
import styles from './MemeCardSkeleton.module.css';

export default function MemeCardSkeleton({ imageHeight = '200px' }) {
  return (
    <div className={styles['skeleton-card']}>
      <Skeleton height={imageHeight} borderRadius="14px" className={styles['image-skeleton']} />
      <div className={styles['info-skeleton']}>
        <Skeleton width="80%" height="18px" />
        <div className={styles['meta-skeleton']}>
          <Skeleton width="40px" height="14px" borderRadius="4px" />
          <Skeleton width="60px" height="14px" borderRadius="4px" />
        </div>
        <Skeleton width="40%" height="12px" className={styles['author-skeleton']} />
      </div>
    </div>
  );
}
