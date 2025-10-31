// src/components/documents/modals/PartyVerificationModal.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { documentStatusAPI } from '@/lib/documentStatusAPI';

export interface PartyVerificationPayload {
  buyer?: {
    name: string;
    email: string;
    phone: string;
    channel: 'sms' | 'email';
    verified: boolean;
  };
  seller?: {
    name: string;
    email: string;
    phone: string;
    channel: 'sms' | 'email';
    verified: boolean;
  };
  defaultExecutive?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  note?: string;
}

interface PartyVerificationModalProps {
  isOpen: boolean;
  documentId: number;
  defaultBuyer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  defaultSeller?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  defaultExecutive?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onClose: () => void;
  onVerified: (payload: PartyVerificationPayload) => void;
}

const PartyVerificationModal: React.FC<PartyVerificationModalProps> = ({
  isOpen,
  documentId,
  defaultBuyer,
  defaultSeller,
  defaultExecutive,
  onClose,
  onVerified,
}) => {
  const [note, setNote] = useState('');

  // --- Detect which sections to show (single/both) ---
  const hasBuyer = useMemo(
    () => !!(defaultBuyer && (defaultBuyer.name || defaultBuyer.email || defaultBuyer.phone)),
    [defaultBuyer]
  );
  const hasSeller = useMemo(
    () => !!(defaultSeller && (defaultSeller.name || defaultSeller.email || defaultSeller.phone)),
    [defaultSeller]
  );

  // If only one side exists, show only that section. If both (or none) exist, show both.
  const showBuyerSection = hasBuyer && !hasSeller ? true : hasSeller && !hasBuyer ? false : true;
  const showSellerSection = hasSeller && !hasBuyer ? true : hasBuyer && !hasSeller ? false : true;

  // --- Buyer States ---
  const [buyerName, setBuyerName] = useState(defaultBuyer?.name || '');
  const [buyerEmail, setBuyerEmail] = useState(defaultBuyer?.email || '');
  const [buyerPhone, setBuyerPhone] = useState(defaultBuyer?.phone || '');
  const [buyerChannel, setBuyerChannel] = useState<'sms' | 'email'>(
    defaultBuyer?.email ? 'email' : 'sms'
  );
  const [buyerOtp, setBuyerOtp] = useState('');
  const [buyerSending, setBuyerSending] = useState(false);
  const [buyerVerifying, setBuyerVerifying] = useState(false);
  const [buyerVerified, setBuyerVerified] = useState(false);
  const [buyerCooldown, setBuyerCooldown] = useState(0);

  // --- Seller States ---
  const [sellerName, setSellerName] = useState(defaultSeller?.name || '');
  const [sellerEmail, setSellerEmail] = useState(defaultSeller?.email || '');
  const [sellerPhone, setSellerPhone] = useState(defaultSeller?.phone || '');
  const [sellerChannel, setSellerChannel] = useState<'sms' | 'email'>(
    defaultSeller?.email ? 'email' : 'sms'
  );
  const [sellerOtp, setSellerOtp] = useState('');
  const [sellerSending, setSellerSending] = useState(false);
  const [sellerVerifying, setSellerVerifying] = useState(false);
  const [sellerVerified, setSellerVerified] = useState(false);
  const [sellerCooldown, setSellerCooldown] = useState(0);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    // Reset form fields with current defaults
    setBuyerName(defaultBuyer?.name || '');
    setBuyerEmail(defaultBuyer?.email || '');
    setBuyerPhone(defaultBuyer?.phone || '');
    setSellerName(defaultSeller?.name || '');
    setSellerEmail(defaultSeller?.email || '');
    setSellerPhone(defaultSeller?.phone || '');

    // Recompute initial channels on open
    setBuyerChannel(defaultBuyer?.email ? 'email' : 'sms');
    setSellerChannel(defaultSeller?.email ? 'email' : 'sms');

    // Fetch current verification status from API
    fetchVerificationStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, documentId, defaultBuyer, defaultSeller]);

  const resetForm = useCallback(() => {
    setBuyerVerified(false);
    setSellerVerified(false);
    setBuyerOtp('');
    setSellerOtp('');
    setNote('');
    setBuyerCooldown(0);
    setSellerCooldown(0);
  }, []);

  // Fetch current verification status from database
