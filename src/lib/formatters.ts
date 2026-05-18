// export function formatPhone(phone: string): string {
//   const digits = phone.replace(/\D/g, '');
//   if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
//   if (digits.startsWith('91') && digits.length === 12)
//     return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
//   return `+${digits}`;
// }

// export function formatCurrency(amount: number): string {
//   if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//   if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//   if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
//   return `₹${amount}`;
// }

// export function formatRelativeTime(dateStr: string | null): string {
//   if (!dateStr) return '';
//   const date = new Date(dateStr);
//   const now = new Date();
//   const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
//   if (diff < 60) return 'just now';
//   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
//   if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
//   return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
// }

// export function formatTime(dateStr: string): string {
//   return new Date(dateStr).toLocaleTimeString('en-IN', {
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true,
//   });
// }

// export function formatDate(dateStr: string): string {
//   const date = new Date(dateStr);
//   const today = new Date();
//   const yesterday = new Date(today);
//   yesterday.setDate(yesterday.getDate() - 1);

//   if (date.toDateString() === today.toDateString()) return 'Today';
//   if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
//   return date.toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric',
//   });
// }

// export function getInitials(name: string): string {
//   return name
//     .split(' ')
//     .slice(0, 2)
//     .map((w) => w[0]?.toUpperCase() || '')
//     .join('');
// }

// export function truncate(str: string, len: number): string {
//   if (str.length <= len) return str;
//   return str.slice(0, len) + '…';
// }
// src/lib/formatters.ts



// Helper to safely convert any date input to a Date object
function toDate(dateInput: any): Date | null {
  if (!dateInput) return null;
  let date: Date;
  if (typeof dateInput === 'number') {
    // If the number is less than 1e12, assume it's seconds → convert to ms
    const ms = dateInput < 1e12 ? dateInput * 1000 : dateInput;
    date = new Date(ms);
  } else {
    date = new Date(dateInput);
  }
  return isNaN(date.getTime()) ? null : date;
}

export function formatDate(dateInput: any): string {
  const date = toDate(dateInput);
  if (!date) return '';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(dateInput: any): string {
  const date = toDate(dateInput);
  if (!date) return '';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(dateInput: any): string {
  const date = toDate(dateInput);
  if (!date) return '';

  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.startsWith('91') && digits.length === 12)
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return `+${digits}`;
}

export function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

export function truncate(str: string, len: number): string {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.slice(0, len) + '…';
}