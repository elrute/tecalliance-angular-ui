import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TodoItem } from '../../models/todo-item';
import { TodoApiService } from '../../services/todo-api';
import { SessionService } from '../../services/session';
import { Header } from "../../shared/header/header";

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(TodoApiService);
  private session = inject(SessionService);
  private router = inject(Router);

  todos: TodoItem[] = [];
  email = '';
  userId: number | null = null;
  errorMessage = '';
  editingId: number | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(250)]]
  });

  editForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(250)]]
  });

  ngOnInit(): void {
    const user = this.session.getUser();
    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    this.email = user.email;
    this.userId = user.id;
    this.loadTodos();
  }

  loadTodos(): void {
    if (this.userId == null) {
      return;
    }

    this.api.getTodos(this.userId).subscribe({
      next: data => {
        this.todos = data;
      },
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Failed to load ToDos.';
      }
    });
  }

  addTodo(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.userId == null) {
      this.errorMessage = 'Missing user information.';
      return;
    }

    const title = this.form.value.title ?? '';

    this.api.addTodo(this.userId, title).subscribe({
      next: (todo) => {
        this.todos = [...this.todos, todo];
        this.form.reset();
      },
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Failed to add ToDo.';
      }
    });
  }

  startEdit(todo: TodoItem): void {
    this.editingId = todo.id;
    this.editForm.patchValue({ title: todo.title });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset();
  }

  saveEdit(todo: TodoItem): void {
    this.errorMessage = '';

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const title = this.editForm.value.title ?? '';
    const updated: TodoItem = { ...todo, title };

    this.api.updateTodo(updated).subscribe({
      next: (saved) => {
        this.todos = this.todos.map((item) =>
          item.id === saved.id ? saved : item
        );
        this.cancelEdit();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Failed to update ToDo item.';
      }
    });
  }

  toggleCompleted(todo: TodoItem): void {
    this.errorMessage = '';

    const updated: TodoItem = {
      ...todo,
      completed: !todo.completed
    };

    this.api.updateTodo(updated).subscribe({
      next: (saved) => {
        this.todos = this.todos.map((item) =>
          item.id === saved.id ? saved : item
        );
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Failed to update ToDo item.';
      }
    });
  }

  remove(todo: TodoItem): void {
    const confirmed = window.confirm(`Are you sure you want to remove "${todo.title}"?`);
    if (!confirmed) {
      return;
    }

    this.api.deleteTodo(todo.id).subscribe({
      next: () => {
        this.todos = this.todos.filter((item) => item.id !== todo.id);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Failed to delete ToDo item.';
      }
    });
  }
}
