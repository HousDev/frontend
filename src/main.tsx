// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import { ErrorBoundary } from './components/ErrorBoundary.tsx'
// import './index.css'
// import App from './App.tsx'
// import { SystemSettingsProvider } from "@/contexts/SystemSettingsContext";
// import 'react-phone-input-2/lib/style.css';

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <ErrorBoundary>
//       <SystemSettingsProvider>
//         <App />
//       </SystemSettingsProvider>
//     </ErrorBoundary>
//   </StrictMode>,
// )

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import "./index.css";
import App from "./App.tsx";
import { SystemSettingsProvider } from "@/contexts/SystemSettingsContext";
import "react-phone-input-2/lib/style.css";

/* ---------- react-pdf setup ---------- */
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// ✅ Vite-safe worker (ESM) — note the .mjs
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/* If you ever need the ?url variant instead:
   import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
   pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
*/

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <SystemSettingsProvider>
        <App />
      </SystemSettingsProvider>
    </ErrorBoundary>
  </StrictMode>
);
