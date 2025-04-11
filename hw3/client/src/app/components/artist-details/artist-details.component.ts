import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Artist } from '../../models/artist.model';
import { Artwork } from '../../models/artwork.model';
import { ArtistService } from '../../services/artist.service';

@Component({
  selector: 'app-artist-details',
  templateUrl: './artist-details.component.html',
  styleUrls: ['./artist-details.component.css']
})
export class ArtistDetailsComponent implements OnChanges {
  @Input() artist!: Artist;
  artworks: Artwork[] = [];
  loading: boolean = false;
  currentTab: string = 'info';

  // 모달 관련 변수
  modalVisible: boolean = false;
  selectedArtworkId: string | null = null;
  categories: any[] = [];
  categoriesLoading: boolean = false;

  constructor(private artistService: ArtistService) {}

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes.artist && this.artist) {
  //     // 아티스트 정보가 변경되면 기본 탭은 'info'로 설정
  //     this.currentTab = 'info';
  //     this.fetchArtworks();
  //   }
  // }

  // ngOnInit(): void {
  //   this.fetchArtistDetails();
  //   this.fetchArtworks();
  // }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.artist && this.artist) {
      this.currentTab = 'info';
      this.fetchArtistDetails();   // ← 이 줄 추가
      this.fetchArtworks();       // ← 기존 코드 유지
    }
  }
  

  fetchArtistDetails() {
    this.loading = true;
    this.artistService.getArtistDetails(this.artist.id).subscribe({
      next: (data: any) => {
        this.artist = data.artist;
        // this.artist.name = data.artist.name || "";
        // this.artist.birthday = data.artist.birthday || "";
        // this.artist.deathday = data.artist.deathday || "";
        // this.artist.nationality = data.artist.nationality || "";
        // this.artist.biography = data.artist.biography || "";
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
  // 아티스트의 작품을 가져오는 메서드 호출문 구현
  // 이 메서드는 아티스트 상세정보를 가져오는 메서드와는 별개로, 아티스트의 작품을 가져오는 메서드입니다.
  

  fetchArtworks(): void {
    this.loading = true;
    // getArtistArtworks()는 백엔드로부터 { _embedded: { artworks: [...] } } 형식의 데이터를 반환한다고 가정
    this.artistService.getArtistArtworks(this.artist.id).subscribe({
      // next: (data: any) => {
      //   this.artworks = data._embedded?.artworks || [];
      //   this.loading = false;
      // },
      next: (res: any) => {
        this.artworks = res.artworks || [];
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching artworks', err);
        this.artworks = [];
        this.loading = false;
      }
    });
  }

  switchTab(tab: string): void {
    this.currentTab = tab;
  }

  showCategories(event: Event, artworkId: string): void {
    // 이벤트 버블링 방지 (예: artwork 카드 클릭 시 아티스트 상세 변경 방지)
    event.stopPropagation();
    this.modalVisible = true;
    this.selectedArtworkId = artworkId;
    this.categoriesLoading = true;

    // getArtworkCategories()는 백엔드에서 { _embedded: { genes: [...] } } 형식의 데이터를 반환한다고 가정
    this.artistService.getArtworkCategories(artworkId).subscribe({
      next: (data: any) => {
        this.categories = data._embedded?.genes || [];
        this.categoriesLoading = false;
      },
      error: err => {
        console.error('Error fetching categories', err);
        this.categories = [];
        this.categoriesLoading = false;
      }
    });
  }

  closeCategoriesModal(): void {
    this.modalVisible = false;
    this.categories = [];
    this.selectedArtworkId = null;
  }
}
