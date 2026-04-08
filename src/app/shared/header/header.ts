import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../services/session';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private session = inject(SessionService);
  private router = inject(Router);

  get email(): string | null {
    return this.session.getEmail();
  }

  logout(): void {
    this.session.clear();
    this.router.navigate(['/']);
  }
}
