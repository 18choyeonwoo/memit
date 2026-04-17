import { trendingTags } from '../../../data';
import styles from './TrendingTags.module.css';

export default function TrendingTags() {
  return (
    <div className={styles['trending-tags']}>
      <span className={styles['trending-label']}>:</span>
      <div className={styles['tags-list']}>
        {trendingTags.map((tag) => (
          <button key={tag} className={styles['tag-btn']}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
