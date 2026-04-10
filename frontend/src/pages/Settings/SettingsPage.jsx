// src/components/SettingsPage.jsx
import { useState } from 'react';
import { FiUser, FiBell, FiLock, FiInfo, FiChevronRight, FiShield, FiExternalLink, FiEdit2 } from 'react-icons/fi';
import { FaGoogle, FaApple, FaPalette } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ProfileEditModal from '../../components/shared/ProfileEditModal/ProfileEditModal';
import styles from './SettingsPage.module.css';

const ToggleSwitch = ({ checked, onChange }) => (
  <button 
    className={`${styles['toggle-switch']} ${checked ? styles['on'] : ''}`} 
    onClick={() => onChange(!checked)}
    aria-checked={checked}
    role="switch"
    type="button"
  >
    <div className={styles['toggle-thumb']} />
  </button>
);

const SettingsSection = ({ title, icon: Icon, iconColor, children }) => (
  <section className={styles['settings-section']}>
    <div className={styles['settings-section-header']}>
      <div className={`${styles['settings-icon-wrapper']} ${iconColor}`}>
        <Icon />
      </div>
      <h2 className={styles['settings-section-title']}>{title}</h2>
    </div>
    <div className={styles['settings-card']}>
      {children}
    </div>
  </section>
);

export default function SettingsPage({ onLogout, onUpdateProfile }) {
  const { user, isLoggedIn } = useAuth();
  
  // 상태 관리 (더미 로직 및 실제 UI 연동)
  const [darkMode, setDarkMode] = useState(false);
  const [layout, setLayout] = useState('masonry');
  const [notiUpdates, setNotiUpdates] = useState(true);
  const [notiActivity, setNotiActivity] = useState(true);
  const [notiMarketing, setNotiMarketing] = useState(false);
  const [privacyScope, setPrivacyScope] = useState('public');
  const [searchAllowed, setSearchAllowed] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // 로딩 중이거나 유저가 없는 경우 처리
  if (!user && isLoggedIn) return <div className={styles['settings-loader']}>Loading...</div>;

  const displayUser = user || {
    username: 'Guest',
    email: 'guest@example.com',
    status_message: '로딩 중...',
    avatar_url: 'https://i.pravatar.cc/150'
  };

  return (
    <div className={styles['settings-page']}>
      <div className={styles['settings-container']}>
        
        {/* 1. Profile & Account Section */}
        <SettingsSection title="프로필 & 계정" icon={FiUser} iconColor="yellow">
          <div className={styles['profile-header-row']}>
            <div className={styles['profile-content']}>
              <div className={styles['profile-avatar-wrapper']}>
                <img 
                  src={displayUser.avatar_url || `https://i.pravatar.cc/150?u=${displayUser.username}`} 
                  alt="Profile" 
                  className={styles['profile-avatar']} 
                />
              </div>
              
              <div className={styles['profile-form']}>
                <div className={styles['row-inputs']}>
                  <div className={styles['input-group']}>
                    <label>ID</label>
                    <input type="text" readOnly value={`@${displayUser.username}`} />
                  </div>
                  <div className={styles['input-group']}>
                    <label>이메일</label>
                    <input type="text" readOnly value={displayUser.email} />
                  </div>
                </div>
                <div className={styles['input-group']}>
                  <label>상태 메시지</label>
                  <input type="text" readOnly value={displayUser.status_message || '상태 메시지가 없습니다.'} />
                </div>
              </div>
            </div>
            <button 
              className={styles['settings-edit-btn']} 
              onClick={() => setShowEditModal(true)}
              title="프로필 수정"
            >
              <FiEdit2 /> 수정
            </button>
          </div>

          <div className={styles['action-buttons-row']}>
            <button className={styles['btn-link-card']}>
              <span className={styles['btn-card-left']}>
                <span className={styles['btn-card-icon']}><FiShield /> 보안</span>
                <span className={styles['btn-card-desc']}>비밀번호 변경 & 2FA</span>
              </span>
              <FiChevronRight className={styles['chevron-icon']} />
            </button>
            <button className={styles['btn-link-card']}>
              <span className={styles['btn-card-left']}>
                <span className={styles['btn-card-icon']}>🔗 연결된 계정</span>
                <span className={styles['btn-card-desc']}>Google, Apple, Twitter</span>
              </span>
              <span className={styles['btn-card-right']}>
                <span className={styles['social-icons']}>
                  <FaGoogle className={`${styles['social-icon']} ${styles['google']}`} />
                  <span className={`${styles['social-icon']} ${styles['apple-wrap']}`}><FaApple /></span>
                </span>
                <FiChevronRight className={styles['chevron-icon']} />
              </span>
            </button>
          </div>

          <div className={styles['auth-buttons']}>
            <button className={styles['btn-logout']} onClick={onLogout}>로그아웃</button>
            <button className={styles['btn-delete']}>탈퇴하기</button>
          </div>
        </SettingsSection>

        {/* 2. Theme Section */}
        <SettingsSection title="테마" icon={FaPalette} iconColor="green">
          <div className={styles['settings-row']}>
            <div className={styles['text-content']}>
              <div className={styles['item-title']}>다크 모드</div>
              <div className={styles['item-desc']}>다크 모드로 전환합니다.</div>
            </div>
            <ToggleSwitch checked={darkMode} onChange={setDarkMode} />
          </div>
          
          <div className={styles['settings-row-col']}>
            <div className={styles['text-content']} style={{ marginBottom: '16px' }}>
              <div className={styles['item-title']}>피드 레이아웃</div>
            </div>
            <div className={styles['layout-options']}>
              <div className={`${styles['layout-card']} ${layout === 'masonry' ? styles['active'] : ''}`} onClick={() => setLayout('masonry')}>
                <div className={`${styles['layout-preview']} ${styles['layout-masonry']}`}>
                  <div className={styles['layout-col']}>
                    <div className={`${styles['layout-box']} ${styles['p-h-1']}`}></div>
                    <div className={`${styles['layout-box']} ${styles['p-h-2']}`}></div>
                  </div>
                  <div className={styles['layout-col']}>
                    <div className={`${styles['layout-box']} ${styles['p-h-2']}`}></div>
                    <div className={`${styles['layout-box']} ${styles['p-h-3']}`}></div>
                  </div>
                  <div className={styles['layout-col']}>
                    <div className={`${styles['layout-box']} ${styles['p-h-3']}`}></div>
                    <div className={`${styles['layout-box']} ${styles['p-h-1']}`}></div>
                  </div>
                </div>
                <div className={styles['layout-label']}>Masonry (Default)</div>
              </div>
              <div className={`${styles['layout-card']} ${layout === 'grid' ? styles['active'] : ''}`} onClick={() => setLayout('grid')}>
                <div className={`${styles['layout-preview']} ${styles['layout-grid']}`}>
                  <div className={styles['grid-row']}>
                    <div className={styles['layout-box']}></div>
                    <div className={styles['layout-box']}></div>
                    <div className={styles['layout-box']}></div>
                  </div>
                  <div className={styles['grid-row']}>
                    <div className={styles['layout-box']}></div>
                    <div className={styles['layout-box']}></div>
                    <div className={styles['layout-box']}></div>
                  </div>
                </div>
                <div className={styles['layout-label']}>Grid View</div>
              </div>
            </div>
          </div>
          
          <div className={`${styles['settings-row']} ${styles['last-row']} ${styles['border-top']}`}>
            <div className={styles['text-content']}>
              <div className={styles['item-title']}>폰트 설정</div>
              <div className={styles['item-desc']}>다양한 폰트를 준비중입니다. 기다려주세요 :)</div>
            </div>
            <button className={styles['btn-secondary']}>폰트 변경</button>
          </div>
        </SettingsSection>

        {/* 3. Notifications Section */}
        <SettingsSection title="알람 설정" icon={FiBell} iconColor="gray">
          <div className={styles['settings-row']}>
            <div className={styles['text-content']}>
              <div className={styles['item-title']}>업데이트</div>
              <div className={styles['item-desc']}>memit 업데이트 안내</div>
            </div>
            <ToggleSwitch checked={notiUpdates} onChange={setNotiUpdates} />
          </div>
          <div className={styles['settings-row']}>
            <div className={styles['text-content']}>
              <div className={styles['item-title']}>활동 알림</div>
              <div className={styles['item-desc']}>좋아요, 댓글, 팔로우 알림</div>
            </div>
            <ToggleSwitch checked={notiActivity} onChange={setNotiActivity} />
          </div>
          <div className={`${styles['settings-row']} ${styles['last-row']}`}>
            <div className={styles['text-content']}>
              <div className={styles['item-title']}>마케팅 알림</div>
              <div className={styles['item-desc']}>개인화된 피드 제안</div>
            </div>
            <ToggleSwitch checked={notiMarketing} onChange={setNotiMarketing} />
          </div>
        </SettingsSection>

        {/* 4. Privacy Section */}
        <SettingsSection title="개인정보" icon={FiLock} iconColor="gray">
          <div className={styles['settings-row']}>
            <div className={styles['text-content']}>
              <div className={styles['item-title']}>공개범위 설정</div>
              <div className={styles['item-desc']}>회원님의 밈은 기본적으로 상태로 설정됩니다.</div>
            </div>
            <div className={styles['tabs-container']}>
              <button className={`${styles['tab']} ${privacyScope === 'public' ? styles['active'] : ''}`} onClick={() => setPrivacyScope('public')}>공개</button>
              <button className={`${styles['tab']} ${privacyScope === 'private' ? styles['active'] : ''}`} onClick={() => setPrivacyScope('private')}>비공개</button>
            </div>
          </div>
          <div className={`${styles['settings-row']} ${styles['last-row']}`}>
            <div className={styles['text-content']}>
              <div className={styles['item-title']}>프로필 검색 허용</div>
              <div className={styles['item-desc']}>다른 사용자가 회원님을 검색할 수 있도록 허용합니다.</div>
            </div>
            <ToggleSwitch checked={searchAllowed} onChange={setSearchAllowed} />
          </div>
        </SettingsSection>

        {/* 5. About Section */}
        <SettingsSection title="밈잇에 관하여" icon={FiInfo} iconColor="gray">
          <ul className={styles['about-list']}>
             <li className={styles['about-item']}>
               <span className={styles['item-title']}>FAQ</span>
               <FiExternalLink className={styles['about-icon']} />
             </li>
             <li className={styles['about-item']}>
               <span className={styles['item-title']}>Notice</span>
               <FiChevronRight className={styles['about-icon']} />
             </li>
             <li className={styles['about-item']}>
               <span className={styles['item-title']}>Terms of Service</span>
               <FiChevronRight className={styles['about-icon']} />
             </li>
             <li className={`${styles['about-item']} ${styles['align-end']} ${styles['last-row']}`}>
                <div className={styles['version-info']}>
                   <span className={`${styles['version-label']} ${styles['item-title']}`}>Version</span>
                   <span className={styles['version-value']}>v1.0.2</span>
                </div>
                <span className={styles['badge']}>LATEST VERSION</span>
             </li>
          </ul>
        </SettingsSection>
        
      </div>

      {showEditModal && (
        <ProfileEditModal 
          user={user} 
          onSave={onUpdateProfile} 
          onClose={() => setShowEditModal(false)} 
        />
      )}
    </div>
  );
}
