import {
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { RentalService } from '../rentals/services/rental.service';
import { Rental } from '../rentals/services/rental.model';

/* ============================================================
   RENTAL DETAIL — /rentals/:id
   Full page for one listing: photo gallery (main photo +
   selectable thumbnails), the listing's details, the same
   WhatsApp / iMessage inquiry actions as the cards, and a
   Google Maps embed of the listing's location that opens
   Google Maps when clicked.
   ============================================================ */

const PHONE = '12269754568';

/** One item in the unified gallery: a photo or a walkthrough video */
interface MediaItem {
  type: 'photo' | 'video';
  url: string;
}

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
  private readonly sanitizer = inject(DomSanitizer);

  private readonly thumbsEl = viewChild<ElementRef<HTMLDivElement>>('thumbsEl');

  protected readonly rental = signal<Rental | null>(null);
  protected readonly loading = signal(true);
  protected readonly selected = signal<MediaItem | null>(null);

  /** All photos: gallery array, falling back to the single cover */
  protected readonly photos = computed(() => {
    const r = this.rental();
    if (!r) return [];
    if (r.image_urls && r.image_urls.length > 0) return r.image_urls;
    return r.image_url ? [r.image_url] : [];
  });

  /** Walkthrough videos for the listing */
  protected readonly videos = computed(() => this.rental()?.video_urls ?? []);

  /** Unified gallery: all photos first, then the videos */
  protected readonly media = computed<MediaItem[]>(() => [
    ...this.photos().map(url => ({ type: 'photo' as const, url })),
    ...this.videos().map(url => ({ type: 'video' as const, url })),
  ]);

  /** Google Maps embed of the listing's address (no API key needed) */
  protected readonly mapEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const r = this.rental();
    if (!r) return null;
    const url = `https://maps.google.com/maps?q=${this.mapQuery(r)}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  /** Google Maps link opened when the map is clicked */
  protected readonly mapsLink = computed(() => {
    const r = this.rental();
    if (!r) return '';
    return `https://www.google.com/maps/search/?api=1&query=${this.mapQuery(r)}`;
  });

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    try {
      if (Number.isFinite(id) && id > 0) {
        const r = await this.rentalService.getRentalById(id);
        this.rental.set(r);
        if (r) {
          this.titleService.setTitle(`${r.address} — Shalala Homes`);
          this.selected.set(this.media()[0] ?? null);
        }
      }
    } catch {
      this.rental.set(null);
    } finally {
      this.loading.set(false);
    }
    window.scrollTo({ top: 0 });
  }

  /** Index of the media item currently shown in the main frame */
  protected readonly currentIndex = computed(() => {
    const current = this.selected();
    return current ? this.media().findIndex(m => m.url === current.url) : -1;
  });

  select(item: MediaItem): void {
    this.selected.set(item);
    this.scrollActiveThumbIntoView();
  }

  /** Arrow navigation: -1 previous, +1 next (wraps around, videos included) */
  step(delta: number): void {
    const list = this.media();
    if (list.length < 2) return;
    const next = (this.currentIndex() + delta + list.length) % list.length;
    this.selected.set(list[next]);
    this.scrollActiveThumbIntoView();
  }

  /** Keep the highlighted thumbnail visible in the scrollable row */
  private scrollActiveThumbIntoView(): void {
    setTimeout(() => {
      const active =
        this.thumbsEl()?.nativeElement.querySelector('.detail__thumb--active');
      active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  }

  /* ---------- map ---------- */

  /** Areas like "Downtown Windsor" aren't real municipalities —
      normalize them so Google Maps finds the address */
  private municipality(city: string): string {
    if (/lasalle/i.test(city)) return 'LaSalle';
    if (/amherstburg/i.test(city)) return 'Amherstburg';
    return 'Windsor';
  }

  /** URL-encoded address query shared by the embed and the link */
  private mapQuery(r: Rental): string {
    return encodeURIComponent(
      `${r.address}, ${this.municipality(r.city)}, ${r.province}, Canada`,
    );
  }

  /* ---------- inquiries ---------- */

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
