import React, { useState } from 'react';
import { Eye, Download, Share, Maximize2, Code, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const DocumentPreview = ({ template, documentData, isVisible }: any) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [isMaximized, setIsMaximized] = useState(false);

  const generatePreviewContent = () => {
    if (template?.name === 'Booking Form') {
      return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1f2937; padding-bottom: 20px;">
            <h1 style="color: #1f2937; margin-bottom: 10px; font-size: 28px;">PROPERTY BOOKING FORM</h1>
            <p style="color: #6b7280; font-size: 16px;">Document ID: ${documentData.document_id || 'BF001'}</p>
            <p style="color: #6b7280; font-size: 16px;">Date: ${documentData.document_date || new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Property Details</h2>
            <div style="margin-top: 20px; background: #f9fafb; padding: 20px; border-radius: 8px;">
              <p><strong>Property Address:</strong> ${documentData.property_address || '[Property Address]'}</p>
              <p><strong>Property Type:</strong> ${documentData.property_type || '[Property Type]'}</p>
              <p><strong>Area:</strong> ${documentData.property_area || '[Area]'} sq ft</p>
              <p><strong>Unit Number:</strong> ${documentData.unit_number || '[Unit Number]'}</p>
              <p><strong>Booking Amount:</strong> ₹${documentData.booking_amount || '[Booking Amount]'}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Customer Information</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                <h3 style="color: #4b5563; margin-bottom: 15px;">Primary Applicant</h3>
                <p><strong>Name:</strong> ${documentData.buyer_name || '[Customer Name]'}</p>
                <p><strong>Phone:</strong> ${documentData.buyer_phone || '[Phone Number]'}</p>
                <p><strong>Email:</strong> ${documentData.buyer_email || '[Email Address]'}</p>
                <p><strong>Address:</strong> ${documentData.buyer_address || '[Address]'}</p>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                <h3 style="color: #4b5563; margin-bottom: 15px;">Deal Executive</h3>
                <p><strong>Name:</strong> ${documentData.sales_executive || '[Deal Executive Name]'}</p>
                <p><strong>Employee ID:</strong> ${documentData.executive_id || '[Executive ID]'}</p>
                <p><strong>Contact:</strong> ${documentData.executive_phone || '[Executive Phone]'}</p>
                <p><strong>Email:</strong> ${documentData.executive_email || '[Executive Email]'}</p>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Terms & Conditions</h2>
            <div style="margin-top: 20px; background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <ol style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">The booking amount is non-refundable and will be adjusted against the total sale consideration.</li>
                <li style="margin-bottom: 10px;">The customer agrees to complete the purchase within 30 days from the booking date.</li>
                <li style="margin-bottom: 10px;">All statutory approvals and clearances are the responsibility of the developer.</li>
                <li style="margin-bottom: 10px;">The customer has inspected the property and is satisfied with its condition.</li>
                <li style="margin-bottom: 10px;">Any disputes shall be subject to the jurisdiction of local courts.</li>
                <li style="margin-bottom: 10px;">This booking is subject to final agreement execution and payment of remaining amount.</li>
                <li style="margin-bottom: 10px;">The deal executive will coordinate all further proceedings and documentation.</li>
              </ol>
            </div>
          </div>
          
          <div style="margin-top: 60px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px;">
              <div style="text-align: center;">
                <div style="border-top: 2px solid #374151; padding-top: 15px; margin-top: 40px;">
                  <p style="font-weight: bold; margin-bottom: 5px;">Customer Signature</p>
                  <p style="color: #6b7280; font-size: 14px;">${documentData.buyer_name || '[Customer Name]'}</p>
                  <p style="color: #6b7280; font-size: 12px;">Date: ${new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div style="text-align: center;">
                <div style="border-top: 2px solid #374151; padding-top: 15px; margin-top: 40px;">
                  <p style="font-weight: bold; margin-bottom: 5px;">Deal Executive</p>
                  <p style="color: #6b7280; font-size: 14px;">${documentData.sales_executive || '[Executive Name]'}</p>
                  <p style="color: #6b7280; font-size: 12px;">ID: ${documentData.executive_id || '[Executive ID]'}</p>
                </div>
              </div>
              <div style="text-align: center;">
                <div style="border-top: 2px solid #374151; padding-top: 15px; margin-top: 40px;">
                  <p style="font-weight: bold; margin-bottom: 5px;">Company Seal</p>
                  <p style="color: #6b7280; font-size: 14px;">ResaleExpert</p>
                  <p style="color: #6b7280; font-size: 12px;">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #1f2937; margin-bottom: 10px;">${template?.name || 'Document Title'}</h1>
          <p style="color: #6b7280;">Document ID: ${documentData.document_id || 'DOC001'}</p>
          <p style="color: #6b7280;">Date: ${documentData.document_date || new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Parties Involved</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div>
              <h3 style="color: #4b5563; margin-bottom: 10px;">Seller</h3>
              <p><strong>Name:</strong> ${documentData.seller_name || '[Seller Name]'}</p>
              <p><strong>Phone:</strong> ${documentData.seller_phone || '[Seller Phone]'}</p>
              <p><strong>Email:</strong> ${documentData.seller_email || '[Seller Email]'}</p>
              <p><strong>Address:</strong> ${documentData.seller_address || '[Seller Address]'}</p>
            </div>
            <div>
              <h3 style="color: #4b5563; margin-bottom: 10px;">Buyer</h3>
              <p><strong>Name:</strong> ${documentData.buyer_name || '[Buyer Name]'}</p>
              <p><strong>Phone:</strong> ${documentData.buyer_phone || '[Buyer Phone]'}</p>
              <p><strong>Email:</strong> ${documentData.buyer_email || '[Buyer Email]'}</p>
              <p><strong>Address:</strong> ${documentData.buyer_address || '[Buyer Address]'}</p>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Property Details</h2>
          <div style="margin-top: 20px;">
            <p><strong>Address:</strong> ${documentData.property_address || '[Property Address]'}</p>
            <p><strong>Type:</strong> ${documentData.property_type || '[Property Type]'}</p>
            <p><strong>Area:</strong> ${documentData.property_area || '[Area]'} sq ft</p>
            <p><strong>Unit Number:</strong> ${documentData.unit_number || '[Unit Number]'}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Terms & Conditions</h2>
          <div style="margin-top: 20px;">
            <p>This agreement is entered into between the above-mentioned parties for the sale/purchase of the property described herein.</p>
            <p style="margin-top: 15px;">The terms and conditions as mutually agreed upon by both parties shall be binding and enforceable.</p>
            <p style="margin-top: 15px;">Sales Executive: <strong>${documentData.sales_executive || '[Sales Executive]'}</strong></p>
          </div>
        </div>
        
        <div style="margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #ccc; padding-top: 10px;">
              <p><strong>Seller Signature</strong></p>
              <p style="margin-top: 5px; color: #6b7280;">${documentData.seller_name || '[Seller Name]'}</p>
            </div>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #ccc; padding-top: 10px;">
              <p><strong>Buyer Signature</strong></p>
              <p style="margin-top: 5px; color: #6b7280;">${documentData.buyer_name || '[Buyer Name]'}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const generatePDF = () => {
    const pdf = new jsPDF();

    // Create a temporary div element with the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generatePreviewContent();
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.padding = '20mm';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.4';

    // Temporarily add to DOM for rendering
    document.body.appendChild(tempDiv);

    // Use jsPDF html method for proper HTML rendering
    return pdf.html(tempDiv, {
      callback: function (doc) {
        document.body.removeChild(tempDiv);
      },
      x: 0,
      y: 0,
      width: 210, // A4 width in mm
      windowWidth: 800
    });
  };

  const generatePDFSync = () => {
    const pdf = new jsPDF();

    // Fallback method for immediate PDF generation
    pdf.setFontSize(20);
    pdf.text(template?.name || 'Document', 20, 30);

    pdf.setFontSize(12);
    pdf.text(`Document ID: ${documentData.document_id || 'DOC001'}`, 20, 50);
    pdf.text(`Date: ${documentData.document_date || new Date().toLocaleDateString()}`, 20, 65);

    let yPosition = 85;
    const lineHeight = 7;
    const maxWidth = 170;

    // Property Details
    pdf.setFontSize(14);
    pdf.text('Property Details:', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    const propertyDetails = [
      `Address: ${documentData.property_address || '[Property Address]'}`,
      `Type: ${documentData.property_type || '[Property Type]'}`,
      `Area: ${documentData.property_area || '[Area]'} sq ft`,
      `Unit: ${documentData.unit_number || '[Unit Number]'}`
    ];

    propertyDetails.forEach(detail => {
      const lines = pdf.splitTextToSize(detail, maxWidth);
      lines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += lineHeight;
      });
    });

    yPosition += 10;

    // Parties Information
    pdf.setFontSize(14);
    pdf.text('Parties Information:', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    const partiesInfo = [
      `Seller: ${documentData.seller_name || '[Seller Name]'}`,
      `Seller Phone: ${documentData.seller_phone || '[Seller Phone]'}`,
      `Buyer: ${documentData.buyer_name || '[Buyer Name]'}`,
      `Buyer Phone: ${documentData.buyer_phone || '[Buyer Phone]'}`,
      `Sales Executive: ${documentData.sales_executive || '[Sales Executive]'}`
    ];

    partiesInfo.forEach(info => {
      const lines = pdf.splitTextToSize(info, maxWidth);
      lines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += lineHeight;
      });
    });

    // Add booking form specific content
    if (template?.name === 'Booking Form') {
      yPosition += 15;
      pdf.setFontSize(14);
      pdf.text('Terms & Conditions:', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(9);
      const terms = [
        '1. The booking amount is non-refundable and will be adjusted against total sale consideration.',
        '2. Customer agrees to complete purchase within 30 days from booking date.',
        '3. All statutory approvals are responsibility of the developer.',
        '4. Customer has inspected the property and is satisfied with its condition.',
        '5. Any disputes shall be subject to jurisdiction of local courts.'
      ];

      terms.forEach(term => {
        const lines = pdf.splitTextToSize(term, maxWidth);
        lines.forEach((line: string) => {
          pdf.text(line, 20, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 3;
      });
    }

    // Add signatures section
    yPosition += 20;
    pdf.setFontSize(12);
    pdf.text('Signatures:', 20, yPosition);
    yPosition += 20;

    pdf.line(20, yPosition, 80, yPosition);
    pdf.line(120, yPosition, 180, yPosition);

    pdf.setFontSize(10);
    pdf.text('Seller/Customer', 20, yPosition + 10);
    pdf.text('Company Representative', 120, yPosition + 10);

    return pdf;
  };

  const handleDownload = () => {
    const pdf = generatePDFSync();
    pdf.save(`${template?.name || 'document'}-${documentData.document_id || 'DOC001'}.pdf`);
  };

  const handlePreview = () => {
    const pdf = generatePDFSync();
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  const handleShare = () => {
    const pdf = generatePDFSync();
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    if (navigator.share) {
      navigator.share({
        title: template?.name || 'Document',
        text: 'Sharing document from ResaleExpert',
        url: pdfUrl
      });
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(pdfUrl);
      alert('PDF link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              className={`p-2 rounded-lg transition-colors ${viewMode === 'preview'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 hover:bg-gray-200'
                }`}
              onClick={() => setViewMode('preview')}
              title="Preview Mode"
            >
              <Eye size={16} />
            </button>
            <button
              className={`p-2 rounded-lg transition-colors ${viewMode === 'code'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 hover:bg-gray-200'
                }`}
              onClick={() => setViewMode('code')}
              title="Code Mode"
            >
              <Code size={16} />
            </button>
            <button
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => setIsMaximized(!isMaximized)}
              title="Toggle Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              onClick={handlePreview}
            >
              <FileText size={14} />
              <span>Preview PDF</span>
            </button>
            <button
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              onClick={handleDownload}
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
            <button
              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
              onClick={handleShare}
            >
              <Share size={14} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`p-4 ${isMaximized ? 'fixed inset-0 z-50 bg-white' : ''}`}>
        <div className="border border-gray-200 rounded-lg bg-gray-50 min-h-[400px]">
          {viewMode === 'preview' ? (
            <div className="p-3 bg-white m-2 rounded shadow-sm w-full h-[700px] overflow-y-auto">
              <div
                className="w-full"
                dangerouslySetInnerHTML={{ __html: generatePreviewContent() }}
              />
            </div>
          ) : (
            <div className="p-3 bg-gray-900 text-green-400 m-2 rounded font-mono text-xs 
            overflow-x-auto overflow-y-auto max-h-[700px] w-full">
              <pre className="whitespace-pre-wrap break-words">
                {generatePreviewContent()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Live preview with current data •{' '}
            {viewMode === 'preview' ? 'Visual Mode' : 'HTML Code Mode'}
          </div>
        </div>
      </div>

      {/* Exit Fullscreen Button (Fixed Top-Right) */}
      {isMaximized && (
        <button
          className="fixed top-4 right-4 z-[100] px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors"
          onClick={() => setIsMaximized(false)}
        >
          Exit Fullscreen
        </button>
      )}
    </div>
  );

};

export default DocumentPreview;  