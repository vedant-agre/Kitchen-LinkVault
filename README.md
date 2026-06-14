# LinkVault

A categorized link/bookmark manager with a BMW M-inspired design system. Save, organize, and search links discovered anywhere — Reels, YouTube, articles, tools — across custom categories, with tags, notes, and quick search.

![Status](https://img.shields.io/badge/status-MVP-blue) ![Made with React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb) ![Styling](https://img.shields.io/badge/styling-Tailwind%20CSS-38bdf8) ![Backend](https://img.shields.io/badge/backend-Firebase-ffca28)

---

## Overview

Most people save links the same way — screenshots, notes apps, or just losing them entirely. LinkVault gives every saved link a home: a categorized, searchable, personal vault that's fast to add to and easy to revisit.

The entire UI follows a strict **BMW M-inspired design language**: near-black canvas, high-contrast white-on-black typography, flat rectangular components (`border-radius: 0`), and the M tricolor stripe used sparingly as a brand accent.

---

## Features

### Core
- **Google Sign-In** via Firebase Authentication
- **Custom categories** with a curated color palette (20 BMW M-aligned accent colors)
- **Quick-add bar** — paste a URL, auto-fetch title, favicon, and preview image
- **Duplicate detection** — warns if a URL already exists in your collection
- **Tags** — multiple tags per link, filterable
- **Search** — across titles, notes, tags, and URLs
- **Grid & List views** — toggle between visual cards and a compact list
- **Smart Collections** — "All Links," "Added This Week," "Most Clicked," "To Revisit"
- **Link health check** — flag dead/broken links on demand

### Planned
- Bulk actions (multi-select move/delete/tag)
- Auto-categorization suggestions based on domain
- Nested categories
- Public, shareable category pages
- "Clone this collection" from public collections
- Weekly digest of saved links

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication (Google) |
| Database | Firestore |
| Hosting | Firebase Hosting |
| Metadata fetching | LinkPreview.net API |
| Icons | Lucide React |

---

## Design System

LinkVault uses a custom **BMW M-inspired design system** — see [`DESIGN-bmw-m.md`](./DESIGN-bmw-m.md) for the full spec.

Key principles:
- Near-black canvas (`#000000`) as the only mode — no light theme
- UPPERCASE, heavy (700) display headlines paired with light (300) body text
- M tricolor accent (`#0066b1` → `#1c69d4` → `#e22718`) used sparingly — never as a fill
- Flat components (`border-radius: 0`) everywhere except circular icon buttons
- Hairline borders (`#3c3c3c`) instead of shadows
- Uppercase, letter-spaced (1.5px) labels for buttons and tabs

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- A Firebase project with Authentication (Google provider) and Firestore enabled

### Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/linkvault.git
cd linkvault

# Install dependencies
npm install
```

### Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Google Sign-In** under Authentication
3. Enable **Firestore Database**
4. Copy your Firebase config into `src/lib/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

5. Deploy the Firestore security rules from `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

### Run Locally

```bash
npm run dev
```

### Build & Deploy

```bash
npm run build
firebase deploy --only hosting
```

---

## Data Structure (Firestore)

```
users/{uid}
  - displayName, email, photoURL, createdAt

users/{uid}/categories/{categoryId}
  - name, color, order, isDefault, createdAt

users/{uid}/links/{linkId}
  - url, title, note, categoryId, tags[], favicon,
    previewImage, source, status, clickCount,
    isPublic, createdAt, updatedAt
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # Button, Input, CategoryTab, LinkCard
│   ├── QuickAddBar.jsx
│   └── LinkList.jsx
├── pages/
│   ├── Login.jsx
│   └── Dashboard.jsx
├── lib/
│   ├── firebase.js
│   ├── auth.js
│   ├── db.js
│   └── constants.js
└── App.jsx
```

---

## Contributing

This project is in active MVP development. Issues and pull requests are welcome once the core feature set stabilizes.

---

## License

MIT
