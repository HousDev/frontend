import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Save, X, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered,
  Image as ImageIcon, Table as TableIcon,
  Code, Undo2, Redo2, Printer, Maximize2, Minimize2, Download, Upload, FileText
} from 'lucide-react';
import systemSettingsAPI from '@/lib/systemSettingsAPI';
import VariablePanel, { MappedVariable } from './VariablePanel';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

// ###################################################################################
// SECTION: TYPE DEFINITIONS
// ###################################################################################

type Template = {
  id?: string | number;
  name?: string;
  description?: string;
  category?: string;
  content?: string;
  variables?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
  usage_count?: number;
  created_by?: string | number;   // <- keep type flexible
  updated_by?: string | number;   // <- NEW
  lastUsed?: string;
};

type Props = {
  template?: Template | null;
  onSave: (t: Template) => void;
  onClose: () => void;
  currentUserId: string | number;
};

type TemplateDef = { id: string; name: string; html: string };

// ###################################################################################
// SECTION: CONSTANTS AND CONFIGURATION
// ###################################################################################

const FONT_SIZES = [
  { label: "8 pt", sizeCmd: 1 }, { label: "10 pt", sizeCmd: 2 }, { label: "12 pt", sizeCmd: 3 },
  { label: "14 pt", sizeCmd: 4 }, { label: "18 pt", sizeCmd: 5 }, { label: "24 pt", sizeCmd: 6 },
  { label: "36 pt", sizeCmd: 7 },
];

const FONT_FAMILIES = [
  "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial", "Arial", "Times New Roman",
  "Georgia", "Verdana", "Tahoma", "Courier New", "Monaco", "Calibri", "Garamond",
];

const CATEGORIES = ['all', 'buyer', 'seller', 'property', 'leads', 'account', 'company', 'common'];

const A4_CSS = `<title>RESALE EXPERT</title><style>body{background:rgb(204,204,204);font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;line-height:1.3 !important;}#printDialog{width:230mm;height:100%;margin:0 auto;padding:0;font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;background:rgb(204,204,204);line-height:1.3 !important;}*{box-sizing:border-box;-moz-box-sizing:border-box;}.main-page{width:210mm;min-height:297mm;margin:10mm auto;background:white;box-shadow:0 0 0.5cm rgba(0,0,0,0.5);}.sub-page{margin-left:50px;margin-right:50px;font-size:13px;}@page{size:A4;margin:0;}@media print{html,body{width:210mm;height:297mm;}.main-page{margin:0;border:initial;border-radius:initial;width:initial;min-height:initial;box-shadow:initial;background:initial;page-break-after:always;}a:link{text-decoration:none !important;}a[href]:after{content:none !important;}}.left{float:left;} .right{float:right;}.companylogo{width:180px;height:60px;} .projectlogo{width:180px;height:60px;}.footerlogo{width:180px;height:60px;}hr.new1{border-top:1px solid;}.div-table{border:1px solid #000;border-collapse:collapse;font-size:11px;}.div-table-row{border:1px solid #000;border-collapse:collapse;}.div-table-col{border:1px solid #000;border-collapse:collapse;padding-left:5px;}table{font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;border-collapse:unset;}</style>`;
const LEGAL_CSS = `<title>RESALE EXPERT</title><style>body{background:rgb(204,204,204);font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;line-height:1.3 !important;}#printDialog{width:236mm;height:100%;margin:0 auto;padding:0;font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;background:rgb(204,204,204);line-height:1.3 !important;}*{box-sizing:border-box;-moz-box-sizing:border-box;}.main-page{width:216mm;min-height:356mm;margin:10mm auto;background:white;box-shadow:0 0 0.5cm rgba(0,0,0,0.5);}.sub-page{margin-left:50px;margin-right:50px;font-size:13px;}@page{size:Legal;margin:0;}@media print{html,body{width:216mm;height:356mm;}.main-page{margin:0;border:initial;border-radius:initial;width:initial;min-height:initial;box-shadow:initial;background:initial;page-break-after:always;}a:link{text-decoration:none !important;}a[href]:after{content:none !important;}}.left{float:left;} .right{float:right;}.companylogo{width:180px;height:60px;} .projectlogo{width:180px;height:60px;}.footerlogo{width:180px;height:60px;}hr.new1{border-top:1px solid;}.div-table{border:1px solid #000;border-collapse:collapse;font-size:11px;}.div-table-row{border:1px solid #000;border-collapse:collapse;}.div-table-col{border:1px solid #000;border-collapse:collapse;padding-left:5px;}table{font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;border-collapse:unset;}</style>`;

