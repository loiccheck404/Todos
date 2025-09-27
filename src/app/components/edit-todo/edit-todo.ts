import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoModel, TodoPriority } from '../../models';

@Component({
  selector: 'app-edit-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">Edit Todo</h3>
          <button class="close-btn" (click)="onCancel()" title="Close">×</button>
        </div>

        <form class="modal-body" (ngSubmit)="onSubmit()" #editForm="ngForm">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="editData.title"
              name="title"
              required
              maxlength="100"
              #titleInput="ngModel"
              [class.error]="titleInput.invalid && titleInput.touched">
            
            <div class="validation-error" *ngIf="titleInput.invalid && titleInput.touched">
              Title is required
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              class="form-textarea"
              [(ngModel)]="editData.description"
              name="description"
              placeholder="Add description (optional)"
              maxlength="500"
              rows="4">
            </textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select [(ngModel)]="editData.priority" name="priority" class="form-select">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Due Date</label>
              <input
                type="date"
                [(ngModel)]="editData.dueDate"
                name="dueDate"
                class="form-input"
                [min]="today">
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="editData.completed"
                name="completed"
                class="checkbox">
              <span class="checkbox-text">Mark as completed</span>
            </label>
          </div>
        </form>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            (click)="onSubmit()"
            [disabled]="!isFormValid()">
            Save Changes
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
      z-index: 1500;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-dialog {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid #e9ecef;
    }

    .modal-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: #f0f0f0;
      color: #333;
    }

    .modal-body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e5e9;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s ease;
      font-family: inherit;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    .form-input.error {
      border-color: #dc3545;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-select {
      cursor: pointer;
    }

    .validation-error {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: normal;
    }

    .checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .checkbox-text {
      font-size: 14px;
      color: #333;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 16px 24px 24px 24px;
      border-top: 1px solid #e9ecef;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 100px;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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
        margin: 10px;
        max-height: 95vh;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 12px;
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
export class EditTodoComponent implements OnInit {
  @Input() todo: TodoModel | null = null;
  @Input() isVisible = false;
  @Output() save = new EventEmitter<Partial<TodoModel>>();
  @Output() cancel = new EventEmitter<void>();

  editData = {
    title: '',
    description: '',
    priority: TodoPriority.MEDIUM,
    dueDate: '',
    completed: false
  };

  today = new Date().toISOString().split('T')[0];

  ngOnInit() {
    if (this.todo) {
      this.loadTodoData();
    }
  }

  ngOnChanges() {
    if (this.todo && this.isVisible) {
      this.loadTodoData();
    }
  }

  private loadTodoData() {
    if (!this.todo) return;

    this.editData = {
      title: this.todo.title,
      description: this.todo.description || '',
      priority: this.todo.priority,
      dueDate: this.todo.dueDate ? this.todo.dueDate.toISOString().split('T')[0] : '',
      completed: this.todo.completed
    };
  }

  isFormValid(): boolean {
    return this.editData.title.trim().length > 0;
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    const updates: Partial<TodoModel> = {
      title: this.editData.title.trim(),
      description: this.editData.description.trim() || undefined,
      priority: this.editData.priority,
      dueDate: this.editData.dueDate ? new Date(this.editData.dueDate) : undefined,
      completed: this.editData.completed
    };

    this.save.emit(updates);
  }

  onCancel() {
    this.cancel.emit();
  }

  onOverlayClick(event: Event) {
    this.onCancel();
  }
}
