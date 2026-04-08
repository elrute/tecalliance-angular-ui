import { TestBed } from '@angular/core/testing';
import { User } from '../models/user';
import { SessionService } from './session';

describe('SessionService', () => {
  let service: SessionService;
  const user = { id: 7, email: 'one@two.com' } as User;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('persists and restores the user snapshot', () => {
    service.setUser(user);

    expect(service.getUser()).toEqual(user);
    expect(service.getEmail()).toBe(user.email);
    expect(service.getUserId()).toBe(user.id);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('gracefully clears invalid stored JSON', () => {
    localStorage.setItem('todo-portal-user', '{bad json');

    expect(service.getUser()).toBeNull();
    expect(localStorage.getItem('todo-portal-user')).toBeNull();
  });

  it('clears the session data', () => {
    service.setUser(user);
    service.clear();

    expect(service.getUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});
