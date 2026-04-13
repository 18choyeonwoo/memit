import { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FiMessageSquare, FiImage, FiTrash2 } from 'react-icons/fi';
import styles from './PostCard.module.css';

export default function PostCard({ post, currentUserId, onClick, onDelete }) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likes, setLikes] = useState(post.likes ?? 0);

  const isOwn = currentUserId != null && post.user_id === currentUserId;

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`"${post.title}" 글을 삭제할까요?`)) {
      onDelete?.(post.id);
    }
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.body}>
        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{post.title}</h3>
            {isOwn && (
              <button className={styles.deleteBtn} onClick={handleDelete} title="글 삭제">
                <FiTrash2 />
              </button>
            )}
          </div>
          <p className={styles.preview}>{post.content}</p>

          <div className={styles.meta}>
            <span className={styles.author}>
              {post.is_anonymous ? '익명' : (post.author ?? '알 수 없음')}
            </span>
            <span className={styles.dot}>·</span>
            <span className={styles.time}>{post.timeAgo ?? '방금 전'}</span>
          </div>

          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={handleLike}>
              {liked
                ? <FaHeart className={`${styles.heartIcon} ${styles.liked}`} />
                : <FaRegHeart className={styles.heartIcon} />
              }
              <span>{likes}</span>
            </button>
            <div className={styles.actionBtn}>
              <FiMessageSquare className={styles.commentIcon} />
              <span>{(post.comments?.length ?? post.comment_count) ?? 0}</span>
            </div>
            {post.image_url && (
              <div className={styles.imageBadge}>
                <FiImage />
              </div>
            )}
          </div>
        </div>

        {post.image_url && (
          <div className={styles.thumbnail}>
            <img src={post.image_url} alt="첨부 이미지" />
          </div>
        )}
      </div>
    </div>
  );
}
