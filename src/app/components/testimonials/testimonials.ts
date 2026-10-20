import { Component } from '@angular/core';

// Testimonials section — "Trusted by owners & tenants"
// Sits directly under the Owners CTA band

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-testimonials',
  imports: [],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials {
  protected readonly testimonials: Testimonial[] = [
    {
      quote:
        'Shalala Homes found me a place near campus in days, not weeks. The whole process was simple and they actually answered the phone.',
      name: 'Priya S.',
      role: 'Student Tenant',
    },
    {
      quote:
        'As an owner, I get my rent on the 1st every month and never worry about my property. Genuinely hands-off management.',
      name: 'Raj K.',
      role: 'Property Owner',
    },
    {
      quote:
        'Professional, responsive, and local. They handled a repair the same week I reported it. Highly recommend.',
      name: 'Daniel M.',
      role: 'Tenant, LaSalle',
    },
  ];
}
