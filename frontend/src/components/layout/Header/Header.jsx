import { useState } from 'react';
import { FiSearch, FiPlusCircle, FiUser, FiUnlock } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import styles from './Header.module.css';

export default function Header({ onSearch, onLoginClick }) {
  const [query, setQuery] = useState('');
  const { isLoggedIn, user } = useAuth();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      onSearch && onSearch(query.trim());
    }
  };

  return (
    <header className={styles['header']}>
      <div className={styles['search-bar']}>
        <FiSearch className={styles['search-icon']} />
        <input
          type="text"
          className={styles['search-input']}
          placeholder="아... 그 밈 뭐였지?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className={styles['header-actions']}>
        {isLoggedIn ? (
          <>
            <button className={styles['icon-btn']}>
              <FiPlusCircle />
            </button>
            <button className={`${styles['icon-btn']} ${styles['avatar-btn']}`}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className={styles['avatar-img']} />
              ) : (
                <FiUser />
              )}
            </button>
          </>
        ) : (
          <button className={styles['login-btn']} onClick={onLoginClick}>
            <FiUnlock />
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
}
