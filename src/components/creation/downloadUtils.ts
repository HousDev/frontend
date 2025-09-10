import { A4_WIDTH_PX, A4_HEIGHT_PX, PAGE_PADDING, HEADER_HEIGHT, FOOTER_HEIGHT } from './constants';
import { TemplateData, DocumentSettings } from './types';

export const handleDownloadPDF = (
  pages: string[],
  templateData: TemplateData,
  documentSettings: DocumentSettings
) => {
  const { headerTitle, logoUrl, watermarkText, watermarkOpacity } = documentSettings;

  const pageBoxes = pages.map((html, idx) => `
    <div class="page">
      <div class="header">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo" />` : ''}
        <div class="title">${headerTitle || 'Document Title'}</div>
      </div>

      ${watermarkText ? `
      <div class="wm-overlay">
        <div class="wm-text">${watermarkText}</div>
      </div>` : ''}

      <div class="content">
        <div class="page-content-inner">${html}</div>
      </div>

      <div class="footer">
        <span>${templateData.name || 'Untitled Template'}</span>
        <span>Page ${idx + 1} of ${pages.length}</span>
      </div>
    </div>
  `).join('');

  const w = window.open('', '_blank');
  if (!w) return;

  w.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${templateData.name || 'Document'}</title>
        <style>
          @page { size: A4; margin: 0; }
          html,body{ margin:0; padding:0; background:#f5f5f5; }
          .page{
            width: ${A4_WIDTH_PX}px; height: ${A4_HEIGHT_PX}px;
            margin: 12px auto; background:#fff; position:relative;
            overflow:hidden; border:1px solid #e5e7eb; border-radius:8px;
          }
          .header{
            position:absolute; left:${PAGE_PADDING}px; right:${PAGE_PADDING}px;
            top:${PAGE_PADDING}px; height:${HEADER_HEIGHT - 8}px;
            display:flex; align-items:center; border-bottom:1px solid #e5e7eb; padding-bottom:8px;
            font-family: Arial, sans-serif;
          }
          .logo{ height:${HEADER_HEIGHT - 24}px; width:auto; margin-right:12px; }
          .title{ font-weight:700; font-size:18px; color:#111827; }
          .content{
            position:absolute; left:${PAGE_PADDING}px; right:${PAGE_PADDING}px;
            top:${PAGE_PADDING + HEADER_HEIGHT}px; bottom:${PAGE_PADDING + FOOTER_HEIGHT}px;
            overflow:hidden;
          }
          .page-content-inner{
            font-family: Arial, sans-serif; font-size:14px; line-height:1.6; color:#111827;
            box-sizing:border-box; padding-bottom:1px;
          }
          .footer{
            position:absolute; left:${PAGE_PADDING}px; right:${PAGE_PADDING}px;
            bottom:${PAGE_PADDING}px; height:${FOOTER_HEIGHT - 8}px;
            display:flex; align-items:center; justify-content:space-between;
            border-top:1px solid #e5e7eb; padding-top:8px; font:12px Arial, sans-serif; color:#6b7280;
          }
          .wm-overlay{
            position:absolute; left:${PAGE_PADDING}px; right:${PAGE_PADDING}px;
            top:${PAGE_PADDING}px; bottom:${PAGE_PADDING}px;
            display:flex; align-items:center; justify-content:center; pointer-events:none; user-select:none;
          }
          .wm-text{
            transform: rotate(-30deg); font-size:84px; font-weight:700; letter-spacing:6px;
            color:#000; opacity:${watermarkOpacity}; text-transform:uppercase; text-align:center; line-height:1;
            white-space:pre-wrap;
          }
          @media print {
            body{ background:#fff; }
            .page{ margin:0; border:none; border-radius:0; page-break-after:always; }
          }
        </style>
      </head>
      <body>${pageBoxes}</body>
    </html>
  `);
  w.document.close();
  w.focus();
  w.print();   // user can "Save as PDF"
};