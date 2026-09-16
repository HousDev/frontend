import React from 'react';
import { X, Building, Key, CheckCircle, ArrowRight, Sparkles, Shield, Users, Zap } from 'lucide-react';

interface PostPropertyTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'sell' | 'rent') => void;
}

const PostPropertyTypeModal: React.FC<PostPropertyTypeModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0b3856] via-[#0f4c75] to-[#E6761D] px-6 py-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <Sparkles size={13} className="text-yellow-300" />
            <span>100% Free Listing</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Post Your Property
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-sm mx-auto">
            Choose whether you want to sell your property or find verified tenants for rent.
          </p>
        </div>

        {/* Content Section: 2 Cards */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SELL PROPERTY CARD */}
            <button
              type="button"
              onClick={() => {
                onSelectType('sell');
                onClose();
              }}
              className="group relative flex flex-col justify-between p-5 rounded-2xl border-2 border-gray-200 hover:border-[#E6761D] bg-white hover:bg-orange-50/40 text-left transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E6761D]/50 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#E6761D] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <Building size={24} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-[#E6761D] border border-orange-200">
                    For Sale
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#E6761D] transition-colors">
                    Sell Property
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    List flat, house, plot or commercial property to sell at maximum market value.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-[11px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
                    <span>2.5L+ Verified Buyers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
                    <span>0% Brokerage & Zero Fee</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between font-bold text-xs text-[#E6761D] group-hover:translate-x-0.5 transition-transform">
                <span>Post for Sale</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* RENT OUT PROPERTY CARD */}
            <button
              type="button"
              onClick={() => {
                onSelectType('rent');
                onClose();
              }}
              className="group relative flex flex-col justify-between p-5 rounded-2xl border-2 border-gray-200 hover:border-[#0b3856] bg-white hover:bg-blue-50/40 text-left transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0b3856]/50 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0b3856] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <Key size={24} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-[#0b3856] border border-blue-200">
                    For Rent
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0b3856] transition-colors">
                    Rent Out Property
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Rent your flat, shop, or office to verified families, bachelors or companies.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-[11px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
                    <span>Verified Tenants Quickly</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
                    <span>Free Agreement & Support</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between font-bold text-xs text-[#0b3856] group-hover:translate-x-0.5 transition-transform">
                <span>Post for Rent</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Bottom Trust badges */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-gray-500 text-center">
            <span className="inline-flex items-center gap-1 font-medium">
              <Shield size={13} className="text-green-600" /> 100% Free Listing
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Zap size={13} className="text-[#E6761D]" /> Instant Online Activation
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Users size={13} className="text-[#0b3856]" /> Direct Contact Only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPropertyTypeModal;
