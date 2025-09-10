import { Variable } from './types';

export const A4_WIDTH_PX = 794;   // ~210mm @ 96dpi
export const A4_HEIGHT_PX = 1123; // ~297mm @ 96dpi

// Layout constants for header/footer/padding within the page box
export const PAGE_PADDING = 24;        // inner padding
export const HEADER_HEIGHT = 90;       // fixed header inside page
export const FOOTER_HEIGHT = 60;       // fixed footer inside page

export const availableVariables: Variable[] = [
  // Personal
  { name: 'seller_name', label: 'Seller Name', category: 'personal' },
  { name: 'buyer_name', label: 'Buyer Name', category: 'personal' },
  { name: 'seller_phone', label: 'Seller Phone', category: 'personal' },
  { name: 'buyer_phone', label: 'Buyer Phone', category: 'personal' },
  { name: 'seller_email', label: 'Seller Email', category: 'personal' },
  { name: 'buyer_email', label: 'Buyer Email', category: 'personal' },
  { name: 'sales_executive', label: 'Sales Executive', category: 'personal' },

  // Property
  { name: 'property_address', label: 'Property Address', category: 'property' },
  { name: 'property_type', label: 'Property Type', category: 'property' },
  { name: 'property_area', label: 'Property Area', category: 'property' },
  { name: 'unit_number', label: 'Unit Number', category: 'property' },
  { name: 'society_name', label: 'Society Name', category: 'property' },

  // Financial
  { name: 'sale_amount', label: 'Sale Amount', category: 'financial' },
  { name: 'token_amount', label: 'Token Amount', category: 'financial' },
  { name: 'booking_amount', label: 'Booking Amount', category: 'financial' },
  { name: 'commission_rate', label: 'Commission Rate', category: 'financial' },

  // Date
  { name: 'document_date', label: 'Document Date', category: 'date' },
  { name: 'agreement_date', label: 'Agreement Date', category: 'date' },
  { name: 'possession_date', label: 'Possession Date', category: 'date' }
];

// measure exact content area (width/height) by rendering a hidden page skeleton
export const computeContentMetrics = () => {
  const host = document.createElement('div');
  host.style.position = 'absolute';
  host.style.left = '-99999px';
  host.style.top = '0';
  host.style.width = `${A4_WIDTH_PX}px`;
  host.style.height = `${A4_HEIGHT_PX}px`;
  host.style.borderRadius = '8px';
  host.style.overflow = 'hidden';
  host.style.background = 'white';
  document.body.appendChild(host);

  const contentBox = document.createElement('div');
  contentBox.style.position = 'absolute';
  contentBox.style.left = `${PAGE_PADDING}px`;
  contentBox.style.right = `${PAGE_PADDING}px`;
  contentBox.style.top = `${PAGE_PADDING + HEADER_HEIGHT}px`;
  contentBox.style.bottom = `${PAGE_PADDING + FOOTER_HEIGHT}px`;
  host.appendChild(contentBox);

  const rect = contentBox.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);

  document.body.removeChild(host);
  return { contentWidth: width, usableHeight: height };
};

export const buildDefaultContent = (title = '{{document_title}}') => `
  <div style="font-family: Arial, sans-serif; padding: 0; line-height: 1.6;">
    <div style="margin-bottom: 16px;">
      <h1 style="color: #333; margin: 0 0 6px 0; font-size: 20px;">${title}</h1>
      <p style="color: #666; margin: 0;">Document ID: {{document_id}} &nbsp;|&nbsp; Date: {{document_date}}</p>
    </div>
    <div style="margin-bottom: 20px;">
      <h2 style="color: #444; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin: 0 0 8px;">Document Details</h2>
      <p style="margin: 0 0 8px;">This is a new template. Customize this content with your document structure.</p>
      <p style="margin: 0;"><strong>Template Variables:</strong> Use variables like {{seller_name}}, {{buyer_name}}, {{property_address}}, etc.</p>
    </div>
    <div style="margin-top: 24px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
        <div style="text-align: center;">
          <div style="border-top: 1px solid #333; padding-top: 10px; margin-top: 30px;">
            <p style="margin: 0 0 4px;"><strong>Party 1 Signature</strong></p>
            <p style="color: #666; margin: 0;">{{seller_name}}</p>
          </div>
        </div>
        <div style="text-align: center;">
          <div style="border-top: 1px solid #333; padding-top: 10px; margin-top: 30px;">
            <p style="margin: 0 0 4px;"><strong>Party 2 Signature</strong></p>
            <p style="color: #666; margin: 0;">{{buyer_name}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`;