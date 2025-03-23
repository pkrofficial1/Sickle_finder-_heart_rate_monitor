import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Calendar, Phone, MapPin, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserDetails {
  userId: string;
  name: string;
  age: string;
  phone: string;
  address: string;
  bloodGroup: string;
  gender: string;
}

function UserDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserDetails>(() => {
    const savedData = localStorage.getItem('userDetails');
    return savedData ? JSON.parse(savedData) : {
      userId: '',
      name: '',
      age: '',
      phone: '',
      address: '',
      bloodGroup: '',
      gender: ''
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store user details in localStorage
    localStorage.setItem('userDetails', JSON.stringify(formData));
    navigate('/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-center mb-8">
          <Heart className="h-10 w-10 text-red-500" />
          <h2 className="ml-2 text-2xl font-bold text-gray-800">Patient Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block">
              <span className="flex items-center text-gray-700 mb-1">
                <UserCircle className="h-4 w-4 mr-1" />
                User ID
              </span>
              <input
                type="text"
                name="userId"
                required
                value={formData.userId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                placeholder="Enter your unique ID"
              />
            </label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block">
              <span className="flex items-center text-gray-700 mb-1">
                <User className="h-4 w-4 mr-1" />
                Full Name
              </span>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                placeholder="John Doe"
              />
            </label>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block">
                <span className="flex items-center text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Age
                </span>
                <input
                  type="number"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                  placeholder="25"
                />
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block">
                <span className="text-gray-700 mb-1">Gender</span>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block">
              <span className="flex items-center text-gray-700 mb-1">
                <Phone className="h-4 w-4 mr-1" />
                Phone Number
              </span>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                placeholder="+1234567890"
              />
            </label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block">
              <span className="flex items-center text-gray-700 mb-1">
                <MapPin className="h-4 w-4 mr-1" />
                Address
              </span>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
                placeholder="123 Main St, City"
              />
            </label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <label className="block">
              <span className="text-gray-700 mb-1">Blood Group</span>
              <select
                name="bloodGroup"
                required
                value={formData.bloodGroup}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </label>
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-red-500 to-purple-600 text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
          >
            Continue to Dashboard
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default UserDetails;