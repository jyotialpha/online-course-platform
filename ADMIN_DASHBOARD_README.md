# Admin Dashboard - Course Management System

## Overview
The Admin Dashboard provides comprehensive course management capabilities for administrators. It allows admins to create, view, edit, search, and delete courses with their associated chapters and mock test questions.

## Features

### 1. Course Management Dashboard
- **View All Courses**: See a comprehensive list of all courses in the system
- **Search & Filter**: Search courses by title or description
- **Sort Options**: Sort courses by title, price, or creation date (ascending/descending)
- **Real-time Stats**: View total courses, chapters, and questions

### 2. Course Operations
- **Create Course**: Build new courses with chapters and mock test questions
- **View Course**: Detailed view of course content, chapters, and questions
- **Edit Course**: Modify existing course details, chapters, and questions
- **Delete Course**: Remove courses with confirmation prompts

### 3. Course Structure
Each course includes:
- Basic information (title, description, price)
- Multiple chapters
- Mock test questions per chapter
- Multiple choice questions with explanations

## How to Use

### Accessing the Dashboard
1. Login as an admin user
2. Navigate to `/admin/dashboard`
3. You'll see the main dashboard with quick action cards and course management

### Creating a Course
1. Click "Create Course" button or navigate to `/admin/create-course`
2. Fill in course details (title, description, price)
3. Add chapters with descriptions
4. Add mock test questions for each chapter
5. Set correct answers and explanations
6. Submit the form

### Managing Existing Courses
1. **View Course**: Click the eye icon (👁️) to see full course details
2. **Edit Course**: Click the edit icon (✏️) to modify course content
3. **Delete Course**: Click the trash icon (🗑️) to remove a course

### Search and Sort
- **Search**: Use the search bar to find courses by title or description
- **Sort**: Choose sorting criteria (title, price, date) and order (ascending/descending)

## Technical Details

### Backend API Endpoints
- `GET /api/admin/courses` - Fetch all courses
- `GET /api/admin/courses/:id` - Fetch specific course
- `POST /api/admin/courses` - Create new course
- `PUT /api/admin/courses/:id` - Update existing course
- `DELETE /api/admin/courses/:id` - Delete course

### Frontend Components
- `AdminDashboard.jsx` - Main dashboard with course listing
- `CourseForm.jsx` - Create new courses
- `CourseEditForm.jsx` - Edit existing courses
- `CourseView.jsx` - View course details

### Security
- All admin routes are protected with JWT authentication
- Role-based access control (admin only)
- CSRF protection with credentials

## File Structure
```
src/
├── pages/
│   └── AdminDashboard.jsx          # Main admin dashboard
├── components/
│   └── admin/
│       ├── CourseForm.jsx          # Create course form
│       ├── CourseEditForm.jsx      # Edit course form
│       └── CourseView.jsx          # View course details
└── config/
    └── api.js                      # API configuration
```

## Best Practices

### Course Creation
- Provide clear, descriptive titles
- Write detailed descriptions
- Structure chapters logically
- Create meaningful mock test questions
- Include explanations for correct answers

### Course Management
- Regularly review and update course content
- Use search and sort features for efficient management
- Confirm before deleting courses
- Keep course information up-to-date

## Troubleshooting

### Common Issues
1. **Courses not loading**: Check authentication token and API connectivity
2. **Edit not working**: Ensure you have proper permissions and valid course ID
3. **Delete failing**: Verify course exists and you have delete permissions

### Error Handling
- All operations include proper error handling
- User-friendly error messages
- Console logging for debugging
- Graceful fallbacks for failed operations

## Future Enhancements
- Bulk course operations
- Course templates
- Advanced analytics and reporting
- Course duplication
- Media file management
- Student progress tracking
