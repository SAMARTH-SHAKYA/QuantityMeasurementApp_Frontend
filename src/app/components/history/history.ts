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
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'SESSION_EXPIRED';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot reach the server. It may be starting up — please wait a moment and try again.';
        } else {
          this.errorMessage = `Failed to load history (Error ${err.status}).`;
        }
      }
    });
  }

  getBadgeClass(type: string | undefined): string {
    if (!type) return '';
    return type.toLowerCase();
  }
}
