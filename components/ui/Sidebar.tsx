'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronLeft, User, Settings, LogOut } from 'lucide-react';

interface MenuItem {
  href: string;
  name: string;
  iconSrc: string; // Path ke gambar icon
}

interface SidebarProps {
  menuItems: MenuItem[];
  title: string;
  subtitle: string;
  logoSrc: string; // Path ke logo
  onLogout: () => void;
}

export default function Sidebar({ 
  menuItems, 
  title, 
  subtitle, 
  logoSrc,
  onLogout 
}: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    setIsLogoutPopupOpen(false);
    onLogout();
  };

  return (
    <aside 
      className={`${
        isSidebarOpen ? "w-72" : "w-24"
      } bg-white border-r border-gray-200 flex flex-col fixed h-full z-30 transition-all duration-300 ease-in-out`}
    >
      {/* HEADER */}
      <div 
        className={`h-24 flex items-center cursor-pointer border-b border-gray-200 hover:bg-gray-50 transition-colors ${
          isSidebarOpen ? "px-6 justify-between" : "justify-center px-0"
        }`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image 
              src={logoSrc} 
              alt="Logo" 
              fill 
              className="object-contain" 
              priority 
            />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col justify-center whitespace-nowrap">
              <span className="font-bold text-xl text-gray-800 leading-none">
                {title}
              </span>
              <span className="text-sm text-gray-400 font-medium mt-1">
                {subtitle}
              </span>
            </div>
          )}
        </div>
        {isSidebarOpen && (
          <ChevronLeft size={28} className="text-white" />
        )}
      </div>

      {/* MENU NAVIGASI */}
      <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center w-full p-4 text-base font-medium rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gray-100 text-black shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              } ${isSidebarOpen ? "gap-4 justify-start" : "justify-center"}`}
            >
              <div className="relative w-5 h-5 flex-shrink-0">
                <Image 
                  src={item.iconSrc} 
                  alt={item.name} 
                  fill 
                  sizes="28px" 
                  className="object-contain" 
                />
              </div>
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER LOGOUT */}
      <div className="p-5 border-t border-gray-100 relative">
        {isLogoutPopupOpen && (
          <div 
            className={`absolute bottom-full left-0 mb-3 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50 ${
              isSidebarOpen ? "w-[calc(100%-40px)] mx-5" : "w-56 left-20"
            }`}
          >
            <div className="py-2">
              <button className="w-full text-left px-5 py-3 text-base text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                <User size={20} /> Profile
              </button>
              <button className="w-full text-left px-5 py-3 text-base text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                <Settings size={20} /> Settings
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-5 py-3 text-base text-red-600 hover:bg-red-50 font-medium flex items-center gap-3"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>
        )}
        <div 
          className={`flex items-center p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group ${
            isSidebarOpen ? "gap-4 justify-start" : "justify-center"
          }`} 
          onClick={() => setIsLogoutPopupOpen(!isLogoutPopupOpen)}
        >
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image 
              src="/images/icons/logout.png" 
              alt="Logout" 
              fill 
              className="object-contain" 
            />
          </div>
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-700 truncate">Logout</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}