const TEMPLATES: TemplateDef[] = [
  { id: "blank-legal", name: "Legal • Blank Page", html: `<!doctype html><html><head>${LEGAL_CSS}</head><body id="printDialog"><div class="main-page"><div class="sub-page" style="padding-top:24px;padding-bottom:24px;"><p style="color:#000000;margin:0 0 8px 0;">(Blank Legal page)</p><br></div></div></body></html>` },
  { id: "blank-a4", name: "A4 • Blank Page", html: `<!doctype html><html><head>${A4_CSS}</head><body id="printDialog"><div class="main-page"><div class="sub-page" style="padding-top:24px;padding-bottom:24px;"><p style="color:#000000;margin:0 0 8px 0;">(Blank A4 page)</p><br></div></div></body></html>` },
  { id: "blank-receipt", name: "A4 • Blank Receipt", html: `<!doctype html><html><head>${A4_CSS}</head><body id="printDialog"><div class="main-page"><div class="sub-page"><table width="100%" style="padding-top:24px"><tbody><tr><td style="width:50%;vertical-align:top;"><img src="{{company_logo}}" alt="Company Logo" class="companylogo"/><h2 style="margin:8px 0 0;color:#0c3854;">Resale Expert</h2><div style="color:#000000;">Address line 1<br/>City, State PIN<br/>+91-XXXXXXXXXX</div></td><td style="text-align:right;vertical-align:top;"><h1 style="margin:0;color:#E6761D;">RECEIPT</h1><div>Date: <strong>__ / __ / ____</strong></div><div>Receipt No: <strong>RE-0001</strong></div></td></tr></tbody></table><hr class="new1" style="margin:16px 0"/><table width="100%" class="div-table"><tbody><tr class="div-table-row"><td class="div-table-col" style="width:25%;">Received From</td><td class="div-table-col" colspan="3">[Buyer / Client Name]</td></tr><tr class="div-table-row"><td class="div-table-col">Amount</td><td class="div-table-col">₹ ___________</td><td class="div-table-col">Mode</td><td class="div-table-col">Cash / UPI / Cheque</td></tr><tr class="div-table-row"><td class="div-table-col">Against</td><td class="div-table-col" colspan="3">[Property / Service]</td></tr></tbody></table><p style="margin-top:24px;">Notes: ____________________________________________________________________</p><table width="100%" style="margin-top:48px;"><tr><td style="width:50%;"></td><td style="text-align:right;"><div>For <strong>Resale Expert</strong></div><div style="margin-top:48px;">Authorised Signatory</div></td></tr></table></div></div></body></html>` },
  { id: "letterhead", name: "A4 • Letterhead", html: `<!doctype html><html><head>${A4_CSS}</head><body id="printDialog"><div class="main-page"><div class="sub-page"><table width="100%" style="padding-top:24px"><tr><td style="vertical-align:middle;"><img src="{{company_logo}}" alt="Company Logo" class="companylogo"/></td><td style="text-align:right;"><div style="font-size:12px;color:#000000;">www.resale.expert<br/>hello@resale.expert<br/>+91-XXXXXXXXXX</div></td></tr></table><hr class="new1" style="margin:16px 0 24px"/><h2 style="margin:0;color:#0c3854;">Subject: ______________________________</h2><p style="margin:16px 0;">Dear ________,</p><p>[Compose your letter here…]</p><p style="margin-top:32px;">Regards,<br/><strong>Resale Expert</strong></p><hr class="new1" style="margin-top:40px"/><div style="text-align:center;color:#000000;font-size:11px;padding:8px 0;">Registered Office • Address line 1 • City • State • PIN</div></div></div></body></html>` },
  { id: "property-brochure", name: "A4 • Property Brochure (1-pg)", html: `<!doctype html><html><head>${A4_CSS}</head><body id="printDialog"><div class="main-page"><div class="sub-page"><table width="100%" style="padding-top:24px;"><tr><td><h1 style="margin:0;color:#E6761D;">Property Brochure</h1><div style="color:#000000;">Project / Society • City</div></td><td style="text-align:right;"><img src="" alt="Project Logo" class="projectlogo"/></td></tr></table><table width="100%" style="margin-top:16px;"><tr><td style="width:50%;vertical-align:top;padding-right:12px;"><div style="height:180px;background:#f3f4f6;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;">Hero Image</div><div style="display:flex;gap:8px;margin-top:8px;"><div style="flex:1;height:80px;background:#f3f4f6;border:1px solid #e5e7eb;"></div><div style="flex:1;height:80px;background:#f3f4f6;border:1px solid #e5e7eb;"></div><div style="flex:1;height:80px;background:#f3f4f6;border:1px solid #e5e7eb;"></div></div></td><td style="vertical-align:top;"><table width="100%" class="div-table"><tr><td class="div-table-col" style="width:40%;">Property Type</td><td class="div-table-col">Apartment</td></tr><tr><td class="div-table-col">Configuration</td><td class="div-table-col">2 BHK</td></tr><tr><td class="div-table-col">Carpet Area</td><td class="div-table-col">____ sq.ft</td></tr><tr><td class="div-table-col">Price</td><td class="div-table-col">₹ ________</td></tr><tr><td class="div-table-col">Location</td><td class="div-table-col">__________</td></tr><tr><td class="div-table-col">RERA</td><td class="div-table-col">__________</td></tr></table><div style="margin-top:12px;"><strong>Amenities:</strong><ul style="margin:8px 0 0 16px;"><li>Clubhouse</li><li>Gym</li><li>Swimming Pool</li><li>Security</li></ul></div></td></tr></table><div style="margin-top:16px;"><strong>Description:</strong><p style="margin-top:8px;">Write a short description of the property here…</p></div></div></div></body></html>` },
  { id: "quotation", name: "A4 • Quotation", html: `<!doctype html><html><head>${A4_CSS}</head><body id="printDialog"><div class="main-page"><div class="sub-page"><table width="100%" style="padding-top:24px"><tr><td><h1 style="margin:0;color:#E6761D;">QUOTATION</h1><div style="color:#000000;">Ref: QT-0001 • Date: __/__/____</div></td><td style="text-align:right;"><img src="" alt="Company Logo" class="companylogo"/></td></tr></table><table width="100%" class="div-table" style="margin-top:12px;"><tr class="div-table-row"><td class="div-table-col" style="width:20%;">To</td><td class="div-table-col">[Client Name]</td></tr><tr class="div-table-row"><td class="div-table-col">Email</td><td class="div-table-col">client@email.com</td></tr><tr class="div-table-row"><td class="div-table-col">Phone</td><td class="div-table-col">+91-XXXXXXXXXX</td></tr></table><table width="100%" class="div-table" style="margin-top:16px;"><thead><tr class="div-table-row"><th class="div-table-col" style="width:8%;">#</th><th class="div-table-col">Description</th><th class="div-table-col" style="width:15%;">Qty</th><th class="div-table-col" style="width:18%;">Rate (₹)</th><th class="div-table-col" style="width:18%;">Amount (₹)</th></tr></thead><tbody><tr class="div-table-row"><td class="div-table-col">1</td><td class="div-table-col">Service / Unit</td><td class="div-table-col">1</td><td class="div-table-col">0.00</td><td class="div-table-col">0.00</td></tr><tr class="div-table-row"><td class="div-table-col">2</td><td class="div-table-col">Service / Unit</td><td class="div-table-col">1</td><td class="div-table-col">0.00</td><td class="div-table-col">0.00</td></tr></tbody></table><table width="40%" align="right" class="div-table" style="margin-top:12px;"><tr class="div-table-row"><td class="div-table-col">Subtotal</td><td class="div-table-col">₹ 0.00</td></tr><tr class="div-table-row"><td class="div-table-col">Taxes</td><td class="div-table-col">₹ 0.00</td></tr><tr class="div-table-row"><td class="div-table-col"><strong>Total</strong></td><td class="div-table-col"><strong>₹ 0.00</strong></td></tr></table><div style="clear:both;"></div><p style="margin-top:24px;"><strong>Terms & Conditions:</strong><br/>— Valid for 7 days • — Payment terms • — Other notes</p></div></div></body></html>` },
  { id: "agreement-summary", name: "A4 • Agreement Summary", html: `<!doctype html><html><head>${A4_CSS}</head><body id="printDialog"><div class="main-page"><div class="sub-page"><h1 style="margin:24px 0 8px;color:#E6761D;">Agreement Summary</h1><table width="100%" class="div-table"><tr class="div-table-row"><td class="div-table-col" style="width:30%;">Buyer</td><td class="div-table-col">{{buyer_name}}</td></tr><tr class="div-table-row"><td class="div-table-col">Seller</td><td class="div-table-col">{{seller_name}}</td></tr><tr class="div-table-row"><td class="div-table-col">Property</td><td class="div-table-col">{{property_address}}</td></tr><tr class="div-table-row"><td class="div-table-col">Agreement Value</td><td class="div-table-col">₹ {{sale_amount}}</td></tr><tr class="div-table-row"><td class="div-table-col">Date</td><td class="div-table-col">{{agreement_date}}</td></tr></table><h3 style="margin:16px 0 8px;color:#0c3854;">Clauses</h3><ol style="margin:0 0 0 18px;"><li>Clause 1…</li><li>Clause 2…</li><li>Clause 3…</li></ol><table width="100%" style="margin-top:32px;"><tr><td style="width:50%;vertical-align:top;"><div><strong>Buyer Signature</strong></div><div style="height:60px;border:1px dashed #9ca3af;margin-top:8px;"></div></td><td style="vertical-align:top;text-align:right;"><div><strong>Seller Signature</strong></div><div style="height:60px;border:1px dashed #9ca3af;margin-top:8px;"></div></td></tr></table></div></div></body></html>` }
];

