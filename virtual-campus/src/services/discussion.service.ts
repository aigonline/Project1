import { apiClient } from '../utils/api';

class DiscussionService {
  getRecentDiscussions() {
    return apiClient.get('/discussions/recent');
  }

  getAllDiscussions(filters = {}) {
    return apiClient.get('/discussions', { params: filters });
  }

  getCourseDiscussions(courseId: string) {
    return apiClient.get(`/courses/${courseId}/discussions`);
  }

  getDiscussionById(id: string) {
    return apiClient.get(`/discussions/${id}`);
  }

  createDiscussion(data: any) {
    return apiClient.post('/discussions', data);
  }

  updateDiscussion(id: string, data: any) {
    return apiClient.put(`/discussions/${id}`, data);
  }

  deleteDiscussion(id: string) {
    return apiClient.delete(`/discussions/${id}`);
  }

  createComment(discussionId: string, content: string) {
    return apiClient.post(`/discussions/${discussionId}/comments`, { content });
  }

  deleteComment(discussionId: string, commentId: string) {
    return apiClient.delete(`/discussions/${discussionId}/comments/${commentId}`);
  }
}

export default new DiscussionService();