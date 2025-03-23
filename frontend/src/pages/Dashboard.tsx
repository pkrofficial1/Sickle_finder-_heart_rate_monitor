import React, { useState, useEffect } from 'react';
import { Heart, Activity, LogOut, Bell, Settings, Calendar, AlertCircle, TrendingUp, User, UserPlus, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import MQTTService from '../services/mqtt';

interface MQTTData {
  bpm: number;
  bpm_status: string;
  spo2: number;
  spo2_status: string;
}

interface VitalReading {
  time: string;
  heartRate: number;
  spo2: number;
  temperature: number;
}

interface Alert {
  id: number;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  time: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [mqttStatus, setMqttStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  const [currentReadings, setCurrentReadings] = useState<MQTTData>({
    bpm: 0,
    bpm_status: '',
    spo2: 0,
    spo2_status: ''
  });
  
  const [historicalData, setHistoricalData] = useState<VitalReading[]>([]);

  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 1, type: 'warning', message: 'Heart rate slightly elevated', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'SpO2 levels stable', time: '4 hours ago' },
    { id: 3, type: 'success', message: 'Daily checkup completed', time: '6 hours ago' }
  ]);

  useEffect(() => {
    const storedDetails = localStorage.getItem('userDetails');
    if (!storedDetails) {
      navigate('/user-details');
      return;
    }
    
    const currentUser = JSON.parse(storedDetails);
    setUserDetails(currentUser);

    const recentUsersStr = localStorage.getItem('recentUsers');
    if (recentUsersStr) {
      const allRecentUsers = JSON.parse(recentUsersStr);
      const updatedRecentUsers = [
        currentUser,
        ...allRecentUsers.filter((user: any) => user.userId !== currentUser.userId)
      ].slice(0, 5);
      
      setRecentUsers(updatedRecentUsers);
      localStorage.setItem('recentUsers', JSON.stringify(updatedRecentUsers));
    } else {
      setRecentUsers([currentUser]);
      localStorage.setItem('recentUsers', JSON.stringify([currentUser]));
    }

    const storedHistory = localStorage.getItem(`history_${currentUser.userId}`);
    if (storedHistory) {
      setHistoricalData(JSON.parse(storedHistory));
    }

    const mqttService = MQTTService.getInstance();
    
    const handleMessage = (topic: string, message: Buffer) => {
      if (topic === 'demo') {
        try {
          const data: MQTTData = JSON.parse(message.toString());
          setCurrentReadings(data);
          
          const newReading: VitalReading = {
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            heartRate: data.bpm,
            spo2: data.spo2,
            temperature: 37.0
          };
          
          setHistoricalData(prev => {
            const updated = [...prev, newReading];
            const latest = updated.slice(-24);
            if (userDetails?.userId) {
              localStorage.setItem(`history_${userDetails.userId}`, JSON.stringify(latest));
            }
            return latest;
          });

          if (data.bpm_status.includes('Bradycardia') || data.spo2_status.includes('Not Safe')) {
            const newAlert: Alert = {
              id: Date.now(),
              type: 'warning',
              message: `${data.bpm_status}. ${data.spo2_status}`,
              time: 'Just now'
            };
            setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
          }
        } catch (error) {
          console.error('Error parsing MQTT message:', error);
        }
      }
    };

    mqttService.connect()
      .then(() => {
        setMqttStatus('connected');
        mqttService.subscribe('demo', handleMessage);
      })
      .catch(() => setMqttStatus('error'));

    return () => {
      mqttService.disconnect();
    };
  }, [navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMeasuring && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsMeasuring(false);
      setCountdown(30);
    }
    return () => clearInterval(timer);
  }, [isMeasuring, countdown]);

  const handleMeasurement = async () => {
    try {
      setIsMeasuring(true);
      const mqttService = MQTTService.getInstance();
      mqttService.publish('demo', 'start');
    } catch (error) {
      console.error('Failed to send MQTT message:', error);
      setIsMeasuring(false);
      setCountdown(30);
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes('Not Safe') || status.includes('Bradycardia')) {
      return 'text-red-500';
    }
    return 'text-green-500';
  };

  const handleUserSwitch = (selectedUser: any) => {
    localStorage.setItem('userDetails', JSON.stringify(selectedUser));
    window.location.reload();
  };

  const handleNewUser = () => {
    navigate('/user-details');
  };

  const handleLogout = () => {
    localStorage.removeItem('userDetails');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Heart className="h-8 w-8 text-red-500" />
              <div className="ml-2">
                <span className="text-xl font-bold text-gray-800">SCD Monitor</span>
                {userDetails && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    <span>Welcome, <span className="font-bold">{userDetails.name}</span></span>
                  </div>
                )}
              </div>
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <button 
                  onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                  className="p-2 rounded-full hover:bg-gray-100 relative flex items-center"
                >
                  <Users className="h-5 w-5 text-gray-600" />
                  <span className="ml-1 text-sm text-gray-600">Change User</span>
                </button>
                {showUserSwitcher && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2"
                  >
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      Recent Users
                    </div>
                    {recentUsers.map((user) => (
                      <button
                        key={user.userId}
                        onClick={() => handleUserSwitch(user)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">ID: {user.userId}</div>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={handleNewUser}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 border-t"
                    >
                      <UserPlus className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Add New User</span>
                    </button>
                  </motion.div>
                )}
              </motion.div>

              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2"
                  >
                    {alerts.map((alert) => (
                      <div key={alert.id} className="px-4 py-2 hover:bg-gray-50">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                          <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${
              mqttStatus === 'connected' ? 'bg-green-500' :
              mqttStatus === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600">
              Status: {mqttStatus.charAt(0).toUpperCase() + mqttStatus.slice(1)}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMeasurement}
            disabled={mqttStatus !== 'connected' || isMeasuring}
            className={`flex items-center space-x-2 px-6 py-2 rounded-md text-white transition-all duration-200 ${
              mqttStatus === 'connected' && !isMeasuring
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <Heart className={`h-4 w-4 ${isMeasuring ? 'animate-pulse' : ''}`} />
            <span>
              {isMeasuring 
                ? `Measuring... ${countdown}s` 
                : 'Start Measure'}
            </span>
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Heart className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold">Heart Rate</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-red-500">{currentReadings.bpm} BPM</span>
                <p className={`text-sm ${getStatusColor(currentReadings.bpm_status)}`}>
                  {currentReadings.bpm_status}
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 200]} />
                <Tooltip />
                <Area type="monotone" dataKey="heartRate" stroke="#ef4444" fill="#fee2e2" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Activity className="h-6 w-6 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold">Blood Oxygen (SpO2)</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-500">{currentReadings.spo2}%</span>
                <p className={`text-sm ${getStatusColor(currentReadings.spo2_status)}`}>
                  {currentReadings.spo2_status}
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="spo2" stroke="#3b82f6" fill="#dbeafe" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold">Temperature</h3>
              </div>
              <span className="text-2xl font-bold text-green-500">37.2°C</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[36, 38]} />
                <Tooltip />
                <Line type="monotone" dataKey="temperature" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
            <div className="space-y-4">
              {[
                { date: '2024-03-20', time: '10:00 AM', doctor: 'Dr. Smith', type: 'Regular Checkup' },
                { date: '2024-03-25', time: '2:30 PM', doctor: 'Dr. Johnson', type: 'Blood Test' },
              ].map((appointment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
                >
                  <Calendar className="h-8 w-8 text-purple-500 mr-4" />
                  <div>
                    <p className="font-semibold">{appointment.type}</p>
                    <p className="text-sm text-gray-600">
                      {appointment.date} at {appointment.time} with {appointment.doctor}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start p-3 bg-gray-50 rounded-lg"
                >
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default Dashboard;