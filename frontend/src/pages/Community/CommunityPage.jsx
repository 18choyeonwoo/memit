import { useState } from 'react';
import { FiPlusSquare, FiUsers } from 'react-icons/fi';
import PostCard from '../../components/community/PostCard';
import PostDetailView from '../../components/community/PostDetailView';
import PostWriteModal from '../../components/community/PostWriteModal';
import styles from './CommunityPage.module.css';

export default function CommunityPage({
  posts,
  onAddPost,
  onDeletePost,
  onAddComment,
  onDeleteComment,
  currentUserId,
  isLoggedIn,
  onLoginRequired,
}) {
  const [view, setView] = useState('list');       // 'list' | 'detail'
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showWriteModal, setShowWriteModal] = useState(false);

  const selectedPost = posts.find((p) => p.id === selectedPostId);

  const handleWriteClick = () => {
    if (!isLoggedIn) { onLoginRequired?.(); return; }
    setShowWriteModal(true);
  };

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setView('list');
    setSelectedPostId(null);
    window.scrollTo(0, 0);
  };

  const handleDeletePost = (postId) => {
    onDeletePost?.(postId);
    handleBack();
  };

  if (view === 'detail' && selectedPost) {
    return (
      <PostDetailView
        post={selectedPost}
        currentUserId={currentUserId}
        onBack={handleBack}
        onDeletePost={handleDeletePost}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FiUsers className={styles.headerIcon} />
          <h1 className={styles.title}>커뮤니티</h1>
        </div>
        <button className={styles.writeBtn} onClick={handleWriteClick}>
          <FiPlusSquare />
          <span>글 쓰기</span>
        </button>
      </div>

      <p className={styles.desc}>찾는 밈이 없으신가요? 익명으로 자유롭게 공유해요.</p>

      <div className={styles.postList}>
        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>아직 글이 없어요</p>
            <p className={styles.emptyDesc}>첫 번째 글을 작성해보세요!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onClick={() => handlePostClick(post.id)}
              onDelete={onDeletePost}
            />
          ))
        )}
      </div>

      {showWriteModal && (
        <PostWriteModal
          onClose={() => setShowWriteModal(false)}
          onSubmit={async (data) => {
            await onAddPost?.(data);
            setShowWriteModal(false);
          }}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
