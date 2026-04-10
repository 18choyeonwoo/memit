import { useState } from 'react';
import { FiX, FiGrid } from 'react-icons/fi';
import styles from './CreateGalleryModal.module.css';

export default function CreateGalleryModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await onSave({ name: name.trim(), description: description.trim() });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrap}>
              <FiGrid />
            </div>
            <h2>새 갤러리 만들기</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>
              갤러리 이름 <span className={styles.required}>*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="갤러리 이름을 입력하세요"
              maxLength={50}
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span>설명 (선택)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 갤러리를 소개해보세요"
              rows={3}
              maxLength={200}
            />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? '만드는 중...' : '갤러리 만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
