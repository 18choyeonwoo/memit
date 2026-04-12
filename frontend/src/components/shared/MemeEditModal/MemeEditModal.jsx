import { useState } from 'react';
import { FiX, FiEdit2 } from 'react-icons/fi';
import styles from './MemeEditModal.module.css';

export default function MemeEditModal({ meme, onSave, onClose }) {
  const [title, setTitle] = useState(meme.title || '');
  const [description, setDescription] = useState(meme.description || '');
  const [tags, setTags] = useState(
    (meme.tags || []).map((t) => t.replace(/^#/, '')).join(', ')
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      await onSave({ title: title.trim(), description: description.trim(), tags: tags.trim() });
      onClose();
    } catch (err) {
      alert(err.message || '수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrap}><FiEdit2 /></div>
            <h2>밈 수정</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <FiX />
          </button>
        </div>

        <div className={styles.preview}>
          <img src={meme.image} alt={meme.title} className={styles.previewImg} />
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>제목 <span className={styles.required}>*</span></span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="밈 제목"
              maxLength={100}
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span>설명</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="밈 설명을 입력하세요"
              rows={3}
              maxLength={500}
            />
          </label>

          <label className={styles.field}>
            <span>태그 <span className={styles.hint}>(쉼표로 구분)</span></span>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: 웃긴짤, 공감, 직장인"
            />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={!title.trim() || isLoading}
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
