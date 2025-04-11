// src/app/models/artwork.model.ts
export interface Artwork {
    id: string;         // 작품 ID (예: '4d8b928b4eb68a1b2c0001f2')
    title: string;      // 작품 제목 (예: 'Starry Night')
    date: string;       // 제작년도 등 (예: '1889')
    thumbnail?: string; // 작품 섬네일 URL (없을 경우 undefined 처리)
  }
  