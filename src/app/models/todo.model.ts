import { Todo, TodoPriority } from './todo.interface';

export class TodoModel implements Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  order: number;

  constructor(data: Partial<Todo>) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.description = data.description;
    this.completed = data.completed || false;
    this.priority = data.priority || TodoPriority.MEDIUM;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.dueDate = data.dueDate;
    this.order = data.order || 0;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  toggle(): void {
    this.completed = !this.completed;
    this.updatedAt = new Date();
  }

  update(data: Partial<Todo>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  setPriority(priority: TodoPriority): void {
    this.priority = priority;
    this.updatedAt = new Date();
  }

  isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && !this.completed;
  }

  getDaysUntilDue(): number | null {
    if (!this.dueDate) return null;
    const today = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static fromJson(json: any): TodoModel {
    return new TodoModel({
      ...json,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
      dueDate: json.dueDate ? new Date(json.dueDate) : undefined,
    });
  }

  toJson(): any {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      completed: this.completed,
      priority: this.priority,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      dueDate: this.dueDate?.toISOString(),
      order: this.order,
    };
  }
}
