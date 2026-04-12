const BACKEND_URL = 'http://localhost:8000';

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  return `${Math.floor(hours / 24)}D AGO`;
}

function toAbsoluteUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
}

// Backend user → frontend user shape (avatar_url 절대경로 변환)
export function adaptUser(u) {
  if (!u) return u;
  return { ...u, avatar_url: toAbsoluteUrl(u.avatar_url) };
}

// Backend meme → frontend meme shape
export function adaptMeme(m) {
  const imageUrl = toAbsoluteUrl(m.image_url);
  return {
    id: m.id,
    image: imageUrl,
    title: m.title,
    description: m.description || '',
    likes: m.likes_count,
    liked: false,
    tags: (m.tags || []).map(t => `#${t.name}`),
    author: m.author?.username || 'Unknown',
    authorId: m.author?.id,
    userId: m.author?.id,
    timeAgo: formatTimeAgo(m.created_at),
  };
}
