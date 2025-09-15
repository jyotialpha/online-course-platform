import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md my-10">
      <h1 className="text-3xl font-bold mb-6">About MockVed</h1>
      <p className="mb-4">
        Welcome to MockVed (http://mockved.com/), your premier online learning platform dedicated to empowering students with high-quality educational resources.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
      <p className="mb-4">
        At MockVed, we believe in making education accessible and effective for everyone. Our platform offers a wide range of courses, mock tests, and interactive learning tools designed to help students excel in their academic and professional pursuits.
      </p>
      <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
      <p className="mb-4">
        - Comprehensive course materials across various subjects<br/>
        - Interactive mock tests to assess and improve performance<br/>
        - Personalized learning dashboards<br/>
        - Expert instructors and support team
      </p>
      <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
      <p className="mb-4">
        We are committed to providing a secure, user-friendly, and innovative learning environment. Your success is our priority.
      </p>
      <p className="mb-4">
        For more information, visit our website at <a href="http://mockved.com/" className="text-blue-600 underline">http://mockved.com/</a> or contact us at <a href="mailto:team@mockved.com" className="text-blue-600 underline">team@mockved.com</a>.
      </p>
    </div>
  );
};

export default About;
