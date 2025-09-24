export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  order: number; //for drag/drop ordering
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface TodoFilter {
  status: TodoStatus;
  priority?: TodoPriority;
  searchTerm?: string;
}

export enum TodoStatus {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
}
