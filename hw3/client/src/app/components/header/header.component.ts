// src/app/components/header/header.component.ts

import { Component, OnInit } from '@angular/core';
import { AuthService, AuthState, User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  user?: User;
  dropdownOpen: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getAuthState().subscribe((state: AuthState) => {
      this.isLoggedIn = state.isLoggedIn;
      this.user = state.user;
    });
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.dropdownOpen = false;
      },
      error: (error) => {
        console.error("Logout error in header:", error);
      }
    });
  }

  deleteAccount(): void {
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.dropdownOpen = false;
      },
      error: (error) => {
        console.error("Delete account error in header:", error);
      }
    });
  }
}
