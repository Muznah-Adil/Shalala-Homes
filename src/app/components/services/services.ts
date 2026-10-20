import { Component } from '@angular/core';

/* SERVICES — "What We Do" section
   - Centered intro, then a 3-column hairline grid of 6 cards
   - Icons are inline SVG paths rendered in the template */

interface Service {
  id: string;
  title: string;
  body: string;
}

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})

export class Services {
  protected readonly services: Service[] = [
    {
      id: 'mgmt',
      title: 'Property Management',
      body: 'Full-service management of your home — inspections, tenant relations, and oversight handled by professionals.',
    },
    {
      id: 'leasing',
      title: 'Leasing',
      body: 'We market your listings across Windsor, LaSalle, and Amherstburg and place reliable, screened tenants quickly.',
    },
    {
      id: 'reno',
      title: 'Renovations',
      body: 'From drywall repairs to full basements, our trusted trades keep properties in top condition.',
    },
    {
      id: 'staging',
      title: 'Staging',
      body: 'Professional staging that helps properties show better, rent faster, and stand out to prospective tenants.',
    },
    {
      id: 'rent',
      title: 'Rent Collection',
      body: 'Tenants pay online with ease, and owners receive their rent transfer reliably on the 1st of every month.',
    },
    {
      id: 'inspect',
      title: 'Inspections & Maintenance',
      body: 'Regular inspections and fast, vetted repairs protect your property and keep tenants comfortable.',
    },
  ];
}
