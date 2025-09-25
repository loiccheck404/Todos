import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { TodoStatus, TodoPriority, TodoFilter } from '../../models';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-bar.html',
  styleUrls: ['./filter-bar.css'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  currentFilter: TodoFilter = { status: TodoStatus.ALL, searchTerm: '' };
  searchTerm = '';

  statusFilters = [
    { value: TodoStatus.ALL, label: 'All', count: 0 },
    { value: TodoStatus.ACTIVE, label: 'Active', count: 0 },
    { value: TodoStatus.COMPLETED, label: 'Completed', count: 0 },
  ];

  priorityFilters = [
    { value: TodoPriority.HIGH, label: 'High' },
    { value: TodoPriority.MEDIUM, label: 'Medium' },
    { value: TodoPriority.LOW, label: 'Low' },
  ];

  constructor(private todoService: TodoService) {}

  ngOnInit() {
    // Subscribe to current filter state
    this.todoService.filter$.pipe(takeUntil(this.destroy$)).subscribe((filter) => {
      this.currentFilter = filter;
      this.searchTerm = filter.searchTerm || '';
    });

    // Subscribe to todo stats to update counts
    this.todoService.stats$.pipe(takeUntil(this.destroy$)).subscribe((stats) => {
      this.statusFilters[0].count = stats.total;
      this.statusFilters[1].count = stats.active;
      this.statusFilters[2].count = stats.completed;
    });

    // Setup debounced search
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.todoService.setFilter({ searchTerm });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setStatusFilter(status: TodoStatus) {
    this.todoService.setFilter({ status });
  }

  setPriorityFilter(priority: TodoPriority | undefined) {
    this.todoService.setFilter({ priority });
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.todoService.clearFilter();
  }

  hasActiveFilters(): boolean {
    const hasStatusFilter = this.currentFilter.status !== TodoStatus.ALL;
    const hasPriorityFilter = this.currentFilter.priority !== undefined;
    const hasSearchFilter = !!(
      this.currentFilter.searchTerm && this.currentFilter.searchTerm.trim().length > 0
    );

    return hasStatusFilter || hasPriorityFilter || hasSearchFilter;
  }

  getActiveFiltersText(): string {
    const filters: string[] = [];

    if (this.currentFilter.status !== TodoStatus.ALL) {
      filters.push(`Status: ${this.currentFilter.status}`);
    }

    if (this.currentFilter.priority) {
      filters.push(`Priority: ${this.currentFilter.priority}`);
    }

    if (this.currentFilter.searchTerm) {
      filters.push(`Search: "${this.currentFilter.searchTerm}"`);
    }

    return filters.length > 0 ? `Active filters: ${filters.join(', ')}` : '';
  }
}
