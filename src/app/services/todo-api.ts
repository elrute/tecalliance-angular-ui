import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TodoItem } from '../models/todo-item';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TodoApiService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly todosSuffix = environment.todosSuffix;
  private readonly usersSuffix = environment.usersSuffix;

  constructor(private http: HttpClient) {}

  validateUser(email: string): Observable<User> {
    return this.http
      .get<User[]>(
        `${this.baseUrl}${this.usersSuffix}?email=${encodeURIComponent(email)}`
      )
      .pipe(
        map((users) => {
          const user = users[0];
          if (!user) {
            throw new Error('User not found');
          }
          return user;
        })
      );
  }

  getTodos(userId: number): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(
      `${this.baseUrl}${this.todosSuffix}?userId=${userId}`
    );
  }

  addTodo(userId: number, title: string): Observable<TodoItem> {
    return this.http.post<TodoItem>(`${this.baseUrl}${this.todosSuffix}`, {
      userId,
      title,
      completed: false
    });
  }

  updateTodo(todo: TodoItem): Observable<TodoItem> {
    return this.http.put<TodoItem>(
      `${this.baseUrl}${this.todosSuffix}/${todo.id}`,
      todo
    );
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${this.todosSuffix}/${id}`
    );
  }
}
