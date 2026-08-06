import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { RentalService } from '../rentals/services/rental.service';
import { Rental } from '../rentals/services/rental.model';

/* ============================================================
   RENTAL DETAIL — /rentals/:id
   Full page for one listing: photo gallery (main photo +
   selectable thumbnails), the listing's details, and the same
   WhatsApp / iMessage inquiry actions as the cards.
   ============================================================ */

const PHONE = '12269754568';

@Component({
  selector: 'app-rental-detail',
  imports: [RouterLink],
  templateUrl: './rental-detail.html',
  styleUrl: './rental-detail.scss',
})
export class RentalDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly rentalService = inject(RentalService);
  private readonly titleService = inject(Title);

  protected readonly rental = signal<Rental | null>(null);
  protected readonly loading = signal(true);
  protected readonly selectedPhoto = signal<string | null>(null);

  /** All photos: gallery array, falling back to the single cover */
  protected readonly photos = computed(() => {
    const r = this.rental();
    if (!r) return [];
    if (r.image_urls && r.image_urls.length > 0) return r.image_urls;
    return r.image_url ? [r.image_url] : [];
  });

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    try {
      if (Number.isFinite(id) && id > 0) {
        const r = await this.rentalService.getRentalById(id);
        this.rental.set(r);
        if (r) {
          this.titleService.setTitle(`${r.address} — Shalala Homes`);
          this.selectedPhoto.set(this.photos()[0] ?? null);
        }
      }
    } catch {
      this.rental.set(null);
    } finally {
      this.loading.set(false);
    }
    window.scrollTo({ top: 0 });
  }

  select(photo: string): void {
    this.selectedPhoto.set(photo);
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
