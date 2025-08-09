import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon,
  FireIcon,
  TrophyIcon,
  ClockIcon,
  UserIcon,
  CogIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import Logo from './Logo';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <Logo className="h-8 w-auto" />
          </div>
          
          <nav className="flex-1 px-2 space-y-1">
            <NavItem to="/" icon={HomeIcon} label="الرئيسية" exact />
            <NavItem to="/live" icon={FireIcon} label="المباريات الحية" />
            <NavItem to="/upcoming" icon={ClockIcon} label="المباريات القادمة" />
            <NavItem to="/leagues" icon={TrophyIcon} label="البطولات" />
            
            {user && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <NavItem to="/my-bets" icon={WalletIcon} label="رهاناتي" />
                <NavItem to="/profile" icon={UserIcon} label="حسابي" />
                <NavItem to="/settings" icon={CogIcon} label="الإعدادات" />
              </>
            )}
          </nav>
        </div>

        {user && (
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-700">{user.username}</p>
                <p className="text-xs font-medium text-green-600">{user.balance} جنيه</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label, exact = false }) => (
  <NavLink
    to={to}
    exact={exact}
    className={({ isActive }) => `
      group flex items-center px-2 py-2 text-sm font-medium rounded-md
      ${isActive ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
    `}
  >
    <Icon
      className={`mr-3 h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}`}
    />
    {label}
  </NavLink>
);

export default Sidebar;