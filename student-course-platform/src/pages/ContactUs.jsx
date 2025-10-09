import React from 'react';
import { Helmet } from 'react-helmet';
import { Mail, MapPin, Clock } from 'lucide-react';

const ContactUs = () => {
  return (
    <>
      <Helmet>
        <title>MockVed Contact Us</title>
        <meta name="description" content="Get in touch with MockVed for support, questions, or assistance with our online learning platform." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
              <p className="text-blue-100 text-lg">We're here to help with your learning journey</p>
            </div>
            
            <div className="px-8 py-12">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
                  <p className="text-gray-600 mb-8">
                    If you have any questions, concerns, or need assistance, please feel free to reach out to us.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Email Support</h3>
                        <a href="mailto:team@mockved.com" className="text-blue-600 hover:underline">
                          team@mockved.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-green-100 p-3 rounded-full mr-4">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Office Address</h3>
                        <p className="text-gray-600">
                          Plot Number -1306/4457, Shastri Nagar,<br />
                          Shastri Nagar, Nayapalli,<br />
                          Bhubaneswar, Odisha, India
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-3 rounded-full mr-4">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Response Time</h3>
                        <p className="text-gray-600">Within 24-48 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Support</h3>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 mb-2">Course Access Issues</h4>
                      <p className="text-gray-600 text-sm">Having trouble accessing your enrolled courses?</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 mb-2">Payment & Enrollment</h4>
                      <p className="text-gray-600 text-sm">Questions about payments or course enrollment?</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 mb-2">Technical Support</h4>
                      <p className="text-gray-600 text-sm">Need help with platform features or technical issues?</p>
                    </div>
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

export default ContactUs;
