// components/layout/MainLayout.tsx
import { ReactNode, useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faBook, faFile, faTasks, faComments, 
  faUser, faCog, faSignOutAlt, faBars
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { currentUser, logout } = useContext(AuthContext);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  // Handle responsive sidebar visibility
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    }
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-gray-800 shadow-md py-3 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-3 text-gray-700 dark:text-gray-300">
            <FontAwesomeIcon icon={faBars} className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-primary dark:text-primaryLight">{t('app.title')}</h1>
        </div>
        <div className="flex items-center">
          <ThemeToggle />
          <LanguageSelector className="ml-2" />
          <div className="relative ml-3">
            <button className="flex items-center">
              <Image 
                src={currentUser?.profilePicture || "https://picsum.photos/id/1005/40/40"} 
                alt={t('common.profile')} 
                width={32} 
                height={32} 
                className="rounded-full"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Show Button (Floating) */}
      {!sidebarVisible && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-30 p-2 rounded-full bg-primary text-white shadow-lg md:hidden"
        >
          <FontAwesomeIcon icon={faBars} className="text-xl" />
        </button>
      )}

      <div id="appContainer" className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar navigation */}
        <aside 
          className={`${sidebarVisible ? 'block' : 'hidden'} md:block w-64 bg-white dark:bg-gray-800 shadow-md top-0 bottom-0 left-0 overflow-y-auto`}
        >
          <div className="p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary dark:text-primaryLight">{t('app.title')}</h1>
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
          <nav className="mt-4">
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase">{t('common.main')}</div>
            
            <Link href="/dashboard"
               className={`nav-link flex items-center py-3 px-4 ${
                router.pathname === '/dashboard' 
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primaryLight' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                <FontAwesomeIcon icon={faHome} className="w-6" />
                <span>{t('common.dashboard')}</span>
            
            </Link>
            
            <Link href="/courses"
              className={`nav-link flex items-center py-3 px-4 ${
                router.pathname === '/courses' || router.pathname.startsWith('/courses/') 
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primaryLight' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                <FontAwesomeIcon icon={faBook} className="w-6" />
                <span>{t('common.courses')}</span>
              
            </Link>
            
            <Link href="/resources"
               className={`nav-link flex items-center py-3 px-4 ${
                router.pathname === '/resources' || router.pathname.startsWith('/resources/') 
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primaryLight' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                <FontAwesomeIcon icon={faFile} className="w-6" />
                <span>{t('common.resources')}</span>
              
            </Link>
            
            <Link href="/assignments"
              className={`nav-link flex items-center py-3 px-4 ${
                router.pathname === '/assignments' || router.pathname.startsWith('/assignments/') 
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primaryLight' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                <FontAwesomeIcon icon={faTasks} className="w-6" />
                <span>{t('common.assignments')}</span>
              
            </Link>
            
            <Link href="/discussions"
               className={`nav-link flex items-center py-3 px-4 ${
                router.pathname === '/discussions' || router.pathname.startsWith('/discussions/') 
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primaryLight' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                <FontAwesomeIcon icon={faComments} className="w-6" />
                <span>{t('common.discussions')}</span>
              
            </Link>

            <div className="px-4 py-2 mt-6 text-xs text-gray-500 dark:text-gray-400 uppercase">{t('common.settings')}</div>
            
            <Link href="/profile"
               className={`nav-link flex items-center py-3 px-4 ${
                router.pathname === '/profile' 
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primaryLight' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                <FontAwesomeIcon icon={faUser} className="w-6" />
                <span>{t('common.profile')}</span>
            
            </Link>
            
            <Link href="/settings"
               className={`nav-link flex items-center py-3 px-4 ${
                router.pathname === '/settings' 
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primaryLight' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                <FontAwesomeIcon icon={faCog} className="w-6" />
                <span>{t('common.settings')}</span>
              
            </Link>
          </nav>

          <div id="sidebarUserInfo" className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Image 
                src={currentUser?.profilePicture || "https://picsum.photos/id/1005/40/40"}
                alt={t('common.profile')} 
                width={40} 
                height={40}
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="font-medium">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : t('auth.loginFirst')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : '...'}
                </p>
              </div>
              
              <div className="ml-auto flex items-center space-x-2">
                <LanguageSelector />
                <ThemeToggle />
              </div>
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
            <span>{t('common.logout')}</span>
          </a>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div id="content" className="p-4 md:p-6 fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile menu modal backdrop */}
      {sidebarVisible && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
        ></div>
      )}

      {/* Toast component will be handled by ToastContext */}
    </div>
  );
}