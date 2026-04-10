// src/services/memeService.js
import { simulateRequest } from '../api/client';
import { similarMemes, trendingTags } from '../api/mockData';
import { apiClient } from '../api/apiClient';
import { adaptMeme } from '../api/adapters';

export const memeService = {
  // 실제 백엔드에서 밈 목록 조회
  getMemes: async () => {
    const data = await apiClient.get('/memes/');
    return data.map(adaptMeme);
  },

  // 실제 백엔드 좋아요 토글 → { liked, likes_count } 반환
  toggleLike: (id) => apiClient.post(`/memes/${id}/like`, null),

  // 실제 백엔드 밈 삭제
  deleteMeme: (id) => apiClient.delete(`/memes/${id}`),

  // 실제 백엔드 업로드
  uploadMeme: (formData) => apiClient.postForm('/memes/upload', formData),

  // 유사 밈 · 트렌딩 태그는 백엔드 미구현 → mock 유지
  getSimilarMemes: () => simulateRequest(similarMemes, 800),
  getTrendingTags: () => simulateRequest(trendingTags, 500),
};