const fetchVerificationStatus = async () => {
  try {
    const sessions = await documentStatusAPI.getOtpSessionsByDocument(documentId, {
      verified: true,
    });

    const buyerSession = sessions?.find((s: any) => s.role === 'buyer' && s.verified_at);
    const sellerSession = sessions?.find((s: any) => s.role === 'seller' && s.verified_at);

    // Just set the state, don't show toast
    if (buyerSession && showBuyerSection) {
      setBuyerVerified(true);
    }
    if (sellerSession && showSellerSection) {
      setSellerVerified(true);
    }
  } catch (error) {
    console.error('Error fetching verification status:', error);
  }
};

  // Cooldown timers
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setBuyerCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setSellerCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Validation
  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string): boolean =>
    /^\+?[\d\s-()]{10,}$/.test(phone.replace(/\s/g, ''));

  /* =========================
     Buyer OTP functions
  ========================== */
  const sendBuyerOtp = async () => {
    try {
      if (buyerChannel === 'sms' && !validatePhone(buyerPhone)) {
        toast.error('Please enter a valid buyer phone number');
        return;
      }
      if (buyerChannel === 'email' && !validateEmail(buyerEmail)) {
        toast.error('Please enter a valid buyer email address');
        return;
      }

      setBuyerSending(true);
      await documentStatusAPI.requestOtp(documentId, {
        role: 'buyer',
        channel: buyerChannel,
        to: buyerChannel === 'sms' ? buyerPhone : buyerEmail,
        name: buyerName || 'Buyer',
      });

      toast.success(`Buyer OTP sent via ${buyerChannel.toUpperCase()}`);
      setBuyerCooldown(60);
    } catch (error: any) {
      console.error('Buyer OTP send error:', error);
      toast.error(error?.message || 'Failed to send OTP to buyer');
    } finally {
      setBuyerSending(false);
    }
  };

  const verifyBuyerOtp = async () => {
    if (!buyerOtp.trim()) {
      toast.error('Please enter the OTP received by buyer');
      return;
    }

    try {
      setBuyerVerifying(true);
      await documentStatusAPI.verifyOtp(documentId, {
        role: 'buyer',
        code: buyerOtp.trim(),
      });

      if (!buyerVerified) toast.success('Buyer verified successfully ✅');
      setBuyerVerified(true);
      checkAndAutoSubmit();
    } catch (error: any) {
      console.error('Buyer OTP verification error:', error);
      toast.error(error?.message || 'Buyer verification failed');
    } finally {
      setBuyerVerifying(false);
    }
  };

  /* =========================
     Seller OTP functions
  ========================== */
  const sendSellerOtp = async () => {
    try {
      if (sellerChannel === 'sms' && !validatePhone(sellerPhone)) {
        toast.error('Please enter a valid seller phone number');
        return;
      }
      if (sellerChannel === 'email' && !validateEmail(sellerEmail)) {
        toast.error('Please enter a valid seller email address');
        return;
      }

      setSellerSending(true);
      await documentStatusAPI.requestOtp(documentId, {
        role: 'seller',
        channel: sellerChannel,
        to: sellerChannel === 'sms' ? sellerPhone : sellerEmail,
        name: sellerName || 'Seller',
      });

      toast.success(`Seller OTP sent via ${sellerChannel.toUpperCase()}`);
      setSellerCooldown(60);
    } catch (error: any) {
      console.error('Seller OTP send error:', error);
      toast.error(error?.message || 'Failed to send OTP to seller');
    } finally {
      setSellerSending(false);
    }
  };

  const verifySellerOtp = async () => {
    if (!sellerOtp.trim()) {
      toast.error('Please enter the OTP received by seller');
      return;
    }

    try {
      setSellerVerifying(true);
      await documentStatusAPI.verifyOtp(documentId, {
        role: 'seller',
        code: sellerOtp.trim(),
      });

      if (!sellerVerified) toast.success('Seller verified successfully ✅');
      setSellerVerified(true);
      checkAndAutoSubmit();
    } catch (error: any) {
      console.error('Seller OTP verification error:', error);
      toast.error(error?.message || 'Seller verification failed');
    } finally {
      setSellerVerifying(false);
    }
  };

  // Stub for future auto-submit if needed
  const checkAndAutoSubmit = () => {
    // Left intentionally for your flow; currently just enables the Continue button.
  };

  // Determine button text
  const getSubmitButtonText = () => {
    const bothVisible = showBuyerSection && showSellerSection;
    if (buyerVerified && sellerVerified && bothVisible) return 'Continue (Both Verified)';
    if (buyerVerified) return 'Continue (Buyer Verified)';
    if (sellerVerified) return 'Continue (Seller Verified)';
    return 'Continue (Not Verified)';
  };

  const isAnyVerified =
    (showBuyerSection && buyerVerified) || (showSellerSection && sellerVerified);

  const handleSubmit = () => {
    const payload: PartyVerificationPayload = {
      note: note.trim() || undefined,
      defaultExecutive,
    };

    if (showBuyerSection && (buyerName || buyerVerified)) {
      payload.buyer = {
        name: buyerName,
        email: buyerEmail,
        phone: buyerPhone,
        channel: buyerChannel,
        verified: buyerVerified,
      };
    }

    if (showSellerSection && (sellerName || sellerVerified)) {
      payload.seller = {
        name: sellerName,
        email: sellerEmail,
        phone: sellerPhone,
        channel: sellerChannel,
        verified: sellerVerified,
      };
    }

    onVerified(payload);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Verify Parties</h3>
            <p className="text-sm text-gray-600 mt-1">
              Verify at least one party ({showBuyerSection && 'buyer'}{showBuyerSection && showSellerSection && ' or '}{showSellerSection && 'seller'}) to continue
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* BUYER SECTION */}
          {showBuyerSection && (
            <div className="border border-gray-200 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold text-gray-900">
                  Buyer Details {!buyerVerified && '(Optional)'}
                </div>
                {buyerVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                    <CheckCircle size={12} /> Verified
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Not verified</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Buyer name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={buyerVerified}
                />
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="Buyer email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={buyerVerified}
                />
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Buyer phone"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={buyerVerified}
                />
              </div>

              {!buyerVerified && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Send via:</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={buyerChannel === 'sms'}
                        onChange={() => setBuyerChannel('sms')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">SMS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={buyerChannel === 'email'}
                        onChange={() => setBuyerChannel('email')}
                        disabled={!buyerEmail.trim()}
                        className="text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm">Email</span>
                    </label>

                    <button
                      onClick={sendBuyerOtp}
                      disabled={
                        buyerSending ||
                        buyerCooldown > 0 ||
                        (buyerChannel === 'sms' && !validatePhone(buyerPhone)) ||
                        (buyerChannel === 'email' && !validateEmail(buyerEmail))
                      }
                      className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buyerSending
                        ? 'Sending…'
                        : buyerCooldown > 0
                        ? `Resend (${buyerCooldown}s)`
                        : 'Send OTP'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      value={buyerOtp}
                      onChange={(e) => setBuyerOtp(e.target.value)}
                      placeholder="Enter OTP received by buyer"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={6}
                    />
                    <button
                      onClick={verifyBuyerOtp}
                      disabled={buyerVerifying || buyerVerified || !buyerOtp.trim()}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buyerVerifying ? 'Verifying…' : 'Verify'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SELLER SECTION */}
          {showSellerSection && (
            <div className="border border-gray-200 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold text-gray-900">
                  Seller Details {!sellerVerified && '(Optional)'}
                </div>
                {sellerVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                    <CheckCircle size={12} /> Verified
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Not verified</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Seller name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={sellerVerified}
                />
                <input
                  type="email"
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  placeholder="Seller email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={sellerVerified}
                />
                <input
                  type="tel"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="Seller phone"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={sellerVerified}
                />
              </div>

              {!sellerVerified && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Send via:</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={sellerChannel === 'sms'}
                        onChange={() => setSellerChannel('sms')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">SMS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={sellerChannel === 'email'}
                        onChange={() => setSellerChannel('email')}
                        disabled={!sellerEmail.trim()}
                        className="text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm">Email</span>
                    </label>

                    <button
                      onClick={sendSellerOtp}
                      disabled={
                        sellerSending ||
                        sellerCooldown > 0 ||
                        (sellerChannel === 'sms' && !validatePhone(sellerPhone)) ||
                        (sellerChannel === 'email' && !validateEmail(sellerEmail))
                      }
                      className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sellerSending
                        ? 'Sending…'
                        : sellerCooldown > 0
                        ? `Resend (${sellerCooldown}s)`
                        : 'Send OTP'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      value={sellerOtp}
                      onChange={(e) => setSellerOtp(e.target.value)}
                      placeholder="Enter OTP received by seller"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={6}
                    />
                    <button
                      onClick={verifySellerOtp}
                      disabled={sellerVerifying || sellerVerified || !sellerOtp.trim()}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sellerVerifying ? 'Verifying…' : 'Verify'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification Summary */}
          {((showBuyerSection && buyerVerified) || (showSellerSection && sellerVerified)) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-800 mb-2">Verification Summary</h4>
              <div className="text-sm text-blue-700 space-y-1">
                {showBuyerSection && buyerVerified && showSellerSection && sellerVerified ? (
                  <p>✅ Both buyer and seller are verified</p>
                ) : showBuyerSection && buyerVerified ? (
                  <p>
                    ✅ Buyer is verified{' '}
                    {showSellerSection && sellerName && '(Seller details captured but not verified)'}
                  </p>
                ) : (
                  <p>
                    ✅ Seller is verified{' '}
                    {showBuyerSection && buyerName && '(Buyer details captured but not verified)'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* NOTE */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add any notes about the verification process (e.g., OTP received on buyer's phone, partial verification details, etc.)"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 shrink-0">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isAnyVerified}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {getSubmitButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyVerificationModal;
