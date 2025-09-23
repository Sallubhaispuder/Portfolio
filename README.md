# Harshit | Sallubhai — Portfolio

This is a single-page portfolio for Harshit | Sallubhai. It is built with semantic HTML5, modular CSS (variables + utility classes), and minimal progressive JavaScript.

Files:
- `index.html` — main site
- `styles.css` — design system and components
- `script.js` — minimal JS: theme toggle, mobile menu, copy-to-clipboard, filters, form stub
- `assets/` — placeholders for hero image and icons
- `404.html`, `robots.txt`, `sitemap.xml` — included for deploy readiness

How to use:
- Replace files in `assets/` with real optimized images (hero at roughly 1600x800, compressed).
- Update social links in `index.html`.
- The contact form is a client-side stub; connect to a serverless endpoint (Netlify/Azure Functions/Vercel) by changing the `form` action and handling POST.

Quick preview (served locally):
```powershell
# from repository root
python -m http.server 8000
# then open http://localhost:8000
```

Accessibility notes:
- Skip-to-content link, keyboard focus styles, ARIA roles and live regions included.
- Respects prefers-reduced-motion for animations.

Deploy:
- This is a static site; upload to any static host (Netlify, Vercel, GitHub Pages).

License: place your preferred license here.
