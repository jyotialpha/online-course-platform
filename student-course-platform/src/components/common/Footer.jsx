import { motion } from 'framer-motion';
import { Mail, Twitter, Github, Linkedin, ArrowRight } from 'lucide-react';

// Animation variants
const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const linkVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

function Footer() {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('Subscribed! (Placeholder action)');
  };

  return (
    <motion.footer
      className="bg-gradient-to-r from-gray-900 via-purple-900/80 to-cyan-900/80 text-white py-12 relative"
      initial="hidden"
      animate="visible"
      variants={footerVariants}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      <div className="relative container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <motion.div variants={footerVariants}>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              LearnPlatform
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Empowering learners worldwide with cutting-edge courses and interactive learning experiences.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={footerVariants}>
            <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              {[
                { label: 'About', href: '#' },
                { label: 'Contact', href: '#' },
                { label: 'Terms', href: '#' },
                { label: 'Privacy Policy', href: '#' },
              ].map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="text-gray-300 hover:text-cyan-400 transition-all duration-300"
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={linkVariants}
                  whileHover={{ x: 5 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div variants={footerVariants}>
            <h3 className="text-xl font-semibold text-white mb-4">Stay Updated</h3>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-4">
              <div className="relative group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                />
                <motion.button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowRight className="w-6 h-6 text-cyan-400" />
                </motion.button>
              </div>
              <p className="text-gray-400 text-sm">Join our newsletter for the latest updates and offers.</p>
            </form>
          </motion.div>
        </div>

        {/* Social Icons and Copyright */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center">
          <motion.div
            className="flex space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {[
              { icon: Twitter, href: '#' },
              { icon: Github, href: '#' },
              { icon: Linkedin, href: '#' },
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                className="text-white hover:text-cyan-400 transition-all duration-300"
                whileHover={{ scale: 1.3, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <social.icon className="w-6 h-6" />
              </motion.a>
            ))}
          </motion.div>
          <motion.p
            className="text-gray-300 mt-4 md:mt-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            &copy; 2025 LearnPlatform. All rights reserved.
          </motion.p>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;