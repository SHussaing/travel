import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  template: `
    <section class="space-y-2">
      <h1 class="text-2xl font-semibold">{{ title }}</h1>
      <p class="text-slate-600">
        This page is scaffolded. Next we’ll connect it to the backend Gateway APIs.
      </p>
    </section>
  `
})
export class PlaceholderPageComponent {
  title = '';

  constructor(route: ActivatedRoute) {
    this.title = (route.snapshot.routeConfig?.title as string) ?? 'Page';
  }
}
