import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { SessionService } from '../../services/session';
import { Header } from './header';

type SessionMock = Pick<SessionService, 'getEmail' | 'clear'> & {
  getEmail: ReturnType<typeof vi.fn<() => string | null>>;
  clear: ReturnType<typeof vi.fn<() => void>>;
};

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let router: Router;
  let session: SessionMock;
  const email = 'user@example.com';

  beforeEach(async () => {
    session = {
      getEmail: vi.fn(() => email),
      clear: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: session }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('creates the shell with nav title', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.title')?.textContent).toContain('MyTODOList');
  });

  it('exposes links to Home and About routes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('.menu a'));
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Home', 'About']);
    expect(links[0].getAttribute('href')).toContain('/home');
    expect(links[1].getAttribute('href')).toContain('/about');
  });

  it('shows the current user and logs out when requested', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const label = compiled.querySelector('.user-label');
    const button = compiled.querySelector('button.logout') as HTMLButtonElement;
    expect(label?.textContent).toContain(email);

    button.click();

    expect(session.clear).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
