import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';
  isSuccess = false;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.getToken()) {
      this.router.navigate(['/dashboard']);
    }
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
          this.message = err.error?.Error || err.error?.message || err.message || 'Failed to register';
        }
        this.isSuccess = false;
        this.isLoading = false;
      }
    });
  }
}
