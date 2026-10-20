import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Nav} from './components/nav/nav';
import {Footer} from './components/footer/footer';

/* APP ROOT — Shalala Homes single-page layout
   Section order (matches prototype):
   Nav -> Hero -> About -> Services
   -> [For Owners: Hadi] -> [Contact: Xingbo] -> [Footer: Hadi] */

@Component({
  selector: 'app-root',
  imports: [Nav, RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {}
