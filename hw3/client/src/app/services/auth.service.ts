// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// 회원 정보 인터페이스 (필요에 따라 확장)
export interface User {
  id: string;
  fullname: string;
  email: string;
  profileImageUrl: string;
  favorites?: string[];
}

export interface AuthState {
  isLoggedIn: boolean;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; // 예: '/api'
  private authStateSubject = new BehaviorSubject<AuthState>({ isLoggedIn: false });

  constructor(private http: HttpClient, private router: Router) {
    this.restoreAuthState();
  }

  getAuthState(): Observable<AuthState> {
    return this.authStateSubject.asObservable();
  }

  private setAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
  }

  // 임시: 로컬 스토리지에 저장된 데이터를 통해 auth state 복원 (실제 환경에서는 /me API 사용)
  private restoreAuthState(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user: User = JSON.parse(storedUser);
      this.setAuthState({ isLoggedIn: true, user });
    }
  }

  // 회원가입
  register(fullname: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, { fullname, email, password }).pipe(
      tap((response) => {
        if (response && response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          this.setAuthState({ isLoggedIn: true, user: response.user });
          this.router.navigate(['/search']);
        }
      }),
      catchError(err => throwError(err))
    );
  }

  // 로그인
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        if (response && response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          this.setAuthState({ isLoggedIn: true, user: response.user });
          this.router.navigate(['/search']);
        }
      }),
      catchError(err => throwError(err))
    );
  }

  // 로그아웃 (GET 또는 POST로 구현할 수 있으나, 여기서는 로컬상태만 제거)
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        // localStorage.removeItem('user');
        this.setAuthState({ isLoggedIn: false });
        this.router.navigate(['/search']);
      }),
      catchError(err => throwError(err))
    );
  }

  // 계정 삭제 – URL을 서버 라우터에 맞게 수정 (delete 요청)
  deleteAccount(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/auth/delete`).pipe(
      tap(() => {
        localStorage.removeItem('user');
        this.setAuthState({ isLoggedIn: false });
        this.router.navigate(['/search']);
      }),
      catchError(err => throwError(err))
    );
  }
}
