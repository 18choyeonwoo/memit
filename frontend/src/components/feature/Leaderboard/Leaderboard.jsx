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
