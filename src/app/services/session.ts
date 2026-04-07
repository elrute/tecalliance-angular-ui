import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly userKey = 'todo-portal-user';

  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): User | null {
    const raw = localStorage.getItem(this.userKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      this.clear();
      return null;
    }
  }

  getEmail(): string | null {
    return this.getUser()?.email ?? null;
  }

  getUserId(): number | null {
    const user = this.getUser();
    return user?.id ?? null;
  }

  clear(): void {
    localStorage.removeItem(this.userKey);
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }
}
