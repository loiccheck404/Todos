import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmationDialog {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  resolve?: (result: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private dialogSubject = new BehaviorSubject<ConfirmationDialog | null>(null);
  public dialog$ = this.dialogSubject.asObservable();

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
  }): Promise<boolean> {
    return new Promise((resolve) => {
      const dialog: ConfirmationDialog = {
        id: this.generateId(),
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'info',
        resolve,
      };

      this.dialogSubject.next(dialog);
    });
  }

  closeDialog(result: boolean): void {
    const currentDialog = this.dialogSubject.value;
    if (currentDialog?.resolve) {
      currentDialog.resolve(result);
    }
    this.dialogSubject.next(null);
  }

  // Convenience methods
  confirmDelete(itemName?: string): Promise<boolean> {
    return this.confirm({
      title: 'Delete Item',
      message: `Are you sure you want to delete${
        itemName ? ` "${itemName}"` : ' this item'
      }? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
  }

  confirmBulkDelete(count: number): Promise<boolean> {
    return this.confirm({
      title: 'Delete Multiple Items',
      message: `Are you sure you want to delete ${count} completed todo${
        count > 1 ? 's' : ''
      }? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger',
    });
  }
}
