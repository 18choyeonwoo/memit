import { apiClient } from '../api/apiClient';

function formatTimeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

function adaptComment(raw) {
  return {
    id: raw.id,
    content: raw.content,
    is_anonymous: raw.is_anonymous,
    user_id: raw.user_id,
    author_name: raw.is_anonymous ? null : raw.author?.username,
    timeAgo: formatTimeAgo(raw.created_at),
  };
}

function adaptPost(raw) {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    is_anonymous: raw.is_anonymous,
    image_url: raw.image_url ?? null,
    user_id: raw.user_id,
    author: raw.is_anonymous ? null : raw.author?.username,
    timeAgo: formatTimeAgo(raw.created_at),
    likes: 0,
    liked: false,
    comments: (raw.comments ?? []).map(adaptComment),
  };
}

export const communityService = {
  getPosts: async () => {
    const data = await apiClient.get('/posts/');
    return data.map(adaptPost);
  },

  createPost: async ({ title, content, isAnonymous }) => {
    const data = await apiClient.post('/posts/', {
      title,
      content,
      is_anonymous: isAnonymous,
    });
    return adaptPost(data);
  },

  deletePost: (postId) => apiClient.delete(`/posts/${postId}`),

  createComment: async (postId, { content, isAnonymous }) => {
    const data = await apiClient.post(`/posts/${postId}/comments`, {
      content,
      is_anonymous: isAnonymous,
    });
    return adaptComment(data);
  },

  deleteComment: (postId, commentId) =>
    apiClient.delete(`/posts/${postId}/comments/${commentId}`),
};
