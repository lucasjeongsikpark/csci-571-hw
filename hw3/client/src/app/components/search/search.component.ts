import { Component } from '@angular/core';
import { Artist } from '../../models/artist.model';
import { ArtistService } from '../../services/artist.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  query: string = '';
  artists: Artist[] = [];
  selectedArtist?: Artist;
  loading: boolean = false;

  // 추가: 검색을 시도한 적이 있는지 여부를 나타내는 플래그
  searchPerformed: boolean = false;

  constructor(private artistService: ArtistService) {}

  performSearch(): void {
    if (!this.query || this.query.trim() === '') { return; }
    this.loading = true;
    this.searchPerformed = true; // 검색 시도 상태로 설정

    this.artistService.searchArtists(this.query).subscribe({
      next: (res: any) => {
        // 예를 들어, res.artists 또는 원하는 필드에 결과가 담겨 있다고 가정
        this.artists = res.artists || [];
        this.selectedArtist = undefined;
        this.loading = false;
        
      },
      error: err => {
        console.error(err);
        this.artists = [];
        this.loading = false;
      }
    });
  }

  clearSearch(): void {
    this.query = '';
    this.artists = [];
    this.selectedArtist = undefined;
    // 검색 버튼을 누르기 전 상태이므로 플래그를 false로 변경
    this.searchPerformed = false;
  }

  selectArtist(artistId: string): void {
    // 이미 선택된 상태를 유지하고 싶다면 해당 로직을 구현(예: 결과가 지워지지 않도록)
    // 여기서는 간단히, 선택한 아티스트를 찾아서 저장합니다.
    this.selectedArtist = this.artists.find(artist => artist.id === artistId);
    // 추가: Artist details에 대한 추가 처리를 여기서 수행할 수 있음.
  }

  toggleFavorite(event: Event, artist: Artist): void {
    // 이벤트 전파 중단: 카드 클릭 이벤트와 별도 처리
    event.stopPropagation();

    // 즐겨찾기 토글 로직 (예시)
    artist.isFavorite = !artist.isFavorite;
    // 실제로는 백엔드 API 호출로 즐겨찾기 상태를 업데이트해야 함.
  }
}
