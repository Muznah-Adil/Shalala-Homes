import { Component } from '@angular/core';

@Component({
  selector: 'app-owners',
  imports: [],
  templateUrl: './owners.html',
  styleUrl: './owners.scss',
})
export class Owners {
  protected readonly phoneDisplay = '(226) 975-4568';
  protected readonly phoneHref = 'tel:+12269754568';
  protected readonly hours = 'Mon–Sat';
}
