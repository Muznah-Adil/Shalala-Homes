import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../../core/supabase.service';
import { Rental, CreateRental, UpdateRental } from './rental.model';

@Injectable({
  providedIn: 'root',
})
export class RentalService {
  private readonly supabase = inject(SupabaseService).client;

  /**
   * Get all rentals from the rentals table
   */
  async getRentals(): Promise<Rental[]> {
    const { data, error } = await this.supabase
      .from('rentals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Rental[];
  }

  /**
   * Get rental by id from the rentals table
   * @param id
   */
  async getRental(id: number): Promise<Rental> {
    const { data, error } = await this.supabase.from('rentals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as Rental;
  }

  /**
   * Create rental and write to rentals table
   * @param rental
   */
  async createRental(rental: CreateRental): Promise<Rental> {
    const { data, error } = await this.supabase
      .from('rentals')
      .insert(rental)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Rental;
  }

  /**
   * Update rental and write to rentals table
   * @param id
   * @param changes
   */
  async updateRental(id: number, changes: UpdateRental): Promise<Rental> {
    const { data, error } = await this.supabase
      .from('rentals')
      .update({...changes})
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Rental;
  }

  /**
   * Upload one rental image to Supabase Storage and return its public URL
   * @param file
   * @param folder e.g. the listing's address slug ("326-elm-ave")
   */
  async uploadRentalImage(file: File, folder: string): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';

    const filePath = `${folder}/${crypto.randomUUID()}.${extension}`;

    const { error } = await this.supabase.storage.from('posters').upload(filePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw error;
    }

    const { data } = this.supabase.storage.from('posters').getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Replace an existing storage photo in place (same path, same URL)
   * @param path object path inside the posters bucket
   * @param file the optimized replacement
   */
  async replacePhoto(path: string, file: File | Blob): Promise<void> {
    const { error } = await this.supabase.storage.from('posters').upload(path, file, {
      cacheControl: '3600',
      contentType: 'image/jpeg',
      upsert: true,
    });

    if (error) {
      throw error;
    }
  }

  /**
   * Upload several rental images and return their public URLs
   * @param files
   * @param folder e.g. the listing's address slug ("326-elm-ave")
   */
  async uploadPhotos(files: File[], folder: string): Promise<string[]> {
    const urls: string[] = [];

    for (const file of files) {
      urls.push(await this.uploadRentalImage(file, folder));
    }

    return urls;
  }

  /**
   * Delete rental and write to rentals table
   * @param id
   */
  async deleteRental(id: number): Promise<void> {
    const { error } = await this.supabase.from('rentals').delete().eq('id', id);

    if (error) {
      throw error;
    }
  }
}
