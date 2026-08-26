import React, { useState, useRef, useEffect } from "react";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserProfileMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            {/* Profile Button */}
            <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                        {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>

                {/* Avatar or Fallback Icon */}
                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt="User Avatar"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <UserIcon className="h-5 w-5 text-gray-600" />
                    )}
                </div>
            </div>

            {/* Dropdown Menu */}
            {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    {/* User Info */}
                    <div className="p-3 border-b border-gray-100 flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="User Avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <UserIcon className="h-5 w-5 text-gray-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>

                    {/* Menu Options */}
                    <ul className="py-2">
                        <li>
                            <button
                                onClick={() => (window.location.href = "/dashboard/profile")}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                                Profile
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => (window.location.href = "/dashboard/settings")}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Settings className="h-4 w-4 mr-2 text-gray-500" />
                                Settings
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={async () => {
                                  try {
                                    await logout();
                                  } catch (e) {
                                    console.error("Logout error:", e);
                                  } finally {
                                    window.location.href = "/login";
                                  }
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfileMenu;
