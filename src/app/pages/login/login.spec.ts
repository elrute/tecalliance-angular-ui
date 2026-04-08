import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { User } from '../../models/user';
import { SessionService } from '../../services/session';
import { TodoApiService } from '../../services/todo-api';
import { LoginComponent } from './login';

type ApiMock = Pick<TodoApiService, 'validateUser'> & {
  validateUser: ReturnType<typeof vi.fn<(email: string) => ReturnType<TodoApiService['validateUser']>>>;
};

type SessionMock = Pick<SessionService, 'setUser'> & {
  setUser: ReturnType<typeof vi.fn<(user: User) => void>>;
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let api: ApiMock;
  let session: SessionMock;
  let router: Router;

  beforeEach(async () => {
    api = {
      validateUser: vi.fn<(email: string) => Observable<User>>(),
    };
    session = {
      setUser: vi.fn<(user: User) => void>(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: TodoApiService, useValue: api },
        { provide: SessionService, useValue: session },
        provideRouter([])
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('does not call the API when the email is invalid', () => {
    component.form.controls.email.setValue('');
    component.submit();

    expect(component.form.controls.email.touched).toBe(true);
    expect(api.validateUser).not.toHaveBeenCalled();
  });

  it('stores the user session and navigates on successful validation', () => {
    const user = { id: 1, email: 'one@two.com' } as User;
    api.validateUser.mockReturnValue(of(user));

    component.form.controls.email.setValue(user.email);
    component.submit();

    expect(api.validateUser).toHaveBeenCalledWith(user.email);
    expect(session.setUser).toHaveBeenCalledWith(user);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.errorMessage).toBe('');
  });

  it('surfaces backend errors to the template', () => {
    api.validateUser.mockReturnValue(throwError(() => ({ message: 'Not allowed' })));

    component.form.controls.email.setValue('bad@example.com');
    component.submit();

    expect(component.errorMessage).toBe('Not allowed');
    expect(component.loading).toBe(false);
  });
});
