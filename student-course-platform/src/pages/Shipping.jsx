import React from 'react';
import { Helmet } from 'react-helmet';
import { Truck, Clock, Shield, Headphones } from 'lucide-react';

const Shipping = () => {
  return (
    <>
      <Helmet>
        <title>MockVed Shipping Policy</title>
        <meta name="description" content="MockVed shipping policy for digital courses and online learning materials." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-center">
              <Truck className="w-16 h-16 text-white mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-4">Shipping Policy</h1>
              <p className="text-blue-100 text-lg">Digital delivery for instant access to your courses</p>
            </div>

            {/* Content */}
            <div className="px-8 py-12">
              {/* Digital Delivery Section */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Instant Digital Delivery</h2>
                </div>
                <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed">
                    MockVed provides 100% digital educational content. Upon successful enrollment and payment verification, 
                    you receive <strong>immediate access</strong> to your course materials through your personalized dashboard. 
                    No physical shipping required!
                  </p>
                </div>
              </div>

              {/* Access Instructions */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">How to Access Your Courses</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">Step 1: Payment Verification</h3>
                    <p className="text-gray-700">After successful Razorpay payment, your enrollment is automatically processed within seconds.</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">Step 2: Dashboard Access</h3>
                    <p className="text-gray-700">Log into your account to find all enrolled courses in your personalized learning dashboard.</p>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-indigo-800 mb-3">Step 3: 24/7 Availability</h3>
                    <p className="text-gray-700">Access your courses anytime, anywhere on any device with internet connectivity.</p>
                  </div>
                  <div className="bg-teal-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-teal-800 mb-3">Step 4: Progress Tracking</h3>
                    <p className="text-gray-700">Your learning progress is automatically saved and synced across all your devices.</p>
                  </div>
                </div>
              </div>

              {/* Technical Requirements */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Technical Requirements</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Stable internet connection (minimum 2 Mbps recommended)
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Compatible device: Computer, tablet, or smartphone
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Modern web browser (Chrome, Firefox, Safari, Edge)
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      PDF viewer for course materials
                    </li>
                  </ul>
                </div>
              </div>

              {/* Support Section */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-lg border border-orange-200">
                <div className="flex items-center mb-4">
                  <Headphones className="w-8 h-8 text-orange-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Need Help?</h2>
                </div>
                <p className="text-gray-700 mb-4">
                  For any questions about course access, payment verification, or technical support:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="mailto:team@mockved.com" 
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <span>Email Support</span>
                  </a>
                  <div className="text-gray-600">
                    <p className="font-medium">Response Time: Within 24 hours</p>
                    <p className="text-sm">We're here to ensure smooth access to your learning journey!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Shipping;
