import { useState, useEffect } from 'react';
import { HiFire, HiHeart } from 'react-icons/hi';
import { memeService } from '../../../services/memeService';
import styles from './Leaderboard.module.css';

const MOBILE_BREAKPOINT = 1100;

function formatLikes(count) {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace('.0', '')}k`;
  return String(count);
}

export default function Leaderboard() {
  const [items, setItems] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  useEffect(() => {
    memeService.getHotMemes().then(setItems).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const defaultCount = isMobile ? 3 : 5;
  const visibleItems = showAll ? items : items.slice(0, defaultCount);

  return (
    <aside className={styles['leaderboard']}>
      <div className={styles['leaderboard-header']}>
        <HiFire className={styles['fire-icon']} />
        <h2 className={styles['leaderboard-title']}>Hot memits</h2>
      </div>

      <ol className={styles['leaderboard-list']}>
        {visibleItems.map((item, idx) => (
          <li key={item.id} className={styles['leaderboard-item']}>
            <span className={styles['leaderboard-rank']}>
              {String(idx + 1).padStart(2, '0')}
            </span>
            <div className={styles['leaderboard-info']}>
              <p className={styles['leaderboard-name']}>{item.title}</p>
              <p className={styles['leaderboard-tags']}>
                {(item.tags || []).map((t) => `#${t.name}`).join(' ')}
              </p>
            </div>
            <div className={styles['leaderboard-likes']}>
              <HiHeart className={styles['like-icon']} />
              <span>{formatLikes(item.likes_count)}</span>
            </div>
          </li>
        ))}
      </ol>

      {items.length > defaultCount && (
        <button
          className={styles['leaderboard-link']}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? 'Show Less' : 'View Full Leaderboard'}
        </button>
      )}
    </aside>
  );
}
