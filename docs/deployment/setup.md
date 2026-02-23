# Deployment Guide

## Prerequisites
- Node.js 18+
- npm 9+
- Firebase project
- Twilio account
- Google Maps API key

## Environment Setup

### 1. Clone and Install
```bash
cd Autowala
npm install
```

### 2. Configure Environment Variables

#### Backend (.env)
```bash
cp packages/backend/.env.example packages/backend/.env
# Edit with your values
```

#### Frontend (.env)
```bash
cp packages/frontend/.env.example packages/frontend/.env
# Edit with your values
```

### 3. Firebase Setup
1. Create Firebase project
2. Enable Firestore
3. Enable Authentication (Phone)
4. Create service account and download key
5. Update .env with credentials

### 4. Twilio Setup
1. Create Twilio account
2. Get WhatsApp sandbox credentials
3. Configure WhatsApp Business API

## Development

### Run All Services
```bash
npm run dev
```

### Run Individual Services
```bash
npm run dev:frontend   # Frontend on :5173
npm run dev:backend    # API on :3000
npm run dev:whatsapp   # WhatsApp bot on :3001
```

## Production Deployment

### Frontend (Vercel)
```bash
npm run build:frontend
# Deploy dist folder to Vercel
```

### Backend (Render/Railway)
```bash
npm run build:backend
# Deploy to Render or Railway
```

### WhatsApp Bot
```bash
npm run build:whatsapp
# Deploy to separate service
```

## WhatsApp Configuration

### Set Webhook URL
```
https://your-backend-url.com/api/whatsapp/webhook
```

### Verify Webhook
```
GET https://your-backend-url.com/api/whatsapp/webhook?hub.verify_token=your-verify-token&hub.mode=subscribe&hub.challenge=test
```

## Monitoring
- Check server logs for errors
- Set up error tracking (Sentry)
- Monitor Firebase console for database usage
