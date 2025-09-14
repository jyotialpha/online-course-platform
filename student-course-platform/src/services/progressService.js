import { API_BASE_URL } from '../config/api';

class ProgressService {
  async updateChapterProgress(courseId, chapterId, timeSpent = 0) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/student/progress/chapter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          chapterId,
          timeSpent
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Progress update failed:', response.status, errorData);
        throw new Error(`Failed to update chapter progress: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating chapter progress:', error);
      throw error;
    }
  }

  async saveTestResult(testData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/student/progress/test-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        throw new Error('Failed to save test result');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving test result:', error);
      throw error;
    }
  }

  async getCourseProgress(courseId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/student/progress/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching course progress:', error);
      throw error;
    }
  }

  async getAnalytics(timeRange = 'all') {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/student/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async resetCourseProgress(courseId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/student/reset/${courseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reset progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error resetting progress:', error);
      throw error;
    }
  }
}

export default new ProgressService();