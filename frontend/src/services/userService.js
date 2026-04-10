// src/services/userService.js
import { simulateRequest } from '../api/client';
import { allUsers, allGalleries } from '../api/mockData';
import { apiClient } from '../api/apiClient';

export const userService = {
  getProfile: (username) => {
    const user = allUsers.find(u => u.username === username);
    return simulateRequest(user || allUsers[0], 700);
  },

  getUserGalleries: (userId) => {
    const galleries = allGalleries.filter(g => g.userId === userId);
    return simulateRequest(galleries, 600);
  },

  toggleFollow: (username) => simulateRequest({ success: true, username }, 500),

  // 실제 백엔드 프로필 수정 → { bio, status_message, avatar_url }
  updateProfile: (updates) => apiClient.put('/users/me', updates),

  // 실제 백엔드 아바타 업로드
  uploadAvatar: (formData) => apiClient.postForm('/users/avatar', formData),

  // 실제 백엔드 갤러리 생성 → { name, description }
  createGallery: (data) => apiClient.post('/galleries/', data),
};
