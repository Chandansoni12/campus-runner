# Delivo PWA – Documentation

**Version:** 1.0.0  
**Item:** Food Delivery Progressive Web App (PWA) Template

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Included Pages](#included-pages)
4. [File Structure](#file-structure)
5. [Installation & Getting Started](#installation--getting-started)
6. [Customization](#customization)
7. [PWA Setup](#pwa-setup)
8. [Browser Support](#browser-support)
9. [Credits & Support](#credits--support)
10. [Changelog](#changelog)

---

## Introduction

**Delivo PWA** is a mobile-first Progressive Web App template for food delivery applications. It includes:

- **Onboarding** – Splash and onboarding carousel  
- **Authentication** – Sign in, sign up, forgot password, verification  
- **Home & discovery** – Dashboard, search, filters, menu detail, favorites, reviews  
- **Order & checkout** – Checkout, address/payment selection, order flow, tracking, rating  
- **Profile & account** – Profile hub, personal data, photo, password, notifications, language, security, PIN  
- **Payment & cards** – Payment account, your cards, add card, billing, email verification, success  
- **Help & legal** – Help center, FAQ, privacy & policy  

The design uses a **dark theme** (#0d0d0d) with **orange accent** (#fd6931), Bootstrap 5.3.2 for layout, and custom SCSS. All pages are linked so the full flow can be demoed without a backend.

---

## Features

- **Mobile-first responsive** – Optimized for phones and tablets  
- **PWA-ready** – Service Worker and Web App Manifest for offline and install  
- **Dark theme + orange accent** – Consistent across all screens  
- **Bootstrap 5.3.2** – Grid/utilities only; styling is custom SCSS  
- **Modular SCSS** – Base, onboarding, auth, user-profile, home  
- **Full user flows** – From onboarding to order and profile/settings  
- **Touch-friendly** – Scrollable areas, OTP/PIN keypads, toggles  
- **Static front-end** – No backend; connect to your own API  

---

## Included Pages

All paths are relative (e.g. `home.html`, `user-profile.html`).

### Entry & Onboarding
| File | Description |
|------|-------------|
| `index.html` | Template demo landing (features, View Demo, QR scan) |
| `app.html` | Splash + onboarding carousel (app entry) |

### Authentication
| File | Description |
|------|-------------|
| `signin.html` | Sign in |
| `signup.html` | Sign up |
| `forgot-password.html` | Forgot password |
| `forgot-password-otp.html` | OTP for password reset |
| `create-password.html` | New password creation |
| `verification.html` | Email verification |
| `account-setup.html` | Account setup |

### Home & Discovery
| File | Description |
|------|-------------|
| `home.html` | Main dashboard |
| `search.html` | Search |
| `filter.html` | Filters |
| `menu-detail.html` | Menu item detail |
| `reviews.html` | Reviews |
| `favorites.html` | Favorites |

### Order & Checkout
| File | Description |
|------|-------------|
| `checkout.html` | Checkout |
| `address-selection.html` | Address selection |
| `payment-selection.html` | Payment methods |
| `payment-amount.html` | Payment amount |
| `order-placed.html` | Order placed |
| `order-success.html` | Order success |
| `order-tracking.html` | Order tracking |
| `order-delivery.html` | Delivery status |
| `order-arrived.html` | Order arrived |
| `order-delivered.html` | Order delivered |
| `rating-driver.html` | Rate driver |

### Profile & Account
| File | Description |
|------|-------------|
| `user-profile.html` | Profile overview (General, Preferences, Log out) |
| `personal-data.html` | Edit profile / personal data |
| `add-profile-photo.html` | Add/change profile photo |
| `change-password.html` | Change password |
| `notifications.html` | Notification toggles |
| `language.html` | Language selection |
| `security.html` | Security settings |
| `create-pin.html` | Create 4-digit PIN |
| `pin-success.html` | PIN created success |

### Payment & Cards
| File | Description |
|------|-------------|
| `payment-account.html` | Payment account (Apple Pay, Google Pay, PayPal) |
| `your-card.html` | Your cards + default option |
| `add-new-card.html` | Add new card (details) |
| `add-card-address.html` | Billing address |
| `add-card.html` | Alternate add card (checkout flow) |
| `email-verify.html` | Verify by email (card flow) |
| `enter-verification-code.html` | 6-digit code + keypad |
| `card-success.html` | Card added success |

### Help & Legal
| File | Description |
|------|-------------|
| `help-center.html` | Help center |
| `faq.html` | FAQ (expandable) |
| `privacy-policy.html` | Privacy & policy |

### Other
| File | Description |
|------|-------------|
| `profile.html` | Simple profile placeholder (optional) |

---

## File Structure

```
Delivo-Pwa/
├── index.html                 # Template demo landing
├── app.html                   # Splash + onboarding (app entry)
├── signin.html, signup.html, ... (all HTML pages)
├── manifest.json
├── service-worker.js
├── package.json
├── auth-script.js
├── script.js
├── realtime-mock.js
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── scss/
│   │   ├── styles.scss
│   │   ├── _base.scss
│   │   ├── _onboarding.scss
│   │   ├── _auth-styles.scss
│   │   ├── _user-profile.scss
│   │   └── _home.scss
│   └── img/
├── Documentation.html
├── DOCUMENTATION.md
└── README.md
```

---

## Installation & Getting Started

### Prerequisites

- A modern browser.  
- Node.js is optional (for `npm start` and compiling SCSS).

### Run locally

**Option A – NPM**
```bash
npm install
npm start
```
Uses `http-server` (e.g. http://localhost:8000).

**Option B – Windows**
```bash
serve.bat
```

**Option C – Any static server**
- Python: `python -m http.server 8000`
- Then open: `http://localhost:8000/index.html`, `http://localhost:8000/home.html`, etc.

### Compile SCSS

From project root:

```bash
npx sass assets/scss/styles.scss assets/css/styles.css --no-source-map
```

If your `package.json` has a sass/build script in the right folder, you can use e.g. `npm run sass` or `npm run build:css` instead.

---

## Customization

### Colors & theme

- **Primary:** `#FD6931` (buttons, links, active states) – set in `_base.scss` and used in other SCSS files.  
- **Background:** `#0d0d0d` / `#000000` in SCSS.  
- **Text:** `#FFFFFF`, `#697586`, `#ced2e6`, `#9ca3af` for hierarchy.

Edit `assets/scss/_base.scss` and the relevant partials (`_user-profile.scss`, `_home.scss`, etc.).

### Logo & app name

- Replace logo/branding in `index.html`, `home.html`, and headers.  
- Update `manifest.json`: `name`, `short_name`, `description`.

### PWA icons

Add icons (72, 96, 128, 144, 152, 192, 384, 512 px) in an `icons/` folder and point to them in `manifest.json`.

### Backend integration

Replace form actions and any `window.location.href` or `fetch()` URLs in `auth-script.js`, `script.js`, and inline scripts with your API. The template is front-end only.

---

## PWA Setup

1. **Manifest** – `manifest.json` in root. Serve with correct MIME type.  
2. **Service worker** – `service-worker.js` in root. Register from your app entry page (e.g. `app.html`); update `urlsToCache` and `CACHE_NAME` when adding assets.  
3. **HTTPS** – Required in production (localhost is fine for testing).

---

## Browser Support

- Chrome (Android, Desktop)  
- Safari (iOS, macOS)  
- Firefox (Android, Desktop)  
- Edge  
- Samsung Internet  

Layout uses Flexbox/Grid; `-webkit-overflow-scrolling: touch` is used where needed for iOS scrolling.

---

## Credits & Support

**Author:** oxlao_inc

- **Bootstrap 5.3.2** – CDN (grid/utilities).  
- **Fonts** – Plus Jakarta Sans (or as included in template).  
- **Icons** – Inline SVG and assets in `assets/img`.

For support, use the author’s contact/support.

---

## Changelog

### 1.0.0
- Initial release.
- Onboarding, auth, home, order flow, profile, payments, security, help.
- PWA manifest and service worker.
- SCSS structure and dark theme with orange accent.
- Full page set with linked navigation.
