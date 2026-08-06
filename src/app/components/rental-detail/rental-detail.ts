import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { RentalService } from '../rentals/services/rental.service';
import { Rental } from '../rentals/services/rental.model';
import type * as Leaflet from 'leaflet';

/* ============================================================
   RENTAL DETAIL — /rentals/:id
   Full page for one listing: photo gallery (main photo +
   selectable thumbnails), the listing's details, the same
   WhatsApp / iMessage inquiry actions as the cards, and a
   location map (OpenStreetMap via Leaflet, geocoded from the
   listing's address with Nominatim).
   ============================================================ */

const PHONE = '12269754568';

@Component({
  selector: 'app-rental-detail',
  imports: [RouterLink],
  templateUrl: './rental-detail.html',
  styleUrl: './rental-detail.scss',
})
export class RentalDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly rentalService = inject(RentalService);
  private readonly titleService = inject(Title);

  protected readonly rental = signal<Rental | null>(null);
  protected readonly loading = signal(true);
  protected readonly selectedPhoto = signal<string | null>(null);

  /** [lat, lng] of the listing, once geocoded (null = no map) */
  protected readonly coords = signal<[number, number] | null>(null);

  private readonly mapEl = viewChild<ElementRef<HTMLDivElement>>('mapEl');
  private map: Leaflet.Map | null = null;

  /** All photos: gallery array, falling back to the single cover */
  protected readonly photos = computed(() => {
    const r = this.rental();
    if (!r) return [];
    if (r.image_urls && r.image_urls.length > 0) return r.image_urls;
    return r.image_url ? [r.image_url] : [];
  });

  constructor() {
    /* Build the map as soon as both the coordinates and the
       #mapEl div (rendered by the @if) exist */
    effect(() => {
      const el = this.mapEl()?.nativeElement;
      const c = this.coords();
      if (el && c && !this.map) void this.buildMap(el, c);
    });
  }

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    try {
      if (Number.isFinite(id) && id > 0) {
        const r = await this.rentalService.getRentalById(id);
        this.rental.set(r);
        if (r) {
          this.titleService.setTitle(`${r.address} — Shalala Homes`);
          this.selectedPhoto.set(this.photos()[0] ?? null);
          void this.geocode(r);
        }
      }
    } catch {
      this.rental.set(null);
    } finally {
      this.loading.set(false);
    }
    window.scrollTo({ top: 0 });
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  select(photo: string): void {
    this.selectedPhoto.set(photo);
  }

  /* ---------- map ---------- */

  /** Areas like "Downtown Windsor" aren't real municipalities —
   normalize them so the geocoder finds the address */
  private municipality(city: string): string {
    if (/lasalle/i.test(city)) return 'LaSalle';
    if (/amherstburg/i.test(city)) return 'Amherstburg';
    return 'Windsor';
  }

  /** Look up the listing's coordinates from its address (Nominatim / OSM) */
  private async geocode(r: Rental): Promise<void> {
    const query = encodeURIComponent(
      `${r.address}, ${this.municipality(r.city)}, ${r.province}, Canada`,
    );
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
        { headers: { Accept: 'application/json' } },
      );
      if (!res.ok) return;
      const results: { lat: string; lon: string }[] = await res.json();
      if (results.length > 0) {
        this.coords.set([Number(results[0].lat), Number(results[0].lon)]);
      }
    } catch {
      /* no coordinates — the map section simply doesn't render */
    }
  }

  /** Create the Leaflet map with an on-brand pin at the listing */
  private async buildMap(el: HTMLDivElement, c: [number, number]): Promise<void> {
    const L = await import('leaflet');

    this.map = L.map(el, {
      center: c,
      zoom: 15,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    const pin = L.divIcon({
      className: 'detail__pin',
      iconSize: [34, 44],
      iconAnchor: [17, 44],
    });

    L.marker(c, { icon: pin }).addTo(this.map);
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