// Helper functions
const hasA4Shell = (html: string) => /class\s*=\s*["']main-page["']/.test(html) && /class\s*=\s*["']sub-page["']/.test(html);
const wrapInBlankA4 = (innerHTML: string) => `<!doctype html><html><head>${A4_CSS}</head><body id="printDialog"><div class="main-page"><div class="sub-page" style="padding-top:24px;padding-bottom:24px;">${innerHTML}</div></div></body></html>`;
const tidy = (s: string) => s.replace(/\s+$/g, "");

function injectIntoTemplate(templateHTML: string, inner: string) {
  const openTagMatch = templateHTML.match(/<div[^>]*class=["'][^"']*sub-page[^"']*["'][^>]*>/i);
  if (!openTagMatch) return wrapInBlankA4(inner);
  const openTag = openTagMatch[0];
  const start = templateHTML.indexOf(openTag) + openTag.length;
  const end = templateHTML.indexOf("</div>", start);
  if (end === -1) return wrapInBlankA4(inner);
  return templateHTML.slice(0, start) + inner + templateHTML.slice(end);
}

function extractVariables(s: string): string[] {
  if (!s) return [];
  const matches = s.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
  const names = matches.map(m => m.slice(2, -2));
  return Array.from(new Set(names));
}

// TemplateEditor.tsx (same trick DocumentForm/Preview me bhi laga sakte ho)
const toAbsolute = (u?: string) => {
  if (!u) return '';
  if (/^(data:|https?:|blob:)/i.test(u)) return u;
  const base = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
  try { return new URL(u, base).href; } catch { return u; }
};


function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function applyLogosToDocument(html: string, headerDataUrl?: string, footerDataUrl?: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (headerDataUrl) {
      (doc.querySelectorAll("img.companylogo") as NodeListOf<HTMLImageElement>).forEach(img => {
        img.setAttribute("src", headerDataUrl);
        img.setAttribute("alt", img.getAttribute("alt") || "Company Logo");
      });
    }
    if (footerDataUrl) {
      (doc.querySelectorAll("img.footerlogo") as NodeListOf<HTMLImageElement>).forEach(img => {
        img.setAttribute("src", footerDataUrl);
        img.setAttribute("alt", img.getAttribute("alt") || "Footer Logo");
      });
    }

    const hasDoctype = /^\s*<!doctype/i.test(html);
    const rebuilt = doc.documentElement.outerHTML;
    return (hasDoctype ? "<!doctype html>" : "") + rebuilt;
  } catch {
    return html;
  }
}

// ###################################################################################
// SECTION: MAIN COMPONENT
// ###################################################################################

const TemplateEditor: React.FC<Props> = ({ template, onSave, onClose }) => {
  // STATE
  const [variables, setVariables] = useState<string[]>([]);
  const [availableVariables, setAvailableVariables] = useState<MappedVariable[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    category: 'deal',
    status: 'draft'
  });

  const [content, setContent] = useState<string>('');
  const [mode, setMode] = useState<'visual' | 'source'>('visual');
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("blank-a4");
  const [headerLogo, setHeaderLogo] = useState<string>('');
  const [footerLogo, setFooterLogo] = useState<string>('');

  // REFS
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerLogoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();


  const [templates, setTemplates] = useState<Template[]>([]);
  // Load system settings for logos
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await systemSettingsAPI.getSettings();
        const settings = res?.data;

        if (settings?.company_logo) {
          setHeaderLogo(settings.company_logo);
        }
        if (settings?.footer_logo) {
          setFooterLogo(settings.footer_logo);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    fetchSettings();
  }, []);

  const currentUserId = useMemo(
  () => (user?.id  ?? null),
  [user]
);

useEffect(() => {
  (async () => {
    try {
      const res = await systemSettingsAPI.getSettings();
      const s = res?.data ?? res;
      if (s?.company_logo) setHeaderLogo(toAbsolute(s.company_logo));
      if (s?.footer_logo)  setFooterLogo(toAbsolute(s.footer_logo));
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  })();
}, []);
  // Initialize template data
  useEffect(() => {
    setVariables(template?.variables || []);
    setTemplateData({
      name: template?.name || '',
      description: template?.description || '',
      category: template?.category || 'deal',
      status: template?.status || 'draft',
    });
    const initialContent = template?.content || TEMPLATES.find(t => t.id === "blank-a4")!.html;
    setContent(tidy(initialContent));
  }, [template]);

  // Sync visual editor with content
  useEffect(() => {
    if (mode === "visual" && editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [mode, content]);

  // Apply logos to document
  useEffect(() => {
    if (!headerLogo && !footerLogo) return;
    setContent(prev => {
      const next = applyLogosToDocument(prev, headerLogo, footerLogo);
      if (mode === 'visual' && editorRef.current) {
        editorRef.current.innerHTML = next;
      }
      return next;
    });
  }, [headerLogo, footerLogo, mode]);

  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const insertInRichEditor = (htmlToInsert: string) => {
    if (mode !== 'visual' || !editorRef.current) {
      setContent(prev => prev + htmlToInsert);
      return;
    }

    editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlToInsert;
    const nodeToInsert = tempDiv.firstChild;
    const styleBreaker = document.createTextNode('\u200b');

    if (nodeToInsert) {
      range.insertNode(nodeToInsert);
      range.setStartAfter(nodeToInsert);
      range.setEndAfter(nodeToInsert);
      range.insertNode(styleBreaker);
      range.setStartAfter(styleBreaker);

      selection.removeAllRanges();
      selection.addRange(range);
    }

    document.execCommand('foreColor', false, '#000000');
    setContent(editorRef.current.innerHTML);
  };

  // const handleVariableDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const variableName = e.target.value;
  //   if (!variableName) return;
  //   const styledTag = `<span style="color:#007bff;padding:2px 4px;border-radius:4px;font-weight:500;">{{${variableName}}}</span>`;
  //   insertInRichEditor(styledTag);
  //   setVariables(prev => Array.from(new Set([...prev, variableName])));
  //   e.target.selectedIndex = 0;
  // };

  const handleVariableDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const variableName = e.target.value;
  if (!variableName) return;
  
  // COLOR CHANGE: #007bff (blue) से #000000 (black) करें
  const styledTag = `<span style="color:#000000;padding:2px 4px;border-radius:4px;font-weight:500;">{{${variableName}}}</span>`;
  
  insertInRichEditor(styledTag);
  setVariables(prev => Array.from(new Set([...prev, variableName])));
  e.target.selectedIndex = 0;
};
  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setSelectedTemplateId(id);
    const maybeWithLogos = applyLogosToDocument(t.html, headerLogo, footerLogo);
    setContent(tidy(maybeWithLogos));
    if (editorRef.current && mode === 'visual') {
      editorRef.current.innerHTML = maybeWithLogos;
    }
  };

  const insertTable = () => {
    const rows = parseInt(prompt("Enter number of rows", "3") || "3", 10);
    const cols = parseInt(prompt("Enter number of columns", "3") || "3", 10);
    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) return;
    let tableHTML = `<table style="border-collapse: collapse; width: 100%; border: 1px solid #ccc;"><tbody>`;
    for (let r = 0; r < rows; r++) {
      tableHTML += `<tr>`;
      for (let c = 0; c < cols; c++) {
        tableHTML += `<td style="border: 1px solid #ccc; padding: 8px;">Cell</td>`;
      }
      tableHTML += `</tr>`;
    }
    tableHTML += `</tbody></table><p><br></p>`;
    insertInRichEditor(tableHTML);
  };

  const printDoc = () => {
    const finalHTML = hasA4Shell(content) ? content : wrapInBlankA4(content);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Could not open print window. Please disable your popup blocker.");
      return;
    }
    printWindow.document.write(finalHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const exportHTML = () => {
    let finalDoc = content;
    if (!hasA4Shell(content)) {
      const selected = TEMPLATES.find(t => t.id === selectedTemplateId);
      finalDoc = selected ? injectIntoTemplate(selected.html, content) : wrapInBlankA4(content);
      finalDoc = applyLogosToDocument(finalDoc, headerLogo, footerLogo);
    } else {
      finalDoc = applyLogosToDocument(finalDoc, headerLogo, footerLogo);
    }
    const filename = (templateData.name || "template") + ".html";
    const blob = new Blob([finalDoc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSelectedTemplate = () => {
    const t = TEMPLATES.find(tt => tt.id === selectedTemplateId);
    if (!t) return;
    const withLogos = applyLogosToDocument(t.html, headerLogo, footerLogo);
    const safeName = t.name.replace(/[^\w]+/g, '-').toLowerCase() + ".html";
    const blob = new Blob([withLogos], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importHTML = async (file: File) => {
    const text = await file.text();
    if (!text) return;
    let nextContent: string;
    if (hasA4Shell(text)) {
      nextContent = text;
    } else {
      const selected = TEMPLATES.find(t => t.id === selectedTemplateId);
      nextContent = selected ? injectIntoTemplate(selected.html, text) : wrapInBlankA4(text);
    }
    nextContent = applyLogosToDocument(nextContent, headerLogo, footerLogo);
    setContent(tidy(nextContent));
  };

  const usedVariables = useMemo(() => {
    const found = new Set<string>([
      ...extractVariables(templateData.description),
      ...extractVariables(content),
      ...variables,
    ]);
    return Array.from(found);
  }, [templateData.description, content, variables]);

  const handleSave = () => {
    if (!templateData.name.trim()) {
      toast.warn('Please enter a template name.');
      return;
    }
    const currentContent = mode === 'visual' ? (editorRef.current?.innerHTML || '') : content;
    const allText = templateData.description + currentContent;
    const foundVariables = extractVariables(allText);
    const finalVariables = Array.from(new Set([...variables, ...foundVariables]));

    const templateToSave: Template = {
      ...template,
      ...templateData,
      content: currentContent,
      variables: finalVariables,
      updated_at: new Date().toISOString(),
      id: template?.id || Date.now(),
       created_by: template?.created_by ?? currentUserId,  // keep existing owner if editing; else set current
    updated_by: currentUserId,       
    };

    onSave(templateToSave);
   
    
  };

  const onHeaderLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await readFileAsDataURL(f);
    setHeaderLogo(dataUrl);
    e.target.value = "";
  };

  const onFooterLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await readFileAsDataURL(f);
    setFooterLogo(dataUrl);
    e.target.value = "";
  };

  const groupedAvailable = useMemo(() => {
    if (!availableVariables.length) return {};
    return availableVariables.reduce((acc, v) => {
      const category = v.category || 'common';
      (acc[category] = acc[category] || []).push(v);
      return acc;
    }, {} as Record<string, MappedVariable[]>);
  }, [availableVariables]);

  const filteredVariables = useMemo(() => {
    if (selectedCategory === 'all') {
      return availableVariables;
    }
    return availableVariables.filter(v => v.category === selectedCategory);
  }, [availableVariables, selectedCategory]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div style={{ display: 'none' }}>
        <VariablePanel onLoaded={setAvailableVariables} />
      </div>

      <div
        className={`bg-white rounded-lg shadow-xl w-full flex flex-col ${fullscreen ? "h-screen max-h-screen max-w-full rounded-none" : "max-w-6xl max-h-[95vh]"
          }`}
      >
        {/* HEADER */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-2 rounded-full hover:bg-gray-100"
              title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6">
          {/* METADATA */}
          <fieldset className="border rounded-md p-3 pt-0 space-y-3">
            <legend className="text-xs font-medium text-gray-600 px-1">Template Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Template Name */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Template Name</label>
                <input
                  type="text"
                  value={templateData.name}
                  onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., Sales Agreement"
                  required
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Status</label>
                <select
                  value={templateData.status}
                  onChange={(e) => setTemplateData({ ...templateData, status: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Category</label>
                <select
                  value={templateData.category}
                  onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="deal">Deal</option>
                  <option value="agency">Agency</option>
                  <option value="society">Society</option>
                  <option value="handover">Handover</option>
                  <option value="banking">Banking</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Description</label>
                <textarea
                  ref={descriptionRef}
                  value={templateData.description}
                  onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm h-10 min-h-[40px] resize-y md:resize-none"
                  placeholder="Brief (e.g., {{buyer_name}} allowed)"
                />
              </div>

              {/* Header Logo */}
              <div
                role="button"
                tabIndex={0}
                title="Upload header company logo"
                onClick={() => headerLogoInputRef.current?.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && headerLogoInputRef.current?.click()}
                className="group w-full max-w-sm px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer flex items-center gap-2"
              >
                <div className="flex-1">
                  <div className="text-[11px] font-medium text-gray-800 group-hover:underline">
                    Header Company Logo
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {headerLogo ? 'Click to change' : 'Click to choose'}
                  </div>
                </div>
                <div className="w-24 h-12 rounded border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                  {headerLogo ? (
                    <img src={headerLogo} alt="Header logo preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <ImageIcon className="opacity-60" size={16} />
                  )}
                </div>
                <input
                  ref={headerLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onHeaderLogoSelect}
                  className="hidden"
                  aria-label="Upload header company logo"
                />
              </div>

              {/* Footer Logo */}
              <div
                role="button"
                tabIndex={0}
                title="Upload footer company logo"
                onClick={() => footerLogoInputRef.current?.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && footerLogoInputRef.current?.click()}
                className="group w-full max-w-sm px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer flex items-center gap-2"
              >
                <div className="flex-1">
                  <div className="text-[11px] font-medium text-gray-800 group-hover:underline">
                    Footer Company Logo
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {footerLogo ? 'Click to change' : 'Click to choose'}
                  </div>
                </div>
                <div className="w-24 h-12 rounded border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                  {footerLogo ? (
                    <img src={footerLogo} alt="Footer logo preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <ImageIcon className="opacity-60" size={16} />
                  )}
                </div>
                <input
                  ref={footerLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFooterLogoSelect}
                  className="hidden"
                  aria-label="Upload footer company logo"
                />
              </div>
            </div>
          </fieldset>

          {/* EDITOR */}
          <fieldset className="border rounded-md">
            <legend className="text-sm font-medium text-gray-600 px-2">Template Content</legend>
            <div className="rounded-lg">
              {/* TOOLBAR */}
              <div className="p-1 border-b border-gray-200 sticky top-[-15px] bg-gray-50 z-20 flex flex-wrap items-center gap-1 text-gray-700 shadow-sm">
                {/* Template Selector */}
                <select
                  className="px-2 py-1 text-xs border border-gray-300 rounded mr-2"
                  value={selectedTemplateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                  title="Apply a Predefined Template"
                >
                  {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                <button
                  onClick={downloadSelectedTemplate}
                  title="Download selected template"
                  className="p-2 rounded hover:bg-gray-200 flex items-center gap-1"
                >
                  <FileText size={16} />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Import/Export */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Import HTML"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <Upload size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,text/html"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importHTML(file);
                    e.currentTarget.value = "";
                  }}
                />
                <button
                  onClick={exportHTML}
                  title="Export current editor content"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <Download size={16} />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Formatting Buttons */}
                <button onClick={() => exec('bold')} title="Bold" className="p-2 rounded hover:bg-gray-200">
                  <Bold size={16} />
                </button>
                <button onClick={() => exec('italic')} title="Italic" className="p-2 rounded hover:bg-gray-200">
                  <Italic size={16} />
                </button>
                <button onClick={() => exec('underline')} title="Underline" className="p-2 rounded hover:bg-gray-200">
                  <Underline size={16} />
                </button>
                <button onClick={() => exec('strikeThrough')} title="Strikethrough" className="p-2 rounded hover:bg-gray-200">
                  <Strikethrough size={16} />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Font Controls */}
                <select
                  onChange={(e) => exec("fontName", e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                  title="Font Family"
                >
                  {FONT_FAMILIES.map(f => <option key={f} value={f}>{f.split(",")[0]}</option>)}
                </select>
                <select
                  onChange={(e) => exec("fontSize", e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                  defaultValue="3"
                  title="Font Size"
                >
                  {FONT_SIZES.map(s => <option key={s.label} value={s.sizeCmd}>{s.label}</option>)}
                </select>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Alignment */}
                <button onClick={() => exec('justifyLeft')} title="Align Left" className="p-2 rounded hover:bg-gray-200">
                  <AlignLeft size={16} />
                </button>
                <button onClick={() => exec('justifyCenter')} title="Align Center" className="p-2 rounded hover:bg-gray-200">
                  <AlignCenter size={16} />
                </button>
                <button onClick={() => exec('justifyRight')} title="Align Right" className="p-2 rounded hover:bg-gray-200">
                  <AlignRight size={16} />
                </button>
                <button onClick={() => exec('justifyFull')} title="Justify" className="p-2 rounded hover:bg-gray-200">
                  <AlignJustify size={16} />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Lists and Tables */}
                <button onClick={() => exec('insertUnorderedList')} title="Bulleted List" className="p-2 rounded hover:bg-gray-200">
                  <List size={16} />
                </button>
                <button onClick={() => exec('insertOrderedList')} title="Numbered List" className="p-2 rounded hover:bg-gray-200">
                  <ListOrdered size={16} />
                </button>
                <button onClick={insertTable} title="Insert Table" className="p-2 rounded hover:bg-gray-200">
                  <TableIcon size={16} />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Undo/Redo/Print */}
                <button onClick={() => exec('undo')} title="Undo" className="p-2 rounded hover:bg-gray-200">
                  <Undo2 size={16} />
                </button>
                <button onClick={() => exec('redo')} title="Redo" className="p-2 rounded hover:bg-gray-200">
                  <Redo2 size={16} />
                </button>
                <button onClick={printDoc} title="Print" className="p-2 rounded hover:bg-gray-200">
                  <Printer size={16} />
                </button>
                <button
                  onClick={() => setMode(m => m === 'visual' ? 'source' : 'visual')}
                  title="Toggle Source Code"
                  className={`p-2 rounded hover:bg-gray-200 ${mode === 'source' ? 'bg-blue-100 text-blue-700' : ''}`}
                >
                  <Code size={16} />
                </button>

                {/* Category Filter */}
                <select
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  value={selectedCategory}
                  className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                  title="Filter by category"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Variable Insertion */}
                <select
                  onChange={handleVariableDropdown}
                  className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                  aria-label="Insert a variable"
                  title="Insert variable into page"
                  disabled={availableVariables.length === 0}
                >
                  <option value="" disabled>
                    {availableVariables.length === 0 ? 'Loading...' : 'Insert variable…'}
                  </option>

                  {selectedCategory === 'all' ? (
                    Object.entries(groupedAvailable)
                      .sort(([catA], [catB]) => catA.localeCompare(catB))
                      .map(([category, vars]) => (
                        <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                          {vars.map(v => <option key={v.name} value={v.name}>{v.label}</option>)}
                        </optgroup>
                      ))
                  ) : (
                    filteredVariables.map(v => (
                      <option key={v.name} value={v.name}>{v.label}</option>
                    ))
                  )}
                </select>

                {/* Used Variables Display */}
                <select
                  className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                  title="Variables detected in this template"
                  value=""
                  onChange={() => { }}
                >
                  <option value="">Used variables ({usedVariables.length})</option>
                  {usedVariables.length === 0 ? (
                    <option value="" disabled>None</option>
                  ) : (
                    usedVariables.sort().map(v => (
                      <option key={v} value={v} disabled>
                        {availableVariables.find(av => av.name === v)?.label || v}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* EDITOR AREA */}
              <div className="overflow-hidden">
                {mode === 'visual' ? (
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                    className="min-h-[400px] p-4 text-gray-900 focus:outline-none prose max-w-none"
                    style={{ whiteSpace: "normal" }}
                  />
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-[400px] p-4 font-mono text-sm bg-gray-800 text-green-300 rounded-b-lg focus:outline-none resize-none"
                    placeholder=""
                  />
                )}
              </div>
            </div>
          </fieldset>
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 flex flex-wrap items-center justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={handleSave}
            disabled={!templateData.name.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            <span>{template ? 'Save Changes' : 'Save Template'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;