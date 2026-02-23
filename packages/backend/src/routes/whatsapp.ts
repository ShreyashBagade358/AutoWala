import { Router } from 'express';

const router = Router();

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'autowala-verify-token';

router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

router.post('/webhook', (req, res) => {
  const { entry } = req.body;
  
  if (entry && entry[0]?.changes) {
    const changes = entry[0].changes;
    
    for (const change of changes) {
      if (change.value?.messages) {
        for (const message of change.value.messages) {
          console.log('Received WhatsApp message:', message);
        }
      }
    }
  }
  
  res.status(200).send('OK');
});

router.post('/send', (req, res) => {
  const { to, message } = req.body;
  
  console.log(`Sending WhatsApp message to ${to}: ${message}`);
  
  res.json({ success: true, messageId: 'mock-message-id' });
});

export default router;
