import React from 'react';

const Shipping = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md my-10">
      <h1 className="text-3xl font-bold mb-6">Shipping Policy</h1>
      <p className="mb-4">
        MockVed is an online learning platform providing digital educational content. As such, all our products and services are delivered electronically.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Digital Delivery</h2>
      <p className="mb-4">
        Upon successful enrollment and payment, you will receive immediate access to your course materials through your account dashboard. No physical shipping is required.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Access Instructions</h2>
      <p className="mb-4">
        After purchase, log in to your account to start accessing the courses. All materials are available 24/7 on any device with internet access.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Technical Requirements</h2>
      <p className="mb-4">
        Ensure you have a stable internet connection and a compatible device (computer, tablet, or smartphone) to access the content.
      </p>
      <p className="mb-4">
        For any shipping-related inquiries (though digital), please contact us at <a href="mailto:team@mockved.com" className="text-blue-600 underline">team@mockved.com</a>.
      </p>
    </div>
  );
};

export default Shipping;
