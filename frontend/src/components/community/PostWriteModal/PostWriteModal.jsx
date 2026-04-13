import { useState, useRef } from 'react';
import { FiX, FiImage, FiTrash2 } from 'react-icons/fi';
import styles from './PostWriteModal.module.css';

export default function PostWriteModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ title, content, isAnonymous, imageFile });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>글 작성</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* 본문 */}
        <div className={styles.body}>
          <input
            className={styles.titleInput}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />

          <textarea
            className={styles.contentInput}
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
          />

          {/* 이미지 첨부 미리보기 */}
          {imagePreview && (
            <div className={styles.previewWrapper}>
              <img src={imagePreview} alt="첨부 이미지" className={styles.previewImage} />
              <button className={styles.removeImageBtn} onClick={handleRemoveImage}>
                <FiTrash2 />
              </button>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {/* 이미지 첨부 버튼 */}
            <button
              className={styles.attachBtn}
              onClick={() => fileInputRef.current?.click()}
              title="이미지 첨부"
            >
              <FiImage />
              <span>사진</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />

            {/* 익명 토글 */}
            <label className={styles.anonymousLabel}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className={styles.anonymousCheckbox}
              />
              <span className={styles.anonymousText}>익명</span>
            </label>
          </div>

          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>취소</button>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
