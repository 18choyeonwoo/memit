function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  return `${Math.floor(hours / 24)}D AGO`;
}

// Backend meme → frontend meme shape
export function adaptMeme(m) {
  const imageUrl = m.image_url?.startsWith('http')
    ? m.image_url
    : `http://localhost:8000${m.image_url}`;
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
    userId: m.user_id,
    timeAgo: formatTimeAgo(m.created_at),
  };
}
