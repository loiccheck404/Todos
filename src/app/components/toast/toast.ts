import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts$ | async; trackBy: trackByToastId"
        class="toast toast-{{ toast.type }}"
        [attr.data-id]="toast.id"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <span *ngIf="toast.type === 'success'">✓</span>
            <span *ngIf="toast.type === 'error'">✕</span>
            <span *ngIf="toast.type === 'warning'">⚠</span>
            <span *ngIf="toast.type === 'info'">i</span>
          </div>

          <div class="toast-message">{{ toast.message }}</div>

          <button class="toast-close" (click)="removeToast(toast.id)" title="Close">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        pointer-events: none;
      }

      .toast {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        margin-bottom: 12px;
        min-width: 300px;
        max-width: 400px;
        pointer-events: auto;
        animation: slideIn 0.3s ease-out;
        border-left: 4px solid;
      }

      .toast-success {
        border-left-color: #28a745;
      }

      .toast-error {
        border-left-color: #dc3545;
      }

      .toast-warning {
        border-left-color: #ffc107;
      }

      .toast-info {
        border-left-color: #007bff;
      }

      .toast-content {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        gap: 12px;
      }

      .toast-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        color: white;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .toast-success .toast-icon {
        background: #28a745;
      }

      .toast-error .toast-icon {
        background: #dc3545;
      }

      .toast-warning .toast-icon {
        background: #ffc107;
        color: #000;
      }

      .toast-info .toast-icon {
        background: #007bff;
      }

      .toast-message {
        flex: 1;
        line-height: 1.4;
        color: #333;
        font-size: 14px;
      }

      .toast-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .toast-close:hover {
        background: #f0f0f0;
        color: #333;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .toast.removing {
        animation: slideOut 0.3s ease-in;
      }

      @media (max-width: 768px) {
        .toast-container {
          top: 10px;
          right: 10px;
          left: 10px;
        }

        .toast {
          min-width: auto;
          max-width: none;
        }
      }
    `,
  ],
})
export class ToastComponent {
  toasts$: Observable<Toast[]>;

  constructor(private notificationService: NotificationService) {
    this.toasts$ = this.notificationService.toasts$;
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }

  removeToast(id: string): void {
    this.notificationService.removeToast(id);
  }
}
