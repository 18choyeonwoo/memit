import { FiEdit2, FiPlus, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { useState } from 'react';
import { allGalleries } from '../../data';
import MemeCard from '../../components/meme/MemeCard';
import ProfileEditModal from '../../components/shared/ProfileEditModal/ProfileEditModal';
import CreateGalleryModal from '../../components/shared/CreateGalleryModal/CreateGalleryModal';
import { userService } from '../../services/userService';
import styles from './ProfilePage.module.css';

export default function ProfilePage({
  user,
  isOwn,
  memeCards,
  onMemeClick,
  onToggleLike,
  onAuthorClick,
  onGalleryClick,
  onUpdateProfile,
  currentUserId,
  onDeleteMeme,
}) {
  const [activeTab, setActiveTab] = useState('likedMemes');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateGalleryModal, setShowCreateGalleryModal] = useState(false);

  const handleCreateGallery = async (data) => {
    await userService.createGallery(data);
    // 성공 토스트는 부모에서 받기 어려우므로 alert 대신 모달이 닫히는 것으로 완료 표시
  };

  // 백엔드(real) user와 mock user 양쪽 필드 모두 대응
  const profile = {
    username: user?.username || '',
    statusMessage: user?.statusMessage || user?.status_message || '',
    avatar:
      user?.avatar ||
      user?.avatar_url ||
      `https://i.pravatar.cc/150?u=${user?.username}`,
    likesReceived: user?.likesReceived ?? user?.likes_received ?? '0',
    followers: user?.followers ?? user?.followers_count ?? 0,
    following: user?.following ?? user?.following_count ?? 0,
  };

  const userGalleries = allGalleries.filter(
    (g) => g.userId === user?.userId && (isOwn || g.isPublic)
  );

  const likedMemesList = memeCards.filter((meme) => meme.liked);

  return (
    <div className={styles['my-feed-page']}>
      {/* Profile Header */}
      <section className={styles['profile-header']}>
        <div className={styles['profile-image-container']}>
          <img src={profile.avatar} alt="Profile" className={styles['profile-avatar']} />
          {isOwn ? (
            <button
              className={styles['profile-edit-btn']}
              onClick={() => setShowEditModal(true)}
            >
              <FiEdit2 />
            </button>
          ) : (
            <button
              className={`${styles['follow-btn']} ${isFollowing ? styles['following'] : ''}`}
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? <><FiUserCheck /> 팔로잉</> : <><FiUserPlus /> 팔로우</>}
            </button>
          )}
        </div>

        <div className={styles['profile-info-content']}>
          <div className={styles['user-info']}>
            <h1 className={styles['username']}>{profile.username}</h1>
            <p className={styles['status-message']}>{profile.statusMessage}</p>
          </div>
          <div className={styles['profile-stats']}>
            <div className={styles['stat-box']}>
              <span className={styles['stat-value']}>{profile.likesReceived}</span>
              <span className={styles['stat-label']}>받은 좋아요 수</span>
            </div>
            <div className={styles['stat-box']}>
              <span className={styles['stat-value']}>{profile.followers}</span>
              <span className={styles['stat-label']}>팔로워</span>
            </div>
            <div className={styles['stat-box']}>
              <span className={styles['stat-value']}>{profile.following}</span>
              <span className={styles['stat-label']}>팔로잉</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className={styles['my-gallery-section']}>
        <div className={styles['section-title-wrap']}>
          <h2 className={styles['section-title']}>{profile.username} 님의 갤러리</h2>
          <button className={styles['view-all-btn']}>View All →</button>
        </div>

        <div className={styles['gallery-list']}>
          {userGalleries.map((gallery) => (
            <div
              key={gallery.id}
              className={styles['gallery-card']}
              onClick={() => onGalleryClick?.(gallery)}
            >
              <div className={styles['gallery-thumb-composite']}>
                <div className={styles['main-thumb']}>
                  {gallery.previewImages?.[0] && (
                    <img src={gallery.previewImages[0]} alt="" />
                  )}
                </div>
                <div className={styles['side-thumbs']}>
                  <div className={styles['side-thumb']}>
                    {gallery.previewImages?.[1] && (
                      <img src={gallery.previewImages[1]} alt="" />
                    )}
                  </div>
                  <div className={styles['side-thumb']}>
                    {gallery.previewImages?.[2] && (
                      <img src={gallery.previewImages[2]} alt="" />
                    )}
                  </div>
                </div>
              </div>
              <div className={styles['gallery-info-v2']}>
                <h3 className={styles['gallery-name-v2']}>{gallery.name}</h3>
                <div className={styles['gallery-meta-v2']}>
                  <span className={styles['pin-count']}>핀 {gallery.count}개</span>
                  <span className={styles['update-time']}>{gallery.updatedAt}</span>
                </div>
              </div>
            </div>
          ))}

          {isOwn && (
            <div className={styles['gallery-card']}>
              <button
                className={styles['create-gallery-thumb']}
                onClick={() => setShowCreateGalleryModal(true)}
              >
                <FiPlus className={styles['create-icon-v2']} />
              </button>
              <div className={styles['gallery-info-v2']}>
                <h3 className={styles['gallery-name-v2']} style={{ color: '#888' }}>
                  새 갤러리
                </h3>
                <div className={styles['gallery-meta-v2']}>
                  <span className={styles['update-time']}>새로운 컬렉션 만들기</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content Tabs */}
      <section className={styles['content-tabs-section']}>
        <div className={styles['content-tabs']}>
          <button
            className={`${styles['tab-btn']} ${activeTab === 'likedMemes' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('likedMemes')}
          >
            좋아요한 밈
          </button>
          <button
            className={`${styles['tab-btn']} ${activeTab === 'likedGalleries' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('likedGalleries')}
          >
            좋아요한 갤러리
          </button>
        </div>
      </section>

      <section className={styles['liked-meme-section']}>
        {activeTab === 'likedMemes' && (
          <div className={styles['liked-meme-grid']}>
            {likedMemesList.length > 0 ? (
              likedMemesList.map((meme) => (
                <MemeCard
                  key={meme.id}
                  meme={meme}
                  onClick={() => onMemeClick(meme)}
                  onToggleLike={() => onToggleLike(meme.id)}
                  onAuthorClick={onAuthorClick}
                  currentUserId={currentUserId}
                  onDelete={() => onDeleteMeme?.(meme.id)}
                />
              ))
            ) : (
              <div className={styles['empty-state']}>
                <p>아직 좋아요한 밈이 없습니다.</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'likedGalleries' && (
          <div className={styles['empty-state']}>
            <p>아직 좋아요한 갤러리가 없습니다.</p>
          </div>
        )}
      </section>

      {/* 프로필 수정 모달 */}
      {showEditModal && (
        <ProfileEditModal
          user={user}
          onSave={async (updates) => { await onUpdateProfile?.(updates); }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* 갤러리 생성 모달 */}
      {showCreateGalleryModal && (
        <CreateGalleryModal
          onSave={handleCreateGallery}
          onClose={() => setShowCreateGalleryModal(false)}
        />
      )}
    </div>
  );
}
