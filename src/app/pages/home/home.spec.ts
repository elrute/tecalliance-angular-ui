import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { vi } from 'vitest';
import { TodoItem } from '../../models/todo-item';
import { User } from '../../models/user';
import { SessionService } from '../../services/session';
import { TodoApiService } from '../../services/todo-api';
import { HomeComponent } from './home';

type ApiMock = {
  getTodos: ReturnType<typeof vi.fn<(userId: number) => ReturnType<TodoApiService['getTodos']>>>;
  addTodo: ReturnType<typeof vi.fn<(userId: number, title: string) => ReturnType<TodoApiService['addTodo']>>>;
  updateTodo: ReturnType<typeof vi.fn<(todo: TodoItem) => ReturnType<TodoApiService['updateTodo']>>>;
  deleteTodo: ReturnType<typeof vi.fn<(id: number) => ReturnType<TodoApiService['deleteTodo']>>>;
};

type SessionMock = Pick<SessionService, 'getUser'> & { getUser: ReturnType<typeof vi.fn<() => ReturnType<SessionService['getUser']>>> };

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let api: ApiMock;
  let session: SessionMock;
  let router: Router;
  const storedUser = { id: 1, email: 'one@two.com' } as User;

  const createComponent = () => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    api = {
      getTodos: vi.fn<(userId: number) => Observable<TodoItem[]>>(),
      addTodo: vi.fn<(userId: number, title: string) => Observable<TodoItem>>(),
      updateTodo: vi.fn<(todo: TodoItem) => Observable<TodoItem>>(),
      deleteTodo: vi.fn<(id: number) => Observable<void>>()
    };
    session = {
      getUser: vi.fn<() => User | null>()
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: TodoApiService, useValue: api },
        { provide: SessionService, useValue: session },
        provideRouter([])
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    session.getUser.mockReturnValue(storedUser);
    api.getTodos.mockReturnValue(of([
      { id: 1, title: 'Existing', completed: false, userId: storedUser.id } as TodoItem
    ]));
  });

  it('redirects to the login page when there is no active session', () => {
    session.getUser.mockReturnValue(null);
    createComponent();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(api.getTodos).not.toHaveBeenCalled();
  });

  it('loads todos for the stored user on init', () => {
    const initialTodos = [
      { id: 3, title: 'Feed the cat', completed: false, userId: storedUser.id } as TodoItem
    ];
    api.getTodos.mockReturnValue(of(initialTodos));

    createComponent();

    expect(api.getTodos).toHaveBeenCalledWith(storedUser.id);
    expect(component.todos).toEqual(initialTodos);
    expect(component.email).toBe(storedUser.email);
  });

  it('adds a todo and resets the form when the submission is valid', () => {
    const created = { id: 10, title: 'Write docs', completed: false, userId: storedUser.id } as TodoItem;
    api.addTodo.mockReturnValue(of(created));

    createComponent();
    component.form.controls.title.setValue('Write docs');
    component.addTodo();

    expect(api.addTodo).toHaveBeenCalledWith(storedUser.id, 'Write docs');
    expect(component.todos.some(todo => todo.id === created.id)).toBe(true);
    expect(component.form.value.title).toBeNull();
  });

  it('removes a todo after confirmation', () => {
    const todo = { id: 55, title: 'Remove me', completed: false, userId: storedUser.id } as TodoItem;
    api.getTodos.mockReturnValue(of([todo]));
    api.deleteTodo.mockReturnValue(of(void 0));
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    createComponent();
    component.remove(todo);

    expect(api.deleteTodo).toHaveBeenCalledWith(todo.id);
    expect(component.todos.length).toBe(0);
  });
});
