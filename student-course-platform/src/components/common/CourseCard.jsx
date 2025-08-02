import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function CourseCard({ course }) {
  const { user } = useContext(AuthContext);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-md mb-4" />
      <h3 className="text-xl font-semibold">{course.title}</h3>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <p className="text-lg font-bold">${course.price}</p>
      {user.isAuthenticated ? (
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Buy Now
        </button>
      ) : (
        <Link to="/login" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block">
          Sign In to Purchase
        </Link>
      )}
    </div>
  );
}

export default CourseCard;