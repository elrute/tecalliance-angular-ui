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
  errorMessage = '';
  editingId: string | null = null;

  form = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(250)]]
  });

  editForm = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(250)]]
  });

  ngOnInit(): void {
    const email = this.session.getEmail();
    if (!email) {
      this.router.navigate(['/']);
      return;
    }

    this.email = email;
    this.loadTodos();
  }

  loadTodos(): void {
    this.api.getTodos(this.email).subscribe({
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

    const description = this.form.value.description ?? '';

    this.api.addTodo(this.email, description).subscribe({
      next: () => {
        this.form.reset();
        this.loadTodos();
      },
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Failed to add ToDo.';
      }
    });
  }

  startEdit(todo: TodoItem): void {
    this.editingId = todo.id;
    this.editForm.patchValue({ description: todo.description });
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

    const description = this.editForm.value.description ?? '';

    this.api.updateTodo(todo.id, this.email, description, todo.isCompleted).subscribe({
      next: () => {
        this.editingId = null;
        this.editForm.reset();
        this.loadTodos();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Failed to update ToDo item.';
      }
    });
  }

  toggleCompleted(todo: TodoItem): void {
    this.errorMessage = '';

    this.api.updateTodo(
      todo.id,
      this.email,
      todo.description,
      !todo.isCompleted
    ).subscribe({
      next: () => this.loadTodos(),
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Failed to update ToDo item.';
      }
    });
  }

  remove(todo: TodoItem): void {
    const confirmed = window.confirm(`Are you sure you want to remove "${todo.description}"?`);
    if (!confirmed) {
      return;
    }

    this.api.deleteTodo(todo.id, this.email).subscribe({
      next: () => this.loadTodos(),
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Failed to delete ToDo item.';
      }
    });
  }
}