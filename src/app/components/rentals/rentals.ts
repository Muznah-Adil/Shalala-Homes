import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RentalService } from './services/rental.service';
import { Rental } from './services/rental.model';

/* ============================================================
   RENTALS — public listings page (matches the prototype)
   - Dark banner header
   - Area filter pills derived from each rental's city
   - Poster card grid (866:1000) with placeholder design
   - "View Photos" opens a generated PDF of the listing's photos
   - WhatsApp / iMessage buttons pre-filled per address
   - Data comes live from Supabase via RentalService
   ============================================================ */

const PHONE = '12269754568';

/** Filter pill definitions — areaKey groups cities like the prototype */
const FILTERS = [
  { key: 'all', label: 'All Areas', match: (_c: string) => true },
  { key: 'west', label: 'South Windsor', match: (c: string) => /south/i.test(c) },
  { key: 'downtown', label: 'West & Downtown', match: (c: string) => /downtown|west/i.test(c) },
  { key: 'lasalle', label: 'LaSalle', match: (c: string) => /lasalle/i.test(c) },
  { key: 'amherstburg', label: 'Amherstburg', match: (c: string) => /amherstburg/i.test(c) },
] as const;

@Component({
  selector: 'app-rentals',
  imports: [RouterLink],
  templateUrl: './rentals.html',
  styleUrl: './rentals.scss',
})
export class Rentals implements OnInit {
  private readonly rentalService = inject(RentalService);

  protected readonly filters = FILTERS;
  protected readonly activeFilter = signal<string>('all');

  protected readonly rentals = signal<Rental[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  /** Rentals narrowed by the active area pill */
  protected readonly visible = computed(() => {
    const f = FILTERS.find(x => x.key === this.activeFilter()) ?? FILTERS[0];
    return this.rentals().filter(r => f.match(r.city));
  });

  async ngOnInit(): Promise<void> {
    try {
      this.rentals.set(await this.rentalService.getRentals());
    } catch {
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  setFilter(key: string): void {
    this.activeFilter.set(key);
  }

  /** Cover photo: first gallery image, falling back to the single cover */
  cover(r: Rental): string | null {
    if (r.image_urls && r.image_urls.length > 0) return r.image_urls[0];
    return r.image_url;
  }

  /** WhatsApp deep link with a pre-filled message about this address */
  waLink(r: Rental): string {
    const msg = encodeURIComponent(
      `Hi, I'm interested in the ${r.address} listing. When can I visit the home?`,
    );
    return `https://wa.me/${PHONE}?text=${msg}`;
  }

  /** SMS / iMessage link with the same pre-filled message */
  smsLink(r: Rental): string {
    const msg = encodeURIComponent(
      `Hi, I'm interested in the ${r.address} listing. When can I visit the home?`,
    );
    return `sms:+${PHONE}?&body=${msg}`;
  }
}
