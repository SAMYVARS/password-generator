import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email?: string;
  image_url?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5001/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuth();
  }

  checkAuth(): void {
    this.http.get<{ authenticated: boolean; user?: User }>(`${this.apiUrl}/check-auth`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          if (response.authenticated && response.user) {
            this.currentUserSubject.next(response.user);
          } else {
            this.currentUserSubject.next(null);
          }
        },
        error: () => {
          this.currentUserSubject.next(null);
        }
      });
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response.success && response.user) {
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  register(username: string, email: string, password: string, image_url?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, email, password, image_url }, { withCredentials: true });
  }

  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null);
        })
      );
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Gestion des mots de passe sauvegardés
  savePassword(serviceName: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/passwords`, {
      service_name: serviceName,
      password: password
    }, { withCredentials: true });
  }

  getPasswords(): Observable<any> {
    return this.http.get(`${this.apiUrl}/passwords`, { withCredentials: true });
  }

  deletePassword(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/passwords/${id}`, { withCredentials: true });
  }
}

