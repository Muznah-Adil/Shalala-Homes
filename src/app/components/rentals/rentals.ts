import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RentalService } from './services/rental.service';
import { Rental } from './services/rental.model';
import { jsPDF } from 'jspdf';

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
  { key: 'west', label: 'West & South Windsor', match: (c: string) => /west|south/i.test(c) },
  { key: 'downtown', label: 'Downtown & Walkerville', match: (c: string) => /downtown|walkerville/i.test(c) },
  { key: 'lasalle', label: 'LaSalle', match: (c: string) => /lasalle/i.test(c) },
  { key: 'amherstburg', label: 'Amherstburg', match: (c: string) => /amherstburg/i.test(c) },
] as const;

@Component({
  selector: 'app-rentals',
  imports: [],
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

  /** All photos for a listing: the gallery array, falling back to the cover */
  photos(r: Rental): string[] {
    if (r.image_urls && r.image_urls.length > 0) return r.image_urls;
    return r.image_url ? [r.image_url] : [];
  }

  /** rental id currently generating its photo PDF (disables that button) */
  protected readonly generatingPdf = signal<number | null>(null);

  /**
   * Build a PDF of this rental's photos and open it in a new tab.
   * Each photo becomes one page, sized to the photo's own aspect ratio.
   */
  async viewPhotos(r: Rental): Promise<void> {
    if (this.generatingPdf() !== null) return;

    const urls = this.photos(r);
    if (urls.length === 0) return;

    // Open the tab NOW, inside the click gesture — popup blockers
    // reject windows opened after async work completes.
    const tab = window.open('', '_blank');
    this.generatingPdf.set(r.id);

    try {
      // Load every photo as a data URL with its natural dimensions
      const images = await Promise.all(urls.map(u => this.loadImage(u)));

      const PAGE_W = 210; // mm — A4 width; each page's height follows the photo
      let doc: jsPDF | null = null;

      for (const img of images) {
        const pageH = (img.height / img.width) * PAGE_W;
        if (doc === null) {
          doc = new jsPDF({ unit: 'mm', format: [PAGE_W, pageH] });
        } else {
          doc.addPage([PAGE_W, pageH]);
        }
        doc.addImage(img.dataUrl, img.format, 0, 0, PAGE_W, pageH);
      }

      const blobUrl = doc!.output('bloburl').toString();
      if (tab) {
        // Render the PDF inside the tab we already own: navigating an
        // opened window to a blob: URL is unreliable across browsers,
        // but an <embed> written into its document always displays.
        tab.document.write(
          `<!doctype html><html><head><title>${r.address} — Photos</title>` +
          `<style>html,body{margin:0;height:100%;background:#0a1a27}</style></head>` +
          `<body><embed src="${blobUrl}" type="application/pdf" style="width:100%;height:100%"></body></html>`,
        );
        tab.document.close();
      } else {
        // Popup blocked — fall back to downloading the PDF instead
        doc!.save(`${r.address.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-photos.pdf`);
      }
    } catch {
      tab?.close(); // don't leave a blank tab behind on failure
    } finally {
      this.generatingPdf.set(null);
    }
  }

  /** Fetch one image and return it as a PDF-ready data URL plus its size */
  private loadImage(url: string): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG'; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Supabase Storage serves CORS-enabled
      img.onload = () => {
        // Downscale for the PDF: full-size photos (often 4000-8000px from
        // phones) would overflow the PDF builder's string limits and
        // produce enormous files. 2000px on the long side is crisp at A4.
        const MAX_DIM = 2000;
        const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
        const width = Math.round(img.naturalWidth * scale);
        const height = Math.round(img.naturalHeight * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff'; // JPEG has no transparency — avoid black fill
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        resolve({
          // Photos are always JPEG inside the PDF — smallest by far
          dataUrl: canvas.toDataURL('image/jpeg', 0.85),
          format: 'JPEG',
          width,
          height,
        });
      };
      img.onerror = () => reject(new Error(`Could not load ${url}`));
      img.src = url;
    });
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
