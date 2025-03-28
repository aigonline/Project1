// API Service Layer
const API_URL = 'http://localhost:5000/api/v1';

// Store the JWT token
let token = localStorage.getItem('token') || null;
let currentUser = null;

// Helper for making authenticated requests
const fetchWithAuth = async (endpoint, options = {}) => {
    if (!options.headers) options.headers = {};
    
    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }
    
    if (!options.noContentType && !options.formData) {
        options.headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
        // Clear token and redirect to login
        authService.logout();
        loadLoginPage();
        throw new Error('Session expired. Please log in again.');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
};

// Auth services
const authService = {
    login: async (email, password) => {
        const data = await fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        token = data.token;
        currentUser = data.data.user;
        localStorage.setItem('token', token);
        return data;
    },
    
    signup: async (userData) => {
        const data = await fetchWithAuth('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        token = data.token;
        currentUser = data.data.user;
        localStorage.setItem('token', token);
        return data;
    },
    
    logout: () => {
        token = null;
        currentUser = null;
        localStorage.removeItem('token');
    },
    
    getCurrentUser: async () => {
        const data = await fetchWithAuth('/auth/me');
        currentUser = data.data.user;
        return data;
    }
};

// Courses service
const courseService = {
    getAllCourses: async () => {
        return await fetchWithAuth('/courses');
    },
    
    getMyCourses: async () => {
        return await fetchWithAuth('/courses/my-courses');
    },
    
    getCourse: async (id) => {
        return await fetchWithAuth(`/courses/${id}`);
    },
    
    createCourse: async (courseData) => {
        return await fetchWithAuth('/courses', {
            method: 'POST',
            body: JSON.stringify(courseData)
        });
    },

    enrollInCourse: async (courseId, enrollmentKey) => {
        console.log("📌 Enrolling in course with ID:", courseId); // ✅ Debugging log
        return await fetchWithAuth('/courses/enroll', { 
            method: 'POST',
            body: JSON.stringify({ courseId, enrollmentKey }),
        });
    },

    unenrollFromCourse: async (courseId) => {
        return await fetchWithAuth(`/courses/${courseId}/unenroll`, {
            method: 'DELETE'
        });
    }
};

// Assignments service
const assignmentService = {
    getCourseAssignments: async (courseId) => {
        return await fetchWithAuth(`/courses/${courseId}/assignments`);
    },
    
    getAllAssignments: async () => {
        return await fetchWithAuth('/assignments');
    },

    getAssignment: async (id) => {
        return await fetchWithAuth(`/assignments/${id}`);
    },

    getMyAssignments: async () => {
        return await fetchWithAuth('/assignments/my-assignments'); // Fetch only the user's assignments
    },
    getInstructorAssignments: async () => {
        return await fetchWithAuth('/assignments/instructor-assignments'); // For instructors
    },
    createAssignment: async (assignmentData) => {
        return await fetchWithAuth('/assignments', {
            method: 'POST',
            body: JSON.stringify(assignmentData)
        });
    },
    
    submitAssignment: async (assignmentId, formData) => {
        // For file uploads, use FormData instead of JSON
        return await fetch(`${API_URL}/assignments/${assignmentId}/submit`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        }).then(async res => {
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to submit assignment');
            }
            return res.json();
        });
    },

    getSubmissions: async (assignmentId) => {
        return await fetchWithAuth(`/assignments/${assignmentId}/submissions`);
    },

    gradeSubmission: async (submissionId, gradeData) => {
        return await fetchWithAuth(`/assignments/submissions/${submissionId}/grade`, {
            method: 'PATCH',
            body: JSON.stringify(gradeData)
        });
    }
};

