import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RentalService } from '../rentals/services/rental.service';
import { Rental } from '../rentals/services/rental.model';
import { AuthService } from '../../core/auth.service';

/* ============================================================
   ADMIN DASHBOARD — full CRUD over the rentals table.
   - Table of all listings
   - One form used for both Add and Edit (editingId decides)
   - Delete with a confirm step
   All operations go through RentalService (Supabase).
   ============================================================ */

@Component({
  selector: 'app-admin-dashboard',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rentalService = inject(RentalService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly rentals = signal<Rental[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMsg = signal<string | null>(null);
  protected readonly successMsg = signal<string | null>(null);

  /** null = the form adds a new rental; a number = editing that id */
  protected readonly editingId = signal<number | null>(null);
  /** id awaiting delete confirmation (two-click delete) */
  protected readonly confirmingDelete = signal<number | null>(null);

  /** photo upload state */
  protected readonly uploading = signal(false);
  protected readonly dragOver = signal(false);
  protected readonly uploadError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    province: ['ON', Validators.required],
    postal_code: [''],
    image_url: [''],
    image_urls_text: [''], // one photo URL per line -> image_urls array
  });

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    this.loading.set(true);
    this.errorMsg.set(null);
    try {
      this.rentals.set(await this.rentalService.getRentals());
    } catch {
      this.errorMsg.set('Could not load listings.');
    } finally {
      this.loading.set(false);
    }
  }

  /** Put a rental's values into the form for editing */
  startEdit(r: Rental): void {
    this.editingId.set(r.id);
    this.form.setValue({
      title: r.title,
      address: r.address,
      city: r.city,
      province: r.province,
      postal_code: r.postal_code,
      image_url: r.image_url ?? '',
      image_urls_text: (r.image_urls ?? []).join('\n'),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ province: 'ON' });
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const { image_urls_text, ...value } = this.form.getRawValue();
    // split the textarea into a clean array of photo URLs
    const image_urls = image_urls_text
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);
    const payload = {
      ...value,
      image_url: value.image_url || image_urls[0] || null, // cover = first photo
      image_urls,
    };

    try {
      const id = this.editingId();
      if (id === null) {
        await this.rentalService.createRental(payload);
        this.successMsg.set('Rental created successfully.');
      } else {
        await this.rentalService.updateRental(id, payload);
        this.successMsg.set('Rental updated successfully.');
      }
      this.cancelEdit();
      await this.refresh();
    } catch {
      this.errorMsg.set('Save failed — check the fields and try again.');
    } finally {
      this.saving.set(false);
    }
  }

  /** First click arms the confirmation; second click deletes */
  async onDelete(id: number): Promise<void> {
    if (this.confirmingDelete() !== id) {
      this.confirmingDelete.set(id);
      return;
    }
    this.confirmingDelete.set(null);
    try {
      await this.rentalService.deleteRental(id);
      this.successMsg.set('Rental deleted successfully.');
      await this.refresh();
    } catch {
      this.errorMsg.set('Delete failed.');
    }
  }

  /** URL-safe folder for a listing's photos, derived from its address */
  private addressSlug(): string {
    return this.form.getRawValue().address
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'unsorted';
  }

  /** Max upload size per photo (matches storage plan limits) */
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  /** Shared upload path for both drag-drop and the file picker */
  private async uploadFiles(files: File[]): Promise<void> {
    if (files.length === 0) return;

    // Validate every file before uploading anything (type, then size)
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.uploadError.set(`"${file.name}" is not an image file.`);
        return;
      }
      if (file.size > AdminDashboard.MAX_FILE_SIZE) {
        this.uploadError.set(`"${file.name}" is larger than 5 MB — please compress it first.`);
        return;
      }
    }
    const images = files;

    if (!this.form.getRawValue().address.trim()) {
      this.uploadError.set('Enter the address first — photos are filed under it.');
      return;
    }

    this.uploading.set(true);
    this.uploadError.set(null);
    try {
      const urls = await this.rentalService.uploadPhotos(images, this.addressSlug());
      // append the new public URLs to the gallery textarea (one per line)
      const current = this.form.getRawValue().image_urls_text.trim();
      this.form.patchValue({
        image_urls_text: current ? current + '\n' + urls.join('\n') : urls.join('\n'),
      });
    } catch {
      this.uploadError.set('Upload failed — check your connection and try again.');
    } finally {
      this.uploading.set(false);
    }
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  async onDrop(e: DragEvent): Promise<void> {
    e.preventDefault();
    this.dragOver.set(false);
    await this.uploadFiles(Array.from(e.dataTransfer?.files ?? []));
  }

  async onFilePick(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    await this.uploadFiles(Array.from(input.files ?? []));
    input.value = ''; // allow re-picking the same file
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigate(['/admin']);
  }
}
