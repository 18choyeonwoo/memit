// src/services/memeService.js
import { simulateRequest } from '../api/client';
import { trendingTags } from '../api/mockData';
import { apiClient } from '../api/apiClient';
import { adaptMeme } from '../api/adapters';

export const memeService = {
  // 실제 백엔드에서 밈 목록 조회
  getMemes: async () => {
    const data = await apiClient.get('/memes/?limit=500');
    return data.map(adaptMeme);
  },

  // 현재 로그인 유저가 좋아요한 meme_id 목록
  getLikedIds: () => apiClient.get('/users/me/likes'),

  // 실제 백엔드 좋아요 토글 → { liked, likes_count } 반환
  toggleLike: (id) => apiClient.post(`/memes/${id}/like`, null),

  // 실제 백엔드 밈 삭제
  deleteMeme: (id) => apiClient.delete(`/memes/${id}`),

  // 실제 백엔드 업로드
  uploadMeme: (formData) => apiClient.postForm('/memes/upload', formData),

  // 실제 백엔드 수정 → { title, description, tags }
  updateMeme: (id, data) => apiClient.put(`/memes/${id}`, data),

  // 제목 / 설명 / 태그 기반 검색
  searchMemes: async (query) => {
    const data = await apiClient.get(`/memes/search?q=${encodeURIComponent(query)}`);
    return data.map(adaptMeme);
  },

  // 유사 밈: 현재 밈 제외한 전체 목록 반환 (추후 추천 알고리즘으로 교체 예정)
  getSimilarMemes: async (memeId) => {
    const data = await apiClient.get('/memes/?limit=500');
    return data.map(adaptMeme).filter((m) => m.id !== memeId);
  },
  getTrendingTags: () => simulateRequest(trendingTags, 500),
};
