// ============================================================
// Memit — 더미 데이터
// 이 파일에 모든 더미 데이터를 모아두어 관리합니다.
// 실제 백엔드 연동 시 API 호출로 대체하면 됩니다.
// ============================================================

export const menuItems = [
  { id: 'recommend', label: '추천 탭', icon: 'smile' },
  { id: 'feed', label: '내 피드', icon: 'compass' },
  { id: 'community', label: '커뮤니티', icon: 'community' },
  { id: 'settings', label: '설정', icon: 'settings' },
];

export const currentUserId = '@ye0nwu';

export const allUsers = [
  {
    userId: '@ye0nwu',
    username: '@ye0nwu',
    statusMessage: '밈잘알입니다. 팔로우해주세용~',
    avatar: '/images/meme_haha.jpg',
    likesReceived: '12.4k',
    followers: '852',
    following: '31'
  },
  {
    userId: '@memit_user1',
    username: '@memit_user1',
    statusMessage: '밈 업로드봇입니다. 좋은 밈 마니마니~',
    avatar: 'https://i.pravatar.cc/150?u=memit_user1',
    likesReceived: '5.2k',
    followers: '210',
    following: '55'
  },
  {
    userId: '@webtoon_fan',
    username: '@webtoon_fan',
    statusMessage: '평범한 웹툰 광입니다.',
    avatar: 'https://i.pravatar.cc/150?u=webtoon_fan',
    likesReceived: '1.2k',
    followers: '88',
    following: '120'
  }
];

export const trendingTags = [
  '#이안시누',
  '#퇴사짤',
  '#감에',
  '#나는솔로_19기',
  '#공감짤',
  '#웃긴짤',
];

export const memeCards = [
  {
    id: 1,
    image: '/images/meme_oppa.png',
    title: '오빠 나 어떻해..',
    likes: 128,
    liked: true,
    tags: ['#슈게임', '#감정', '#격정'],
    author: '@memit_user1',
    timeAgo: '5H AGO',
    description: '오빠 나 어떻해.. 시리즈의 대표 짤입니다.',
  },
  {
    id: 2,
    image: '/images/meme_table.jpg',
    title: '손님 배로 테이블 치지 마세요!',
    likes: 493,
    liked: false,
    tags: ['#웹툰', '#프리드로우'],
    author: '@webtoon_fan',
    timeAgo: '3H AGO',
    description: '프리드로우 웹툰에서 유래한 인기 밈입니다.',
  },
  {
    id: 3,
    image: '/images/meme_learning.jpg',
    title: '배우고 갑니다',
    likes: 1035,
    liked: true,
    tags: ['#감에', '#배우신분'],
    author: '@meme_master',
    timeAgo: '1H AGO',
    description: '배우고 갑니다 밈의 원본 버전입니다.',
  },
  {
    id: 4,
    image: '/images/meme_haha.jpg',
    title: "I'm haha",
    likes: 35,
    liked: true,
    tags: ['#아임피네', '#감정', '#괜찮아', '#무한도전'],
    author: '@ye0nwu',
    timeAgo: '2H AGO',
    description: "I'm fine (아임 피네) 밈의 하하 버전입니다.",
  },
  {
    id: 5,
    image: '/images/meme_pagliacci.JPG',
    title: '팔리아치',
    likes: 13,
    liked: false,
    tags: ['#삐에로', '#힘스'],
    author: '@circus_lover',
    timeAgo: '4H AGO',
    description: '제가 그 팔리아치 입니다. 클래식 코미디 밈.',
  },
];

