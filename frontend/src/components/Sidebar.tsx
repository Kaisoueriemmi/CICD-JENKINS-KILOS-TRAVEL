'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plane,
  Wallet,
  ArrowLeftRight,
  User,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble'
    },
    { 
      name: 'Mes Vols', 
      href: '/flights', 
      icon: Plane,
      description: 'Gérer vos vols'
    },
    { 
      name: 'Wallet', 
      href: '/wallet', 
      icon: Wallet,
      description: 'Solde de kilos'
    },
    { 
      name: 'Transactions', 
      href: '/transactions', 
      icon: ArrowLeftRight,
      description: 'Historique'
    },
    { 
      name: 'Profil', 
      href: '/profile', 
      icon: User,
      description: 'Mes informations'
    },
    { 
      name: 'Abonnement', 
      href: '/subscription', 
      icon: CreditCard,
      description: 'Plan et facturation'
    },
  ];

  const bottomNavigation = [
    { 
      name: 'Paramètres', 
      href: '/settings', 
      icon: Settings 
    },
    { 
      name: 'Aide', 
      href: '/help', 
      icon: HelpCircle 
    },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  return (
    <div
      className={`
        relative bg-white border-r min-h-screen transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white border rounded-full p-1.5 shadow-md hover:shadow-lg transition-all z-10 hover:scale-110"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Logo Section */}
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="relative">
            <Plane className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AirWeight
            </span>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-3 rounded-lg transition-all
                  ${active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }
                  ${isCollapsed ? 'justify-center' : 'space-x-3'}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`} />
                {!isCollapsed && (
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 group-hover:text-gray-600">
                      {item.description}
                    </p>
                  </div>
                )}
                {!isCollapsed && active && (
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t px-3 py-4">
        <div className="space-y-1">
          {bottomNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-lg transition-all
                  ${active
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isCollapsed ? 'justify-center' : 'space-x-3'}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t px-6 py-4">
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p className="font-medium">AirWeight v1.0.0</p>
            <p>© 2026 - MVP</p>
          </div>
        </div>
      )}
    </div>
  );
}
