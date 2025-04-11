import { Component, OnInit } from '@angular/core';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  loading: boolean = false;

  constructor(private favoritesService: FavoritesService) { }

  ngOnInit(): void {
    this.loading = true;
    this.favoritesService.getFavorites().subscribe({
      next: (data: any) => {
        this.favorites = data.favorites || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  removeFavorite(artistId: string): void {
    this.favoritesService.removeFavorite(artistId).subscribe({
      next: (data: any) => {
        this.favorites = data.favorites;
      },
      error: (err) => console.error(err)
    });
  }
}
