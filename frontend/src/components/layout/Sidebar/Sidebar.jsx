import { useState } from 'react';
import { BsEmojiSmile } from 'react-icons/bs';
import { FiCompass, FiSettings, FiMenu, FiPlus, FiUsers } from 'react-icons/fi';
import { menuItems } from '../../../data';
import styles from './Sidebar.module.css';

const iconMap = {
  smile: <BsEmojiSmile />,
  compass: <FiCompass />,
  community: <FiUsers />,
  settings: <FiSettings />,
};

// onMenuClick: 메뉴 전환 콜백
// onUploadClick: 업로드 버튼 클릭 콜백
export default function Sidebar({ activeMenu, onMenuClick, onUploadClick }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`${styles['sidebar']} ${isCollapsed ? styles['collapsed'] : ''}`}>
      <div className={styles['sidebar-top']}>
        <div className={styles['sidebar-header']}>
          <h1 className={styles['logo']} onClick={() => onMenuClick('recommend')} style={{ cursor: 'pointer' }}>
            {isCollapsed ? 'M' : 'Memit'}
          </h1>
          <button className={styles['collapse-toggle']} onClick={() => setIsCollapsed(!isCollapsed)}>
            <FiMenu />
          </button>
        </div>

        {!isCollapsed && <p className={styles['categories-label']}>Categories</p>}

        <nav className={styles['menu-list']}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles['menu-item']} ${activeMenu === item.id ? styles['active'] : ''}`}
              onClick={() => onMenuClick(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={styles['menu-icon']}>{iconMap[item.icon]}</span>
              {!isCollapsed && <span className={styles['menu-label']}>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <button className={styles['upload-btn']} onClick={onUploadClick} title={isCollapsed ? "Upload Meme" : undefined}>
        {isCollapsed ? <FiPlus /> : 'Upload Meme'}
      </button>
    </aside>
  );
}
