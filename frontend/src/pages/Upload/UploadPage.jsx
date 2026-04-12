import { useState, useRef } from 'react';
import {
  FiUpload, FiTrash2, FiSend, FiChevronDown,
  FiShield, FiArrowLeft, FiImage,
} from 'react-icons/fi';
import { memeService } from '../../services/memeService';
import styles from './UploadPage.module.css';

const RECOMMENDED_TAGS = ['무한도전', '릴스', '퇴사짤', '딥빡'];

export default function UploadPage({ onBack, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);

  // 실제 File 객체와 표시용 메타데이터 분리
  const [fileObj, setFileObj]   = useState(null);
  const [fileMeta, setFileMeta] = useState(null); // { name, size, preview }

  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput]     = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [gallery, setGallery]       = useState('');
  const [dropHover, setDropHover]   = useState(false);
  const fileRef = useRef(null);
  const composingRef = useRef(false);

  // ── 파일 적용 공통 ────────────────────────────────────────
  const applyFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (fileMeta?.preview) URL.revokeObjectURL(fileMeta.preview);
    setFileObj(file);
    setFileMeta({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      preview: URL.createObjectURL(file),
    });
  };

  const removeFile = () => {
    if (fileMeta?.preview) URL.revokeObjectURL(fileMeta.preview);
    setFileObj(null);
    setFileMeta(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDropHover(false);
    applyFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e) => applyFile(e.target.files[0]);

  // ── 태그 ─────────────────────────────────────────────────
  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const handleTagKeyDown = (e) => {
    // 한국어 IME 조합 중 Enter는 무시 (마지막 글자 중복 방지)
    if (e.nativeEvent.isComposing || composingRef.current) return;
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!selectedTags.includes(newTag)) setSelectedTags((p) => [...p, newTag]);
      setTagInput('');
    }
  };

  // ── 제출 ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!fileObj)        { alert('이미지를 선택해 주세요.'); return; }
    if (!title.trim())   { alert('제목을 입력해 주세요.'); return; }

    // tagInput은 Enter로 확정된 것만 selectedTags에 있으므로 그대로 사용
    const allTags = [...selectedTags];

    const formData = new FormData();
    formData.append('file', fileObj);
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('tags', allTags.join(','));

    setIsUploading(true);
    try {
      await memeService.uploadMeme(formData);
      onUploadSuccess?.();
      onBack();
    } catch (err) {
      alert('업로드 실패: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const canSubmit = !!fileObj && !!title.trim() && !isUploading;

  return (
    <section className={styles['upload-page']}>
      <button className={styles['upload-back-btn']} onClick={onBack} type="button">
        <FiArrowLeft />
      </button>

      <div className={styles['upload-page-header']}>
        <h1 className={styles['upload-page-title']}>Share your mimits!</h1>
        <p className={styles['upload-page-subtitle']}>당신의 밈잇을 공유해 볼까요? 🪄</p>
      </div>

      <div className={styles['upload-form-container']}>
        {/* ── 왼쪽: 이미지 드롭 ── */}
        <div className={styles['upload-left-col']}>
          <div
            className={`${styles['drag-drop-zone']} ${dropHover ? styles['hover'] : ''} ${fileMeta ? styles['has-file'] : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDropHover(true); }}
            onDragLeave={() => setDropHover(false)}
            onDrop={handleDrop}
            onClick={() => !fileMeta && fileRef.current?.click()}
          >
            {fileMeta?.preview ? (
              <img src={fileMeta.preview} alt="미리보기" className={styles['preview-img']} />
            ) : (
              <>
                <div className={styles['drop-icon-circle']}>
                  <FiUpload className={styles['drop-icon']} />
                </div>
                <p className={styles['drop-title']}>Drop your meme here</p>
                <p className={styles['drop-sub']}>PNG, JPG, GIF, WEBP · 최대 10MB</p>
                <button
                  className={styles['browse-btn']}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                >
                  Or click to browse files
                </button>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className={styles['file-input-hidden']}
              onChange={handleFileSelect}
            />
          </div>

          {fileMeta && (
            <div className={styles['file-preview']}>
              <FiImage className={styles['file-thumb-icon']} />
              <div className={styles['file-info']}>
                <p className={styles['file-name']}>{fileMeta.name}</p>
                <p className={styles['file-meta']}>업로드 대기중 · {fileMeta.size}</p>
              </div>
              <button className={styles['file-delete']} type="button" onClick={removeFile}>
                <FiTrash2 />
              </button>
            </div>
          )}
        </div>

        {/* ── 오른쪽: 폼 ── */}
        <div className={styles['upload-right-col']}>

          {/* 제목 (필수) */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>
              제목 <span className={styles['required']}>*</span>
            </label>
            <input
              className={styles['form-input']}
              type="text"
              placeholder="밈 제목을 입력해 주세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* 설명 (선택) */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>설명 (선택)</label>
            <textarea
              className={styles['form-textarea']}
              placeholder="당신의 밈잇을 설명해 주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* 태그 (선택) */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>태그 (선택)</label>
            <p className={styles['recommend-label']}>• 추천 태그</p>
            <div className={styles['recommend-tags']}>
              {RECOMMENDED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`${styles['rec-tag']} ${selectedTags.includes(tag) ? styles['selected'] : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <input
              className={styles['form-input']}
              type="text"
              placeholder="태그 입력 후 Enter (예: 공감짤)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onCompositionStart={() => { composingRef.current = true; }}
              onCompositionEnd={() => { composingRef.current = false; }}
            />
            {selectedTags.length > 0 && (
              <div className={styles['selected-tags']}>
                {selectedTags.map((tag) => (
                  <span key={tag} className={styles['selected-tag-chip']}>
                    #{tag}
                    <button
                      type="button"
                      className={styles['chip-remove']}
                      onClick={() => toggleTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 갤러리 선택 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>갤러리에 추가</label>
            <div className={styles['custom-select']}>
              <select
                className={styles['form-select']}
                value={gallery}
                onChange={(e) => setGallery(e.target.value)}
              >
                <option value="">선택 안 함</option>
                <option value="funny">웃긴 짤</option>
                <option value="relatable">공감 짤</option>
                <option value="retro">레트로 밈</option>
              </select>
              <FiChevronDown className={styles['select-arrow']} />
            </div>
          </div>

          <div className={styles['review-notice']}>
            <FiShield className={styles['notice-icon']} />
            <p className={styles['notice-text']}>
              업로드한 밈잇은 심사 후에 올라가요.
              <br />
              심사 기간은 최대 3일입니다.
            </p>
          </div>

          <button
            className={`${styles['submit-btn']} ${!canSubmit ? styles['disabled'] : ''}`}
            onClick={handleSubmit}
            disabled={!canSubmit}
            type="button"
          >
            <span>{isUploading ? 'Uploading...' : 'mimit upload!'}</span>
            <FiSend className={styles['submit-icon']} />
          </button>
        </div>
      </div>
    </section>
  );
}
