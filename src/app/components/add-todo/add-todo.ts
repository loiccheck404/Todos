import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { TodoPriority } from '../../models';

@Component({
  selector: 'app-add-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-todo.html',
  styleUrls: ['./add-todo.css'],
})
export class AddTodoComponent {
  @ViewChild('todoForm') todoForm!: NgForm;

  newTodo = {
    title: '',
    description: '',
    priority: TodoPriority.MEDIUM,
    dueDate: null as string | null,
    dueTime: '' as string,
  };

  showDetails = false;
  isSubmitting = false;
  today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  constructor(private todoService: TodoService) {}

  onSubmit(): void {
    if (!this.newTodo.title.trim()) {
      return;
    }

    this.isSubmitting = true;

    // Combine date and time into a single Date object
    let dueDatetime: Date | undefined = undefined;
    if (this.newTodo.dueDate) {
      const dateStr = this.newTodo.dueDate;
      const timeStr = this.newTodo.dueTime || '23:59'; // Default to end of day if no time
      dueDatetime = new Date(`${dateStr}T${timeStr}`);
    }

    // Prepare todo data
    const todoData = {
      title: this.newTodo.title.trim(),
      description: this.newTodo.description?.trim() || undefined,
      priority: this.newTodo.priority,
      dueDate: this.newTodo.dueDate ? new Date(this.newTodo.dueDate) : undefined,
      completed: false,
    };

    // Add todo via service
    this.todoService.addTodo(todoData);

    // Reset form properly
    this.resetForm();

    // Reset submitting state
    this.isSubmitting = false;
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  private resetForm(): void {
    this.newTodo = {
      title: '',
      description: '',
      priority: TodoPriority.MEDIUM,
      dueDate: null,
      dueTime: '',
    };

    // Reset form validation state
    if (this.todoForm) {
      this.todoForm.resetForm();
    }

    this.showDetails = false;
  }
}
