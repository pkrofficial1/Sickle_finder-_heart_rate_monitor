import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, AlertCircle, Info, Activity, ArrowRight, Microscope, Stethoscope, PlusCircle } from 'lucide-react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Heartbeat animation component
const HeartbeatIcon = () => (
  <motion.div
    animate={{
      scale: [1, 1.2, 1, 1.3, 1],
    }}
    transition={{
      duration: 0.8,
      repeat: Infinity,
      repeatDelay: 0.5,
      ease: "easeInOut",
    }}
  >
    <Heart className="h-8 w-8 text-red-500" />
  </motion.div>
);

// Enhanced floating animation component
const FloatingElement = ({ children, delay = 0, duration = 3, y = 15 }) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{
        y: [-y, y],
        x: [-3, 3],
        rotate: [-1, 1],
      }}
      transition={{
        y: {
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay,
        },
        x: {
          duration: duration * 1.2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay + 0.2,
        },
        rotate: {
          duration: duration * 1.4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay + 0.4,
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// Enhanced background bubble component
const Bubble = ({ id, size, left, top, delay }) => (
  <motion.div
    key={id}
    className="absolute rounded-full bg-gradient-to-br from-red-200/20 to-purple-200/20 backdrop-blur-3xl"
    style={{
      width: size,
      height: size,
      left: `${left}%`,
      top: `${top}%`,
    }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.4, 0.2],
      x: [-20, 20, -20],
      y: [-10, 10, -10],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay,
      times: [0, 0.5, 1],
    }}
  />
);

const FadeInWhenVisible = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
};

// Define bubbles configuration
const BUBBLES = [
  { id: 'bubble-1', size: 300, left: 10, top: 20, delay: 0 },
  { id: 'bubble-2', size: 200, left: 80, top: 40, delay: 1 },
  { id: 'bubble-3', size: 150, left: 20, top: 60, delay: 2 },
  { id: 'bubble-4', size: 250, left: 70, top: 70, delay: 3 },
];

// Image gallery data
const SCD_IMAGES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800",
    title: "Blood Cell Analysis",
    description: "Microscopic view of blood cells affected by Sickle Cell Disease"
  },
  {
    id: 2,
    url: "https://dobetter.esade.edu/sites/default/files/inline-images/health-monitoring.jpg",
    title: "Medical Monitoring",
    description: "Advanced monitoring systems for tracking vital signs"
  },
  {
    id: 3,
    url: "https://th.bing.com/th/id/OIP.V4vD9FeMU2rE7phGCEdnKAHaD6?rs=1&pid=ImgDetMain",
    title: "Healthcare Technology",
    description: "Modern medical equipment for patient care"
  }
];

