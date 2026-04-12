import { useState, useEffect } from 'react';
import { FiX, FiGrid, FiCheck, FiPlus } from 'react-icons/fi';
import { userService } from '../../../services/userService';
import styles from './AddToGalleryModal.module.css';

export default function AddToGalleryModal({ memeId, onClose }) {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [alreadyInIds, setAlreadyInIds] = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    userService.getMyGalleries()
      .then((data) => {
        setGalleries(data);
        const ids = new Set(
          data.filter((g) => g.memes.some((m) => m.id === memeId)).map((g) => g.id)
        );
        setAlreadyInIds(ids);
      })
      .catch(() => setErrorMsg('갤러리를 불러올 수 없어요. 로그인 상태를 확인해주세요.'))
      .finally(() => setLoading(false));
  }, [memeId]);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setAdding(true);
    setErrorMsg('');
    try {
      await userService.addMemeToGallery(selectedId, memeId);
      setAlreadyInIds((prev) => new Set([...prev, selectedId]));
      setSelectedId(null);
    } catch (err) {
      if (err?.status === 409) {
        setAlreadyInIds((prev) => new Set([...prev, selectedId]));
        setSelectedId(null);
      } else {
        setErrorMsg('추가에 실패했어요. 다시 시도해주세요.');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setErrorMsg('');
    try {
      const created = await userService.createGallery({ name: newName.trim() });
      setGalleries((prev) => [...prev, created]);
      setNewName('');
      setShowCreate(false);
      setSelectedId(created.id);
    } catch {
      setErrorMsg('갤러리 생성에 실패했어요.');
    } finally {
      setCreating(false);
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
            <h2>갤러리에 추가</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <FiX />
          </button>
        </div>

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}

        <div className={styles.list}>
          {loading ? (
            <p className={styles.hint}>불러오는 중...</p>
          ) : galleries.length === 0 && !showCreate ? (
            <p className={styles.hint}>아직 갤러리가 없어요. 아래에서 만들어보세요.</p>
          ) : (
            galleries.map((g) => {
              const alreadyIn = alreadyInIds.has(g.id);
              const isSelected = selectedId === g.id;
              return (
                <button
                  key={g.id}
                  className={[
                    styles.galleryItem,
                    isSelected ? styles.selected : '',
                    alreadyIn ? styles.alreadyIn : '',
                  ].join(' ')}
                  onClick={() => !alreadyIn && setSelectedId(isSelected ? null : g.id)}
                  disabled={alreadyIn}
                >
                  <div className={styles.galleryIcon}>
                    <FiGrid />
                  </div>
                  <span className={styles.galleryName}>{g.name}</span>
                  {alreadyIn ? (
                    <span className={styles.alreadyBadge}>이미 추가됨</span>
                  ) : isSelected ? (
                    <FiCheck className={styles.selectCheck} />
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        {showCreate ? (
          <form onSubmit={handleCreate} className={styles.createForm}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="갤러리 이름"
              autoFocus
              maxLength={50}
            />
            <div className={styles.createActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowCreate(false)}>
                취소
              </button>
              <button type="submit" className={styles.saveBtn} disabled={!newName.trim() || creating}>
                {creating ? '만드는 중...' : '만들기'}
              </button>
            </div>
          </form>
        ) : (
          <button className={styles.newGalleryBtn} onClick={() => setShowCreate(true)}>
            <FiPlus />
            새 갤러리 만들기
          </button>
        )}

        <div className={styles.footer}>
          <button className={styles.cancelFooterBtn} onClick={onClose} type="button">
            취소
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!selectedId || adding}
            type="button"
          >
            {adding ? '추가 중...' : '추가하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
