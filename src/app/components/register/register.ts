import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, GoogleSigninButtonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';
  isSuccess = false;
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private socialAuthService: SocialAuthService
  ) {
    if (this.authService.getToken()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit() {
    this.socialAuthService.authState.subscribe((user) => {
      if (user && user.idToken) {
        this.isLoading = true;
        this.authService.googleLogin(user.idToken).subscribe({
          next: (res: any) => {
            const token = res?.token || res?.Token || (typeof res === 'string' ? res : '');
            this.authService.setToken(token);
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
             this.message = err.error?.error || err.error?.Error || err.error?.message || err.message || 'Google Login failed';
             this.isSuccess = false;
             this.isLoading = false;
          }
        });
      }
    });
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match';
      this.isSuccess = false;
      return;
    }

    this.message = '';
    this.isLoading = true;
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.message = 'Registration successful! Redirecting to login...';
        this.isSuccess = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        if (err.error?.errors?.Email) {
          this.message = 'invalid email re - enter';
        } else {
          this.message = err.error?.error || err.error?.Error || err.error?.message || err.message || 'Failed to register';
        }
        this.isSuccess = false;
        this.isLoading = false;
      }
    });
  }
}
