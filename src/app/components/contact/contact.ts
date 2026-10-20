import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder, ReactiveFormsModule, Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

/*
   CONTACT — "Get in Touch" section
   - Left column: heading, copy, phone/email/location rows
   - Right column: reactive form -> Formspree -> client inbox
*/

// Formspree endpoint — REPLACE {YOUR_FORM_ID} with the ID from
// formspree.io after creating the form (Settings -> Integration).
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xnjedgbw';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {

  // 'idle' -> 'sending' -> 'sent' | 'error'
  protected readonly status = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Contact info shown in the left column
  protected readonly phoneDisplay = '(226) 975-4568';
  protected readonly phoneHref = 'tel:+12269754568';
  protected readonly email = 'shalalahomes@gmail.com';

  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  // Accepts North American phone formats: 2894007236, 289-400-7236, (289) 400-7236, +1 289 400 7236
  // rejects anything non-numeric.
  private static readonly PHONE_PATTERN = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

  // Reactive form: name, phone, email and message are all required.
  // Email must also be properly formatted (Validators.email).
  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(Contact.PHONE_PATTERN)]],
    message: ['']
  });

  // true when a control should show its error (touched + invalid)
  protected showError(name: 'firstName' | 'lastName' | 'email' | 'phone' | 'message'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // reveal validation messages
      return;
    }

    this.status.set('sending');

    // Formspree accepts JSON when the Accept header asks for it,
    // and emails the submission to the inbox linked to the form.
    this.http
      .post(FORMSPREE_ENDPOINT, this.form.getRawValue(), {
        headers: { Accept: 'application/json' },
      })
      .subscribe({
        next: () => this.status.set('sent'),
        error: () => this.status.set('error'),
      });
  }
}
