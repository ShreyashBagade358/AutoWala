# 🚕 Autowala

Auto booking platform for Kolhapur - WhatsApp-first, union-partnered, no-surge pricing.

## Features

- 🚗 Auto-only booking (no cabs)
- 💬 WhatsApp-first booking interface
- 📱 PWA for low-end phones
- 💰 Fixed zone-based pricing (no surge)
- 🤝 Union-partnered model
- 🗣️ Marathi + English support

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind + PWA |
| Backend | Node.js + Express + TypeScript |
| Database | Firebase Firestore |
| Maps | Google Maps Platform |
| WhatsApp | Twilio / Meta Cloud API |
| Auth | Firebase Auth (Phone OTP) |

## Quick Start

```bash
# Install dependencies
npm install

# Run development
npm run dev

# Build for production
npm run build
```

## Project Structure

```
autowala/
├── packages/
│   ├── shared/          # Shared types, constants, utils
│   ├── frontend/        # React PWA (User & Driver)
│   ├── backend/        # Node.js API
│   └── whatsapp-bot/  # WhatsApp Business API bot
├── docs/               # API & deployment docs
└── scripts/           # Utility scripts
```

## Environment Variables

See `.env.example` files in each package for required variables.

## License

MIT
