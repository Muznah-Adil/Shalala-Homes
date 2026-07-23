import {Component, HostListener, signal,} from '@angular/core';
import {RouterLink} from '@angular/router';

interface NavLink {
  label: string;
  href: string;
}

@Component({
  selector: 'app-nav',
  imports: [RouterLink],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})

export class Nav {

  /** true once the page has scrolled past the hero top (adds dark bg) */
  protected readonly scrolled = signal(false);

  /** true while the mobile slide-in panel is open */
  protected readonly menuOpen = signal(false);

  protected readonly phoneDisplay = '(226) 975-4568';
  protected readonly phoneHref = 'tel:+12269754568';

  protected readonly links: NavLink[] = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Rentals', href: '/rentals' },
    { label: 'For Owners', href: '/for-owners' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 60);
  }

  openMenu(): void {
    this.menuOpen.set(true);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
