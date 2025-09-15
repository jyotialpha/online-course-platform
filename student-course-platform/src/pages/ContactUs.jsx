import React from 'react';

const ContactUs = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md my-10">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="mb-4">
        If you have any questions, concerns, or need assistance, please feel free to reach out to us.
      </p>
      <p className="mb-4">
        You can contact our team at <a href="mailto:team@mockved.com" className="text-blue-600 underline">team@mockved.com</a>.
      </p>
      <p className="mb-4">
        We strive to respond to all inquiries within 24-48 hours.
      </p>
    </div>
  );
};

export default ContactUs;
