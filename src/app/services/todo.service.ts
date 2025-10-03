import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs';
import { Todo, TodoModel, TodoPriority, TodoStatus, TodoFilter, TodoStats } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly STORAGE_KEY = 'angular-todos';
  private todosSubject = new BehaviorSubject<TodoModel[]>([]);
  private filterSubject = new BehaviorSubject<TodoFilter>({
    status: TodoStatus.ALL,
    searchTerm: '',
  });

  // Public observables
  public todos$ = this.todosSubject.asObservable();
  public filter$ = this.filterSubject.asObservable();

  // Filtered todos based on current filter
  public filteredTodos$ = combineLatest([this.todos$, this.filter$]).pipe(
    map(([todos, filter]) => this.applyFilter(todos, filter))
  );

  // Statistics
  public stats$ = this.todos$.pipe(map((todos) => this.calculateStats(todos)));

  constructor() {
    this.loadFromStorage();
  }

  // CRUD Operations
  addTodo(todoData: Partial<Todo>): TodoModel {
    const todos = this.todosSubject.value;
    const newOrder = todos.length > 0 ? Math.max(...todos.map((t) => t.order)) + 1 : 0;

    const newTodo = new TodoModel({
      ...todoData,
      order: newOrder,
    });

    const updatedTodos = [...todos, newTodo];
    this.updateTodos(updatedTodos);
    return newTodo;
  }

  updateTodo(id: string, updates: Partial<Todo>): boolean {
    const todos = this.todosSubject.value;
    const index = todos.findIndex((todo) => todo.id === id);

    if (index === -1) return false;

    todos[index].update(updates);
    this.updateTodos([...todos]);
    return true;
  }

  deleteTodo(id: string): boolean {
    const todos = this.todosSubject.value;
    const filteredTodos = todos.filter((todo) => todo.id !== id);

    if (filteredTodos.length === todos.length) return false;

    this.updateTodos(filteredTodos);
    return true;
  }

  toggleTodo(id: string): boolean {
    const todos = this.todosSubject.value;
    const todo = todos.find((t) => t.id === id);

    if (!todo) return false;

    todo.toggle();
    this.updateTodos([...todos]);
    return true;
  }

  getTodoById(id: string): TodoModel | undefined {
    return this.todosSubject.value.find((todo) => todo.id === id);
  }

  // Drag and Drop Operations
  reorderTodos(previousIndex: number, currentIndex: number): void {
    const todos = [...this.todosSubject.value];
    const [removed] = todos.splice(previousIndex, 1);
    todos.splice(currentIndex, 0, removed);

    // Update order property for all todos
    todos.forEach((todo, index) => {
      todo.order = index;
      todo.updatedAt = new Date();
    });

    this.updateTodos(todos);
  }

  moveTodo(todoId: string, newIndex: number): void {
    const todos = [...this.todosSubject.value];
    const todoIndex = todos.findIndex((t) => t.id === todoId);

    if (todoIndex === -1) return;

    const [todo] = todos.splice(todoIndex, 1);
    todos.splice(newIndex, 0, todo);

    // Update order property
    todos.forEach((t, index) => {
      t.order = index;
      t.updatedAt = new Date();
    });

    this.updateTodos(todos);
  }

  // Filtering Operations
  setFilter(filter: Partial<TodoFilter>): void {
    const currentFilter = this.filterSubject.value;
    const newFilter = { ...currentFilter, ...filter };
    this.filterSubject.next(newFilter);
  }

  clearFilter(): void {
    this.filterSubject.next({
      status: TodoStatus.ALL,
      searchTerm: '',
    });
  }

  // Bulk Operations
  deleteCompleted(): number {
    const todos = this.todosSubject.value;
    const activeTodos = todos.filter((todo) => !todo.completed);
    const deletedCount = todos.length - activeTodos.length;

    this.updateTodos(activeTodos);
    return deletedCount;
  }

  markAllComplete(): void {
    const todos = this.todosSubject.value;
    todos.forEach((todo) => {
      if (!todo.completed) {
        todo.toggle();
      }
    });
    this.updateTodos([...todos]);
  }

  markAllIncomplete(): void {
    const todos = this.todosSubject.value;
    todos.forEach((todo) => {
      if (todo.completed) {
        todo.toggle();
      }
    });
    this.updateTodos([...todos]);
  }

  // Data Export/Import
  exportTodos(): string {
    const todos = this.todosSubject.value;
    return JSON.stringify(
      todos.map((todo) => todo.toJson()),
      null,
      2
    );
  }

  importTodos(jsonData: string): { success: boolean; count?: number; error?: string } {
    try {
      const data = JSON.parse(jsonData);

      if (!Array.isArray(data)) {
        return { success: false, error: 'Invalid data format' };
      }

      const importedTodos = data.map((item: any) => TodoModel.fromJson(item));
      this.updateTodos(importedTodos);

      return { success: true, count: importedTodos.length };
    } catch (error) {
      return { success: false, error: 'Failed to parse JSON data' };
    }
  }

  // Private helper methods
  private updateTodos(todos: TodoModel[]): void {
    // Sort by completion status first (incomplete first), then by order
    todos.sort((a, b) => {
      // If completion status differs, incomplete comes first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // If both have same completion status, sort by order
      return a.order - b.order;
    });

    this.todosSubject.next(todos);
    this.saveToStorage(todos);
  }

  private applyFilter(todos: TodoModel[], filter: TodoFilter): TodoModel[] {
    let filtered = [...todos];

    // Debug logging - remove later
    console.log('Applying filter:', filter);
    console.log('Total todos:', todos.length);

    // Status filter
    switch (filter.status) {
      case TodoStatus.ACTIVE:
        filtered = filtered.filter((todo) => !todo.completed);
        break;
      case TodoStatus.COMPLETED:
        filtered = filtered.filter((todo) => todo.completed);
        break;
      case TodoStatus.ALL:
      default:
        // Show all todos
        break;
    }

    console.log('After status filter:', filtered.length);

    // Priority filter
    if (filter.priority) {
      filtered = filtered.filter((todo) => todo.priority === filter.priority);
    }

    // Search filter
    if (filter.searchTerm && filter.searchTerm.trim()) {
      const searchTerm = filter.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchTerm) ||
          (todo.description && todo.description.toLowerCase().includes(searchTerm))
      );
    }

    console.log('Final filtered result:', filtered.length);
    return filtered;
  }

  private calculateStats(todos: TodoModel[]): TodoStats {
    return {
      total: todos.length,
      active: todos.filter((todo) => !todo.completed).length,
      completed: todos.filter((todo) => todo.completed).length,
    };
  }

  // Local Storage Operations
  private saveToStorage(todos: TodoModel[]): void {
    try {
      const data = todos.map((todo) => todo.toJson());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save todos to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    // Check if we're in browser environment
    if (typeof localStorage === 'undefined') {
      this.todosSubject.next([]);
      return;
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const todos = parsed.map((item: any) => TodoModel.fromJson(item));
        this.todosSubject.next(todos);
      }
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
      this.todosSubject.next([]);
    }
  }

  // Development helper methods
  addSampleData(): void {
    const sampleTodos = [
      {
        title: 'Welcome to your Todo App!',
        description: 'You can drag and drop todos to reorder them',
        priority: TodoPriority.HIGH,
        completed: false,
      },
      {
        title: 'Try editing this todo',
        description: 'Click on a todo to edit its details',
        priority: TodoPriority.MEDIUM,
        completed: false,
      },
      {
        title: 'Mark this as completed',
        description: 'Check the box to mark todos as done',
        priority: TodoPriority.LOW,
        completed: false,
      },
      {
        title: 'This one is already done',
        description: 'Completed todos can be filtered or hidden',
        priority: TodoPriority.MEDIUM,
        completed: true,
      },
    ];

    sampleTodos.forEach((todoData) => this.addTodo(todoData));
  }
}
