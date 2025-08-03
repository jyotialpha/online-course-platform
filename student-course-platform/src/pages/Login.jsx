import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ArrowLeft, User, Shield, Mail, Sparkles, Zap, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import AdminLoginForm from '../components/auth/AdminLoginForm';

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.9, rotateX: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotateX: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.15
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, rotateX: -10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  },
};

const buttonVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.03, 
    y: -2,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    transition: { 
      duration: 0.3, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  },
  tap: { 
    scale: 0.97,
    y: 0,
    transition: { duration: 0.1 }
  },
};

// Animated mesh gradient background
const MeshGradientBackground = () => (
  <div className="fixed inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
    
    {/* Animated gradient orbs */}
    <motion.div
      className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full mix-blend-multiply filter blur-xl"
      animate={{
        x: [0, 100, 0],
        y: [0, -100, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full mix-blend-multiply filter blur-xl"
      animate={{
        x: [0, -100, 0],
        y: [0, 100, 0],
        scale: [1.2, 1, 1.2],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-cyan-600/30 rounded-full mix-blend-multiply filter blur-xl"
      animate={{
        x: [-50, 50, -50],
        y: [0, -50, 0],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    />
  </div>
);

// Floating geometric shapes
const FloatingShapes = () => {
  const shapes = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    duration: Math.random() * 20 + 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute border border-white/10 backdrop-blur-sm"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            borderRadius: shape.id % 3 === 0 ? '50%' : shape.id % 3 === 1 ? '25%' : '0%',
          }}
          animate={{
            rotate: [shape.rotation, shape.rotation + 360],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Glassmorphism card with advanced effects
const GlassmorphismCard = ({ children, className = "" }) => (
  <motion.div
    className={`relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl ${className}`}
    style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    }}
    whileHover={{
      scale: 1.02,
      boxShadow: '0 25px 50px 0 rgba(31, 38, 135, 0.5)',
    }}
    transition={{ duration: 0.3 }}
  >
    {/* Animated border gradient */}
    <motion.div
      className="absolute inset-0 rounded-3xl opacity-50"
      style={{
        background: 'linear-gradient(45deg, transparent, rgba(168, 85, 247, 0.4), transparent, rgba(6, 182, 212, 0.4), transparent)',
        backgroundSize: '300% 300%',
      }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

// Enhanced button component
const EnhancedButton = ({ children, onClick, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white",
    secondary: "bg-gradient-to-r from-slate-600 to-slate-700 text-white",
    demo: "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white",
  };

  return (
    <motion.button
      onClick={onClick}
      className={`relative w-full py-4 px-6 rounded-2xl font-semibold overflow-hidden transition-all duration-300 ${variants[variant]} ${className}`}
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {/* Animated background overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut"
        }}
      />
      
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </motion.button>
  );
};

function Login() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
    console.log('Login: User', user);

    // Mouse tracking for interactive effects
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [user]);

  const handleMockStudentLogin = () => {
    login({
      role: 'student',
      name: 'Test Student',
      email: 'student@example.com',
      purchasedCourses: [1, 2],
    });
    navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <MeshGradientBackground />
      <FloatingShapes />
      
      {/* Interactive cursor effect */}
      <motion.div
        className="fixed  pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      >
        <div className="w-full h-full bg-white rounded-full opacity-50" />
      </motion.div>
      
      <motion.div
        className="relative z-20 w-full max-w-md mx-4"
        initial="hidden"
        animate={isLoaded ? 'visible' : 'hidden'}
        variants={containerVariants}
        style={{ perspective: 1000 }}
      >
        {/* Animated header */}
        <motion.div 
          className="text-center mb-8" 
          variants={itemVariants}
        >
          <motion.div 
            className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden"
            whileHover={{ 
              rotate: [0, -10, 10, 0],
              scale: 1.1,
            }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <Sparkles className="w-10 h-10 text-white relative z-10" />
          </motion.div>
          
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))',
            }}
            animate={{
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Welcome Back
          </motion.h1>
          
          <motion.p 
            className="text-gray-300 text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Enter the future of learning
          </motion.p>
        </motion.div>

        {/* Main glassmorphism card */}
        <motion.div variants={itemVariants}>
          <GlassmorphismCard className="p-8">
            <AnimatePresence mode="wait">
              {user.isAuthenticated ? (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(16, 185, 129, 0.5)',
                        '0 0 40px rgba(16, 185, 129, 0.8)',
                        '0 0 20px rgba(16, 185, 129, 0.5)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <User className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-3">You're In!</h3>
                  <p className="text-gray-300 mb-8">Ready to continue your learning journey?</p>
                  <EnhancedButton variant="primary">
                    <Zap className="w-5 h-5" />
                    Launch Dashboard
                  </EnhancedButton>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Enhanced tab navigation */}
                  <div className="flex mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
                    {[
                      { id: 'student', label: 'Student', icon: User },
                      { id: 'admin', label: 'Admin', icon: Shield }
                    ].map(({ id, label, icon: Icon }) => (
                      <motion.button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          activeTab === id
                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-white/20'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                        {activeTab === id && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl"
                            layoutId="activeTab"
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'student' ? (
                      <motion.div
                        key="student"
                        initial={{ opacity: 0, x: 50, rotateY: 15 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        exit={{ opacity: 0, x: -50, rotateY: -15 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="space-y-6"
                      >
                        {/* Enhanced Google Login */}
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <GoogleLoginButton />
                        </motion.div>

                        {/* Animated divider */}
                        <div className="relative py-4">
                          <div className="absolute inset-0 flex items-center">
                            <motion.div 
                              className="w-full border-t border-gradient-to-r from-transparent via-white/20 to-transparent"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                            />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-6 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm text-gray-300 text-sm font-medium rounded-full border border-white/10">
                              or dive in with demo
                            </span>
                          </div>
                        </div>

                        {/* Enhanced demo button */}
                        <EnhancedButton
                          onClick={handleMockStudentLogin}
                          variant="demo"
                        >
                          <Zap className="w-5 h-5" />
                          Launch Demo Experience
                          <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [1, 0.5, 1],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                            }}
                          />
                        </EnhancedButton>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="admin"
                        initial={{ opacity: 0, x: 50, rotateY: 15 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        exit={{ opacity: 0, x: -50, rotateY: -15 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        <AdminLoginForm />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassmorphismCard>
        </motion.div>

        {/* Enhanced footer */}
        <motion.div
          className="mt-8 text-center"
          variants={itemVariants}
        >
          <Link
            to="/"
            className="group inline-flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium text-lg"
          >
            <motion.div 
              className="p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-cyan-400/30 transition-all duration-300"
              whileHover={{ 
                scale: 1.1, 
                x: -5,
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
              }}
              transition={{ duration: 0.3 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.div>
            Return Home
          </Link>
        </motion.div>

        {/* Floating security badge */}
        <motion.div
          className="mt-6 text-center"
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-xs text-gray-400"
            animate={{
              boxShadow: [
                '0 0 10px rgba(255,255,255,0.1)',
                '0 0 20px rgba(255,255,255,0.2)',
                '0 0 10px rgba(255,255,255,0.1)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Shield className="w-3 h-3" />
            Enterprise Security Enabled
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;