// Image Card Component
const ImageCard = ({ image, index }) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative group"
    >
      <div className="overflow-hidden rounded-xl shadow-lg">
        <motion.img
          src={image.url}
          alt={image.title}
          className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
          whileHover={{ scale: 1.05 }}
          initial={{ scale: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-lg font-semibold">{image.title}</h3>
            <p className="text-sm opacity-90">{image.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function Home() {
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showSecondLine, setShowSecondLine] = useState(false);

  useEffect(() => {
    // Start second line after first line completes
    const secondLineTimer = setTimeout(() => {
      setShowSecondLine(true);
    }, 2000);

    // Show the rest of the content after typing completes
    const completionTimer = setTimeout(() => {
      setIsTypingComplete(true);
    }, 4000);

    return () => {
      clearTimeout(secondLineTimer);
      clearTimeout(completionTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 overflow-hidden relative">
      {/* Background Bubbles */}
      {BUBBLES.map((bubble) => (
        <Bubble key={bubble.id} {...bubble} />
      ))}

      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center">
                <img 
                  src="https://th.bing.com/th/id/R.9eb5ba66306f079916f6ea8abfd87966?rik=1K5lYq7%2bqDq3CQ&riu=http%3a%2f%2fwww.srcas.ac.in%2fwp-content%2fthemes%2fsrcas%2fimages%2flogo-wide.png&ehk=wYFypwKoL9y6dzXkC0Y5j2tQTgkVr2Z24E194ByOxP4%3d&risl=&pid=ImgRaw&r=0" 
                  alt="Sri Ramakrishna College Logo" 
                  className="h-12 w-auto mr-3"
                />
                <div className="flex items-center">
                  <HeartbeatIcon />
                  <span className="ml-2 text-xl font-bold text-gray-800">SCD Monitor</span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                to="/login" 
                className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors flex items-center gap-2 group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative">Login</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="relative"
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section with Background */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 hero-bg">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="typing-container">
                  <div className="typing-text text-4xl md:text-6xl font-bold">
                    Monitor Your Heart with
                  </div>
                </div>
                
                {showSecondLine && (
                  <div className="typing-container mt-2">
                    <div className="typing-text text-4xl md:text-6xl font-bold gradient-text">
                      Advanced Technology
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.p 
                className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: isTypingComplete ? 1 : 0 }}
                transition={{ duration: 0.8 }}
              >
                Real-time monitoring of vital signs for early detection of Sickle Cell Disease complications.
                Stay informed about your health with our advanced monitoring system.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isTypingComplete ? 1 : 0, y: isTypingComplete ? 0 : 20 }}
                transition={{ duration: 0.5 }}
              >
                <Link 
                  to="/login" 
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FadeInWhenVisible delay={0.1}>
                <div className="bg-white p-6 rounded-xl shadow-lg card-hover">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Heart Rate Monitoring</h3>
                  <p className="text-gray-600">Continuous monitoring of your heart rate with instant alerts for abnormal patterns.</p>
                </div>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.2}>
                <div className="bg-white p-6 rounded-xl shadow-lg card-hover">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">SpO2 Tracking</h3>
                  <p className="text-gray-600">Keep track of your blood oxygen levels with precise measurements and trend analysis.</p>
                </div>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.3}>
                <div className="bg-white p-6 rounded-xl shadow-lg card-hover">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Early Warning System</h3>
                  <p className="text-gray-600">Get instant notifications when vital signs indicate potential health concerns.</p>
                </div>
              </FadeInWhenVisible>
            </div>
          </div>
        </section>

        {/* Image Gallery Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Understanding Sickle Cell Disease</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore how our monitoring system helps in managing Sickle Cell Disease through advanced technology and continuous care.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {SCD_IMAGES.map((image, index) => (
                <ImageCard key={image.id} image={image} index={index} />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FadeInWhenVisible delay={0.1}>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Microscope className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Early Detection</h3>
                  <p className="text-gray-600">Advanced monitoring for early signs of complications</p>
                </div>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.2}>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Continuous Care</h3>
                  <p className="text-gray-600">24/7 monitoring of vital health parameters</p>
                </div>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.3}>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlusCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Immediate Response</h3>
                  <p className="text-gray-600">Quick medical intervention when needed</p>
                </div>
              </FadeInWhenVisible>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                <FadeInWhenVisible>
                  <div className="flex items-center mb-6">
                    <Info className="h-6 w-6 text-blue-500 mr-2" />
                    <h2 className="text-2xl font-bold">About SCD Monitor</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Our advanced monitoring system helps track vital signs that are crucial for 
                    Sickle Cell Disease patients. Early detection of complications can lead to 
                    better health outcomes and improved quality of life.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Heart className="h-5 w-5 text-red-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold mb-2">Continuous Monitoring</h3>
                        <p className="text-gray-600">24/7 tracking of vital signs with real-time updates and alerts.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Activity className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold mb-2">Data Analysis</h3>
                        <p className="text-gray-600">Advanced analytics to identify patterns and predict potential complications.</p>
                      </div>
                    </div>
                  </div>
                </FadeInWhenVisible>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Credits */}
        <section className="bg-white/90 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-gray-600 font-medium">Developed by</p>
              <div className="mt-2 space-y-1">
                <p className="text-lg font-semibold text-gray-800">Dr. V. KrishnaPriya MCA.,M.Phil.,Ph.D.,</p>
                <p className="text-lg font-semibold text-gray-800">Dr. M. Jaithoon Bibi M.sc.,M.Phil.,Ph.D.,</p>
              </div>
              <div className="mt-4">
                <img 
                  src="https://th.bing.com/th/id/R.9eb5ba66306f079916f6ea8abfd87966?rik=1K5lYq7%2bqDq3CQ&riu=http%3a%2f%2fwww.srcas.ac.in%2fwp-content%2fthemes%2fsrcas%2fimages%2flogo-wide.png&ehk=wYFypwKoL9y6dzXkC0Y5j2tQTgkVr2Z24E194ByOxP4%3d&risl=&pid=ImgRaw&r=0" 
                  alt="Sri Ramakrishna College Logo" 
                  className="h-16 w-auto mx-auto"
                />
                <p className="mt-2 text-sm text-gray-600">Sri Ramakrishna College of Arts & Science</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;