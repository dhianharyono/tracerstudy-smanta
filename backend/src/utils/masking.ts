export const maskEmail = (email: string) => {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 3) return `${user[0]}***@${domain}`;
  return `${user.substring(0, 3)}***@${domain}`;
};

export const maskPhone = (phone: string) => {
  if (!phone) return phone;
  const cleanPhone = phone.toString();
  if (cleanPhone.length < 5) return cleanPhone;
  return `${cleanPhone.substring(0, 4)}****${cleanPhone.substring(cleanPhone.length - 2)}`;
};

export const maskName = (name: string) => {
  if (!name) return name;
  const parts = name.split(' ');
  const maskedParts = parts.map((part, index) => {
    if (index === 0) return part; // Keep first name
    return `${part[0]}***`;
  });
  return maskedParts.join(' ');
};
