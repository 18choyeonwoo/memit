import { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import MemeCard from '../../components/meme/MemeCard';
import styles from './GalleryDetailPage.module.css';

export default function GalleryDetailPage({
  gallery,
  memes: initialMemes,
  onBack,
  onMemeClick,
  onToggleLike,
  onDeleteMeme,
  onEditMeme,
  onRemoveFromGallery,
  currentUserId,
  isOwn,
}) {
  const [localMemes, setLocalMemes] = useState(initialMemes || []);

  // gallery가 바뀌면 (다른 갤러리로 이동) 밈 목록 초기화
  useEffect(() => {
    setLocalMemes(initialMemes || []);
  }, [gallery?.id]);

  const handleDelete = async (memeId) => {
    await onDeleteMeme?.(memeId);
    setLocalMemes((prev) => prev.filter((m) => m.id !== memeId));
  };

  const handleEdit = async (memeId, updates) => {
    await onEditMeme?.(memeId, updates);
    setLocalMemes((prev) =>
      prev.map((m) =>
        m.id === memeId
          ? { ...m, title: updates.title ?? m.title, description: updates.description ?? m.description }
          : m
      )
    );
  };

  const handleRemove = async (memeId) => {
    await onRemoveFromGallery?.(memeId);
    setLocalMemes((prev) => prev.filter((m) => m.id !== memeId));
  };

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={onBack}>
        <FiArrowLeft />
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>{gallery.name}</h1>
        {gallery.description && (
          <p className={styles.description}>{gallery.description}</p>
        )}
        <span className={styles.meta}>
          밈 {localMemes.length}개
        </span>
      </div>

      {localMemes.length > 0 ? (
        <div className={styles.grid}>
          {localMemes.map((meme) => (
            <MemeCard
              key={meme.id}
              meme={meme}
              onClick={() => onMemeClick?.(meme)}
              onToggleLike={() => onToggleLike?.(meme.id)}
              currentUserId={currentUserId}
              onEdit={(memeId, updates) => handleEdit(memeId, updates)}
              onDelete={() => handleDelete(meme.id)}
              onRemoveFromGallery={isOwn ? () => handleRemove(meme.id) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>이 갤러리에 아직 밈이 없습니다.</p>
          {isOwn && (
            <p className={styles.emptyHint}>
              밈 상세 페이지에서 &ldquo;내 갤러리에 추가&rdquo;를 눌러 담아보세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
