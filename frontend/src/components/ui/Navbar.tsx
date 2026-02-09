import React, { useState } from 'react';
import { Menu, X, LogOut, User, Plus } from 'lucide-react';
import { Button } from './Button';
interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole?: 'user' | 'admin';
  onLogout: () => void;
}
export function Navbar({
  currentPage,
  onNavigate,
  userRole,
  onLogout
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
  {
    name: 'Browse Items',
    value: 'browse'
  },
  {
    name: 'Incoming Requests',
    value: 'incoming'
  },
  {
    name: 'My Requests',
    value: 'outgoing'
  },
  {
    name: 'History',
    value: 'history'
  }];

  if (userRole === 'admin') {
    navItems.push({
      name: 'Admin Dashboard',
      value: 'admin'
    });
  }
  return (
    <nav className="border-b border-neutral-200 bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div
              className="flex flex-shrink-0 items-center cursor-pointer"
              onClick={() => onNavigate('browse')}>

              <img
                src="/logo.png"
                alt="ReWear"
                className="h-9 w-auto" />

            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) =>
              <button
                key={item.value}
                onClick={() => onNavigate(item.value)}
                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${currentPage === item.value ? 'border-brand-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>

                  {item.name}
                </button>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('additem')}
              className="mr-3">

              <Plus className="mr-1.5 h-4 w-4" />
              Add Item
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500">

              <span className="sr-only">Open main menu</span>
              {isOpen ?
              <X className="block h-6 w-6" /> :

              <Menu className="block h-6 w-6" />
              }
            </button>
          </div>
        </div>
      </div>

      {isOpen &&
      <div className="sm:hidden bg-white border-b border-neutral-200">
          <div className="space-y-1 pb-3 pt-2">
            {navItems.map((item) =>
          <button
            key={item.value}
            onClick={() => {
              onNavigate(item.value);
              setIsOpen(false);
            }}
            className={`block w-full text-left border-l-4 py-2 pl-3 pr-4 text-base font-medium ${currentPage === item.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'}`}>

                {item.name}
              </button>
          )}
            <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="block w-full text-left border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700">

              Logout
            </button>
            <div className="px-3 pt-2 pb-1">
              <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => {
                onNavigate('additem');
                setIsOpen(false);
              }}>

                <Plus className="mr-1.5 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      }
    </nav>);

}