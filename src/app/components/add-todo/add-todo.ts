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
    // Reset the model
    this.newTodo = {
      title: '',
      description: '',
      priority: TodoPriority.MEDIUM,
      dueDate: null,
    };

    // Reset form validation state
    if (this.todoForm) {
      this.todoForm.resetForm();
    }

    this.showDetails = false;
  }
}
