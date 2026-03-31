import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  message = '';
  isSuccess = false;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.getToken()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    this.message = '';
    this.isLoading = true;
    this.authService.login(this.username, this.password).subscribe({
      next: (res: any) => {
        const token = res.token || res;
        this.authService.setToken(token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const errorMsg = err.error?.Error || err.error?.message || err.message || 'Failed to login';
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
