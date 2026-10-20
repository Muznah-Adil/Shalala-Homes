import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

/* ============================================================
   ADMIN LOGIN — email + password sign-in via Supabase Auth.
   On success -> /admin/dashboard (guarded route).
   If already signed in, skips straight to the dashboard.
   ============================================================ */

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly status = signal<'idle' | 'signing-in' | 'error'>('idle');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor() {
    // Already signed in? Go straight to the dashboard.
    this.auth.isLoggedIn().then(ok => {
      if (ok) this.router.navigate(['/admin/dashboard']);
    });
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('signing-in');
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.signIn(email, password);
      await this.router.navigate(['/admin/dashboard']);
    } catch {
      this.status.set('error');
    }
  }
}
