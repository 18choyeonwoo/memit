import { useState } from 'react';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import CommentItem from '../CommentItem/CommentItem';
import styles from './PostDetailView.module.css';

export default function PostDetailView({ post, currentUserId, onBack, onDeletePost, onAddComment, onDeleteComment }) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const isOwn = currentUserId != null && post.user_id === currentUserId;

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment?.({
      postId: post.id,
      content: commentText.trim(),
      isAnonymous,
    });
    setCommentText('');
    setIsAnonymous(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmitComment();
    }
  };

  const handleDeletePost = () => {
    if (window.confirm('이 글을 삭제할까요?')) {
      onDeletePost?.(post.id);
      onBack?.();
    }
  };

  return (
    <div className={styles.page}>
      {/* 뒤로가기 */}
      <button className={styles.backBtn} onClick={onBack}>
        <FiArrowLeft />
        <span>목록으로</span>
      </button>

      {/* 글 본문 */}
      <div className={styles.postBox}>
        <div className={styles.postHeader}>
          <h2 className={styles.title}>{post.title}</h2>
          {isOwn && (
            <button className={styles.deletePostBtn} onClick={handleDeletePost} title="글 삭제">
              <FiTrash2 />
              <span>삭제</span>
            </button>
          )}
        </div>

        <div className={styles.meta}>
          <span className={styles.author}>
            {post.is_anonymous ? '익명' : (post.author ?? '알 수 없음')}
          </span>
          <span className={styles.dot}>·</span>
          <span className={styles.time}>{post.timeAgo ?? '방금 전'}</span>
        </div>

        {post.image_url && (
          <img src={post.image_url} alt="첨부 이미지" className={styles.postImage} />
        )}

        <p className={styles.content}>{post.content}</p>

        <button className={styles.likeBtn} onClick={handleLike}>
          {liked
            ? <FaHeart className={`${styles.heart} ${styles.liked}`} />
            : <FaRegHeart className={styles.heart} />
          }
          <span>{likes}</span>
        </button>
      </div>

      {/* 댓글 섹션 */}
      <div className={styles.commentSection}>
        <h3 className={styles.commentTitle}>
          댓글 <span className={styles.commentCount}>{(post.comments ?? []).length}</span>
        </h3>

        {/* 댓글 작성 */}
        <div className={styles.commentForm}>
          <textarea
            className={styles.commentInput}
            placeholder="댓글을 입력하세요 (Ctrl+Enter로 등록)"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />
          <div className={styles.commentFormFooter}>
            <label className={styles.anonymousLabel}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className={styles.anonymousCheckbox}
              />
              <span>익명</span>
            </label>
            <button
              className={styles.commentSubmitBtn}
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
            >
              등록
            </button>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className={styles.commentList}>
          {(post.comments ?? []).length === 0 ? (
            <p className={styles.noComments}>첫 번째 댓글을 남겨보세요!</p>
          ) : (
            (post.comments ?? []).map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onDelete={(commentId) => onDeleteComment?.({ postId: post.id, commentId })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
