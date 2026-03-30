import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5003/api/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  register(username: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { username, email, password });
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  setToken(token: string) {
    localStorage.setItem('jwt_token', token);
  }

  logout() {
    localStorage.removeItem('jwt_token');
  }
}
