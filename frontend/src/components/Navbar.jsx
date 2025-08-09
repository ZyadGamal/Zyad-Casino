import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Logo from "./Logo";
import { Button } from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { state: { from: window.location.pathname } });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
          
          <DesktopNavigation user={user} handleLogout={handleLogout} />
          <MobileNavigation user={user} handleLogout={handleLogout} />
        </div>
      </div>
    </nav>
  );
};

const DesktopNavigation = ({ user, handleLogout }) => (
  <div className="hidden md:flex items-center space-x-6">
    <NavLink to="/games" icon="🎮" text="الألعاب" />
    <NavLink to="/live" icon="📺" text="مباشر" />
    
    {user ? (
      <UserDropdown user={user} handleLogout={handleLogout} />
    ) : (
      <Button as={Link} to="/login" variant="primary" size="sm">
        تسجيل الدخول
      </Button>
    )}
  </div>
);

const MobileNavigation = ({ user, handleLogout }) => (
  <div className="md:hidden flex items-center">
    <Menu as="div" className="relative">
      <Menu.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700">
        <Bars3Icon className="h-6 w-6" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-3 py-4 space-y-3">
            <MobileNavLink to="/games" icon="🎮" text="الألعاب" />
            <MobileNavLink to="/live" icon="📺" text="مباشر" />
            {user ? (
              <>
                <MobileNavLink to="/profile" icon="👤" text="حسابي" />
                <Menu.Item>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-red-400 flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    تسجيل الخروج
                  </button>
                </Menu.Item>
              </>
            ) : (
              <Menu.Item>
                <Button 
                  as={Link}
                  to="/login"
                  variant="primary"
                  className="w-full justify-center"
                >
                  تسجيل الدخول
                </Button>
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  </div>
);

const NavLink = ({ to, icon, text }) => (
  <Link 
    to={to} 
    className="hover:text-green-400 transition px-3 py-2 text-sm font-medium flex items-center"
  >
    <span className="mr-1">{icon}</span>
    {text}
  </Link>
);

const MobileNavLink = ({ to, icon, text }) => (
  <Menu.Item>
    <Link 
      to={to} 
      className="block px-3 py-2 rounded hover:bg-gray-700 flex items-center"
    >
      <span className="mr-2">{icon}</span>
      {text}
    </Link>
  </Menu.Item>
);

const UserDropdown = ({ user, handleLogout }) => (
  <Menu as="div" className="relative ml-3">
    <Menu.Button className="flex items-center space-x-2">
      <span className="text-sm font-medium">{user.username}</span>
      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
        {user.balance} جنيه
      </span>
    </Menu.Button>
    <DropdownTransition>
      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg">
        <DropdownItem to="/profile">إعدادات الحساب</DropdownItem>
        <DropdownItem as="button" onClick={handleLogout}>
          تسجيل الخروج
        </DropdownItem>
      </Menu.Items>
    </DropdownTransition>
  </Menu>
);

const DropdownTransition = ({ children }) => (
  <Transition
    as={Fragment}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    {children}
  </Transition>
);

const DropdownItem = ({ children, to, as: Component = Link, ...props }) => (
  <Menu.Item>
    {({ active }) => (
      <Component
        to={to}
        className={`block px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}
        {...props}
      >
        {children}
      </Component>
    )}
  </Menu.Item>
);

export default Navbar;