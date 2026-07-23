import {AfterViewInit, Component, OnDestroy, inject} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Hero} from '../hero/hero';
import {About} from '../about/about';
import {Services} from '../services/services';
import {Owners} from '../owners/owners';
import {Testimonials} from '../testimonials/testimonials';
import {Contact} from '../contact/contact';
import {FeaturedRentals} from '../featured-rentals/featured-rentals';

@Component({
  selector: 'app-home',
  imports: [Hero, About, Services, Owners, Testimonials, Contact, FeaturedRentals],
  templateUrl: './home.html',
})
export class Home implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private routeSub?: Subscription;

  /** URL path -> section element id on this page */
  private static readonly SECTIONS: Record<string, string> = {
    '/services': 'services',
    '/about': 'about',
    '/for-owners': 'owners',
    '/contact': 'contact',
  };

  ngAfterViewInit(): void {
    // Deep link (someone opens /services directly): jump once rendered
    this.scrollForUrl(this.router.url, 'auto');

    // In-page navigation (nav/footer clicks while already on Home)
    this.routeSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.scrollForUrl(e.urlAfterRedirects, 'smooth'));
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private scrollForUrl(url: string, behavior: ScrollBehavior): void {
    const path = url.split('?')[0].split('#')[0];
    const id = Home.SECTIONS[path];
    setTimeout(() => {
      if (id) {
        document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' });
      } else if (path === '/') {
        window.scrollTo({ top: 0, behavior });
      }
    });
  }
}
