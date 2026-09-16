import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, RefreshCw, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface TenantSignatureCanvasProps {
  initialName?: string;
  onSignatureChange: (signatureDataUrl: string | null, signatureType: 'drawn' | 'uploaded' | 'typed') => void;
}

export const TenantSignatureCanvas: React.FC<TenantSignatureCanvasProps> = ({
  initialName = '',
  onSignatureChange,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload' | 'type'>('draw');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [typedName, setTypedName] = useState(initialName);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize canvas & scale resolution cleanly
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : 500;
      const h = rect.height > 0 ? rect.height : 140;
      
      // Set high-DPI resolution
      canvas.width = Math.floor(w * 2);
      canvas.height = Math.floor(h * 2);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(1, 1);
        ctx.strokeStyle = '#0b3856';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab]);

  const getCoordinates = (canvas: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Drawing Event Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0b3856';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const coords = getCoordinates(canvas, e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0b3856';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const coords = getCoordinates(canvas, e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    if (!hasDrawn) {
      setHasDrawn(true);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        onSignatureChange(dataUrl, 'drawn');
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange(null, 'drawn');
  };

  // Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG/JPG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImage(result);
      onSignatureChange(result, 'uploaded');
    };
    reader.readAsDataURL(file);
  };

  // Handle Typed Signature change
  const handleTypedChange = (val: string) => {
    setTypedName(val);
    if (!val.trim()) {
      onSignatureChange(null, 'typed');
      return;
    }

    // Create a stylized text canvas for typed signature
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 400;
    tempCanvas.height = 100;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0b3856';
      ctx.font = 'italic bold 28px "Georgia", serif';
      ctx.fillText(val, 20, 60);
      onSignatureChange(tempCanvas.toDataURL('image/png'), 'typed');
    }
  };

  return (
    <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
      {/* Signature Method Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setActiveTab('draw');
            onSignatureChange(hasDrawn && canvasRef.current ? canvasRef.current.toDataURL('image/png') : null, 'drawn');
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition ${
            activeTab === 'draw' ? 'bg-white text-[#0b3856] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PenTool size={13} />
          <span>Draw Signature</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('upload');
            onSignatureChange(uploadedImage, 'uploaded');
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition ${
            activeTab === 'upload' ? 'bg-white text-[#0b3856] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload size={13} />
          <span>Upload Image</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('type');
            handleTypedChange(typedName);
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition ${
            activeTab === 'type' ? 'bg-white text-[#0b3856] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImageIcon size={13} />
          <span>Typed Font</span>
        </button>
      </div>

      {/* Tab 1: Interactive Canvas Drawing */}
      {activeTab === 'draw' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Use mouse or touch finger to draw your signature below:</span>
            {hasDrawn && (
              <button
                type="button"
                onClick={clearCanvas}
                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>Clear Canvas</span>
              </button>
            )}
          </div>
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner hover:border-[#0b3856] transition-colors">
            <canvas
              ref={canvasRef}
              width={420}
              height={130}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-32 touch-none cursor-crosshair"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs font-semibold italic">
                Sign here inside the box...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Signature Photo Upload */}
      {activeTab === 'upload' && (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileUpload}
          />
          {uploadedImage ? (
            <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <img src={uploadedImage} alt="Signature Upload" className="h-12 max-w-36 object-contain rounded border border-slate-200" />
                <div className="text-[11px] truncate">
                  <span className="font-bold text-emerald-800 block">✓ Signature Image Uploaded</span>
                  <span className="text-slate-500">Ready to stamp on rental agreement</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadedImage(null);
                  onSignatureChange(null, 'uploaded');
                }}
                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-5 border-2 border-dashed border-slate-300 hover:border-[#0b3856] rounded-xl bg-white text-center cursor-pointer transition-all space-y-1.5 group"
            >
              <Upload size={22} className="mx-auto text-slate-400 group-hover:scale-110 text-[#0b3856] transition-transform" />
              <p className="text-xs font-bold text-slate-800">Click to upload photo of signature</p>
              <span className="text-[10px] text-slate-400 font-mono">PNG, JPG or scanned signature image (Max 5MB)</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Stylized Typed Signature */}
      {activeTab === 'type' && (
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-700 block">
            Type Full Legal Name for Cursive Digital Stamp:
          </label>
          <input
            type="text"
            value={typedName}
            onChange={(e) => handleTypedChange(e.target.value)}
            placeholder="e.g. Prachi Lad"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#0b3856] text-slate-900"
          />
          {typedName && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center font-serif italic text-xl font-bold text-[#0b3856] shadow-xs">
              "{typedName}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
