import { FiTrash2 } from 'react-icons/fi';
import styles from './CommentItem.module.css';

export default function CommentItem({ comment, currentUserId, onDelete }) {
  const isOwn = currentUserId != null && comment.user_id === currentUserId;

  return (
    <div className={styles.item}>
      <div className={styles.top}>
        <span className={styles.author}>
          {comment.is_anonymous ? '익명' : (comment.author_name ?? '알 수 없음')}
        </span>
        <span className={styles.time}>{comment.timeAgo ?? '방금 전'}</span>
        {isOwn && (
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete?.(comment.id)}
            title="댓글 삭제"
          >
            <FiTrash2 />
          </button>
        )}
      </div>
      <p className={styles.content}>{comment.content}</p>
    </div>
  );
}
