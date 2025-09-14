import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, BookOpen, Zap, Clock, Play, Users, Award, TrendingUp, ArrowRight, Rocket, Target, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

// Animation variants
const heroVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.15, duration: 0.8, ease: 'easeOut' },
  }),
};

const testimonialVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

// Floating Particles Component
const FloatingParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const particleTypes = ['circle', 'star', 'diamond', 'triangle'];
    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
      color: ['cyan', 'purple', 'pink', 'yellow'][Math.floor(Math.random() * 4)],
    }));
    setParticles(newParticles);
  }, []);

  const getParticleStyle = (particle) => {
    const colorClass = {
      cyan: 'bg-cyan-400',
      purple: 'bg-purple-400',
      pink: 'bg-pink-400',
      yellow: 'bg-yellow-400',
    }[particle.color];

    const shapeStyle = {
      circle: { borderRadius: '50%' },
      star: { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' },
      diamond: { transform: 'rotate(45deg)' },
      triangle: { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
    }[particle.type];

    return { ...shapeStyle, boxShadow: `0 0 20px ${particle.color === 'cyan' ? '#06b6d4' : particle.color === 'purple' ? '#a855f7' : particle.color === 'pink' ? '#ec4899' : '#facc15'}` };
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute ${particle.color === 'cyan' ? 'bg-cyan-400' : particle.color === 'purple' ? 'bg-purple-400' : particle.color === 'pink' ? 'bg-pink-400' : 'bg-yellow-400'}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            ...getParticleStyle(particle),
          }}
          animate={{
            x: [0, Math.random() * 200 - 100],
            y: [0, Math.random() * 200 - 100],
            rotate: [0, Math.random() * 720],
            scale: [1, 1.2, 0.8],
          }}
          transition={{
            duration: particle.speed * 4,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Animated Background Component
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse' }}
    />
    <motion.div
      className="absolute inset-0 bg-gradient-to-tr from-pink-900/40 via-purple-800/40 to-cyan-900/40"
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 8, delay: 1, repeat: Infinity, repeatType: 'reverse' }}
    />
    <motion.div
      className="absolute inset-0 bg-gradient-to-bl from-emerald-900/20 via-transparent to-violet-900/20"
      animate={{ opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, delay: 2, repeat: Infinity, repeatType: 'reverse' }}
    />
    <div className="absolute top-0 left-0 w-full h-full">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${
            ['bg-purple-500/20', 'bg-cyan-500/15', 'bg-pink-500/20', 'bg-emerald-500/15', 'bg-yellow-500/10', 'bg-violet-500/20'][i]
          }`}
          style={{
            width: `${200 + i * 40}px`,
            height: `${200 + i * 40}px`,
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
          }}
          animate={{
            x: [0, 50 - Math.random() * 100],
            y: [0, 50 - Math.random() * 100],
            scale: [1, 1.2, 0.8],
            opacity: [0.3, 0.5, 0.2],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse' }}
    />
  </div>
);

// Course Card Component
const CourseCard = ({ course, delay }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const getPriceColor = (course) => {
    return (course.isFree === true || course.price === 0) ? 'bg-green-500' : 'bg-blue-500';
  };

  const getPriceText = (course) => {
    return (course.isFree === true || course.price === 0) ? 'Free' : 'Paid';
  };

  const getQuestionCount = (subjects) => {
    return subjects?.reduce((total, subject) =>
      total + (subject.chapters?.reduce((chapterTotal, chapter) =>
        chapterTotal + (chapter.questions?.length || 0), 0) || 0), 0) || 0;
  };

  const getChapterCount = (subjects) => {
    return subjects?.reduce((total, subject) =>
      total + (subject.chapters?.length || 0), 0) || 0;
  };

  return (
    <motion.div
      className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20"
      custom={delay}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(168, 85, 247, 0.25)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <div className="relative h-56 overflow-hidden">
        {course.thumbnail ? (
          <motion.img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1, rotate: isHovered ? 1 : 0 }}
            transition={{ duration: 1 }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <div className={`${getPriceColor(course)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
            {getPriceText(course)}
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
          <BookOpen className="w-3 h-3 fill-current" />
          {getChapterCount(course.subjects)}
        </div>
        <motion.div
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </motion.div>
      </div>
      <div className="p-6 relative">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
            {course.title}
          </h3>
          <motion.div
            className="text-yellow-400"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </div>
        <p className="text-gray-300 mb-4 leading-relaxed text-sm">{course.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
              <BookOpen className="w-4 h-4" />
              {getChapterCount(course.subjects)} chapters
            </span>
            <span className="flex items-center gap-1 hover:text-purple-400 transition-colors">
              <Clock className="w-4 h-4" />
              {getQuestionCount(course.subjects)} questions
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {(course.isFree === true || course.price === 0) ? 'Free' : `₹${course.price}`}
            </span>
            <span className="text-xs text-gray-400">{(course.isFree === true || course.price === 0) ? 'no cost' : 'one-time payment'}</span>
          </div>
          <Link
            to={user.isAuthenticated ? `/student/courses` : `/login`}
            className="group/btn relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-2xl overflow-hidden"
          >
            <motion.span
              className="relative z-10 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {user.isAuthenticated ? 'View Course' : 'Enroll Now'}
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1" />
            </motion.span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, delay, accent }) => (
  <motion.div
    className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-3xl text-center border border-white/20"
    custom={delay}
    initial="hidden"
    animate="visible"
    variants={cardVariants}
    whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(168, 85, 247, 0.25)' }}
  >
    <motion.div
      className={`absolute inset-0 bg-gradient-to-br ${accent}/10 via-transparent to-transparent rounded-3xl opacity-0`}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
    <div className="relative">
      <motion.div
        className={`w-20 h-20 bg-gradient-to-br ${accent} to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
        whileHover={{ scale: 1.1, rotate: 6 }}
        transition={{ duration: 0.5 }}
      >
        <Icon className="w-10 h-10 text-white" />
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${accent} to-transparent rounded-3xl opacity-0 blur-xl`}
          whileHover={{ opacity: 0.5 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
      <h3 className="text-2xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
        {title}
      </h3>
      <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">{description}</p>
    </div>
  </motion.div>
);

// Image Slider Component
const ImageSlider = ({ courses }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const sliderImages = courses.length > 0 ? courses.slice(0, 5) : [
    { id: 1, title: 'Web Development', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop', description: 'Master modern web technologies' },
    { id: 2, title: 'Data Science', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop', description: 'Analyze data and build insights' },
    { id: 3, title: 'Mobile Development', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop', description: 'Create amazing mobile apps' },
    { id: 4, title: 'AI & Machine Learning', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop', description: 'Build intelligent systems' },
    { id: 5, title: 'Cloud Computing', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop', description: 'Scale applications globally' }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, sliderImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-3xl mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            <img
              src={sliderImages[currentSlide].image || sliderImages[currentSlide].thumbnail}
              alt={sliderImages[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div>
                <h3 className="text-4xl font-bold text-white mb-4">{sliderImages[currentSlide].title}</h3>
                <p className="text-xl text-gray-200">{sliderImages[currentSlide].description || sliderImages[currentSlide].description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => { setCurrentSlide(index); setIsAutoPlaying(false); }}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Stats Section Component
const StatsSection = () => (
  <motion.div
    className="py-20 relative"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
  >
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { number: '50K+', label: 'Happy Students', icon: Users, color: 'from-blue-400 to-cyan-400' },
          { number: '500+', label: 'Expert Courses', icon: BookOpen, color: 'from-purple-400 to-pink-400' },
          { number: '98%', label: 'Success Rate', icon: TrendingUp, color: 'from-green-400 to-emerald-400' },
          { number: '24/7', label: 'Live Support', icon: Award, color: 'from-yellow-400 to-orange-400' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="text-center group"
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <motion.div
              className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 3 }}
              transition={{ duration: 0.5 }}
            >
              <stat.icon className="w-10 h-10 text-white" />
            </motion.div>
            <div className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-all duration-300`}>
              {stat.number}
            </div>
            <div className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
);

function Homepage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/courses?limit=6`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreCourses = async (page) => {
    setLoadingMore(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/courses?page=${page}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setAllCourses(data.data.courses || []);
        } else {
          setAllCourses(prev => [...prev, ...(data.data.courses || [])]);
        }
      }
    } catch (error) {
      console.error('Error fetching more courses:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = () => {
    const featuredCoursesSection = document.getElementById('featured-courses');
    if (featuredCoursesSection) {
      featuredCoursesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* <AnimatedBackground /> */}
        <FloatingParticles />
        <motion.div
          className="relative z-10 text-center px-4 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          {/* Image Slider */}
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto mb-12"
          >
            <ImageSlider courses={courses} />
          </motion.div>
          
          <motion.div variants={heroVariants} initial="hidden" animate="visible">
            <div className="flex items-center justify-center mb-6">
              <Rocket className="w-12 h-12 text-cyan-400 mr-4" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} />
              <span className="text-cyan-400 font-semibold text-lg tracking-wide uppercase">Transform Your Future</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
              Unlock Your
            </h1>
            <h1 className="text-7xl md:text-9xl font-black mb-8 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
              Potential
            </h1>
          </motion.div>
          <motion.p
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
          >
            Join the <span className="text-cyan-400 font-semibold">future of learning</span> with our cutting-edge platform designed to <span className="text-purple-400 font-semibold">accelerate your success</span>
          </motion.p>
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto mb-16 relative group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <input
              type="text"
              placeholder="🚀 Search for your next breakthrough..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full p-8 text-xl bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-3xl text-white placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-500 shadow-2xl"
            />
            <motion.div
              className="absolute right-8 top-1/2 transform -translate-y-1/2 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              onClick={handleSearch}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20"
          >
            <Link
              to={user.isAuthenticated ? '/student/dashboard' : '/login'}
              className="group relative px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-3xl text-xl overflow-hidden"
            >
              <motion.span
                className="relative z-10 flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Play className="w-6 h-6 group-hover:scale-110" />
                Start Learning Journey
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2" />
              </motion.span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-cyan-400/30 to-purple-400/30 blur-2xl opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </Link>
            <motion.button
              className="px-12 py-6 bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white font-bold rounded-3xl text-xl"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)' }}
              transition={{ duration: 0.3 }}
            >
              <span className="flex items-center gap-3">
                <Target className="w-6 h-6 group-hover:rotate-12" />
                Watch Demo
              </span>
            </motion.button>
          </motion.div>
          {/* <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="flex flex-col items-center">
              <span className="text-white/60 text-sm mb-2 font-medium">Discover More</span>
              <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center relative overflow-hidden">
                <motion.div
                  className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full mt-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div> */}
        </motion.div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Featured Courses Section */}
      <section id="featured-courses" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-purple-400 mr-3" />
              <span className="text-purple-400 font-semibold text-lg tracking-wide uppercase">Premium Courses</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Featured Courses
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Handpicked courses designed by industry experts to accelerate your career and unlock new opportunities
            </p>
          </motion.div>
          <AnimatePresence>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredCourses.map((course, index) => (
                    <CourseCard key={course._id} course={course} delay={index} />
                  ))}
                </div>
                {filteredCourses.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-2xl text-gray-400">
                      {courses.length === 0 ? 'No courses available yet!' : 'No courses found. Try different keywords!'}
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* View More Courses Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Explore All Courses
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Discover our complete collection of courses designed to advance your skills
            </p>
            <motion.button
              onClick={() => {
                fetchMoreCourses(1);
                setCurrentPage(1);
              }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              View All Courses
            </motion.button>
          </motion.div>
          
          {allCourses.length > 0 && (
            <>
              <div className="overflow-x-auto pb-6">
                <div className="flex gap-6 min-w-max">
                  {allCourses.map((course, index) => (
                    <motion.div
                      key={course._id}
                      className="flex-shrink-0 w-80"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 h-full">
                        <div className="relative h-48 overflow-hidden">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-white" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                            {getChapterCount(course.subjects)} chapters
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{course.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                              {(course.isFree === true || course.price === 0) ? 'Free' : `₹${course.price}`}
                            </span>
                            <Link
                              to={user.isAuthenticated ? `/student/courses` : `/login`}
                              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl text-sm"
                            >
                              {user.isAuthenticated ? 'View' : 'Enroll'}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {allCourses.length >= 8 && (
                <div className="text-center mt-8">
                  <motion.button
                    onClick={() => {
                      const nextPage = currentPage + 1;
                      fetchMoreCourses(nextPage);
                      setCurrentPage(nextPage);
                    }}
                    disabled={loadingMore}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-2xl disabled:opacity-50"
                    whileHover={{ scale: loadingMore ? 1 : 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {loadingMore ? 'Loading...' : 'Load More Courses'}
                  </motion.button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-cyan-900/10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-yellow-400 mr-3" />
              <span className="text-yellow-400 font-semibold text-lg tracking-wide uppercase">Why Choose Us</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Learn Differently
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of learning with our innovative platform designed for modern learners
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={BookOpen}
              title="Expert Content"
              description="Learn from industry leaders with real-world experience and cutting-edge knowledge that matters"
              delay={0}
              accent="from-blue-400"
            />
            <FeatureCard
              icon={Zap}
              title="Interactive Learning"
              description="Engage with immersive content, live coding sessions, and hands-on projects that build real skills"
              delay={1}
              accent="from-yellow-400"
            />
            <FeatureCard
              icon={Clock}
              title="Flexible Schedule"
              description="Learn at your own pace with lifetime access to all course materials and continuous updates"
              delay={2}
              accent="from-green-400"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center mb-6">
              <Star className="w-8 h-8 text-yellow-400 mr-3" />
              <span className="text-yellow-400 font-semibold text-lg tracking-wide uppercase">Success Stories</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Student Success
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Real stories from students who transformed their careers with our platform
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              {
                quote: "This platform completely transformed my career trajectory. The interactive approach made complex concepts incredibly easy to understand and apply!",
                name: "Alice Johnson",
                role: "Senior Developer at Google",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
                rating: 5,
              },
              {
                quote: "The quality of instruction and hands-on projects prepared me perfectly for real-world challenges. Best investment I've ever made!",
                name: "Marcus Chen",
                role: "Data Scientist at Tesla",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/20"
                variants={testimonialVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(255, 255, 255, 0.2)' }}
              >
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current mr-1" />
                  ))}
                </div>
                <p className="text-gray-300 text-xl mb-8 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20 group-hover:border-cyan-400/50 transition-colors duration-300"
                  />
                  <div>
                    <div className="font-bold text-white text-lg group-hover:text-cyan-400 transition-colors duration-300">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-400 font-medium">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-purple-900/20 to-transparent" />
        <motion.div
          className="relative z-10 text-center max-w-5xl mx-auto px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-12">
            <div className="flex items-center justify-center mb-8">
              <Rocket className="w-12 h-12 text-cyan-400 mr-4" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} />
              <span className="text-cyan-400 font-semibold text-xl tracking-wide uppercase">Ready to Start?</span>
            </div>
            <h2 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-8" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
              Transform Your Future
            </h2>
            <p className="text-2xl md:text-3xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
              Join <span className="text-purple-400 font-bold">50,000+</span> learners who are already advancing their careers with our platform
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link
              to={user.isAuthenticated ? '/student/dashboard' : '/login'}
              className="group relative px-16 py-8 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-full text-2xl overflow-hidden"
            >
              <motion.span
                className="relative z-10 flex items-center gap-4"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Zap className="w-8 h-8 group-hover:rotate-12" />
                Start Your Journey Today
                <ArrowRight className="w-8 h-8 group-hover:translate-x-3" />
              </motion.span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-cyan-400/30 to-purple-400/30 blur-2xl opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </Link>
            <div className="text-center">
              <p className="text-gray-400 mb-2">✨ No commitment required</p>
              <p className="text-gray-400">🎯 Start learning in 2 minutes</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Homepage;