// Resources service
const resourceService = {
    getCourseResources: async (courseId) => {
        return await fetchWithAuth(`/courses/${courseId}/resources`);
    },
    
    getAllResources: async () => {
        return await fetchWithAuth('/resources');
    },

    getResource: async (id) => {
        return await fetchWithAuth(`/resources/${id}`);
    },
    getPopularResources: async () => {
        return await fetchWithAuth('/resources/popular');
    },
    getMyResources: async () => {
        return await fetchWithAuth('/resources/my-resources'); // Fetch only the user's resources
    },
    togglePin: async (id) => {
            return await fetchWithAuth(`/resources/${resourceId}/pin`, {
                method: 'PATCH'
            });
        },
    uploadResource: async (formData) => {
        return await fetch(`${API_URL}/resources`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        }).then(async res => {
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to upload resource');
            }
            return res.json();
        });
    },
    deleteResource: async (id) => {
        return await fetchWithAuth(`/resources/${id}`, {
            method: 'DELETE'
        });
    }
};

// Discussions service
const discussionService = {
    getCourseDiscussions: async (courseId) => {
        return await fetchWithAuth(`/courses/${courseId}/discussions`);
    },
    
    getAllDiscussions: async () => {
        return await fetchWithAuth('/discussions');
    },
    
    getPopularDiscussions: async () => {
        return await fetchWithAuth('/discussions/popular');
    },
    
    getDiscussion: async (id) => {
        return await fetchWithAuth(`/discussions/${id}`);
    },

    getMyDiscussions: async () => {
        return await fetchWithAuth('/discussions/my-discussions'); // Fetch only the user's discussions
    },

    createDiscussion: async (discussionData) => {
        console.log("📌 Sending Discussion Data:", discussionData); // ✅ Debug
        return await fetchWithAuth('/discussions', {
            method: 'POST',
            body: JSON.stringify({
                title: discussionData.title,
                content: discussionData.content,
                course: discussionData.course, // ✅ Ensure this is the correct course I
            }),
        });
    },
    
    
    addReply: async (discussionId, replyData) => {
        return await fetchWithAuth(`/discussions/${discussionId}/replies`, {
            method: 'POST',
            body: JSON.stringify(replyData),
        });
    },
    deleteReply: async (discussionId, replyId) => {
        return await fetchWithAuth(`/discussions/${discussionId}/replies/${replyId}`, {
            method: 'DELETE'
        });
    },
    deleteDiscussion: async (id) => {
        return await fetchWithAuth(`/discussions/${id}`, {
            method: 'DELETE'
        });
    }
};

const userService = {
    getCurrentUser: async () => {
        return await fetchWithAuth('/auth/me'); // ✅ Fetch user profile
    },

    updateProfile: async (userData) => {
        return await fetchWithAuth('/users/updateMe', {
            method: 'PATCH',
            body: JSON.stringify(userData)
        });
    },

    updatePassword: async (passwordData) => {
        return await fetchWithAuth('/auth/updatePassword', {
            method: 'PATCH',
            body: JSON.stringify(passwordData)
        });
    }
};

const announcementService = {
    getCourseAnnouncements: async (courseId) => {
        return await fetchWithAuth(`/announcements/${courseId}`);
    },
    
    createAnnouncement: async (announcementData) => {
        return await fetchWithAuth('/announcements', {
            method: 'POST',
            body: JSON.stringify(announcementData),
        });
    }
};

// SecureLink service
const courseLinkService = {
    generateCourseLink: async (courseId, options = {}) => {
      return await fetchWithAuth(`/courses/${courseId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
    },
  
    getCourseLinks: async (courseId) => {
      return await fetchWithAuth(`/courses/${courseId}/links`);
    },
  
    revokeCourseLink: async (linkId) => {
      return await fetchWithAuth(`/links/${linkId}/revoke`, {
        method: 'PATCH'
      });
    },
  
    // For joining via a secure link, do not send a Content-Type header
    joinViaLink: async (token) => {
      return await fetchWithAuth(`/join/${token}`, {
        method: 'POST',
        noContentType: true  // This flag prevents adding the default JSON header
      });
    }
  };
  