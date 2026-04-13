import { useState, useEffect } from 'react';
import { FiSearch, FiImage, FiUploadCloud, FiUsers } from 'react-icons/fi';
import MemeGrid from '../../components/meme/MemeGrid';
import PostCard from '../../components/community/PostCard';
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
  communityPosts = [],
  onCommunityPostClick,
}) {
  const [memeResults, setMemeResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const communityResults = communityPosts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!query.trim()) return;
    setIsLoading(true);
    memeService
      .searchMemes(query)
      .then(setMemeResults)
      .catch(() => setMemeResults([]))
      .finally(() => setIsLoading(false));
  }, [query]);

  return (
    <div className={styles['search-results-page']}>
      <div className={styles['search-header']}>
        <h1 className={styles['search-title']}>
          <span className={styles['highlight']}>"{query}"</span> 검색 결과
        </h1>
      </div>

      {/* ── 밈 섹션 ── */}
      <div className={styles['section']}>
        <div className={styles['section-title']}>
          <FiImage className={styles['section-icon']} />
          <span>밈</span>
          {!isLoading && memeResults.length > 0 && (
            <span className={styles['count-badge']}>{memeResults.length}</span>
          )}
        </div>

        {isLoading ? (
          <MemeGrid
            memeCards={[]}
            isLoading={true}
            onMemeClick={onMemeClick}
            onToggleLike={onToggleLike}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : memeResults.length === 0 ? (
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
        ) : (
          <MemeGrid
            memeCards={memeResults}
            isLoading={false}
            onMemeClick={onMemeClick}
            onToggleLike={onToggleLike}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>

      {/* ── 커뮤니티 섹션 ── */}
      <div className={styles['section']}>
        <div className={styles['section-title']}>
          <FiUsers className={styles['section-icon']} />
          <span>커뮤니티</span>
          {communityResults.length > 0 && (
            <span className={styles['count-badge']}>{communityResults.length}</span>
          )}
        </div>

        {communityResults.length === 0 ? (
          <div className={styles['empty-state']}>
            <div className={styles['empty-icon-wrapper']}>
              <FiUsers className={styles['empty-icon']} />
            </div>
            <h3 className={styles['empty-title']}>
              &quot;{query}&quot;에 대한 커뮤니티 글이 없어요.
            </h3>
            <p className={styles['empty-desc']}>커뮤니티에서 직접 질문해보세요!</p>
            <button className={styles['upload-btn']} onClick={onCommunityPostClick}>
              <FiUsers className={styles['upload-icon']} /> 커뮤니티 가기
            </button>
          </div>
        ) : (
          <div className={styles['community-list']}>
            {communityResults.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onClick={onCommunityPostClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
