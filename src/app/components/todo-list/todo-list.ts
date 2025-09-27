import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { TodoModel } from '../../models';
import { Observable } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { take } from 'rxjs/operators';
// In todo-list.ts imports
import { EditTodoComponent } from '../edit-todo/edit-todo';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, EditTodoComponent],
  template: `
    <div class="todo-list-container">
      <div class="todo-stats" *ngIf="stats$ | async as stats">
        <span class="stat">Total: {{ stats.total }}</span>
        <span class="stat">Active: {{ stats.active }}</span>
        <span class="stat">Completed: {{ stats.completed }}</span>
      </div>

      <div class="todo-list" *ngIf="filteredTodos$ | async as todos">
        <div *ngIf="todos.length === 0" class="empty-state">
          <p>No todos yet. Add your first todo above!</p>
          <button (click)="addSampleData()" class="sample-btn">Add Sample Todos</button>
        </div>

        <div
          *ngFor="let todo of todos; trackBy: trackByTodoId; let i = index"
          class="todo-item"
          [class.completed]="todo.completed"
          [class.high-priority]="todo.priority === 'high'"
          [class.medium-priority]="todo.priority === 'medium'"
          [class.low-priority]="todo.priority === 'low'"
          [class.dragging]="draggedIndex === i"
          [class.drag-over]="dragOverIndex === i"
          draggable="true"
          (dragstart)="onDragStart($event, i)"
          (dragover)="onDragOver($event, i)"
          (dragenter)="onDragEnter($event, i)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event, i)"
          (dragend)="onDragEnd($event)"
        >
          <div class="todo-content">
            <div class="todo-header">
              <input
                type="checkbox"
                [checked]="todo.completed"
                (change)="toggleTodo(todo.id)"
                class="todo-checkbox"
              />

              <h3 class="todo-title" [class.completed]="todo.completed">
                {{ todo.title }}
              </h3>

              <span class="priority-badge priority-{{ todo.priority }}">
                {{ todo.priority }}
              </span>
            </div>

            <p *ngIf="todo.description" class="todo-description">
              {{ todo.description }}
            </p>

            <div class="todo-meta">
              <span class="created-date"> Created: {{ todo.createdAt | date : 'short' }} </span>
              <span *ngIf="todo.dueDate" class="due-date" [class.overdue]="todo.isOverdue()">
                Due: {{ todo.dueDate | date : 'MMM d, y h:mm a' }}
              </span>
            </div>
          </div>

          <div class="todo-actions">
            <button (click)="editTodo(todo)" class="edit-btn" title="Edit">✏️</button>
            <button (click)="deleteTodo(todo.id)" class="delete-btn" title="Delete">🗑️</button>
          </div>
        </div>
      </div>

      <div class="bulk-actions" *ngIf="(stats$ | async)?.total! > 0">
        <button (click)="markAllComplete()" class="bulk-btn">Mark All Complete</button>
        <button (click)="markAllIncomplete()" class="bulk-btn">Mark All Incomplete</button>
        <button
          (click)="deleteCompleted()"
          class="bulk-btn danger"
          *ngIf="(stats$ | async)?.completed! > 0"
        >
          Delete Completed ({{ (stats$ | async)?.completed }})
        </button>
      </div>
    </div>

    <app-edit-todo
      [todo]="editingTodo"
      [isVisible]="showEditModal"
      (save)="onEditSave($event)"
      (cancel)="onEditCancel()"
    >
    </app-edit-todo>
  `,
  styles: [
    `
      .todo-list-container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .todo-stats {
        background: #f8f9fa;
        padding: 15px 20px;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        gap: 20px;
      }

      .stat {
        font-size: 14px;
        font-weight: 600;
        color: #666;
      }

      .todo-list {
        max-height: 500px;
        overflow-y: auto;
      }

      .empty-state {
        padding: 40px 20px;
        text-align: center;
        color: #666;
      }

      .sample-btn {
        background: #28a745;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 10px;
      }

      .todo-item {
        display: flex;
        align-items: flex-start;
        padding: 16px 20px;
        border-bottom: 1px solid #e9ecef;
        transition: background-color 0.2s ease;
      }

      .todo-item:hover {
        background-color: #f8f9fa;
      }

      .todo-item.completed {
        opacity: 0.7;
        background-color: #f8f9fa;
      }

      .todo-content {
        flex: 1;
      }

      .todo-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .todo-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .todo-title {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        flex: 1;
        color: #333;
      }

      .todo-title.completed {
        text-decoration: line-through;
        color: #666;
      }

      .priority-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .priority-high {
        background: #dc3545;
        color: white;
      }

      .priority-medium {
        background: #ffc107;
        color: #000;
      }

      .priority-low {
        background: #28a745;
        color: white;
      }

      .todo-description {
        margin: 8px 0;
        color: #666;
        font-size: 14px;
        line-height: 1.4;
      }

      .todo-meta {
        display: flex;
        gap: 15px;
        font-size: 12px;
        color: #888;
        margin-top: 8px;
      }

      .due-date.overdue {
        color: #dc3545;
        font-weight: 600;
      }

      .todo-actions {
        display: flex;
        gap: 8px;
        margin-left: 12px;
      }

      .edit-btn,
      .delete-btn {
        background: none;
        border: none;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.2s ease;
      }

      .edit-btn:hover {
        background: #e3f2fd;
      }

      .delete-btn:hover {
        background: #ffebee;
      }

      .bulk-actions {
        padding: 15px 20px;
        border-top: 1px solid #e9ecef;
        background: #f8f9fa;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .bulk-btn {
        background: #6c757d;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s ease;
      }

      .bulk-btn:hover {
        background: #5a6268;
      }

      .bulk-btn.danger {
        background: #dc3545;
      }

      .bulk-btn.danger:hover {
        background: #c82333;
      }

      /* Border colors for priority levels */
      .high-priority {
        border-left: 4px solid #dc3545;
      }

      .medium-priority {
        border-left: 4px solid #ffc107;
      }

      .low-priority {
        border-left: 4px solid #28a745;
      }

      @media (max-width: 768px) {
        .todo-stats {
          flex-direction: column;
          gap: 8px;
        }

        .todo-header {
          flex-wrap: wrap;
          gap: 8px;
        }

        .bulk-actions {
          flex-direction: column;
        }

        .bulk-btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class TodoListComponent implements OnInit {
  filteredTodos$: Observable<TodoModel[]>;
  stats$: Observable<any>;

  // Drag and drop properties
  draggedIndex: number | null = null;
  dragOverIndex: number | null = null;
  currentTodos: TodoModel[] = []; // Cache for drag operations

  // Edit modal state
  editingTodo: TodoModel | null = null;
  showEditModal = false;

  constructor(
    private todoService: TodoService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {
    this.filteredTodos$ = this.todoService.filteredTodos$;
    this.stats$ = this.todoService.stats$;
  }

  ngOnInit() {
    // Cache todos for drag operations
    this.filteredTodos$.subscribe((todos) => {
      this.currentTodos = todos;
    });
  }

  trackByTodoId(index: number, todo: TodoModel): string {
    return todo.id;
  }

  toggleTodo(id: string) {
    this.todoService.toggleTodo(id);
  }

  async deleteTodo(id: string) {
    const todo = this.todoService.getTodoById(id);
    const confirmed = await this.confirmationService.confirmDelete(todo?.title);

    if (confirmed) {
      const success = this.todoService.deleteTodo(id);
      if (success) {
        this.notificationService.success('Todo deleted successfully');
      } else {
        this.notificationService.error('Failed to delete todo');
      }
    }
  }

  editTodo(todo: TodoModel) {
    this.editingTodo = todo;
    this.showEditModal = true;
  }

  onEditSave(updates: Partial<TodoModel>) {
    if (this.editingTodo) {
      const success = this.todoService.updateTodo(this.editingTodo.id, updates);
      if (success) {
        this.notificationService.success('Todo updated successfully');
      } else {
        this.notificationService.error('Failed to update todo');
      }
    }
    this.closeEditModal();
  }

  onEditCancel() {
    this.closeEditModal();
  }

  private closeEditModal() {
    this.showEditModal = false;
    this.editingTodo = null;
  }

  markAllComplete() {
    this.todoService.markAllComplete();
    this.notificationService.success('All todos marked as complete');
  }

  markAllIncomplete() {
    this.todoService.markAllIncomplete();
    this.notificationService.info('All todos marked as incomplete');
  }

  async deleteCompleted() {
    this.stats$.pipe(take(1)).subscribe(async (stats) => {
      if (!stats?.completed) return;

      const confirmed = await this.confirmationService.confirmBulkDelete(stats.completed);

      if (confirmed) {
        const deletedCount = this.todoService.deleteCompleted();
        this.notificationService.success(`Deleted ${deletedCount} completed todos`);
      }
    });
  }

  addSampleData() {
    this.todoService.addSampleData();
  }

  // Drag and Drop Methods
  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    const todo = this.currentTodos[index];

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', todo.id);
    }

    // Add visual feedback
    setTimeout(() => {
      const element = event.target as HTMLElement;
      element.style.opacity = '0.5';
    }, 0);
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverIndex = index;
  }

  onDragEnter(event: DragEvent, index: number): void {
    event.preventDefault();
    this.dragOverIndex = index;
  }

  onDragLeave(event: DragEvent): void {
    // Only clear dragOver if we're leaving the container, not just moving between child elements
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      this.dragOverIndex = null;
    }
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();

    if (this.draggedIndex !== null && this.draggedIndex !== dropIndex) {
      const draggedTodo = this.currentTodos[this.draggedIndex];
      const targetTodo = this.currentTodos[dropIndex];

      // Find the todos in the full list (not filtered) to get correct indices
      this.todoService.todos$.pipe(take(1)).subscribe((allTodos) => {
        const draggedOriginalIndex = allTodos.findIndex((t) => t.id === draggedTodo.id);
        const targetOriginalIndex = allTodos.findIndex((t) => t.id === targetTodo.id);

        if (draggedOriginalIndex !== -1 && targetOriginalIndex !== -1) {
          this.todoService.reorderTodos(draggedOriginalIndex, targetOriginalIndex);

          // Show success notification
          this.notificationService.success(`Moved "${draggedTodo.title}" to new position`);
        }
      });
    }

    this.resetDragState();
  }

  onDragEnd(event: DragEvent): void {
    // Restore visual feedback
    const element = event.target as HTMLElement;
    element.style.opacity = '1';

    this.resetDragState();
  }

  private resetDragState(): void {
    this.draggedIndex = null;
    this.dragOverIndex = null;
  }
}
