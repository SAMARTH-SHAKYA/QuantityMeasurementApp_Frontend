import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HistoryService } from '../../services/history';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History implements OnInit {
  historyItems: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private historyService: HistoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadHistory();
  }

  loadHistory() {
    this.historyService.getHistory().subscribe({
      next: (data) => {
        this.historyItems = data ? [...data].reverse() : [];
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        }
        this.errorMessage = 'Failed to load history.';
        this.isLoading = false;
      }
    });
  }

  getBadgeClass(type: string | undefined): string {
    if (!type) return '';
    return type.toLowerCase();
  }
}
