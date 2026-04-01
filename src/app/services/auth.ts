import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  googleLogin(idToken: string) {
    return this.http.post(`${this.apiUrl}/google-login`, { idToken });
  }

  register(username: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { username, email, password });
  }

  getToken(): string | null {
    const token = localStorage.getItem('jwt_token');
    // Validate it looks like a real JWT (3 base64 parts separated by dots)
    if (token && token.split('.').length === 3) {
      return token;
    }
    // Token is corrupt/invalid - clear it so the user can log in fresh
    if (token) {
      console.warn('Clearing invalid token from localStorage');
      localStorage.removeItem('jwt_token');
    }
    return null;
  }

  setToken(token: string) {
    localStorage.setItem('jwt_token', token);
  }

  logout() {
    localStorage.removeItem('jwt_token');
  }
}
