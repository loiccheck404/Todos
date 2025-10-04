import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AddTodoComponent } from './components/add-todo/add-todo';
import { TodoListComponent } from './components/todo-list/todo-list';
import { FilterBarComponent } from './components/filter-bar/filter-bar';
import { ToastComponent } from './components/toast/toast';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog';
import { ReminderService } from './services/reminder.service';

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
export class AppComponent implements OnInit, OnDestroy {
  title = 'todos';
  remindersEnabled = false;

  constructor(private reminderService: ReminderService) {}

  ngOnInit() {
    // Start checking for reminders
    this.reminderService.startReminders();
    this.remindersEnabled = true;
  }

  ngOnDestroy() {
    // Clean up when app closes
    this.reminderService.stopReminders();
  }

  toggleReminders() {
    if (this.remindersEnabled) {
      this.reminderService.stopReminders();
      this.remindersEnabled = false;
    } else {
      this.reminderService.startReminders();
      this.remindersEnabled = true;
    }
  }
}
