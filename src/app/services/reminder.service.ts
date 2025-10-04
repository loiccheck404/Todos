import { Injectable } from '@angular/core';
import { TodoService } from './todo.service';
import { NotificationService } from './notification.service';
import { TodoModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  private checkInterval: any;
  private notifiedTodos = new Set<string>(); // Track already notified todos

  constructor(private todoService: TodoService, private notificationService: NotificationService) {
    // Listen for todo changes and clear notifications for completed todos
    this.todoService.todos$.subscribe((todos) => {
      todos.forEach((todo) => {
        if (todo.completed) {
          this.notifiedTodos.delete(todo.id);
        }
      });
    });
  }

  startReminders(): void {
    // Request browser notification permission
    this.requestNotificationPermission();

    // Check for due todos every minute
    this.checkInterval = setInterval(() => {
      this.checkDueTodos();
    }, 60000); // Check every 60 seconds

    // Initial check
    this.checkDueTodos();
  }

  stopReminders(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private async requestNotificationPermission(): Promise<void> {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.notificationService.success('Reminders enabled!');
      }
    }
  }

  private checkDueTodos(): void {
    this.todoService.todos$.subscribe((todos) => {
      const now = new Date();

      todos.forEach((todo) => {
        if (this.shouldNotify(todo, now)) {
          this.sendReminder(todo);
          this.notifiedTodos.add(todo.id);
        }
      });
    });
  }

  private shouldNotify(todo: TodoModel, now: Date): boolean {
    // Don't notify if:
    // - Already completed
    // - No due date
    // - Already notified
    // - Due date is in the future
    if (todo.completed || !todo.dueDate || this.notifiedTodos.has(todo.id)) {
      return false;
    }

    const dueTime = new Date(todo.dueDate).getTime();
    const currentTime = now.getTime();

    // Notify if due time has passed or is within next 5 minutes
    // Notify 1 minute before
    const oneMinute = 1 * 60 * 1000;
    return currentTime >= dueTime - oneMinute;
  }

  private sendReminder(todo: TodoModel): void {
    const title = '🔔 Todo Reminder';
    const body = `"${todo.title}" is due now!`;

    // Check browser environment before using Notification API
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: todo.id,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

    // In-app notification always works
    this.notificationService.warning(`"${todo.title}" is due now!`, 8000);
  }

  private formatDueTime(dueDate: Date): string {
    const date = new Date(dueDate);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Clear notification tracking for a todo (when it's updated or completed)
  clearNotification(todoId: string): void {
    this.notifiedTodos.delete(todoId);
  }

  // Reset all notifications (useful when todos are updated)
  resetNotifications(): void {
    this.notifiedTodos.clear();
  }
}
