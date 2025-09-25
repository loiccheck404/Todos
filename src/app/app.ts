import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AddTodoComponent } from './components/add-todo/add-todo';
import { TodoListComponent } from './components/todo-list/todo-list';
import { FilterBarComponent } from './components/filter-bar/filter-bar';
import { ToastComponent } from './components/toast/toast';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AddTodoComponent,
    FilterBarComponent,
    TodoListComponent,
    ToastComponent,
    ConfirmationDialogComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  title = 'todos';
}
