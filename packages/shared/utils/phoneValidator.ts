export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return true;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return true;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return true;
  }
  
  return false;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+91${cleaned.slice(1)}`;
  }
  
  return phone;
};

export const maskPhoneNumber = (phone: string): string => {
  const formatted = formatPhoneNumber(phone);
  if (formatted.length >= 10) {
    return `+91 ${'*'.repeat(5)}${formatted.slice(-5)}`;
  }
  return phone;
};
