import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

/* HERO — full-screen video section
   - Background video with dark gradient overlay
   - Eyebrow, serif headline, two CTA pills, scroll indicator
   - Mobile: iOS only autoplays when the video is muted BEFORE the
     play attempt, so we set it programmatically and call play()
     ourselves; if autoplay is still blocked (e.g. Low Power Mode),
     we retry once on the first touch. */

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})

export class Hero implements AfterViewInit {
  protected readonly videoSrc = 'bg-video.mp4';
  protected readonly posterSrc = 'hero-poster.jpg';

  @ViewChild('bgVideo') private bgVideo?: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    const video = this.bgVideo?.nativeElement;
    if (!video) return;

    // Mute via the DOM properties iOS actually checks, then play.
    video.muted = true;
    video.defaultMuted = true;

    const tryPlay = () => video.play().catch(() => { /* blocked — poster stays */ });
    tryPlay();

    // Autoplay refused (Low Power Mode, data saver)? First tap anywhere starts it.
    const onFirstInteraction = () => {
      tryPlay();
      window.removeEventListener('touchstart', onFirstInteraction);
      window.removeEventListener('click', onFirstInteraction);
    };
    window.addEventListener('touchstart', onFirstInteraction, { passive: true });
    window.addEventListener('click', onFirstInteraction);
  }
}
