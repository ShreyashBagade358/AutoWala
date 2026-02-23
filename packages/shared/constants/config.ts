export const config = {
  app: {
    name: 'Autowala',
    description: 'Auto booking platform for Kolhapur',
    version: '1.0.0',
  },
  
  api: {
    port: parseInt(process.env.PORT || '3000', 10),
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },
  
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'autowala-dev',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'autowala-dev.appspot.com',
  },
  
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'autowala-verify-token',
  },
  
  maps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },
  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  
  fares: {
    defaultBaseFare: 25,
    defaultPerKmRate: 12,
    defaultPerMinuteRate: 1,
    defaultMinimumFare: 30,
  },
  
  driver: {
    maxRadiusKm: 5,
    assignmentTimeoutSeconds: 30,
    maxDailyRides: 50,
  },
  
  session: {
    whatsappExpiryMinutes: 30,
    otpExpiryMinutes: 5,
  },
  
  limits: {
    maxRidesPerDay: 10,
    maxCancellationPerDay: 3,
  },
};

export type Config = typeof config;
