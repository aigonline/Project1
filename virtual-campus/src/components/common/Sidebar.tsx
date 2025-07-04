// components/common/Sidebar.tsx
import { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faBook, faFile, faTasks, faComments, 
  faUser, faCog, faSignOutAlt, faMoon, faSun
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { getProfileImageUrl } from '../../utils/user.utils';

export default function Sidebar() {
  const { currentUser, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  // Hide sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsVisible(false);
    }
    
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [router.pathname]);

  const sidebarClass = isVisible 
    ? "w-64 bg-white dark:bg-gray-800 shadow-md" 
    : "hidden md:block w-64 bg-white dark:bg-gray-800 shadow-md";

  return (
    <aside id="sidebar" className={sidebarClass}>
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary dark:text-primaryLight">Virtual Campus</h1>
        <button 
          id="toggleSidebarBtn" 
          className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={toggleSidebar}
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>
      
      <nav className="mt-4">
        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase">Main</div>
        
        <Link href="/dashboard"
          className={`nav-link flex items-center py-3 px-4 ${
            router.pathname === '/dashboard' 
              ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primaryLight' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}>
            <FontAwesomeIcon icon={faHome} className="w-6" />
            <span>Dashboard</span>
        </Link>
        
        {/* More nav items... */}
        
        <div className="px-4 py-2 mt-6 text-xs text-gray-500 dark:text-gray-400 uppercase">Settings</div>
        
        <Link href="/profile"
           className={`nav-link flex items-center py-3 px-4 ${
            router.pathname === '/profile' 
              ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primaryLight' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}>
            <FontAwesomeIcon icon={faUser} className="w-6" />
            <span>Profile</span>
          
        </Link>
        
        {/* More settings links... */}
      </nav>
      
      <div id="sidebarUserInfo" className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <img 
            src={currentUser ? getProfileImageUrl(currentUser) : "https://picsum.photos/id/1005/40/40"} 
            alt="Profile" 
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <p className="font-medium">
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Log in first'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentUser ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : '...'}
            </p>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="ml-auto p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FontAwesomeIcon 
              icon={isDarkMode ? faSun : faMoon} 
              className={isDarkMode ? "text-yellow-400" : ""} 
            />
          </button>
        </div>
      </div>
      
      {/* Logout Button */}
      <a 
        href="#" 
        onClick={(e) => {
          e.preventDefault();
          logout();
        }}
        className="nav-link flex items-center py-3 px-4 hover:bg-red-100 dark:hover:bg-red-700 text-red-500 dark:text-red-400"
      >
        <FontAwesomeIcon icon={faSignOutAlt} className="w-6" />
        <span>Logout</span>
      </a>
    </aside>
  );
}