import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getFavorites() {
    return this.http.get(`${this.apiUrl}/favorites`);
  }

  addFavorite(artistId: string) {
    return this.http.post(`${this.apiUrl}/favorites/add`, { artistId });
  }

  removeFavorite(artistId: string) {
    return this.http.post(`${this.apiUrl}/favorites/remove`, { artistId });
  }
}
