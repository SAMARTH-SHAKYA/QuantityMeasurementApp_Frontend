import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, GoogleSigninButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  username = '';
  password = '';
  message = '';
  isSuccess = false;
  isLoading = false;
  isWarmingUp = true;

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
    // Silently wake up Render's free-tier server. Using no-cors mode avoids 
    // CORS errors in the console while still sending the wake-up HTTP request.
    try {
      fetch(`${environment.apiUrl.replace('/api', '')}`, { method: 'HEAD', mode: 'no-cors' })
        .finally(() => this.isWarmingUp = false);
    } catch {
      this.isWarmingUp = false;
    }
    // Also set a timeout to stop showing the spinner after 8 seconds max
    setTimeout(() => this.isWarmingUp = false, 8000);

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
    this.message = '';
    this.isLoading = true;
    this.authService.login(this.username, this.password).subscribe({
      next: (res: any) => {
        const token = res?.token || res?.Token || (typeof res === 'string' ? res : '');
        this.authService.setToken(token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const errorMsg = err.error?.error || err.error?.Error || err.error?.message || err.message || 'Failed to login';
        if (errorMsg === 'not register') {
          this.message = 'not register';
          this.isSuccess = false;
          setTimeout(() => {
            this.router.navigate(['/register']);
          }, 1500);
        } else {
          this.message = errorMsg;
          this.isSuccess = false;
        }
        this.isLoading = false;
      }
    });
  }
}
