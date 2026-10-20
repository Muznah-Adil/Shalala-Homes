export interface Rental {
  id: number;
  title: string;
  address: string;
  city: string;
  province: string;
  postal_code?: string;
  price: string;
  beds: string;
  baths: string;
  image_url: string | null;
  image_urls: string[];
  video_urls: string[];
  created_at: string;
  updated_at: string;
}

export type CreateRental = Omit<Rental, 'id' | 'created_at' | 'updated_at'>;

export type UpdateRental = Partial<CreateRental>;
