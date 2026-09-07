// frontend/src/pages/communication/UserMyChatsPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { UserMyChatsDesk } from "./components/UserMyChatsDesk";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";

export const UserMyChatsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header / Breadcrumb Bar */}
      <header className="bg-[#0f2b3d] text-white px-4 sm:px-6 py-3 shrink-0 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/buyer-dashboard"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-base font-bold tracking-tight">My Property Inquiries</h1>
              <div className="flex items-center gap-1 text-[11px] text-slate-300">
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight size={10} />
                <Link to="/buyer-dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
                <ChevronRight size={10} />
                <span className="text-orange-400 font-medium">My Chats</span>
              </div>
            </div>
          </div>

          <Link
            to="/properties"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors shadow-xs"
          >
            <Home size={13} />
            <span>Search Properties</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 max-w-7xl w-full mx-auto flex flex-col">
        <div className="flex-1 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden min-h-[500px]">
          <UserMyChatsDesk />
        </div>
      </main>
    </div>
  );
};

export default UserMyChatsPage;
