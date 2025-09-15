import React from 'react';
import { Helmet } from 'react-helmet';

const TermsConditions = () => {
  return (
    <>
      <Helmet>
        <title>MockVed Terms and Conditions</title>
        <meta name="description" content="Read MockVed's terms and conditions for using our online learning platform and services." />
      </Helmet>
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md my-10">
        <h1 className="text-3xl font-bold mb-6">MockVed Terms and Conditions</h1>
        <p className="mb-4">
          Welcome to MockVed! These terms and conditions outline the rules and regulations for the use of our platform.
        </p>
        <p className="mb-4">
          By accessing this website, you accept these terms and conditions. Do not continue to use MockVed if you do not agree to take all of the terms and conditions stated on this page.
        </p>
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using MockVed, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
        <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
        <p className="mb-4">
          Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.
        </p>
        <h2 className="text-2xl font-semibold mb-4">3. Payment Terms</h2>
        <p className="mb-4">
          All payments are processed securely through Razorpay. By making a payment, you agree to their terms and conditions.
        </p>
        <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
        <p className="mb-4">
          All content on MockVed is owned by us and is protected by copyright and intellectual property laws.
        </p>
        <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
        <p className="mb-4">
          MockVed shall not be liable for any indirect, incidental, special, or consequential damages.
        </p>
        <p className="mb-4">
          For any questions or concerns regarding these terms, please contact us at <a href="mailto:team@mockved.com" className="text-blue-600 underline">team@mockved.com</a>.
        </p>
      </div>
    </>
  );
};

export default TermsConditions;
