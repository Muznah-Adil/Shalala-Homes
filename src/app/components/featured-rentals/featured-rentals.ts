import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RentalService } from '../rentals/services/rental.service';
import { Rental } from '../rentals/services/rental.model';

/* ============================================================
   FEATURED RENTALS — home page section (matches prototype)
   The three newest listings as poster cards, with the same
   WhatsApp / iMessage actions as the rentals page, and a
   "View All Rentals" pill linking to /rentals.
   ============================================================ */

const PHONE = '12269754568';

@Component({
  selector: 'app-featured-rentals',
  imports: [RouterLink],
  templateUrl: './featured-rentals.html',
  styleUrl: './featured-rentals.scss',
})
export class FeaturedRentals implements OnInit {
  private readonly rentalService = inject(RentalService);

  protected readonly featured = signal<Rental[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      // getRentals() returns newest first — take the top three
      this.featured.set((await this.rentalService.getRentals()).slice(0, 3));
    } catch {
      // Featured is decorative on the home page: fail silently,
      // the section simply renders empty rather than erroring.
      this.featured.set([]);
    }
  }

  cover(r: Rental): string | null {
    if (r.image_urls && r.image_urls.length > 0) return r.image_urls[0];
    return r.image_url;
  }

  waLink(r: Rental): string {
    const msg = encodeURIComponent(
      `Hi, I'm interested in the ${r.address} listing. When can I visit the home?`,
    );
    return `https://wa.me/${PHONE}?text=${msg}`;
  }

  smsLink(r: Rental): string {
    const msg = encodeURIComponent(
      `Hi, I'm interested in the ${r.address} listing. When can I visit the home?`,
    );
    return `sms:+${PHONE}?&body=${msg}`;
  }
}
