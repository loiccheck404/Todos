import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService, ConfirmationDialog } from '../../services/confirmation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" 
         *ngIf="dialog$ | async as dialog"
         (click)="onOverlayClick($event)">
      
      <div class="modal-dialog" 
           [class]="'modal-' + dialog.type"
           (click)="$event.stopPropagation()">
        
        <div class="modal-header">
          <div class="modal-icon">
            <span *ngIf="dialog.type === 'danger'">⚠️</span>
            <span *ngIf="dialog.type === 'warning'">⚠️</span>
            <span *ngIf="dialog.type === 'info'">ℹ️</span>
          </div>
          <h3 class="modal-title">{{ dialog.title }}</h3>
        </div>
        
        <div class="modal-body">
          <p class="modal-message">{{ dialog.message }}</p>
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn btn-secondary"
            (click)="onCancel()">
            {{ dialog.cancelText }}
          </button>
          
          <button 
            class="btn"
            [class]="'btn-' + dialog.type"
            (click)="onConfirm()">
            {{ dialog.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-dialog {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 450px;
      animation: slideUp 0.3s ease-out;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 24px 16px 24px;
    }

    .modal-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .modal-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      flex: 1;
    }

    .modal-body {
      padding: 0 24px 24px 24px;
    }

    .modal-message {
      margin: 0;
      color: #666;
      line-height: 1.5;
      font-size: 14px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      padding: 16px 24px 24px 24px;
      justify-content: flex-end;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 80px;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn-warning {
      background: #ffc107;
      color: #000;
    }

    .btn-warning:hover {
      background: #e0a800;
    }

    .btn-info {
      background: #007bff;
      color: white;
    }

    .btn-info:hover {
      background: #0056b3;
    }

    .modal-danger .modal-header {
      border-bottom: 3px solid #dc3545;
    }

    .modal-warning .modal-header {
      border-bottom: 3px solid #ffc107;
    }

    .modal-info .modal-header {
      border-bottom: 3px solid #007bff;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .modal-dialog {
        width: 95%;
        margin: 20px;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding-left: 16px;
        padding-right: 16px;
      }

      .modal-footer {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  dialog$: Observable<ConfirmationDialog | null>;

  constructor(private confirmationService: ConfirmationService) {
    this.dialog$ = this.confirmationService.dialog$;
  }

  onConfirm(): void {
    this.confirmationService.closeDialog(true);
  }

  onCancel(): void {
    this.confirmationService.closeDialog(false);
  }

  onOverlayClick(event: Event): void {
    // Close dialog when clicking on overlay (outside the modal)
    this.onCancel();
  }
}