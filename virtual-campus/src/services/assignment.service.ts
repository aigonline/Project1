import { apiClient } from '../utils/api';

class AssignmentService {
  getAllAssignments(filters = {}) {
    return apiClient.get('/assignments', { params: filters });
  }

  getAssignmentById(id: string) {
    return apiClient.get(`/assignments/${id}`);
  }
getAssignment(id: string) {
    return apiClient.get(`/assignments/${id}`);
}
  getMyAssignments() {
    return apiClient.get('/assignments/student');
  }

  getInstructorAssignments() {
    return apiClient.get('/assignments/instructor');
  }

  createAssignment(data: any) {
    return apiClient.post('/assignments', data);
  }

  updateAssignment(id: string, data: any) {
    return apiClient.put(`/assignments/${id}`, data);
  }

  deleteAssignment(id: string) {
    return apiClient.delete(`/assignments/${id}`);
  }

  submitAssignment(assignmentId: string, formData: FormData) {
    return apiClient.post(
      `/assignments/${assignmentId}/submit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  }

  gradeSubmission(submissionId: string, gradeData: any) {
    return apiClient.post(`/submissions/${submissionId}/grade`, gradeData);
  }

  getSubmission(assignmentId: string) {
    return apiClient.get(`/assignments/${assignmentId}/submission`);
  }
getSubmissions(assignmentId: string) {
    return apiClient.get(`/assignments/${assignmentId}/submissions`);
}
  getAllSubmissions(assignmentId: string) {
    return apiClient.get(`/assignments/${assignmentId}/submissions`);
  }
}

export default new AssignmentService();