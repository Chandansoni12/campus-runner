# PWA Icons (required for install)

The app **cannot be installed** ("Add to Home Screen" / "Install app") until these icon files exist and are deployed.

## Generate icons (recommended)

No extra npm install, no network — Node.js only:

```bash
node scripts/generate-pwa-icons.js
```

This creates solid orange (`#FD6931`) PNGs and saves them here. Then commit and push so Netlify deploys them.

## Or add icons manually

Create PNG files with these exact names (or use [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) / [RealFaviconGenerator](https://realfavicongenerator.net/)):

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png` ← **required**
- `icon-384x384.png`
- `icon-512x512.png` ← **required**

After adding files, redeploy (e.g. push to trigger Netlify).