export const similarMemes = [
  { id: 101, image: '/images/meme_pani.png', title: "I'm pani", likes: 142, liked: true, tags: ['#아임파니', '#감정'], author: '@memit_user', timeAgo: '1H AGO', description: 'similar 밈' },
  { id: 102, image: '/images/meme_fine.png', title: "I'm fine", likes: 88, liked: false, tags: ['#아임파인', '#기쁨'], author: '@happy_guy', timeAgo: '2H AGO', description: 'similar 밈' },
  { id: 103, image: '/images/meme_eva.png', title: '에바참치', likes: 21, liked: false, tags: ['#에바', '#참치'], author: '@tuna_fan', timeAgo: '3H AGO', description: 'similar 밈' },
  { id: 104, image: '/images/meme_mandu.png', title: '그만두고 싶어', likes: 512, liked: true, tags: ['#퇴사', '#직장인'], author: '@worker_bee', timeAgo: '4H AGO', description: 'similar 밈' },
  { id: 105, image: '/images/meme_ani.png', title: '너의 이름은', likes: 99, liked: false, tags: ['#애니', '#감동'], author: '@anime_lover', timeAgo: '5H AGO', description: 'similar 밈' },
  { id: 106, image: '/images/meme_jojo.png', title: '죠죠의 기묘한 모험', likes: 777, liked: true, tags: ['#죠죠', '#기묘함'], author: '@jojo_fan', timeAgo: '6H AGO', description: 'similar 밈' },
];

export const profileData = allUsers[0];

export const allGalleries = [
  {
    id: 1,
    userId: '@ye0nwu',
    name: '🗿 킁',
    previewImages: ['/images/meme_haha.jpg', '/images/meme_pani.png', '/images/meme_fine.png'],
    updatedAt: '1년',
    count: 6,
    isPublic: false
  },
  {
    id: 2,
    userId: '@ye0nwu',
    name: 'sss',
    previewImages: ['/images/meme_learning.jpg', '/images/meme_table.jpg', '/images/meme_oppa.png'],
    updatedAt: '3년',
    count: 5,
    isPublic: true
  },
  {
    id: 3,
    userId: '@ye0nwu',
    name: '실험적사진',
    previewImages: ['/images/meme_oppa.png', '/images/meme_eva.png', '/images/meme_mandu.png'],
    updatedAt: '3년',
    count: 3,
    isPublic: true
  },
  {
    id: 4,
    userId: '@ye0nwu',
    name: 'kintama',
    previewImages: ['/images/meme_jojo.png'],
    updatedAt: '3년',
    count: 1,
    isPublic: true
  },
  {
    id: 5,
    userId: '@memit_user1',
    name: '웃긴 짤 모음',
    previewImages: ['/images/meme_learning.jpg', '/images/meme_table.jpg'],
    updatedAt: '1개월',
    count: 12,
    isPublic: true
  },
  {
    id: 6,
    userId: '@memit_user1',
    name: '나만 볼거임 (비공개)',
    previewImages: ['/images/meme_oppa.png'],
    updatedAt: '2개월',
    count: 2,
    isPublic: false
  },
  {
    id: 7,
    userId: '@webtoon_fan',
    name: '내 최애 웹툰 밈',
    previewImages: ['/images/meme_table.jpg'],
    updatedAt: '5개월',
    count: 5,
    isPublic: true
  }
];

export const likedMemes = [
  { id: 201, image: '/images/meme_table.jpg' },
  { id: 202, image: '/images/meme_pani.png' },
  { id: 203, image: '/images/meme_fine.png' },
  { id: 204, image: '/images/meme_eva.png' },
  { id: 205, image: '/images/meme_mandu.png' },
  { id: 206, image: '/images/meme_ani.png' },
  { id: 207, image: '/images/meme_jojo.png' },
  { id: 208, image: '/images/meme_oppa.png' }
];

export const leaderboardItems = [
  {
    rank: '01',
    title: '오빠 나 어떻해..',
    tags: '#슈게임 #감정 #격정',
    trend: 'up',
    likes: '12k',
  },
  {
    rank: '02',
    title: '배우고 갑니다',
    tags: '#감에 #배우신분',
    trend: 'up',
    likes: '8.5k',
  },
  {
    rank: '03',
    title: '손님 배로 테이블 치지...',
    tags: '#웹툰 #프리드로우',
    trend: 'same',
    likes: '5.2k',
  },
  {
    rank: '04',
    title: "I'm fine",
    tags: '#아임피네 #감정 #괜찮아',
    trend: 'up',
    likes: '3.1k',
  },
  {
    rank: '05',
    title: '팔리아치',
    tags: '#삐에로 #힘스',
    trend: 'down',
    likes: '1.2k',
  },
];
