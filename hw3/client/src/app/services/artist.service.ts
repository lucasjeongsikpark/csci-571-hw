// src/app/services/artist.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // 환경 변수 파일의 경로에 맞게 수정

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  // 환경변수에서 지정한 API 기본 URL
  private apiUrl = environment.apiUrl; // 예: '/api'

  constructor(private http: HttpClient) { }

  // 아티스트 검색 API 호출
  searchArtists(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?q=${encodeURIComponent(query)}&size=10&type=artist`);
  }

  // 선택한 아티스트의 상세 정보 API 호출
  getArtistDetails(artistId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/artist?id=${artistId}`);
  }

  // 선택한 아티스트의 작품 목록을 가져오는 API 호출
  getArtistArtworks(artistId: string): Observable<any> {
    // 예시 URL: /api/artworks?artist_id={artistId}&size=10  
    return this.http.get(`${this.apiUrl}/artworks?artist_id=${artistId}&size=10`);
  }

  getArtworkCategories(artworkId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/genes?artwork_id=${artworkId}`);
  }

}
