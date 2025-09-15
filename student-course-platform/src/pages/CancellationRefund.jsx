import React from 'react';

const CancellationRefund = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md my-10">
      <h1 className="text-3xl font-bold mb-6">Cancellation & Refund Policy</h1>
      <p className="mb-4">
        At MockVed, we strive to provide the best learning experience. If you are not satisfied with our courses, we offer a refund policy as outlined below.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Refund Eligibility</h2>
      <p className="mb-4">
        Refunds are available within 7 days of purchase if you have not accessed more than 20% of the course content.
      </p>
      <h2 className="text-2xl font-semibold mb-4">How to Request a Refund</h2>
      <p className="mb-4">
        To request a refund, please contact our support team at <a href="mailto:team@mockved.com" className="text-blue-600 underline">team@mockved.com</a> with your order details.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Processing Time</h2>
      <p className="mb-4">
        Refunds are processed within 5-7 business days after approval and may take additional time to reflect in your account depending on your payment method.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Cancellation</h2>
      <p className="mb-4">
        You can cancel your subscription at any time through your account dashboard. Cancellations take effect immediately, but access to paid content may continue until the end of the billing period.
      </p>
      <p className="mb-4">
        For any questions, please reach out to us via email.
      </p>
    </div>
  );
};

export default CancellationRefund;
