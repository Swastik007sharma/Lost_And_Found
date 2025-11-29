// src/pages/Home.jsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  FiLock,
  FiSearch,
  FiMessageCircle,
  FiShield,
  FiZap,
  FiUsers,
  FiCheckCircle,
  FiTrendingUp,
  FiAward,
  FiHeart,
  FiClock
} from 'react-icons/fi';
import {
  FaBoxOpen,
  FaHandHoldingHeart,
  FaBell,
  FaMapMarkerAlt
} from 'react-icons/fa';
import Footer from '../components/Footer';
import ThemeToggle from '../components/common/ThemeToggle';
import Button from '../components/common/Button';

const steps = [
  {
    icon: <FiLock size={32} className="text-white" />,
    title: 'Get Access',
    description: 'Log in or create a free account using your university email address',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: <FiSearch size={32} className="text-white" />,
    title: 'Report or Search',
    description: 'Once inside, report a lost item or browse the list of found items',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: <FiMessageCircle size={32} className="text-white" />,
    title: 'Connect',
    description: "We'll help you connect with the person who has your item so you can get it back",
    color: 'from-pink-500 to-pink-600',
  },
];

const features = [
  {
    icon: <FiShield size={28} />,
    title: 'Secure Platform',
    description: 'Your data is protected with industry-standard encryption',
  },
  {
    icon: <FiZap size={28} />,
    title: 'Lightning Fast',
    description: 'Find or report items in seconds with our optimized search',
  },
  {
    icon: <FiUsers size={28} />,
    title: 'Community Driven',
    description: 'Join thousands of students helping each other',
  },
  {
    icon: <FaBell size={28} />,
    title: 'Real-time Alerts',
    description: 'Get instant notifications when your item is found',
  },
];

const Home = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const showModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Theme Toggle Button */}
      <div className='fixed top-4 right-4 z-50'>
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`relative min-h-screen flex items-center justify-center px-4 ${theme === 'dark'
            ? 'bg-linear-to-br from-gray-900 via-blue-900 to-indigo-900'
            : 'bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50'
          }`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Orbs */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          />

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shadow-2xl"
              style={{ background: 'var(--color-primary)' }}
            >
              <FaBoxOpen className="text-white text-4xl sm:text-5xl" />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-lg backdrop-blur-sm"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
              border: '2px solid var(--color-primary)'
            }}
          >
            <FiTrendingUp className="text-green-500" />
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Your Campus Lost & Found Hub
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
          >
            Lost Something on Campus?<br />
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Let's Find It Together
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className={`text-lg sm:text-xl md:text-2xl mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
          >
            Connect with your college community to report and recover lost items quickly and securely.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16"
          >
            <motion.button
              className="rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 font-bold py-4 px-8 text-base sm:text-lg shadow-2xl min-w-full sm:min-w-[200px] transition-all duration-300"
              style={{ background: 'var(--color-primary)', color: 'white' }}
              whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
            >
              Get Started →
            </motion.button>
            <motion.button
              className={`rounded-xl focus:outline-none focus:ring-4 font-bold py-4 px-8 text-base sm:text-lg shadow-lg min-w-full sm:min-w-[200px] border-2 transition-all duration-300 ${theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50'
                }`}
              style={{
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
            >
              Create Account
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-8"
          >
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-green-500 text-xl" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                100% Free
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiShield className="text-blue-500 text-xl" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Secure & Private
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiUsers className="text-purple-500 text-xl" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Campus Community
              </span>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 1.5, duration: 0.5 },
            y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
          }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-2 ${theme === 'dark' ? 'border-gray-400' : 'border-gray-600'
            }`}>
            <div className={`w-1 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-600'
              }`} />
          </div>
        </motion.div>
      </motion.div>

      {/* How It Works Section */}
      <div className={`py-16 sm:py-20 px-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              How It Works
            </h2>
            <p className={`text-base sm:text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Getting started is quick and easy. Follow these simple steps to find or reunite items.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className={`relative p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center mx-auto mb-6 bg-linear-to-r ${step.color} shadow-lg`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className={`text-xl sm:text-2xl font-bold mb-3 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-16 sm:py-20 px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Why Choose Us?
            </h2>
            <p className={`text-base sm:text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Built with students in mind, designed for maximum efficiency and security.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className={`p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'
                  }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-16 sm:py-20 px-4 ${theme === 'dark' ? 'bg-linear-to-r from-blue-900 to-purple-900' : 'bg-linear-to-r from-blue-600 to-purple-600'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <FaHandHoldingHeart className="text-5xl sm:text-6xl text-white mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join our campus community today and help make lost items found again. It's completely free!
            </p>
            <motion.button
              className="bg-white text-blue-600 font-bold py-4 px-10 rounded-xl shadow-2xl text-base sm:text-lg hover:bg-gray-100 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
            >
              Create Free Account →
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer showModal={showModal} />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-lg p-8 max-w-md mx-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{modalTitle}</h3>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{modalContent}</p>
              <button
                onClick={closeModal}
                className="bg-university-blue text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;