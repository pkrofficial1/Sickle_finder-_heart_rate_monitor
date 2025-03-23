import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function Login() {
  const [email, setEmail] = useState('cscs@gmail.com');
  const [password, setPassword] = useState('Test@1234');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'cscs@gmail.com' && password === 'Test@1234') {
      setError('');
      // Check if user details exist in localStorage
      const savedUserDetails = localStorage.getItem('userDetails');
      if (savedUserDetails) {
        navigate('/dashboard'); // Go directly to dashboard if user details exist
      } else {
        navigate('/user-details'); // Go to user details form if first time
      }
    } else {
      setError('Invalid credentials. Please use the default login.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        <motion.div 
          className="flex items-center justify-center mb-8"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Heart className="h-10 w-10 text-red-500" />
          <h2 className="ml-2 text-2xl font-bold text-gray-800">SCD Monitor</h2>
        </motion.div>

        <motion.div 
          className="mb-6 p-4 bg-blue-50 rounded-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-blue-800">
            <strong>Default Login Credentials:</strong><br />
            Email: cscs@gmail.com<br />
            Password: Test@1234
          </p>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center mb-1">
                <User className="h-4 w-4 mr-1" />
                Email
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 transition-all duration-200"
                required
              />
            </label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center mb-1">
                <Lock className="h-4 w-4 mr-1" />
                Password
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 transition-all duration-200"
                required
              />
            </label>
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Sign In
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;