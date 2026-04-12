import { useState, useEffect } from 'react';
import { FiSearch, FiImage, FiUploadCloud } from 'react-icons/fi';
import MemeGrid from '../../components/meme/MemeGrid';
import { memeService } from '../../services/memeService';
import styles from './SearchResultsPage.module.css';

export default function SearchResultsPage({
  query,
  onUploadClick,
  onMemeClick,
  onToggleLike,
  currentUserId,
  onDelete,
  onEdit,
}) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setIsLoading(true);
    memeService
      .searchMemes(query)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setIsLoading(false));
  }, [query]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <MemeGrid
          memeCards={[]}
          isLoading={true}
          onMemeClick={onMemeClick}
          onToggleLike={onToggleLike}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    }

    if (results.length === 0) {
      return (
        <div className={styles['empty-state']}>
          <div className={styles['empty-icon-wrapper']}>
            <FiSearch className={styles['empty-icon']} />
          </div>
          <h3 className={styles['empty-title']}>
            &quot;{query}&quot;에 대한 밈이 없어요.
          </h3>
          <p className={styles['empty-desc']}>첫 밈을 업로드 해보시겠어요?</p>
          <button className={styles['upload-btn']} onClick={onUploadClick}>
            <FiUploadCloud className={styles['upload-icon']} /> 밈 업로드하기
          </button>
        </div>
      );
    }

    return (
      <MemeGrid
        memeCards={results}
        isLoading={false}
        onMemeClick={onMemeClick}
        onToggleLike={onToggleLike}
        currentUserId={currentUserId}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  };

  return (
    <div className={styles['search-results-page']}>
      <div className={styles['search-header']}>
        <h1 className={styles['search-title']}>
          <span className={styles['highlight']}>"{query}"</span> 검색 결과
        </h1>
      </div>

      <div className={styles['tabs-section']}>
        <div className={styles['tabs']}>
          <button className={`${styles['tab-btn']} ${styles['active']}`}>
            <FiImage className={styles['tab-icon']} />
            밈
            {!isLoading && results.length > 0 && (
              <span className={styles['tab-count']}>{results.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className={styles['results-content']}>{renderContent()}</div>
    </div>
  );
}
