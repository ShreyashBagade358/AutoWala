# Autowala Project Structure

```
autowala/
├── .github/                    # GitHub Actions CI/CD
│   └── workflows/
│       └── deploy.yml
├── .gitignore
├── README.md
├── package.json                # Root workspace config
├── turbo.json                  # Monorepo orchestration
│
├── packages/
│   ├── shared/                 # Shared types, utils, constants
│   │   ├── package.json
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   ├── driver.ts
│   │   │   ├── ride.ts
│   │   │   ├── zone.ts
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── zones.ts       # Kolhapur zone fare data
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── fareCalculator.ts
│   │       ├── phoneValidator.ts
│   │       └── index.ts
│   │
│   ├── frontend/               # React PWA (User & Driver)
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   ├── public/
│   │   │   ├── manifest.json   # PWA manifest
│   │   │   ├── sw.js           # Service worker
│   │   │   └── icons/
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── index.css
│   │   │   ├── api/            # API client functions
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rides.ts
│   │   │   │   └── index.ts
│   │   │   ├── components/     # Reusable UI components
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Card/
│   │   │   │   ├── Loader/
│   │   │   │   └── index.ts
│   │   │   ├── pages/          # Route pages
│   │   │   │   ├── Home/
│   │   │   │   ├── Booking/
│   │   │   │   ├── RideStatus/
│   │   │   │   ├── DriverHome/
│   │   │   │   ├── DriverAccept/
│   │   │   │   └── index.ts
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useRide.ts
│   │   │   │   └── usePushNotification.ts
│   │   │   ├── store/          # State management
│   │   │   │   ├── authStore.ts
│   │   │   │   ├── rideStore.ts
│   │   │   │   └── index.ts
│   │   │   ├── i18n/           # Internationalization
│   │   │   │   ├── en.json
│   │   │   │   ├── mr.json     # Marathi
│   │   │   │   └── index.ts
│   │   │   ├── lib/            # Third-party integrations
│   │   │   │   ├── firebase.ts
│   │   │   │   ├── googleMaps.ts
│   │   │   │   └── pushManager.ts
│   │   │   └── utils/
│   │   │       ├── formatters.ts
│   │   │       └── validation.ts
│   │   └── tailwind.config.js
│   │
│   ├── backend/                # Node.js + Express API
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts        # Entry point
│   │   │   ├── app.ts          # Express app setup
│   │   │   ├── config/
│   │   │   │   ├── database.ts # Firestore/MongoDB connection
│   │   │   │   ├── firebaseAdmin.ts
│   │   │   │   └── env.ts       # Environment variables
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rides.ts
│   │   │   │   ├── drivers.ts
│   │   │   │   ├── zones.ts
│   │   │   │   └── index.ts
│   │   │   ├── controllers/
│   │   │   │   ├── authController.ts
│   │   │   │   ├── rideController.ts
│   │   │   │   ├── driverController.ts
│   │   │   │   └── index.ts
│   │   │   ├── services/
│   │   │   │   ├── fareService.ts
│   │   │   │   ├── driverMatchingService.ts
│   │   │   │   ├── notificationService.ts
│   │   │   │   └── index.ts
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Driver.ts
│   │   │   │   ├── Ride.ts
│   │   │   │   └── Zone.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── driverAuth.ts
│   │   │   │   ├── rateLimiter.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts
│   │   │   │   └── helpers.ts
│   │   │   └── types/
│   │   │       └── express.d.ts  # TypeScript declarations
│   │   └── .env.example
│   │
│   └── whatsapp-bot/            # WhatsApp Business API bot
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── config/
│       │   │   └── whatsapp.ts
│       │   ├── handlers/
│       │   │   ├── messageHandler.ts
│       │   │   ├── bookingHandler.ts
│       │   │   └── locationHandler.ts
│       │   ├── services/
│       │   │   ├── nlpService.ts      # Simple keyword matching
│       │   │   ├── fareService.ts
│       │   │   └── driverService.ts
│       │   ├── flows/
│       │   │   ├── bookingFlow.ts
│       │   │   ├── driverAcceptFlow.ts
│       │   │   └── helpFlow.ts
│       │   └── utils/
│       │       ├── responseBuilder.ts
│       │       └── sessionManager.ts
│       └── .env.example
│
├── docs/                       # Documentation
│   ├── api/
│   │   └── README.md
│   ├── schema/
│   │   └── database.md
│   └── deployment/
│       └── setup.md
│
└── scripts/                   # Utility scripts
    ├── seed-zones.ts
    ├── generate-admin.ts
    └── deploy.sh
```

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run development (all packages)
npm run dev

# Run specific package
npm run dev:frontend
npm run dev:backend
npm run dev:whatsapp

# Build for production
npm run build

# Deploy
npm run deploy
```

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind + PWA |
| Backend | Node.js + Express + TypeScript |
| Database | Firebase Firestore |
| Maps | Google Maps Platform |
| WhatsApp | Meta Cloud API / Twilio |
| Auth | Firebase Auth (phone OTP) |
| Deploy | Vercel + Render |
