import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import HomePage from './pages/Home';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';
import UploadPage from './pages/Upload';
import SearchResultsPage from './pages/Search';
import MemeDetail from './pages/Detail';
import GalleryDetailPage from './pages/GalleryDetail/GalleryDetailPage';
import AuthPage from './pages/Auth';
import CommunityPage from './pages/Community';
import Toast from './components/shared/Toast/Toast';
import { useToast } from './hooks/useToast';
import { useAuth } from './context/AuthContext';
import { memeService } from './services/memeService';
import { userService } from './services/userService';
import { communityService } from './services/communityService';
import { adaptMeme } from './api/adapters';
import { allUsers } from './api/mockData';
import './App.css';

function App() {
  const [page, setPage] = useState('recommend');
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [memeCards, setMemeCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProfileUser, setActiveProfileUser] = useState(allUsers[0]);
  const [communityPosts, setCommunityPosts] = useState([]);

  const { isLoggedIn, user, logout, updateUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  // 실제 백엔드에서 밈 목록 로드
  useEffect(() => {
    const initFetch = async () => {
      setIsLoading(true);
      try {
        const data = await memeService.getMemes();
        setMemeCards(data);
      } catch (err) {
        showToast('밈을 불러오는 데 실패했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    initFetch();
  }, [showToast]);

  // ── 좋아요 토글 ────────────────────────────────────────────
  const toggleLike = async (memeId) => {
    if (!isLoggedIn) {
      setPage('auth');
      showToast('좋아요를 누르려면 로그인이 필요합니다.', 'info');
      return;
    }

    const meme = memeCards.find((m) => m.id === memeId);
    const optimisticLiked = !meme.liked;

    // 낙관적 업데이트
    setMemeCards((prev) =>
      prev.map((m) =>
        m.id === memeId
          ? { ...m, liked: optimisticLiked, likes: optimisticLiked ? m.likes + 1 : m.likes - 1 }
          : m
      )
    );

    try {
      const result = await memeService.toggleLike(memeId);
      // 서버 응답값으로 최종 동기화
      setMemeCards((prev) =>
        prev.map((m) =>
          m.id === memeId ? { ...m, liked: result.liked, likes: result.likes_count } : m
        )
      );
      showToast(result.liked ? '좋아요를 눌렀습니다! ❤️' : '좋아요를 취소했습니다.');
    } catch {
      // 실패 시 롤백
      setMemeCards((prev) =>
        prev.map((m) =>
          m.id === memeId
            ? { ...m, liked: !optimisticLiked, likes: optimisticLiked ? m.likes - 1 : m.likes + 1 }
            : m
        )
      );
      showToast('처리에 실패했습니다.', 'error');
    }
  };

  // ── 밈 수정 ───────────────────────────────────────────────
  const handleEditMeme = async (memeId, updates) => {
    try {
      const raw = await memeService.updateMeme(memeId, updates);
      const updatedFields = {
        title: raw.title,
        description: raw.description ?? '',
        tags: (raw.tags || []).map((t) => `#${t.name}`),
      };
      setMemeCards((prev) =>
        prev.map((m) => (m.id === memeId ? { ...m, ...updatedFields } : m))
      );
      // 상세 페이지에서 수정한 경우 selectedMeme도 갱신
      setSelectedMeme((prev) => (prev?.id === memeId ? { ...prev, ...updatedFields } : prev));
      showToast('밈이 수정되었습니다.', 'success');
    } catch (err) {
      showToast(err.message || '수정에 실패했습니다.', 'error');
      throw err;
    }
  };

  // ── 밈 삭제 ───────────────────────────────────────────────
  const handleDeleteMeme = async (memeId) => {
    try {
      await memeService.deleteMeme(memeId);
      setMemeCards((prev) => prev.filter((m) => m.id !== memeId));
      showToast('밈이 삭제되었습니다.', 'success');
      if (page === 'detail') {
        setPage('recommend');
        setSelectedMeme(null);
      }
    } catch (err) {
      showToast(err.message || '삭제에 실패했습니다.', 'error');
    }
  };

  // ── 커뮤니티 ──────────────────────────────────────────────
  useEffect(() => {
    communityService.getPosts()
      .then(setCommunityPosts)
      .catch(() => {});
  }, []);

  const handleAddPost = async ({ title, content, isAnonymous }) => {
    try {
      const newPost = await communityService.createPost({ title, content, isAnonymous });
      setCommunityPosts((prev) => [newPost, ...prev]);
    } catch (err) {
      showToast(err.message || '글 등록에 실패했습니다.', 'error');
      throw err;
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await communityService.deletePost(postId);
      setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('글이 삭제되었습니다.', 'success');
    } catch (err) {
      showToast(err.message || '삭제에 실패했습니다.', 'error');
    }
  };

  const handleAddComment = async ({ postId, content, isAnonymous }) => {
    try {
      const newComment = await communityService.createComment(postId, { content, isAnonymous });
      setCommunityPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...(p.comments ?? []), newComment] } : p
        )
      );
    } catch (err) {
      showToast(err.message || '댓글 등록에 실패했습니다.', 'error');
      throw err;
    }
  };

  const handleDeleteComment = async ({ postId, commentId }) => {
    try {
      await communityService.deleteComment(postId, commentId);
      setCommunityPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: (p.comments ?? []).filter((c) => c.id !== commentId) }
            : p
        )
      );
    } catch (err) {
      showToast(err.message || '댓글 삭제에 실패했습니다.', 'error');
    }
  };

  // ── 프로필 수정 ────────────────────────────────────────────
  const handleUpdateProfile = async (updates) => {
    try {
      const updated = await userService.updateProfile(updates);
      updateUser(updated);
      setActiveProfileUser((prev) => ({ ...prev, ...updated }));
      showToast('프로필이 수정되었습니다.', 'success');
    } catch (err) {
      showToast(err.message || '프로필 수정에 실패했습니다.', 'error');
    }
  };

  // ── 네비게이션 ─────────────────────────────────────────────
  const handleMemeClick = (meme) => {
    setSelectedMeme(meme);
    setPage('detail');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (page === 'gallery') {
      setPage(activeProfileUser ? 'feed' : 'recommend');
      setSelectedGallery(null);
    } else {
      setPage('recommend');
      setSelectedMeme(null);
    }
  };

  const handleGalleryClick = (gallery) => {
    setSelectedGallery(gallery);
    setPage('gallery');
    window.scrollTo(0, 0);
  };

  const handleMenuClick = (menuId) => {
    if (['feed', 'settings', 'upload'].includes(menuId) && !isLoggedIn) {
      setPage('auth');
      showToast('로그인이 필요한 서비스입니다.', 'info');
      return;
    }
    if (menuId === 'feed' && user) {
      setActiveProfileUser(user);
    }
    setPage(menuId);
    window.scrollTo(0, 0);
  };

  const handleProfileView = (username) => {
    const targetUser = allUsers.find((u) => u.username === username);
    if (targetUser) {
      setActiveProfileUser(targetUser);
      setPage('profile');
      window.scrollTo(0, 0);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage('search');
    window.scrollTo(0, 0);
  };

  // ── 렌더링 ─────────────────────────────────────────────────
  const renderContent = () => {
    switch (page) {
      case 'detail':
        return (
          <MemeDetail
            meme={selectedMeme}
            onBack={handleBack}
            onMemeClick={handleMemeClick}
            currentUserId={user?.id}
            onDelete={handleDeleteMeme}
            onEdit={handleEditMeme}
          />
        );

      case 'gallery':
        return (
          <GalleryDetailPage
            gallery={selectedGallery}
            memes={(selectedGallery?.memes || []).map(adaptMeme)}
            onBack={handleBack}
            onMemeClick={handleMemeClick}
            onToggleLike={toggleLike}
            onDeleteMeme={handleDeleteMeme}
            onEditMeme={handleEditMeme}
            onRemoveFromGallery={async (memeId) => {
              await userService.removeFromGallery(selectedGallery.id, memeId);
            }}
            currentUserId={user?.id}
            isOwn={isLoggedIn && selectedGallery?.user_id === user?.id}
          />
        );

      case 'upload':
        return (
          <UploadPage
            onBack={handleBack}
            onUploadSuccess={async () => {
              showToast('업로드에 성공했습니다! ✨', 'success');
              // 업로드 후 피드 갱신
              const data = await memeService.getMemes();
              setMemeCards(data);
            }}
          />
        );

      case 'feed':
      case 'profile':
        return (
          <ProfilePage
            user={activeProfileUser}
            isOwn={isLoggedIn && (activeProfileUser?.userId === user?.userId || activeProfileUser?.id === user?.id)}
            memeCards={memeCards}
            onMemeClick={handleMemeClick}
            onToggleLike={toggleLike}
            onAuthorClick={handleProfileView}
            onGalleryClick={handleGalleryClick}
            onUpdateProfile={handleUpdateProfile}
            currentUserId={user?.id}
            onDeleteMeme={handleDeleteMeme}
            onEditMeme={handleEditMeme}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            onLogout={() => {
              logout();
              setPage('recommend');
              showToast('로그아웃 되었습니다.');
            }}
            onUpdateProfile={handleUpdateProfile}
          />
        );

      case 'search':
        return (
          <SearchResultsPage
            query={searchQuery}
            onUploadClick={() => handleMenuClick('upload')}
            onMemeClick={handleMemeClick}
            onToggleLike={toggleLike}
            currentUserId={user?.id}
            onDelete={handleDeleteMeme}
            onEdit={handleEditMeme}
            communityPosts={communityPosts}
            onCommunityPostClick={() => handleMenuClick('community')}
          />
        );

      case 'community':
        return (
          <CommunityPage
            posts={communityPosts}
            onAddPost={handleAddPost}
            onDeletePost={handleDeletePost}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            currentUserId={user?.id}
            isLoggedIn={isLoggedIn}
            onLoginRequired={() => {
              setPage('auth');
              showToast('로그인이 필요한 서비스입니다.', 'info');
            }}
          />
        );

      case 'recommend':
      default:
        return (
          <HomePage
            memeCards={memeCards}
            isLoading={isLoading}
            handleMemeClick={handleMemeClick}
            toggleLike={toggleLike}
            handleProfileView={handleProfileView}
            currentUserId={user?.id}
            onEdit={handleEditMeme}
            onDelete={handleDeleteMeme}
          />
        );
    }
  };

  // Auth 전체화면 (사이드바 없음)
  if (page === 'auth') {
    return (
      <div className="app guest-mode">
        <AuthPage
          onAuthSuccess={() => {
            setPage('recommend');
            showToast(`${user?.username || '회원'}님, 반갑습니다! 👋`, 'success');
          }}
        />
        <ToastsList toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  const activeSidebarMenu = ['recommend', 'feed', 'community', 'settings'].includes(page)
    ? page
    : page === 'detail'
    ? 'recommend'
    : page === 'profile' && user && activeProfileUser?.userId === user?.userId
    ? 'feed'
    : '';

  return (
    <div className="app">
      <Sidebar
        activeMenu={activeSidebarMenu}
        onMenuClick={handleMenuClick}
        onUploadClick={() => handleMenuClick('upload')}
      />
      <div className="main-wrapper">
        <Header onSearch={handleSearch} onLoginClick={() => setPage('auth')} />
        {renderContent()}
      </div>
      <ToastsList toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function ToastsList({ toasts, removeToast }) {
  return (
    <div className="toasts-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default App;
