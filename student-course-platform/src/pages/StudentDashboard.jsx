import { useAuth } from '../context/AuthContext';

function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h2>
        <p className="text-gray-600 mb-4">Hi {user.name}, welcome to your student dashboard!</p>
      </div>
    </div>
  );
}

function MyCourses() {
  const { user } = useAuth();
  const purchasedCourses = user.isAuthenticated
    ? mockCourses.filter((course) => user.purchasedCourses.includes(course.id))
    : [];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">My Courses</h2>
      {purchasedCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedCourses.map((course) => (
            <PurchasedCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">You haven't purchased any courses yet.</p>
      )}
    </div>
  );
}

export default StudentDashboard;