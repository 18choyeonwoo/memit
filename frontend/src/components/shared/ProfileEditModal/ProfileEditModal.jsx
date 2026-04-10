import { useState, useRef } from 'react';
import { FiX, FiCamera } from 'react-icons/fi';
import { userService } from '../../../services/userService';
import styles from './ProfileEditModal.module.css';

export default function ProfileEditModal({ user, onSave, onClose }) {
  const [bio, setBio] = useState(user?.bio || '');
  const [statusMessage, setStatusMessage] = useState(user?.status_message || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || `https://i.pravatar.cc/150?u=${user?.username}`);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let finalAvatarUrl = user?.avatar_url;

      // 1. 아바타 이미지가 새로 선택되었다면 먼저 업로드
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const updatedUser = await userService.uploadAvatar(formData);
        finalAvatarUrl = updatedUser.avatar_url;
      }

      // 2. 나머지 프로필 정보 업데이트
      await onSave({ bio, status_message: statusMessage, avatar_url: finalAvatarUrl });
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('프로필 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>프로필 수정</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarPreviewWrapper} onClick={() => fileInputRef.current.click()}>
              <img 
                src={avatarPreview} 
                alt="Avatar Preview" 
                className={styles.avatarPreview} 
              />
              <div className={styles.editOverlay}>
                <FiCamera />
              </div>
            </div>
            <label className={styles.uploadLabel}>
              사진 변경
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className={styles.hiddenInput} 
                onChange={handleFileChange}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>상태 메시지</span>
            <input
              type="text"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="상태 메시지를 입력하세요"
              maxLength={100}
            />
          </label>

          <label className={styles.field}>
            <span>소개 (Bio)</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="나를 소개해보세요"
              rows={4}
              maxLength={200}
            />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
