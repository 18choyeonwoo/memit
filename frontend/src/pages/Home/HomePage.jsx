import MemeGrid from '../../components/meme/MemeGrid';
import Leaderboard from '../../components/feature/Leaderboard';
import Footer from '../../components/layout/Footer';

export default function HomePage({ memeCards, isLoading, handleMemeClick, toggleLike, handleProfileView, currentUserId, onEdit, onDelete }) {
  return (
    <>
      <div className="content-row">
        <main className="feed-area">
          <MemeGrid
            memeCards={memeCards}
            isLoading={isLoading}
            onMemeClick={handleMemeClick}
            onToggleLike={toggleLike}
            onAuthorClick={handleProfileView}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </main>
        <Leaderboard />
      </div>
      <Footer />
    </>
  );
}
