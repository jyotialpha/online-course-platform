function PurchasedCourseCard({ course }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-md mb-4" />
      <h3 className="text-xl font-semibold">{course.title}</h3>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <div className="flex space-x-4">
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          View PDFs
        </button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          Take Mock Test
        </button>
      </div>
    </div>
  );
}

export default PurchasedCourseCard;