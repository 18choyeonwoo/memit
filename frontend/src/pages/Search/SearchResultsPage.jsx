import { useState } from 'react';
import { FiSearch, FiImage, FiFolder, FiUsers, FiUploadCloud } from 'react-icons/fi';
import styles from './SearchResultsPage.module.css';

export default function SearchResultsPage({ query, onUploadClick }) {
  const [activeTab, setActiveTab] = useState('memes');

  // 모킹 상태: 검색 결과가 모두 빈 상태라고 가정 (설계 요구사항)
  const isEmpty = true; 

  const renderTabContent = () => {
    if (isEmpty) {
      return (
        <div className={styles['empty-state']}>
          <div className={styles['empty-icon-wrapper']}>
             <FiSearch className={styles['empty-icon']} />
          </div>
          <h3 className={styles['empty-title']}>
            아직 관련된 {activeTab === 'memes' ? '밈이' : activeTab === 'galleries' ? '갤러리가' : '사용자가'} 없어요.
          </h3>
          <p className={styles['empty-desc']}>첫 밈을 업로드 해보시겠어요?</p>
          <button className={styles['upload-btn']} onClick={onUploadClick}>
            <FiUploadCloud className={styles['upload-icon']} /> 밈 업로드하기
          </button>
        </div>
      );
    }

    // 결과가 있는 경우 렌더링 로직 (추후 연동)
    return null;
  };

  return (
    <div className={styles['search-results-page']}>
      <div className={styles['search-header']}>
        <h1 className={styles['search-title']}>
          <span className={styles['highlight']}>"{query}"</span> 검색 결과
        </h1>
      </div>

      <div className={styles['tabs-section']}>
        <div className={styles['tabs']}>
          <button 
            className={`${styles['tab-btn']} ${activeTab === 'memes' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('memes')}
          >
            <FiImage className={styles['tab-icon']} /> 밈 (Memes)
          </button>
          <button 
            className={`${styles['tab-btn']} ${activeTab === 'galleries' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('galleries')}
          >
            <FiFolder className={styles['tab-icon']} /> 갤러리 (Galleries)
          </button>
          <button 
            className={`${styles['tab-btn']} ${activeTab === 'users' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FiUsers className={styles['tab-icon']} /> 사용자 (Users)
          </button>
        </div>
      </div>

      <div className={styles['results-content']}>
        {renderTabContent()}
      </div>
    </div>
  );
}
