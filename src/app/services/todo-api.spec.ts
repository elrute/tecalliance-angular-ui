import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TodoItem } from '../models/todo-item';
import { User } from '../models/user';
import { TodoApiService } from './todo-api';

describe('TodoApiService', () => {
  let service: TodoApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TodoApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });

    service = TestBed.inject(TodoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests a user by email and returns the first match', () => {
    const user = { id: 1, email: 'one@two.com' } as User;

    service.validateUser('one@two.com').subscribe((result) => {
      expect(result).toEqual(user);
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?email=one%40two.com');
    expect(req.request.method).toBe('GET');
    req.flush([user]);
  });

  it('fails fast when no user matches the email', () => {
    service.validateUser('missing@two.com').subscribe({
      next: () => {
        throw new Error('expected an error');
      },
      error: (err) => {
        expect(err.message).toContain('User not found');
      }
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users?email=missing%40two.com');
    req.flush([]);
  });

  it('posts new todos with the expected payload', () => {
    const created = { id: 5, title: 'Write unit tests', completed: false, userId: 9 } as TodoItem;

    service.addTodo(created.userId, created.title).subscribe((todo) => {
      expect(todo).toEqual(created);
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      userId: created.userId,
      title: created.title,
      completed: false
    });
    req.flush(created);
  });
});
