import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md my-10">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        At MockVed, we are committed to protecting your privacy and ensuring the security of your personal information. This privacy policy explains how we collect, use, and safeguard your data.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
      <p className="mb-4">
        We collect information you provide directly to us, such as when you create an account, enroll in courses, make payments, or contact us for support. This may include your name, email address, payment information, and course progress data.
      </p>
      <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
      <p className="mb-4">
        Your data is used solely for providing our services, processing payments, improving your learning experience, and communicating with you about your account and courses.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Data Sharing and Security</h2>
      <p className="mb-4">
        We do not sell or share your personal information with third parties except as necessary to provide our services (e.g., payment processing through Razorpay). We implement security measures to protect your data.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
      <p className="mb-4">
        You have the right to access, update, or delete your personal information. Contact us to exercise these rights.
      </p>
      <p className="mb-4">
        For privacy-related questions, please contact us at <a href="mailto:team@mockved.com" className="text-blue-600 underline">team@mockved.com</a>.
      </p>
    </div>
  );
};

export default Privacy;
