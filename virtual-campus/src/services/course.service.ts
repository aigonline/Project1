// services/course.service.ts
import api from '../utils/api';
import { Course } from '../types/user.types';

const courseService = {
  getMyCourses: async () => {
    return await api.get('/courses/my-courses');
  },
  
  getCourse: async (id: string) => {
    return await api.get(`/courses/${id}`);
  },
  
  createCourse: async (courseData: Partial<Course>) => {
    return await api.post('/courses', courseData);
  },
  
  enrollInCourse: async (enrollmentCode: string) => {
    return await api.post('/courses/enroll', { enrollmentCode });
  },
  
  updateCourse: async (id: string, courseData: Partial<Course>) => {
    return await api.patch(`/courses/${id}`, courseData);
  },
  
  deleteCourse: async (id: string) => {
    return await api.delete(`/courses/${id}`);
  }
};

export default courseService;