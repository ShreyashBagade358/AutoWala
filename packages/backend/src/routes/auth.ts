import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_PHONE = '+918010159779';

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith('0')) return `+91${cleaned.slice(1)}`;
  return phone;
};

const generateToken = (userId: string, isAdmin: boolean = false): string => {
  return jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });
};

const router = Router();

const users: Map<string, any> = new Map();

users.set(ADMIN_PHONE, {
  id: 'admin-001',
  phone: ADMIN_PHONE,
  name: 'Shreyash',
  language: 'en',
  isAdmin: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

router.post('/login',
  body('phone').notEmpty().withMessage('Phone is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phone } = req.body;
    const formattedPhone = formatPhoneNumber(phone);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${formattedPhone}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      // In production, send via Twilio
    });
  }
);

router.post('/verify',
  body('phone').notEmpty(),
  body('otp').notEmpty(),
  async (req, res) => {
    const { phone, otp } = req.body;
    const formattedPhone = formatPhoneNumber(phone);
    
    // In production, verify against stored OTP
    if (otp !== '123456' && otp.length === 6) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }
    
    let user = users.get(formattedPhone);
    
    if (!user) {
      const userId = uuidv4();
      user = {
        id: userId,
        phone: formattedPhone,
        name: 'Shreyash',
        language: 'en',
        isAdmin: formattedPhone === ADMIN_PHONE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.set(formattedPhone, user);
    }
    
    const token = generateToken(user.id, user.isAdmin);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        language: user.language,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }
);

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { userId: string; isAdmin: boolean };
    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    if (user) {
      res.json({
        id: user.id,
        phone: user.phone,
        name: user.name,
        language: user.language,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } else {
      res.json({
        id: decoded.userId,
        phone: '+919876543210',
        language: 'en',
        isAdmin: decoded.isAdmin || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

export default router;
