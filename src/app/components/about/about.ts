import {RouterLink} from '@angular/router';
import {Component } from '@angular/core';

/* ABOUT — two-column section
   - Left: eyebrow, heading, copy, stats, CTA pill
   - Right: 4:5 photo with bottom gradient */

interface Stat {
  n: string;
  label: string;
}

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})

export class About {
  protected readonly imageSrc =
    'https://images.unsplash.com/photo-1774384734233-f9ed2e4e4dc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXNpZGVudGlhbCUyMHByb3BlcnR5JTIwV2luZHNvciUyME9udGFyaW8lMjBleHRlcmlvcnxlbnwxfHx8fDE3ODI2MTA3MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080';

  protected readonly stats: Stat[] = [
    { n: '80+', label: 'Properties Managed' },
    { n: '450+', label: 'Homes Leased' },
  ];
}
