import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TodoApiService } from '../../services/todo-api';
import { SessionService } from '../../services/session';
import { Header } from "../../shared/header/header";

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private api = inject(TodoApiService);
  private session = inject(SessionService);
  private router = inject(Router);

  errorMessage = '';
  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.email!;
    this.loading = true;

    this.api.validateUser(email).subscribe({
      next: (user) => {
        this.session.setUser(user);
        this.router.navigate(['/home']);
      },
      error: err => {
        this.errorMessage = err?.message ?? err?.error?.message ?? 'Validation failed.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
