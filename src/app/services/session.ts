import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly emailKey = 'todo-user-email';

  setEmail(email: string): void {
    localStorage.setItem(this.emailKey, email);
  }

  getEmail(): string | null {
    return localStorage.getItem(this.emailKey);
  }

  clear(): void {
    localStorage.removeItem(this.emailKey);
  }

  isLoggedIn(): boolean {
    return !!this.getEmail();
  }
}