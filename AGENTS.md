## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Responsive: every change, every screen

Every UI change must look right on all screen sizes, not just the one being worked on. Before calling a UI change done, check it at these viewports:

- 320×640 (small phone)
- 380×800 (phone)
- 768×1024 (tablet portrait)
- 1024×768 (tablet landscape / small laptop)
- 1280×720 (short laptop)
- 1440×900 (desktop)

At each size confirm: no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`), nothing clipped or overlapping, text wraps cleanly (no orphan words or awkward breaks in headings), tap targets stay usable, and the layout still looks intentional (no lone card on its own row, no huge empty gaps). Take screenshots, don't rely on measurements alone.
