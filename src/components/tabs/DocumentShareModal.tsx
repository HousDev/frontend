import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Send,
  Mail,
  Phone,
  Check,
  Clock,
  Copy,
  Link as LinkIcon,
  Globe,
  QrCode,
  Share,
  Plus,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { FaWhatsapp } from 'react-icons/fa6';
import documentStatusAPI from '@/lib/documentStatusAPI';

type AnyObj = Record<string, any>;
type Role = 'Seller' | 'Buyer' | 'Custom';
type Recipient = { id: string | number; name: string; contact: string; type: 'phone'|'email'; role: Role };

const DocumentShareModal = ({ isOpen, onClose, document, onShare }: AnyObj) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipient, setNewRecipient] = useState<Recipient>({ id: 0, name: '', contact: '', type: 'phone', role: 'Custom' });
  const [isSharing, setIsSharing] = useState(false);
  const [shareResults, setShareResults] = useState<any[]>([]);
  const [audienceFilter, setAudienceFilter] = useState<'seller' | 'buyer' | 'both'>('both');

  // separate role-based message editors (editable defaults for Seller/Buyer)
  const [msgSeller, setMsgSeller] = useState('');
  const [msgBuyer, setMsgBuyer] = useState('');

  if (!isOpen || !document) return null;
  const d = document?.data || {};

  /* ---------- helpers ---------- */
  const hasChannel = (id: string) => selectedChannels.includes(id);

  const formatINR = (v: any) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return '';
    return n.toLocaleString('en-IN');
  };

  // Which recipient types are allowed by current channel selections?
  // - email channel -> allow 'email'
  // - whatsapp or sms -> allow 'phone'
  // - public_link -> does not require recipients, but if mixing with others keep the union logic
  const allowedRecipientTypes = useMemo(() => {
    const allow = new Set<'phone' | 'email'>();
    if (hasChannel('email')) allow.add('email');
    if (hasChannel('whatsapp') || hasChannel('sms')) allow.add('phone');
    // If no channel picked yet, show both to help user choose
    if (selectedChannels.length === 0) { allow.add('phone'); allow.add('email'); }
    return allow;
  }, [selectedChannels]);

  // Normalize phone for wa.me
  const normalizePhone = (raw: string) => String(raw).replace(/\D/g, '');

  // Build a public link slug
  const generatePublicLink = () => {
    const documentSlug = String(document.title || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    return `https://resaleexpert.com/document/${d.document_id ?? ''}/${documentSlug}`;
  };

  // Channel-aware templates (no emojis for Email/SMS to avoid �)
  const baseLines = {
    doc: () => `Document: ${document.title ?? ''}`,
    id:  () => `Document ID: ${d.document_id ?? ''}`,
    date:() => `Date: ${d.document_date ?? ''}`,
    propHeader: () => `Property Details:`,
    addr: () => `• Address: ${d.property_address ?? ''}`,
    type: () => `• Type: ${d.property_type ?? ''}`,
    area: () => `• Area: ${d.property_area ? `${d.property_area} sq ft` : ''}`,
    saleAmount: () => d.sale_amount ? `• Sale Amount: ₹${formatINR(d.sale_amount)}` : '',
    tokenAmount:() => d.token_amount ? `• Token Amount: ₹${formatINR(d.token_amount)}` : '',
    bookingAmount:() => d.booking_amount ? `• Booking Amount: ₹${formatINR(d.booking_amount)}` : '',
    footerA: () => `Best regards,\n${d.sales_executive || 'ResaleExpert Team'}`,
    footerB: () => `---\nResaleExpert - Your Trusted Real Estate Partner\nContact: +91 99999 99999\nwww.resaleexpert.com`,
  };

  // Rich (emoji) header lines for WhatsApp
  const waLines = {
    doc: () => `📄 ${baseLines.doc()}`,
    id:  () => `🆔 ${baseLines.id()}`,
    date:() => `📅 ${baseLines.date()}`,
    propHeader: () => `🏠 ${baseLines.propHeader()}`,
    footerB: () => `---\nResaleExpert - Your Trusted Real Estate Partner\n📞 Contact: +91 99999 99999\n🌐 www.resaleexpert.com`,
  };

  // Role-specific body blocks
  // Seller message emphasizes Buyer details
  const sellerBodyBlock = () => [
    baseLines.propHeader(),
    baseLines.addr(),
    baseLines.type(),
    baseLines.area(),
    baseLines.saleAmount(),
    baseLines.tokenAmount(),
    baseLines.bookingAmount(),
    d.buyer_name ? `\nBuyer: ${d.buyer_name}${d.buyer_phone ? ` • ${d.buyer_phone}` : ''}` : '',
  ].filter(Boolean).join('\n');

  // Buyer message emphasizes Seller details
  const buyerBodyBlock = () => [
    baseLines.propHeader(),
    baseLines.addr(),
    baseLines.type(),
    baseLines.area(),
    baseLines.saleAmount(),
    baseLines.tokenAmount(),
    baseLines.bookingAmount(),
    d.seller_name ? `\nSeller: ${d.seller_name}${d.seller_phone ? ` • ${d.seller_phone}` : ''}` : '',
  ].filter(Boolean).join('\n');

  // Channel-aware message builders (role → different content)
  const buildEmailMessage = (role: 'Seller'|'Buyer', salutationName?: string) => {
    const name = salutationName
      ?? (role === 'Seller'
          ? (d.seller_name && String(d.seller_name).trim()) || 'Client'
          : (d.buyer_name && String(d.buyer_name).trim()) || 'Client');

    const bodyBlock = role === 'Seller' ? sellerBodyBlock() : buyerBodyBlock();

    return [
      `Dear ${name},`,
      ``,
      `Please find attached the ${document.template_name ?? 'document'} for your review.`,
      ``,
      baseLines.doc(),
      baseLines.id(),
      baseLines.date(),
      ``,
      bodyBlock,
      ``,
      `Please review the document and let us know if you have any questions.`,
      ``,
      baseLines.footerA(),
      ``,
      baseLines.footerB(),
    ].join('\n');
  };

  const buildSMSMessage = (role: 'Seller'|'Buyer', salutationName?: string) => {
    const name = salutationName
      ?? (role === 'Seller'
          ? (d.seller_name && String(d.seller_name).trim()) || 'Client'
          : (d.buyer_name && String(d.buyer_name).trim()) || 'Client');

    const link = generatePublicLink();
    // Ultra-short for SMS (160-ish chars style)
    return [
      `Hi ${name},`,
      `${document.template_name ?? 'Document'}: ${document.title ?? ''}`,
      `ID: ${d.document_id ?? ''} • ${d.document_date ?? ''}`,
      `Link: ${link}`,
    ].join('\n');
  };

const buildWhatsAppMessage = (role: 'Seller'|'Buyer', salutationName?: string) => {
  const name = salutationName
    ?? (role === 'Seller'
        ? (d.seller_name && String(d.seller_name).trim()) || 'Client'
        : (d.buyer_name && String(d.buyer_name).trim()) || 'Client');

  const link = generatePublicLink();

  // role blocks
  const roleLine =
    role === 'Seller'
      ? (d.buyer_name ? `- Buyer: ${d.buyer_name}${d.buyer_phone ? ` • ${d.buyer_phone}` : ''}` : '')
      : (d.seller_name ? `- Seller: ${d.seller_name}${d.seller_phone ? ` • ${d.seller_phone}` : ''}` : '');

  const moneyLines = [
    d.sale_amount    ? `- Sale Amount: ₹${formatINR(d.sale_amount)}` : '',
    d.token_amount   ? `- Token Amount: ₹${formatINR(d.token_amount)}` : '',
    d.booking_amount ? `- Booking Amount: ₹${formatINR(d.booking_amount)}` : '',
  ].filter(Boolean).join('\n');

  return [
    `Dear ${name},`,
    ``,
    `Please find attached the ${document.template_name ?? 'document'} for your review.`,
    ``,
    `*Document:* ${document.title ?? ''}`,
    `*Document ID:* ${d.document_id ?? ''}`,
    `*Date:* ${d.document_date ?? ''}`,
    ``,
    `*Property Details:*`,
    `- Address: ${d.property_address ?? ''}`,
    `- Type: ${d.property_type ?? ''}`,
    `- Area: ${d.property_area ? `${d.property_area} sq ft` : ''}`,
    moneyLines ? moneyLines : ``,
    roleLine ? `\n${roleLine}` : ``,
    ``,
    `*Link:* ${link}`,
    ``,
    `Please review the document and let us know if you have any questions.`,
    ``,
    `Best regards,`,
    `${d.sales_executive || 'ResaleExpert Team'}`,
    ``,
    `---`,
    `ResaleExpert - Your Trusted Real Estate Partner`,
    `Contact: +91 99999 99999`,
    `www.resaleexpert.com`,
  ].filter(Boolean).join('\n');
};


  // for Custom role → use the recipient's name in salutation
  const buildMessageForName = (recipientName: string, channel: 'whatsapp'|'email'|'sms', forRole: 'Seller'|'Buyer') => {
    if (channel === 'whatsapp') return buildWhatsAppMessage(forRole, recipientName);
    if (channel === 'sms')      return buildSMSMessage(forRole, recipientName);
    return buildEmailMessage(forRole, recipientName);
  };

  // Initialize recipients from document
  useEffect(() => {
    const autoRecipients: Recipient[] = [];

    if (d.seller_name && d.seller_phone) {
      autoRecipients.push({ id: 'seller_phone', name: d.seller_name, contact: String(d.seller_phone), type: 'phone', role: 'Seller' });
    }
    if (d.seller_name && d.seller_email) {
      autoRecipients.push({ id: 'seller_email', name: d.seller_name, contact: String(d.seller_email), type: 'email', role: 'Seller' });
    }
    if (d.buyer_name && d.buyer_phone) {
      autoRecipients.push({ id: 'buyer_phone', name: d.buyer_name, contact: String(d.buyer_phone), type: 'phone', role: 'Buyer' });
    }
    if (d.buyer_name && d.buyer_email) {
      autoRecipients.push({ id: 'buyer_email', name: d.buyer_name, contact: String(d.buyer_email), type: 'email', role: 'Buyer' });
    }

    setRecipients(autoRecipients);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id]);

  // Initialize editable defaults (email-safe = no emojis)
  useEffect(() => {
    setMsgSeller(buildEmailMessage('Seller'));
    setMsgBuyer(buildEmailMessage('Buyer'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id]);

  /* ---------- channels ---------- */
  const colorClassMap: Record<
    string,
    { border: string; bg: string; text: string; textStrong: string; check: string; borderIdle: string; hoverBorder: string; textIdle: string; }
  > = {
    green:  { border: 'border-green-500',  bg: 'bg-green-50',  text: 'text-green-600',  textStrong: 'text-green-900',  check: 'text-green-600',  borderIdle: 'border-gray-200', hoverBorder: 'hover:border-gray-300', textIdle: 'text-gray-600' },
    blue:   { border: 'border-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-600',   textStrong: 'text-blue-900',   check: 'text-blue-600',   borderIdle: 'border-gray-200', hoverBorder: 'hover:border-gray-300', textIdle: 'text-gray-600' },
    purple: { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-600', textStrong: 'text-purple-900', check: 'text-purple-600', borderIdle: 'border-gray-200', hoverBorder: 'hover:border-gray-300', textIdle: 'text-gray-600' },
    indigo: { border: 'border-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600', textStrong: 'text-indigo-900', check: 'text-indigo-600', borderIdle: 'border-gray-200', hoverBorder: 'hover:border-gray-300', textIdle: 'text-gray-600' },
  };

  const channels = [
    { id: 'whatsapp',   label: 'WhatsApp',   icon: FaWhatsapp, color: 'green',  description: 'Send via WhatsApp with rich formatting' },
    { id: 'email',      label: 'Email',      icon: Mail,       color: 'blue',   description: 'Send detailed email with document attachment' },
    { id: 'sms',        label: 'SMS',        icon: Phone,      color: 'purple', description: 'Send SMS with document link' },
    { id: 'public_link',label: 'Public Link',icon: Globe,      color: 'indigo', description: 'Generate shareable public link' },
  ] as const;

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]
    );
  };

  const addRecipient = () => {
    if (newRecipient.name.trim() && newRecipient.contact.trim()) {
      setRecipients(prev => [...prev, { ...newRecipient, id: Date.now() }]);
      // default next type guided by selected channels
      const nextType = hasChannel('email') && !(hasChannel('whatsapp') || hasChannel('sms')) ? 'email' : 'phone';
      setNewRecipient({ id: 0, name: '', contact: '', type: nextType, role: 'Custom' });
    }
  };

  const removeRecipient = (id: string | number) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  /* ---------- filtering logic (audience + allowed types) ---------- */
  const visibleRecipients = useMemo(() => {
    const byAudience = recipients.filter(r => {
      if (audienceFilter === 'both') return true;
      if (audienceFilter === 'seller') return r.role === 'Seller' || r.role === 'Custom';
      if (audienceFilter === 'buyer')  return r.role === 'Buyer'  || r.role === 'Custom';
      return true;
    });
    // Filter by allowed recipient types from channels
    const byType = byAudience.filter(r => allowedRecipientTypes.has(r.type));
    return byType;
  }, [recipients, audienceFilter, allowedRecipientTypes]);

  const effectiveRecipientCount = visibleRecipients.length;
  const effectiveChannelCount = selectedChannels.length;

  /* ---------- body selector PER RECIPIENT (role-aware + channel-aware) ---------- */
  const messageForRecipientByChannel = (r: Recipient, channel: 'whatsapp'|'email'|'sms') => {
    const baseRole: 'Seller'|'Buyer' = r.role === 'Seller' ? 'Seller' : 'Buyer';
    if (r.role === 'Custom') {
      return buildMessageForName(r.name, channel, baseRole);
    }
    if (channel === 'whatsapp') return buildWhatsAppMessage(baseRole);
    if (channel === 'sms') return buildSMSMessage(baseRole);
    return (baseRole === 'Seller' ? (msgSeller || buildEmailMessage('Seller')) : (msgBuyer || buildEmailMessage('Buyer')));
  };

  /* ---------- share ---------- */
const handleShare = async () => {
  if (effectiveChannelCount === 0) {
    alert('Please select at least one sharing channel');
    return;
  }
  if (effectiveRecipientCount === 0 && !hasChannel('public_link')) {
    alert('Please add/select at least one recipient (based on your filters).');
    return;
  }

  setIsSharing(true);
  setShareResults([]);

  try {
    const results: any[] = [];

    // ---------- LOCAL ACTIONS ----------
    for (const channel of selectedChannels) {
      await new Promise(resolve => setTimeout(resolve, 200));

      if (channel === 'whatsapp') {
        const waRecipients = visibleRecipients.filter(r => r.type === 'phone');
        for (const r of waRecipients) {
          const body = messageForRecipientByChannel(r, 'whatsapp');
          const url = `https://wa.me/${normalizePhone(r.contact)}?text=${encodeURIComponent(body)}`;
          window.open(url, '_blank', 'noopener,noreferrer');
          results.push({ channel: 'WhatsApp', recipient: r.name, contact: r.contact, status: 'sent', timestamp: new Date().toISOString() });
        }
      }

      if (channel === 'email') {
        const emailRecipients = visibleRecipients.filter(r => r.type === 'email');
        for (const r of emailRecipients) {
          const subject = `${document.template_name ?? 'Document'} - ${d.document_id ?? ''}`;
          const body = messageForRecipientByChannel(r, 'email');
          const mailtoUrl = `mailto:${encodeURIComponent(r.contact)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.location.href = mailtoUrl;
          results.push({ channel: 'Email', recipient: r.name, contact: r.contact, status: 'sent', timestamp: new Date().toISOString() });
        }
      }

      if (channel === 'sms') {
        const smsRecipients = visibleRecipients.filter(r => r.type === 'phone');
        for (const r of smsRecipients) {
          const body = messageForRecipientByChannel(r, 'sms');
          results.push({ channel: 'SMS', recipient: r.name, contact: r.contact, status: 'queued', timestamp: new Date().toISOString() });
        }
      }

      if (channel === 'public_link') {
        const publicLink = generatePublicLink();
        await navigator.clipboard.writeText(publicLink);
        toast.success('Public link copied!');
        results.push({ channel: 'Public Link', recipient: 'Link copied', contact: publicLink, status: 'generated', timestamp: new Date().toISOString() });
      }
    }

    setShareResults(results);

    // ---------- BACKEND CALL ----------
    try {
      await documentStatusAPI.createShareBatch(document.id, {
        channels: selectedChannels,
        message: msgSeller || msgBuyer || '',
        public_link: generatePublicLink(),
        recipients: visibleRecipients.map(r => ({
          recipient_name: r.name,
          recipient_type: r.type,
          recipient_value: r.contact,
          role: r.role,
          channel: selectedChannels[0] || 'unknown',
          status: 'sent',
        })),
      });

      // ✅ Fetch the updated snapshot (will now be `shared`)
      const updatedSnap = await documentStatusAPI.getSnapshot(document.id);

      // ✅ Notify parent about updated snapshot
      onShare?.({
        document_id: document.id,
        channels: selectedChannels,
        recipients: visibleRecipients,
        results,
        snapshot: updatedSnap, // this contains { current_status: 'shared', ... }
        shared_at: new Date().toISOString(),
      });

      toast.success('Share recorded and status updated to "Shared" ✅');
    } catch (err) {
      console.error('Failed to log share batch or update snapshot:', err);
      toast.error('Backend share log failed (status may not update)');
    }
  } catch (error) {
    console.error('Sharing failed:', error);
    toast.error('Sharing failed. Check console for details.');
  } finally {
    setIsSharing(false);
  }
};


  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Share className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-xs">Share Document</h2>
                <p className="text-gray-600 mt-1 text-xs">{document.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Document Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-xs">Document Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Document:</span>
                <span className="font-semibold ml-2 text-xs">{document?.data?.document_id}</span>
              </div>
              <div>
                <span className="text-gray-500">Template:</span>
                <span className="font-semibold ml-2 text-xs">{document.template_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Seller:</span>
                <span className="font-semibold ml-2 text-xs">{document?.data?.seller_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Property:</span>
                <span className="font-semibold ml-2 text-xs">{document?.data?.property_type}</span>
              </div>
            </div>
          </div>

          {/* Sharing Channels */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-xs">Select Sharing Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map((channel) => {
                const Icon = channel.icon as any;
                const isSelected = selectedChannels.includes(channel.id);
                const cm = colorClassMap[channel.color];

                return (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelToggle(channel.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected ? `${cm.border} ${cm.bg}` : `${cm.borderIdle} ${cm.hoverBorder}`}`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon size={20} className={isSelected ? `${cm.text}` : 'text-gray-400'} />
                      <span className={`font-medium text-xs ${isSelected ? `${cm.textStrong}` : `${cm.textIdle}`}`}>
                        {channel.label}
                      </span>
                      {isSelected && <Check size={16} className={`${cm.check}`} />}
                    </div>
                    <p className="text-xs text-gray-500">{channel.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipients */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-xs">Recipients</h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                {/* Filter: Seller / Buyer / Both */}
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-600 mb-1">Show</label>
                  <select
                    value={audienceFilter}
                    onChange={(e) => setAudienceFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  >
                    <option value="seller">Only Seller</option>
                    <option value="buyer">Only Buyer</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {/* Add Custom Recipient */}
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-2 text-xs">Add Custom Recipient</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={newRecipient.name}
                      onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="Recipient name"
                    />
                    <input
                      type="text"
                      value={newRecipient.contact}
                      onChange={(e) => setNewRecipient({ ...newRecipient, contact: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder={hasChannel('email') && !(hasChannel('whatsapp') || hasChannel('sms')) ? 'Email' : 'Phone'}
                    />
                    <select
                      value={newRecipient.type}
                      onChange={(e) => setNewRecipient({ ...newRecipient, type: e.target.value as any })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    >
                      {/* Only offer the types currently allowed */}
                      {allowedRecipientTypes.has('phone') && <option value="phone">Phone</option>}
                      {allowedRecipientTypes.has('email') && <option value="email">Email</option>}
                    </select>
                    <button
                      onClick={addRecipient}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipients List */}
            <div className="space-y-2">
              {visibleRecipients.map((recipient) => (
                <div key={recipient.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {recipient.type === 'email'
                        ? <Mail size={16} className="text-blue-600" />
                        : <Phone size={16} className="text-blue-600" />
                      }
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-xs">{recipient.name}</div>
                      <div className="text-xs text-gray-600">{recipient.contact}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {recipient.role}
                    </span>
                    <button
                      onClick={() => removeRecipient(recipient.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {visibleRecipients.length === 0 && (
                <div className="p-3 text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  No recipients to show for the current filters.
                </div>
              )}
            </div>
          </div>

          {/* Message Editors (email-safe defaults shown/edited) */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-xs">Message</h3>

            {audienceFilter === 'both' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seller */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-700">Seller Message (Email template)</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => setMsgSeller(buildEmailMessage('Seller'))}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[11px] hover:bg-blue-200"
                      >
                        Use Default
                      </button>
                      <button
                        onClick={() => copyToClipboard(msgSeller || buildEmailMessage('Seller'))}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-[11px] hover:bg-gray-200"
                      >
                        <Copy size={12} className="inline mr-1" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={msgSeller || buildEmailMessage('Seller')}
                    onChange={(e) => setMsgSeller(e.target.value)}
                    className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                  />
                </div>

                {/* Buyer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-700">Buyer Message (Email template)</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => setMsgBuyer(buildEmailMessage('Buyer'))}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[11px] hover:bg-blue-200"
                      >
                        Use Default
                      </button>
                      <button
                        onClick={() => copyToClipboard(msgBuyer || buildEmailMessage('Buyer'))}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-[11px] hover:bg-gray-200"
                      >
                        <Copy size={12} className="inline mr-1" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={msgBuyer || buildEmailMessage('Buyer')}
                    onChange={(e) => setMsgBuyer(e.target.value)}
                    className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                  />
                </div>
              </div>
            ) : audienceFilter === 'seller' ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMsgSeller(buildEmailMessage('Seller'))}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                  >
                    Use Default (Seller)
                  </button>
                  <button
                    onClick={() => copyToClipboard(msgSeller || buildEmailMessage('Seller'))}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                  >
                    <Copy size={12} className="inline mr-1" />
                    Copy
                  </button>
                </div>
                <textarea
                  value={msgSeller || buildEmailMessage('Seller')}
                  onChange={(e) => setMsgSeller(e.target.value)}
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMsgBuyer(buildEmailMessage('Buyer'))}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                  >
                    Use Default (Buyer)
                  </button>
                  <button
                    onClick={() => copyToClipboard(msgBuyer || buildEmailMessage('Buyer'))}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                  >
                    <Copy size={12} className="inline mr-1" />
                    Copy
                  </button>
                </div>
                <textarea
                  value={msgBuyer || buildEmailMessage('Buyer')}
                  onChange={(e) => setMsgBuyer(e.target.value)}
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                />
              </div>
            )}
          </div>

          {/* Share Results */}
          {shareResults.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-xs">Sharing Results</h3>
              <div className="space-y-2">
                {shareResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Check className="text-green-600" size={16} />
                      <span className="text-xs font-medium text-green-800">
                        {result.channel} - {result.recipient}
                      </span>
                      {result.contact && (
                        <span className="text-xs text-green-600">({result.contact})</span>
                      )}
                    </div>
                    <span className="text-xs text-green-600 uppercase font-medium">
                      {result.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-blue-50 rounded-xl py-2 px-4">
            <h4 className="font-semibold text-blue-900 mb-3 text-xs">Quick Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const publicLink = generatePublicLink();
                  copyToClipboard(publicLink);
                }}
                className="flex items-center space-x-2 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <LinkIcon className="text-blue-600" size={16} />
                <span className="text-blue-800 font-medium text-xs">Copy Public Link</span>
              </button>
              <button
                onClick={() => {
                  const url = generatePublicLink();
                  const qrWindow = window.open('', '_blank');
                  if (qrWindow) {
                    qrWindow.document.write(`
                      <html>
                        <head><title>QR Code - ${document.title ?? ''}</title></head>
                        <body style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
                          <h2 style="font-size:12px;margin:0 0 8px 0">${document.title ?? ''}</h2>
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" alt="QR Code" style="margin: 12px;">
                          <p style="font-size: 12px; color: #666;">Scan to view document</p>
                          <p style="font-size: 10px; color: #666;">${url}</p>
                        </body>
                      </html>
                    `);
                  }
                }}
                className="flex items-center space-x-2 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <QrCode className="text-blue-600" size={16} />
                <span className="text-blue-800 font-medium text-xs">Generate QR Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {effectiveChannelCount} channel{effectiveChannelCount !== 1 ? 's' : ''} selected • {effectiveRecipientCount} recipient{effectiveRecipientCount !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={(effectiveChannelCount === 0) || (effectiveRecipientCount === 0 && !hasChannel('public_link')) || isSharing}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {isSharing ? (
                  <>
                    <Clock size={16} className="animate-spin" />
                    <span>Sharing...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Share Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentShareModal;
