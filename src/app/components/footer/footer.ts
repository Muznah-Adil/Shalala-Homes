import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
interface FooterLink {
  label: string;
  href: string;
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly year = new Date().getFullYear();

  protected readonly phoneDisplay = '(226) 975-4568';
  protected readonly phoneHref = 'tel:+12269754568';
  protected readonly email = 'shalalahomes@gmail.com';

  protected readonly exploreLinks: FooterLink[] = [
    { label: 'Home', href: '/' },
    { label: 'Rentals', href: '/rentals' },
    { label: 'Services', href: '/services' },
    { label: 'For Owners', href: '/for-owners' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  protected readonly serviceAreas: string[] = [
    'Windsor',
    'LaSalle',
    'Tecumseh',
    'Amherstburg',
    'Belle River',
  ];
}
