import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TodoItem } from '../models/todo-item';

@Injectable({ providedIn: 'root' })
export class TodoApiService {
  private readonly baseUrl = 'https://localhost:5001/api/todo';

  constructor(private http: HttpClient) {}

  validateUser(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/validate-user`, { email });
  }

  getTodos(email: string): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(`${this.baseUrl}?email=${encodeURIComponent(email)}`);
  }

  addTodo(userEmail: string, description: string): Observable<TodoItem> {
    return this.http.post<TodoItem>(this.baseUrl, { userEmail, description });
  }

  updateTodo(id: string, userEmail: string, description: string, isCompleted: boolean): Observable<TodoItem> {
    return this.http.put<TodoItem>(`${this.baseUrl}/${id}`, {
      userEmail,
      description,
      isCompleted
    });
  }

  deleteTodo(id: string, email: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}?email=${encodeURIComponent(email)}`);
  }
}