// src/components/documents/modals/PartyVerificationModal.tsx
import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { documentStatusAPI } from '@/lib/documentStatusAPI';

export interface PartyVerificationPayload {
  buyer: { name: string; email: string; phone: string; channel: 'sms' | 'email' };
  seller: { name: string; email: string; phone: string; channel: 'sms' | 'email' };
  defaultExecutive?: { name?: string; email?: string; phone?: string };
  note?: string;
}

interface PartyVerificationModalProps {
  isOpen: boolean;
  documentId: number;
  defaultBuyer?: { name?: string; email?: string; phone?: string };
  defaultSeller?: { name?: string; email?: string; phone?: string };
  defaultExecutive?: { name?: string; email?: string; phone?: string };
  onClose: () => void;
  onBothVerified: (payload: PartyVerificationPayload) => void;
}

const PartyVerificationModal: React.FC<PartyVerificationModalProps> = ({
  isOpen,
  documentId,
  defaultBuyer,
  defaultSeller,
  onClose,
  onBothVerified,
}) => {
  const [note, setNote] = React.useState('');

  // --- Buyer States ---
  const [buyerName, setBuyerName] = React.useState(defaultBuyer?.name || '');
  const [buyerEmail, setBuyerEmail] = React.useState(defaultBuyer?.email || '');
  const [buyerPhone, setBuyerPhone] = React.useState(defaultBuyer?.phone || '');
  const [buyerChannel, setBuyerChannel] = React.useState<'sms' | 'email'>(
    defaultBuyer?.email ? 'email' : 'sms'
  );
  const [buyerOtp, setBuyerOtp] = React.useState('');
  const [buyerSending, setBuyerSending] = React.useState(false);
  const [buyerVerifying, setBuyerVerifying] = React.useState(false);
  const [buyerVerified, setBuyerVerified] = React.useState(false);
  const [buyerCooldown, setBuyerCooldown] = React.useState(0);

  // --- Seller States ---
  const [sellerName, setSellerName] = React.useState(defaultSeller?.name || '');
  const [sellerEmail, setSellerEmail] = React.useState(defaultSeller?.email || '');
  const [sellerPhone, setSellerPhone] = React.useState(defaultSeller?.phone || '');
  const [sellerChannel, setSellerChannel] = React.useState<'sms' | 'email'>(
    defaultSeller?.email ? 'email' : 'sms'
  );
  const [sellerOtp, setSellerOtp] = React.useState('');
  const [sellerSending, setSellerSending] = React.useState(false);
  const [sellerVerifying, setSellerVerifying] = React.useState(false);
  const [sellerVerified, setSellerVerified] = React.useState(false);
  const [sellerCooldown, setSellerCooldown] = React.useState(0);

  // Cooldown timers
  React.useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setBuyerCooldown((v) => (v > 0 ? v - 1 : 0));
      setSellerCooldown((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  /* =========================
     Buyer OTP functions
  ========================== */
  const sendBuyerOtp = async () => {
    try {
      if (buyerChannel === 'sms' && !/^\+?\d{10,15}$/.test(buyerPhone))
        return alert('Buyer phone invalid');
      if (buyerChannel === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(buyerEmail))
        return alert('Buyer email invalid');

      setBuyerSending(true);
      await documentStatusAPI.requestOtp(documentId, {
        role: 'buyer',
        channel: buyerChannel,
        to: buyerChannel === 'sms' ? buyerPhone : buyerEmail,
        name: buyerName || 'Buyer',
      });
      toast.success(`Buyer OTP sent via ${buyerChannel.toUpperCase()}`);
      setBuyerCooldown(60);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to send buyer OTP');
    } finally {
      setBuyerSending(false);
    }
  };

  const verifyBuyerOtp = async () => {
    if (!buyerOtp.trim()) return alert('Enter Buyer OTP');
    try {
      setBuyerVerifying(true);
      await documentStatusAPI.verifyOtp(documentId, {
        role: 'buyer',
        code: buyerOtp.trim(),
      });
      toast.success('Buyer verified ✅');
      setBuyerVerified(true);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Buyer verification failed');
    } finally {
      setBuyerVerifying(false);
    }
  };

  /* =========================
     Seller OTP functions
  ========================== */
  const sendSellerOtp = async () => {
    try {
      if (sellerChannel === 'sms' && !/^\+?\d{10,15}$/.test(sellerPhone))
        return alert('Seller phone invalid');
      if (sellerChannel === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(sellerEmail))
        return alert('Seller email invalid');
        
      setSellerSending(true);
      await documentStatusAPI.requestOtp(documentId, {
        role: 'seller',
        channel: sellerChannel,
        to: sellerChannel === 'sms' ? sellerPhone : sellerEmail,
        name: sellerName || 'Seller',
      });
      toast.success(`Seller OTP sent via ${sellerChannel.toUpperCase()}`);
      setSellerCooldown(60);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to send seller OTP');
    } finally {
      setSellerSending(false);
    }
  };

  const verifySellerOtp = async () => {
    if (!sellerOtp.trim()) return alert('Enter Seller OTP');
    try {
      setSellerVerifying(true);
      await documentStatusAPI.verifyOtp(documentId, {
        role: 'seller',
        code: sellerOtp.trim(),
      });
      toast.success('Seller verified ✅');
      setSellerVerified(true);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Seller verification failed');
    } finally {
      setSellerVerifying(false);
    }
  };

  const bothVerified = buyerVerified && sellerVerified;

  /* =========================
         RENDER
  ========================== */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Verify Buyer & Seller</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* BUYER SECTION */}
        <div className="border rounded-xl p-4 mb-4">
          <div className="flex justify-between mb-3">
            <div className="font-semibold">Buyer Details</div>
            {buyerVerified ? (
              <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 flex items-center gap-1">
                <CheckCircle size={12} /> Verified
              </span>
            ) : (
              <span className="text-xs text-gray-500">Not verified</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
            <input
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Buyer name"
              className="border rounded-lg px-3 py-2"
            />
            <input
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="Buyer email"
              className="border rounded-lg px-3 py-2"
            />
            <input
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="Buyer phone"
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm">Send via:</label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={buyerChannel === 'sms'}
                onChange={() => setBuyerChannel('sms')}
              />
              SMS
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={buyerChannel === 'email'}
                onChange={() => setBuyerChannel('email')}
                disabled={!buyerEmail}
              />
              Email
            </label>
            <button
              onClick={sendBuyerOtp}
              disabled={buyerSending || buyerCooldown > 0}
              className="ml-auto bg-blue-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
            >
              {buyerSending
                ? 'Sending…'
                : buyerCooldown > 0
                ? `Resend in ${buyerCooldown}s`
                : 'Send OTP'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={buyerOtp}
              onChange={(e) => setBuyerOtp(e.target.value)}
              placeholder="Enter Buyer OTP"
              className="border rounded-lg px-3 py-2 w-48"
            />
            <button
              onClick={verifyBuyerOtp}
              disabled={buyerVerifying || buyerVerified || !buyerOtp.trim()}
              className="bg-green-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
            >
              {buyerVerifying ? 'Verifying…' : buyerVerified ? 'Verified' : 'Verify'}
            </button>
          </div>
        </div>

        {/* SELLER SECTION */}
        <div className="border rounded-xl p-4 mb-4">
          <div className="flex justify-between mb-3">
            <div className="font-semibold">Seller Details</div>
            {sellerVerified ? (
              <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 flex items-center gap-1">
                <CheckCircle size={12} /> Verified
              </span>
            ) : (
              <span className="text-xs text-gray-500">Not verified</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
            <input
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="Seller name"
              className="border rounded-lg px-3 py-2"
            />
            <input
              value={sellerEmail}
              onChange={(e) => setSellerEmail(e.target.value)}
              placeholder="Seller email (optional)"
              className="border rounded-lg px-3 py-2"
            />
            <input
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              placeholder="Seller phone"
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm">Send via:</label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={sellerChannel === 'sms'}
                onChange={() => setSellerChannel('sms')}
              />
              SMS
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={sellerChannel === 'email'}
                onChange={() => setSellerChannel('email')}
                disabled={!sellerEmail}
              />
              Email
            </label>
            <button
              onClick={sendSellerOtp}
              disabled={sellerSending || sellerCooldown > 0}
              className="ml-auto bg-blue-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
            >
              {sellerSending
                ? 'Sending…'
                : sellerCooldown > 0
                ? `Resend in ${sellerCooldown}s`
                : 'Send OTP'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={sellerOtp}
              onChange={(e) => setSellerOtp(e.target.value)}
              placeholder="Enter Seller OTP"
              className="border rounded-lg px-3 py-2 w-48"
            />
            <button
              onClick={verifySellerOtp}
              disabled={sellerVerifying || sellerVerified || !sellerOtp.trim()}
              className="bg-green-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
            >
              {sellerVerifying ? 'Verifying…' : sellerVerified ? 'Verified' : 'Verify'}
            </button>
          </div>
        </div>

        {/* NOTE + FOOTER */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="border rounded-lg w-full px-3 py-2"
          placeholder="Optional note (e.g. OTP received on buyer's phone)"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={() =>
              onBothVerified({
                buyer: { name: buyerName, email: buyerEmail, phone: buyerPhone, channel: buyerChannel },
                seller: { name: sellerName, email: sellerEmail, phone: sellerPhone, channel: sellerChannel },
                note: note.trim() || undefined,
              })
            }
            disabled={!bothVerified}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Continue (Both Verified)
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartyVerificationModal;