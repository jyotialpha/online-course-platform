import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Home, BookOpen, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Animation variants
const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const sidebarVariants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { x: '-100%', transition: { duration: 0.3, ease: 'easeInOut' } },
};

const linkVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <motion.nav
      className="bg-gradient-to-r from-cyan-500 to-purple-500 p-1 shadow-lg backdrop-blur-lg bg-opacity-90 sticky top-0 z-50"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <motion.button
            className="text-white md:hidden mr-4 focus:outline-none"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="w-6 h-6" />
          </motion.button>
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            LearnPlatform
          </Link>
        </div>
        <div className="hidden md:flex space-x-6 items-center">
          {[
            { to: '/', label: 'Home', icon: Home },
            ...(user.isAuthenticated && user.role === 'student' ? [{ to: '/student/dashboard', label: 'Dashboard', icon: BookOpen }] : []),
            ...(user.isAuthenticated && user.role === 'admin' ? [{ to: '/admin/dashboard', label: 'Admin Dashboard', icon: Zap }] : []),
            ...(user.isAuthenticated ? [] : [{ to: '/login', label: 'Login', icon: Zap }]),
          ].map((link, index) => (
            <motion.div
              key={link.label}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={linkVariants}
            >
              <Link
                to={link.to}
                className="group relative text-white font-semibold px-4 py-2 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <motion.span
                  className="flex items-center gap-2"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <link.icon className="w-5 h-5 group-hover:text-cyan-400" />
                  {link.label}
                </motion.span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          ))}
          {user.isAuthenticated && (
            <motion.button
              custom={4}
              initial="hidden"
              animate="visible"
              variants={linkVariants}
              onClick={handleLogout}
              className="group relative text-white font-semibold px-4 py-2 rounded-2xl hover:bg-white/10 transition-all duration-300"
            >
              <motion.span
                className="flex items-center gap-2"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <LogOut className="w-5 h-5 group-hover:text-purple-400" />
                Logout
              </motion.span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 rounded-2xl opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          )}
        </div>
      </div>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-cyan-600 to-purple-600 text-white md:hidden z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
          >
            <div className="p-4">
              <motion.button
                className="text-white mb-4 focus:outline-none"
                onClick={toggleSidebar}
                aria-label="Close sidebar"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
              <nav className="flex flex-col space-y-4">
                {[
                  { to: '/', label: 'Home', icon: Home },
                  ...(user.isAuthenticated && user.role === 'student' ? [{ to: '/student/dashboard', label: 'Dashboard', icon: BookOpen }] : []),
                  ...(user.isAuthenticated && user.role === 'admin' ? [{ to: '/admin/dashboard', label: 'Admin Dashboard', icon: Zap }] : []),
                  ...(user.isAuthenticated ? [] : [{ to: '/login', label: 'Login', icon: Zap }]),
                ].map((link, index) => (
                  <motion.div
                    key={link.label}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={linkVariants}
                  >
                    <Link
                      to={link.to}
                      className="flex items-center gap-2 text-white font-semibold py-2 hover:bg-white/10 rounded-lg transition-all duration-300"
                      onClick={toggleSidebar}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {user.isAuthenticated && (
                  <motion.button
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={linkVariants}
                    onClick={() => {
                      handleLogout();
                      toggleSidebar();
                    }}
                    className="flex items-center gap-2 text-white font-semibold py-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </motion.button>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;