// Current state
let currentView = 'dashboard';
let currentCourse = null;

// Login page
function loadLoginPage() {
    hideUIElements();
  
    content.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 class="text-2xl font-bold mb-6 text-center">Log In to EduShare</h2>
          
          <form id="loginForm" class="space-y-6">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" id="email" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 dark:text-gray-200">
            </div>
            
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input type="password" id="password" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 dark:text-gray-200">
            </div>
            
            <div id="loginError" class="text-red-500 hidden"></div>
            
            <button type="submit" class="w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
              Log In
            </button>
          </form>
          
          <div class="mt-4 text-center">
            <p class="text-gray-600 dark:text-gray-400">
              Don't have an account? 
              <a href="#" onclick="loadSignupPage(); return false;" class="text-primary dark:text-primaryLight hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    `;
  
    // Add event listener for form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('loginError');
  
      try {
        errorDiv.classList.add('hidden');
        errorDiv.textContent = "";
  
        // Log in once and get the user data
        const result = await authService.login(email, password);
  
        // Update UI with user info
        showUIElements();
        updateUserInfo();
  
        // Check for a pending secure join token stored in localStorage
        const pendingToken = localStorage.getItem('pendingJoinToken');
        if (pendingToken) {
          localStorage.removeItem('pendingJoinToken');
          // joinCourseViaLink should be defined in your secure link service logic
          await joinCourseViaLink(pendingToken);
        } else {
          loadView('dashboard');
        }
      } catch (error) {
        console.error("Login error:", error);
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
      }
    });
  }
  

// Signup page
function loadSignupPage() {
    hideUIElements();
    
    content.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full">
                <h2 class="text-2xl font-bold mb-6 text-center">Create an Account</h2>
                
                <form id="signupForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                            <input type="text" id="firstName" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                            <input type="text" id="lastName" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="email" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Role</label>
                        <select id="role" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <input type="password" id="password" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                        <input type="password" id="passwordConfirm" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div id="signupError" class="text-red-500 hidden"></div>
                    
                    <button type="submit" class="w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                        Sign Up
                    </button>
                </form>
                
                <div class="mt-4 text-center">
                    <p class="text-gray-600 dark:text-gray-400">
                        Already have an account? 
                        <a href="#" onclick="loadLoginPage(); return false;" class="text-primary dark:text-primaryLight hover:underline">
                            Log in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener for form submission
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        const errorDiv = document.getElementById('signupError');
        
        // Validate passwords match
        if (password !== passwordConfirm) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.classList.remove('hidden');
            return;
        }
        
        try {
            errorDiv.classList.add('hidden');
            const result = await authService.signup({
                firstName,
                lastName,
                email,
                role,
                password,
                passwordConfirm
            });
            
            // Update UI with user info
            showUIElements();
            updateUserInfo();
            loadView('dashboard');

        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}

// Dashboard view
async function loadDashboard() {
    // Fetch data
    
    const coursesResponse = await courseService.getMyCourses();
    const courses = coursesResponse.data.courses;
    
    let upcomingAssignments = [];
    let recentDiscussions = [];
    
    try {
        // Get assignments
        const assignmentsResponse = await assignmentService.getAllAssignments();
        upcomingAssignments = assignmentsResponse.data.assignments
            .filter(a => new Date(a.dueDate) >= new Date())
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 3);
        
        // Get discussions
        const discussionsResponse = await discussionService.getAllDiscussions();
        recentDiscussions = discussionsResponse.data.discussions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
    
    content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
                <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
                
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    <h3 class="text-lg font-semibold mb-3">Upcoming Assignments</h3>
                    ${upcomingAssignments.length > 0 ? `
                        <div class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${upcomingAssignments.map(assignment => {
                                const course = assignment.course;
                                const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                                let statusClass = '';
                                
                                if (daysLeft <= 1) statusClass = 'text-red-500';
                                else if (daysLeft <= 3) statusClass = 'text-yellow-500';
                                
                                return `
                                    <div class="py-3 flex justify-between items-center">
                                        <div>
                                            <p class="font-medium">${assignment.title}</p>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">${course.name} (${course.code})</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="${statusClass} font-medium">Due: ${formatDate(assignment.dueDate)}</p>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">${daysLeft} days left</p>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <a href="#" class="block mt-3 text-primary dark:text-primaryLight text-sm font-medium" onclick="loadView('assignments'); return false;">
                            View all assignments →
                        </a>
                    ` : `
                        <p class="text-gray-500 dark:text-gray-400">No upcoming assignments.</p>
                    `}
                </div>
                
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                    <h3 class="text-lg font-semibold mb-3">Recent Activity</h3>
                    ${recentDiscussions.length > 0 ? `
                        <div class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${recentDiscussions.map(discussion => {
                                const course = discussion.course;
                                return `
                                    <div class="py-3">
                                        <div class="flex justify-between">
                                            <p class="font-medium">${discussion.title}</p>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">${formatDate(discussion.createdAt)}</p>
                                        </div>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            ${course.name} • by ${discussion.author.firstName} ${discussion.author.lastName} • ${discussion.replyCount || discussion.replies?.length || 0} replies
                                        </p>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <a href="#" class="block mt-3 text-primary dark:text-primaryLight text-sm font-medium" onclick="loadView('discussions'); return false;">
                            View all discussions →
                        </a>
                    ` : `
                        <p class="text-gray-500 dark:text-gray-400">No recent activity.</p>
                    `}
                </div>
            </div>
            
            <div>
                <h3 class="text-lg font-semibold mb-3">My Courses</h3>
                <div class="space-y-4">
                    ${courses.slice(0, 3).map(course => `
                        <div class="course-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer" 
                             onclick="loadView('course-detail', {courseId: '${course._id}'})">
                            <div class="h-2 ${course.color || 'bg-blue-500'}"></div>
                            <div class="p-4">
                                <h4 class="font-bold">${course.name}</h4>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${course.code} • ${course.instructor.firstName} ${course.instructor.lastName}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <a href="#" class="block mt-3 text-primary dark:text-primaryLight text-sm font-medium" onclick="loadView('courses'); return false;">
                    View all courses →
                </a>
                
                <div class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                    <h3 class="text-lg font-semibold mb-3">Calendar</h3>
                    <div class="text-center py-4 px-2">
                        <div class="font-medium text-lg mb-2">${getCurrentMonth()}</div>
                        <div class="grid grid-cols-7 gap-1 text-xs mb-2">
                            <div>Su</div>
                            <div>Mo</div>
                            <div>Tu</div>
                            <div>We</div>
                            <div>Th</div>
                            <div>Fr</div>
                            <div>Sa</div>
                        </div>
                        <div class="grid grid-cols-7 gap-1">
                            ${generateCalendarDays(upcomingAssignments)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadCourses() {
    try {
        // Fetch all courses
        const response = await courseService.getMyCourses();
        console.log('My Courses Response:', response);

        // Ensure response.data.courses exists and is an array
        const courses = response?.data?.courses || [];
        if (!Array.isArray(courses)) {
            throw new Error('Invalid courses data from getMyCourses');
        }

        // Fetch all available courses for enrollment
        const allResponse = await courseService.getAllCourses();
        console.log('All Courses Response:', allResponse);

        // Ensure allResponse.data.courses exists and is an array
        const allCourses = allResponse.data.courses || [];
        if (!Array.isArray(allCourses)) {
            throw new Error('Invalid courses data from getAllCourses');
        }

        // Filter available courses
        const availableCourses = allCourses.filter(
            course => !courses.some(myCourse => myCourse._id === course._id)
        );

        console.log('Available Courses:', availableCourses);

        // Render the courses
        content.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">My Courses</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${courses.map(course => `
                    <div class="course-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer" 
                            onclick="loadView('course-detail', {courseId: '${course._id}'})">
                        <div class="h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <i class="fas fa-book-open text-3xl text-gray-400 dark:text-gray-500"></i>
                        </div>
                        <div class="h-2 ${course.color || 'bg-blue-500'}"></div>
                        <div class="p-4">
                            <h3 class="text-lg font-bold">${course.name}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${course.code}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">${course.instructor.firstName} ${course.instructor.lastName}</p>
                        </div>
                    </div>
                `).join('')}
            
            ${currentUser.role === 'student' ? ` 
                <div id="joinCourseCard" class="course-card bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col justify-center items-center p-6 cursor-pointer">
                    <div class= enroll-button "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <i class="fas fa-plus text-3xl text-primary dark:text-primaryLight"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Join New Course</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">click the plus sign</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">Enter a course code to enroll</p>
                </div>
            </div>
            ` : ''}
            </div>
            ${currentUser.role === 'instructor' ? `
                <div class="mt-8">
                    <h2 class="text-2xl font-bold mb-4">Create New Course</h2>
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                        <form id="createCourseForm" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Course Name</label>
                                    <input type="text" id="courseName" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Course Code</label>
                                    <input type="text" id="courseCode" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                            </div>
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea id="courseDescription" rows="3" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Enrollment Key (optional)</label>
                                    <input type="text" id="enrollmentKey" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Color Theme</label>
                                    <select id="courseColor" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                        <option value="bg-blue-500">Blue</option>
                                        <option value="bg-green-500">Green</option>
                                        <option value="bg-red-500">Red</option>
                                        <option value="bg-purple-500">Purple</option>
                                        <option value="bg-yellow-500">Yellow</option>
                                        <option value="bg-pink-500">Pink</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    Create Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ` : ''}

            ${availableCourses.length > 0 ? `
                <div class="mt-8">
                    <h2 class="text-2xl font-bold mb-4">Available Courses</h2>
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-750">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instructor</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                ${availableCourses.map(course => `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm font-medium">${course.name}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-500 dark:text-gray-400">${course.code}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-500 dark:text-gray-400">${course.instructor.firstName} ${course.instructor.lastName}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <button class="enroll-button px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition" data-course-id="${course._id}">
                                                Enroll
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
        `;

        // Setup enroll buttons
        document.querySelectorAll('.enroll-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const courseId = e.target.dataset.courseId;
                showEnrollmentKeyModal(courseId);
            });
        });
        
        // Setup create course form
        const createCourseForm = document.getElementById('createCourseForm');
        if (createCourseForm) {
            createCourseForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const courseData = {
                        name: document.getElementById('courseName').value,
                        code: document.getElementById('courseCode').value,
                        description: document.getElementById('courseDescription').value,
                        color: document.getElementById('courseColor').value,
                        enrollmentKey: document.getElementById('enrollmentKey').value || undefined
                    };
                    
                    await courseService.createCourse(courseData);
                    showToast('Course created successfully!');
                    loadView('courses');
                } catch (error) {
                    showToast(`Failed to create course: ${error.message}`, 'error');
                }
            });
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        showToast('Failed to load courses', 'error');
    }
}

// Course detail view
async function loadCourseDetail(courseId) {
    // Fetch course data
    const courseResponse = await courseService.getCourse(courseId);
    const course = courseResponse.data.course;
    console.log('Course:', course);
    currentCourse = course;
    
    // Fetch course-related data
    const resourcesResponse = await resourceService.getCourseResources(courseId);
    const courseResources = resourcesResponse.data.resources;
    
    const assignmentsResponse = await assignmentService.getCourseAssignments(courseId);
    const courseAssignments = assignmentsResponse.data.assignments;
    
    const discussionsResponse = await discussionService.getCourseDiscussions(courseId);
    const courseDiscussions = discussionsResponse.data.discussions;
  
    const announcementsResponse = await announcementService.getCourseAnnouncements(courseId);
    const courseAnnouncements = announcementsResponse.data.announcements;
    
    // Render the course detail page
    content.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div class="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <i class="fas fa-book-open text-5xl text-gray-400 dark:text-gray-500"></i>
        </div>
        <div class="h-2 ${course.color || 'bg-blue-500'}"></div>
        <div class="p-6">
          <div class="flex flex-wrap justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold">${course.name}</h2>
              <p class="text-gray-600 dark:text-gray-400">
                ${course.code} • ${course.instructor.firstName} ${course.instructor.lastName}
              </p>
            </div>
            <div class="flex mt-2 md:mt-0 space-x-2">
              
              
              ${currentUser.role === 'student' ? `
                <button class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                <i class="fas fa-envelope mr-2"></i>Contact Instructor
              </button>
                <button id="unenrollBtn" class="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition">
                  <i class="fas fa-sign-out-alt mr-2"></i>Unenroll
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
  
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
     
        <div class="lg:col-span-2">
        
          <!-- Announcements Section -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Announcements</h3>
              ${currentUser.role === 'instructor' ? `
                <button id="createAnnouncementBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                  <i class="fas fa-plus mr-1"></i> New Announcement
                </button>
              ` : ''}
            </div>
            ${courseAnnouncements.length > 0 ? `
              <div class="space-y-4">
                ${courseAnnouncements.map(announcement => `
                  <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div class="flex">
                      <img src="${getProfileImageUrl(announcement.author)}" alt="Instructor" class="w-10 h-10 rounded-full mr-3">
                      <div>
                        <p class="font-medium">${announcement.author.firstName} ${announcement.author.lastName} <span class="text-gray-500 dark:text-gray-400 font-normal text-sm">• ${formatTimeAgo(announcement.createdAt)}</span></p>
                        <p class="mt-1">${announcement.content}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <p class="text-gray-500 dark:text-gray-400">No announcements yet.</p>
            `}
          </div>
        <!-- Generate Link Section Section -->
         ${currentUser.role === 'instructor' && course.instructor._id === currentUser._id ? `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Enrollment Links</h3>
                <button id="generateLinkBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                    <i class="fas fa-plus mr-1"></i> Generate New Link
                </button>
            </div>
            
            <div id="courseLinksContainer" class="space-y-3">
                <div class="text-center py-4">
                    <div class="spinner w-8 h-8 border-4 border-gray-300 dark:border-gray-600 rounded-full mx-auto"></div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading enrollment links...</p>
                </div>
            </div>
        </div>
    ` : ''}
          <!-- Assignments Section -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Upcoming Assignments</h3>
              ${currentUser.role === 'instructor' ? `
                <button id="createAssignmentBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                  <i class="fas fa-plus mr-1"></i> New Assignment
                </button>
              ` : ''}
            </div>
            ${courseAssignments.length > 0 ? `
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                ${courseAssignments.map(assignment => {
                  const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  let statusBadge = '';
                  // Here you could add logic to check if the student has submitted the assignment
                  const isSubmitted = false;
                  if (!isSubmitted) {
                    statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</span>`;
                  } else {
                    statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Submitted</span>`;
                  }
                  return `
                    <div class="py-3 flex flex-wrap justify-between items-center">
                      <div class="mb-2 md:mb-0">
                        <p class="font-medium">${assignment.title}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Due: ${formatDate(assignment.dueDate)}</p>
                      </div>
                      <div class="flex items-center">
                        ${statusBadge}
                        <button class="ml-3 px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                          ${!isSubmitted ? 'Submit' : 'View'}
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <p class="text-gray-500 dark:text-gray-400">No assignments yet.</p>
            `}
          </div>
        </div>
    
        <div>
          <!-- Resources Section -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Resources</h3>
              <button id="uploadResourceBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                <i class="fas fa-upload mr-1"></i> Upload Resource
              </button>
            </div>
            ${courseResources.length > 0 ? `
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                ${courseResources.map(resource => {
                  let iconClass = 'fa-file';
                  if (resource.type === 'PDF') iconClass = 'fa-file-pdf text-red-500';
                  else if (resource.type === 'PPT') iconClass = 'fa-file-powerpoint text-orange-500';
                  else if (resource.type === 'Video') iconClass = 'fa-file-video text-blue-500';
                  return `
                    <div class="py-3 flex items-center">
                      <div class="mr-3 text-lg">
                        <i class="fas ${iconClass}"></i>
                      </div>
                      <div class="flex-1">
                        <p class="font-medium">${resource.title}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          ${resource.type} • Added ${formatDate(resource.createdAt)}
                        </p>
                      </div>
                      <button class="text-primary dark:text-primaryLight hover:underline text-sm" onclick="viewResource('${resource._id}')">
                        View
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <p class="text-gray-500 dark:text-gray-400 mb-3">No resources yet.</p>
            `}
            <button id="uploadResourceBtn2" class="w-full mt-3 px-3 py-2 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark rounded transition text-sm">
              <i class="fas fa-upload mr-1"></i> Upload Resource
            </button>
          </div>
    
          <!-- Discussions Section -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Discussions</h3>
              <button id="viewAllDiscussionsBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium" onclick="loadView('discussions')">
                View all
              </button>
            </div>
            ${courseDiscussions.length > 0 ? `
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                ${courseDiscussions.map(discussion => `
                  <div class="py-3 cursor-pointer" onclick="loadView('discussion-detail', {discussionId: '${discussion._id}'})">
                    <p class="font-medium">${discussion.title}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Started by ${discussion.author.firstName} ${discussion.author.lastName} • ${discussion.replyCount || discussion.replies?.length || 0} replies
                    </p>
                  </div>
                `).join('')}
              </div>
              <button id="newDiscussionBtn" class="w-full mt-3 px-3 py-2 bg-primary hover:bg-primaryDark text-white rounded transition text-sm">
                <i class="fas fa-plus mr-1"></i> New Discussion
              </button>
            ` : `
              <p class="text-gray-500 dark:text-gray-400 mb-3">No discussions yet.</p>
              <button id="newDiscussionBtn2" class="w-full px-3 py-2 bg-primary hover:bg-primaryDark text-white rounded transition text-sm">
                <i class="fas fa-plus mr-1"></i> Start Discussion
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  
    // Setup event listeners
    document.getElementById('uploadResourceBtn').addEventListener('click', showUploadResourceModal);
    document.getElementById('uploadResourceBtn2').addEventListener('click', showUploadResourceModal);
  
    const newDiscussionBtn = document.getElementById('newDiscussionBtn');
    const newDiscussionBtn2 = document.getElementById('newDiscussionBtn2');
    if (newDiscussionBtn) newDiscussionBtn.addEventListener('click', showNewDiscussionModal);
    if (newDiscussionBtn2) newDiscussionBtn2.addEventListener('click', showNewDiscussionModal);
  
    const createAnnouncementBtn = document.getElementById('createAnnouncementBtn');
    if (createAnnouncementBtn) {
      createAnnouncementBtn.addEventListener('click', () => showNewAnnouncementModal());
    }
  
    const createAssignmentBtn = document.getElementById('createAssignmentBtn');
    if (createAssignmentBtn) {
      createAssignmentBtn.addEventListener('click', showCreateAssignmentModal);
    }
  
    const unenrollBtn = document.getElementById('unenrollBtn');
    if (unenrollBtn) {
      unenrollBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to unenroll from this course?')) {
          try {
            await courseService.unenrollFromCourse(courseId);
            showToast('Successfully unenrolled from course');
            loadView('courses');
          } catch (error) {
            showToast(`Failed to unenroll: ${error.message}`, 'error');
          }
        }
      });
    }
    
    if (currentUser.role === 'instructor' && course.instructor._id === currentUser._id) {
    // Setup generate link button
    document.getElementById('generateLinkBtn').addEventListener('click', showGenerateLinkModal);
    
    // Load course links
    loadCourseLinks(course._id);
    }
}
  
// Discussion detail view
async function loadDiscussionDetail(discussionId) {
    // Fetch discussion data
    const response = await discussionService.getDiscussion(discussionId);
    const discussion = response.data.discussion;
    
    content.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div class="mb-4">
                <div class="flex items-center justify-between">
                    <a href="#" class="text-primary dark:text-primaryLight hover:underline flex items-center mb-2" onclick="loadView('course-detail', {courseId: '${discussion.course._id}'}); return false;">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Back to ${discussion.course.name}
                    </a>
                    ${discussion.isPinned ? `
                        <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            <i class="fas fa-thumbtack mr-1"></i> Pinned
                        </span>
                    ` : ''}
                    <!-- 🗑 Delete Button (Only for author, instructor, or admin) -->
                            ${(discussion.author._id === currentUser._id || currentUser.role === 'instructor' || currentUser.role === 'admin') ? `
                                <button class="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition"
                                        onclick="deleteDiscussion('${discussionId}')">
                                    <i class="fas fa-trash-alt mr-1"></i> Delete
                                </button>
                            ` : ''}
                </div>
                <h1 class="text-2xl font-bold">${discussion.title}</h1>
                <div class="flex items-center mt-2 mb-4">
                    <img src="${getProfileImageUrl(discussion.author)}" alt="${discussion.author.firstName}" class="w-8 h-8 rounded-full mr-2">
                    <div>
                        <p class="text-sm font-medium">${discussion.author.firstName} ${discussion.author.lastName}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${formatTimeAgo(discussion.createdAt)}</p>
                    </div>
                </div>
                <div class="prose dark:prose-invert max-w-none">
                    ${discussion.content}
                </div>
                
                ${discussion.tags && discussion.tags.length > 0 ? `
                    <div class="mt-4 flex flex-wrap gap-1">
                        ${discussion.tags.map(tag => `
                            <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                ${tag}
                            </span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="mr-4">
                    <i class="far fa-eye mr-1"></i> ${discussion.views || 0} views
                </div>
                <div>
                    <i class="far fa-comment mr-1"></i> ${discussion.replies?.length || 0} replies
                </div>
            </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">${discussion.replies?.length || 0} Replies</h2>
            
            ${!discussion.isLocked ? `
                <div class="mb-6">
                    <form id="replyForm" class="space-y-4">
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Your Reply</label>
                            <textarea id="replyContent" rows="4" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                        </div>
                        <div id="replyError" class="text-red-500 hidden"></div>
                        <div>
                            <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                Post Reply
                            </button>
                        </div>
                    </form>
                </div>
            ` : `
                <div class="bg-gray-100 dark:bg-gray-750 border-l-4 border-gray-400 p-4 mb-6">
                    <p class="text-gray-700 dark:text-gray-300">
                        <i class="fas fa-lock mr-2"></i>
                        This discussion is locked. No new replies can be added.
                    </p>
                </div>
            `}
            
            <div class="space-y-6">
                ${discussion.replies && discussion.replies.length > 0 ? discussion.replies.map(reply => `
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div class="flex">
                            <img src="${getProfileImageUrl(reply.author)}" alt="${reply.author.firstName}" class="w-10 h-10 rounded-full mr-3">
                            <div class="flex-1">
                                <div class="flex items-center">
                                    <p class="font-medium">${reply.author.firstName} ${reply.author.lastName}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 ml-2">${formatTimeAgo(reply.createdAt)}</p>
                                    ${reply.isEdited ? `
                                        <p class="text-xs text-gray-500 dark:text-gray-400 ml-2">(edited)</p>
                                    ` : ''}
                                </div>
                                <div class="mt-1 text-gray-700 dark:text-gray-300">
                                    ${reply.content}
                                </div>
                                <div class="mt-2 flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                    <button class="hover:text-gray-700 dark:hover:text-gray-200">
                                        <i class="far fa-thumbs-up mr-1"></i> ${reply.likes?.length || 0}
                                    </button>
                                    ${reply.author._id === currentUser._id || currentUser.role === 'instructor' || currentUser.role === 'admin' ? `
                                        <button class="ml-4 hover:text-red-500" delete-reply="${reply._id}" onclick="deleteReply('${discussionId}', '${reply._id}')">
                                            <i class="far fa-trash-alt mr-1"></i> Delete
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div class="text-center py-6 text-gray-500 dark:text-gray-400">
                        No replies yet. Be the first to reply!
                    </div>
                `}
            </div>
        </div>
    `;

    // Set up reply form submission
    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
        replyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const content = document.getElementById('replyContent').value;
            const errorDiv = document.getElementById('replyError');
            
            try {
                errorDiv.classList.add('hidden');
                
                // Add reply
                await discussionService.addReply(discussionId, { content });
                
                // Reload discussion
                loadView('discussion-detail', { discussionId });
                showToast('Reply added successfully!');
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });
    }
}
async function deleteDiscussion(discussionId) {
    if (!confirm("Are you sure you want to delete this discussion? This action cannot be undone.")) {
        return;
    }

    try {
        await discussionService.deleteDiscussion(discussionId);
        showToast("Discussion deleted successfully.");
        loadView("discussions"); // Redirect back to discussions list
    } catch (error) {
        showToast(`Failed to delete discussion: ${error.message}`, "error");
    }

}
async function deleteReply(discussionId, replyId) {
    if (!confirm("Are you sure you want to delete this reply? This action cannot be undone.")) {
        return;
    }

    try {
        await discussionService.deleteReply(discussionId, replyId);
        showToast("Reply deleted successfully.");
        loadView("discussion-detail", { discussionId });
    } catch (error) {
        showToast(`Failed to delete reply: ${error.message}`, "error");
    }   
}

async function loadResources() {
    try {
        // Fetch resources
        const resourcesResponse = await resourceService.getAllResources();
        const resources = resourcesResponse.data.resources;
        
        // Make sure each resource has a valid course object
        resources.forEach(resource => {
            // If course is missing or invalid, provide a fallback
            if (!resource.course || typeof resource.course !== 'object') {
                resource.course = {
                    _id: 'unknown',
                    code: 'N/A',
                    color: '#888888'
                };
            }
        });
        
        // Fetch popular resources
        let popularResources = [];
        try {
            const popularResponse = await resourceService.getPopularResources();
            popularResources = popularResponse.data.resources;
            
            // Apply same course validity check to popular resources
            popularResources.forEach(resource => {
                if (!resource.course || typeof resource.course !== 'object') {
                    resource.course = {
                        _id: 'unknown',
                        code: 'N/A',
                        color: '#888888'
                    };
                }
            });
        } catch (error) {
            console.warn('Could not fetch popular resources:', error);
            // If popular resources endpoint fails, create a fallback
            popularResources = resources
                .slice() // Create a copy to avoid modifying the original
                .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
                .slice(0, 5);
        }
        
        // Fetch user's courses for filtering
        const coursesResponse = await courseService.getMyCourses();
        const courses = coursesResponse.data.courses;
        
        // Sort resources by date (newest first)
        resources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        content.innerHTML = `
            <div class="flex flex-wrap justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Resources</h2>
                <div class="mt-2 sm:mt-0 flex flex-wrap gap-2">
                    <div class="relative">
                        <input type="text" id="searchResources" placeholder="Search resources..." class="pl-10 pr-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <div class="flex flex-wrap justify-between items-center mb-4">
                            <div class="flex flex-wrap gap-2 mb-2 sm:mb-0">
                                <button class="resource-filter-btn px-3 py-1.5 bg-primary text-white rounded-lg text-sm" data-filter="all">All</button>
                                <button class="resource-filter-btn px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm" data-filter="documents">Documents</button>
                                <button class="resource-filter-btn px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm" data-filter="videos">Videos</button>
                                <button class="resource-filter-btn px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm" data-filter="myuploads">My Uploads</button>
                            </div>
                            
                            <div class="flex flex-wrap gap-2">
                                <select id="courseFilter" class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-800">
                                    <option value="all">All Courses</option>
                                    ${courses.map(course => `<option value="${course._id}">${course.code}</option>`).join('')}
                                </select>
                                <select id="resourceSort" class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-800">
                                    <option value="latest">Sort: Latest</option>
                                    <option value="downloads">Sort: Most Downloads</option>
                                    <option value="name">Sort: Name</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="resourcesList" class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${resources.length === 0 ? `
                                <div class="py-6 text-center text-gray-500 dark:text-gray-400">
                                    <p>No resources found.</p>
                                </div>
                            ` : resources.map(resource => {
                                // Ensure uploader has a valid object structure
                                const uploader = resource.addedBy || { _id: 'unknown', firstName: 'Unknown', lastName: 'User' };
                                const course = resource.course; // 
                                const isMyUpload = uploader._id === currentUser._id;
                                const fileIcon = getFileIcon(resource.file?.fileType || 'unknown');
                                
                                return `
                                    <div class="py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 -mx-5 px-5 transition resource-item" 
                                        data-course="${course._id}"
                                        data-type="${(resource.file?.fileType || resource.file?.fileName?.split('.').pop() || 'unknown').toLowerCase()}"
                                        data-myupload="${isMyUpload}">
                                        <div class="flex justify-between items-start">
                                            <div class="flex">
                                                <div class="flex-shrink-0 mr-3 text-2xl text-primary">
                                                    <i class="${fileIcon}"></i>
                                                </div>
                                                <div>
                                                    <div class="flex items-center gap-2">
                                                    <div class="flex items-center gap-3">
                                                        <h4 class="font-medium">${resource.title || 'Untitled Resource'}</h4>
                                                    </div>
                                                        ${resource.isPinned ? `
                                                            <span class="text-yellow-500 dark:text-yellow-400" title="Pinned">
                                                                <i class="fas fa-thumbtack"></i>
                                                            </span>
                                                        ` : ''}
                                                    </div>
                                                    <div class="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <span class="px-2 py-0.5 text-xs rounded-full" style="background-color: ${course.color || 'var(--tw-colors-blue-500)'}25; color: ${course.color || 'var(--tw-colors-blue-500)'};">
                                                            ${course.code}
                                                        </span>
                                                        <span class="mx-2">•</span>
                                                        <span>Uploaded by ${uploader.firstName} ${uploader.lastName}</span>
                                                        <span class="mx-2">•</span>
                                                        <span>${formatTimeAgo(resource.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                <i class="fas fa-download mr-1"></i> ${resource.downloadCount || 0}
                                                <span class="ml-2 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                                    ${formatFileSize(resource.file?.fileSize || 0)}
                                                </span>
                                                <p class="mr-1 mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                                ${resource.description || 'No description provided.'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <button 
                                        class="mt-3 px-3 py-0.5 bg-primary hover:bg-primaryDark text-white rounded-full transition text-align:right text-sm" onclick="viewResource('${resource._id}')">
                                        View
                                        </button>
                                        ${resource.tags && resource.tags.length > 0 ? `
                                            <div class="mt-2 flex flex-wrap gap-1">
                                                ${resource.tags.map(tag => `
                                                    <span class="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                                        ${tag}
                                                    </span>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        
                        ${resources.length > 10 ? `
                            <div class="mt-4 text-center">
                                <button id="loadMoreBtn" class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-650 transition">
                                    Load More
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h3 class="text-lg font-semibold mb-4">Popular Resources</h3>
                        <div class="space-y-3">
                            ${popularResources.length > 0 ? popularResources.slice(0, 5).map(resource => {
                                const fileIcon = getFileIcon(resource.fileType || 'unknown');
                                // Ensure course is available and valid
                                const course = resource.course || { code: 'N/A' };
                                return `
                                <div class="flex items-start cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 -mx-5 px-5 py-2 transition" onclick="loadView('resource-detail', {resourceId: '${resource._id}'})">
                                    <div class="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                                        <i class="${fileIcon}"></i>
                                    </div>
                                    <div>
                                    <p class="font-medium line-clamp-1">${resource.title || 'Untitled Resource'}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">
                                            ${course.code} • ${formatTimeAgo(resource.createdAt)}
                                    </p>
                                    </div>
                                    <div class="ml-auto text-xs text-gray-500">
                                        <i class="fas fa-download"></i> ${resource.downloadCount || 0}
                                    </div>
                                </div>
                            `}).join('') : `
                                <p class="text-gray-500 dark:text-gray-400">No popular resources yet.</p>
                            `}
                        </div>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                        <h3 class="text-lg font-semibold mb-4">My Activity</h3>
                        <div>
                            ${resources.filter(r => r.uploader && r.uploader._id === currentUser._id).length > 0 ? `
                                <div class="space-y-2">
                                    <p class="mb-2 text-gray-700 dark:text-gray-300">
                                        <span class="font-semibold">My Uploads:</span> ${resources.filter(r => r.uploader && r.uploader._id === currentUser._id).length}
                                    </p>
                                    <p class="mb-2 text-gray-700 dark:text-gray-300">
                                        <span class="font-semibold">Total Downloads:</span> ${resources
                                            .filter(r => r.uploader && r.uploader._id === currentUser._id)
                                            .reduce((total, resource) => total + (resource.downloadCount || 0), 0)}
                                    </p>
                                    <button id="viewMyUploadsBtn" class="mt-2 w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                        View My Uploads
                                    </button>
                                </div>
                            ` : `
                                <p class="text-gray-500 dark:text-gray-400 mb-3">You haven't uploaded any resources yet.</p>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Helper function to get appropriate icon for file type
        function getFileIcon(fileType) {
            if (!fileType) return 'far fa-file';
            
            switch(fileType.toLowerCase()) {
                case 'pdf': return 'far fa-file-pdf';
                case 'doc':
                case 'docx': return 'far fa-file-word';
                case 'xls':
                case 'xlsx': return 'far fa-file-excel';
                case 'ppt':
                case 'pptx': return 'far fa-file-powerpoint';
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif': return 'far fa-file-image';
                case 'mp4':
                case 'avi':
                case 'mov': return 'far fa-file-video';
                case 'mp3':
                case 'wav': return 'far fa-file-audio';
                case 'zip':
                case 'rar': return 'far fa-file-archive';
                default: return 'far fa-file';
            }
        }
        
        // Helper function to format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }
        
        // Setup event listeners
        
        const uploadFirstResourceBtn = document.getElementById('uploadFirstResourceBtn');
        if (uploadFirstResourceBtn) {
            uploadFirstResourceBtn.addEventListener('click', () => showUploadResourceModal());
        }
        
        const viewMyUploadsBtn = document.getElementById('viewMyUploadsBtn');
        if (viewMyUploadsBtn) {
            viewMyUploadsBtn.addEventListener('click', () => {
                // Select the "My Uploads" filter button and trigger a click
                const myUploadsBtn = document.querySelector('.resource-filter-btn[data-filter="myuploads"]');
                if (myUploadsBtn) myUploadsBtn.click();
            });
        }
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('.resource-filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                filterButtons.forEach(btn => {
                    btn.classList.remove('bg-primary', 'text-white');
                    btn.classList.add('bg-gray-200', 'dark:bg-gray-700');
                });
                button.classList.remove('bg-gray-200', 'dark:bg-gray-700');
                button.classList.add('bg-primary', 'text-white');
                
                const filter = button.dataset.filter;
                const items = document.querySelectorAll('.resource-item');
                
                items.forEach(item => {
                    if (filter === 'all') {
                        item.classList.remove('hidden');
                    } else if (filter === 'documents') {
                        const fileType = item.dataset.type ? item.dataset.type.toLowerCase() : 'unknown';  // Ensure dataset.type is defined
                        const isDocument = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].some(ext => fileType.includes(ext));
                        item.classList.toggle('hidden', !isDocument);
                    }
                    
                     else if (filter === 'videos') {
                        const fileType = item.dataset.type.toLowerCase();
                        const isVideo = ['mp4', 'avi', 'mov', 'webm'].includes(fileType);
                        item.classList.toggle('hidden', !isVideo);
                    } else if (filter === 'myuploads') {
                        const isMyUpload = item.dataset.myupload === 'true';
                        item.classList.toggle('hidden', !isMyUpload);
                    }
                });
                
                // Apply course filter if selected
                applyCourseFilter();
            });
        });
        
        // Course filter
        const courseFilter = document.getElementById('courseFilter');
        if (courseFilter) {
            courseFilter.addEventListener('change', applyCourseFilter);
        }
        
        function applyCourseFilter() {
            const courseFilter = document.getElementById('courseFilter');
            if (!courseFilter) return;
            
            const courseId = courseFilter.value;
            const items = document.querySelectorAll('.resource-item:not(.hidden)');
            
            items.forEach(item => {
                if (courseId === 'all') {
                    item.classList.remove('hidden-by-course');
                } else {
                    const itemCourseId = item.dataset.course;
                    item.classList.toggle('hidden-by-course', itemCourseId !== courseId);
                }
                
                // Finally check both filters
                item.style.display = (item.classList.contains('hidden') || item.classList.contains('hidden-by-course')) ? 'none' : '';
            });
        }
        
        // Sort dropdown
        const resourceSort = document.getElementById('resourceSort');
        if (resourceSort) {
            resourceSort.addEventListener('change', () => {
                const sortValue = resourceSort.value;
                const resourcesList = document.getElementById('resourcesList');
                const items = Array.from(resourcesList.querySelectorAll('.resource-item'));
                
                // Sort the items
                items.sort((a, b) => {
                    // Safely extract resource IDs using try/catch to prevent errors
                    let aId, bId;
                    try {
                        aId = a.getAttribute('onclick').match(/resourceId: '([^']+)'/)[1];
                    } catch (e) {
                        console.warn('Could not extract resource ID from item', a);
                        aId = '';
                    }
                    
                    try {
                        bId = b.getAttribute('onclick').match(/resourceId: '([^']+)'/)[1];
                    } catch (e) {
                        console.warn('Could not extract resource ID from item', b);
                        bId = '';
                    }
                    
                    const aData = resources.find(r => r._id === aId) || {};
                    const bData = resources.find(r => r._id === bId) || {};
                    
                    if (sortValue === 'latest') {
                        const aDate = aData.createdAt ? new Date(aData.createdAt) : new Date(0);
                        const bDate = bData.createdAt ? new Date(bData.createdAt) : new Date(0);
                        return bDate - aDate;
                    } else if (sortValue === 'downloads') {
                        return (bData.downloadCount || 0) - (aData.downloadCount || 0);
                    } else if (sortValue === 'name') {
                        return (aData.title || '').localeCompare(bData.title || '');
                    }
                    return 0;
                });
                
                // Re-append the items in the new order
                items.forEach(item => resourcesList.appendChild(item));
            });
        }
        
        // Search input
        const searchInput = document.getElementById('searchResources');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const items = document.querySelectorAll('.resource-item');
                
                items.forEach(item => {
                    const title = item.querySelector('h4')?.textContent.toLowerCase() || '';
                    const description = item.querySelector('p.line-clamp-2')?.textContent.toLowerCase() || '';
                    const hasMatch = title.includes(searchTerm) || description.includes(searchTerm);
                    
                    item.classList.toggle('hidden-by-search', !hasMatch);
                    
                    // Check all filter states
                    item.style.display = (
                        item.classList.contains('hidden') || 
                        item.classList.contains('hidden-by-course') ||
                        item.classList.contains('hidden-by-search')
                    ) ? 'none' : '';
                });
            });
        }
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            // In a real app, this would load the next page of resources
            // For now, we'll just hide the button after clicking
            loadMoreBtn.addEventListener('click', () => {
                loadMoreBtn.textContent = 'No more resources to load';
                loadMoreBtn.disabled = true;
                loadMoreBtn.classList.add('opacity-50', 'cursor-not-allowed');
            });
        }
        
    } catch (error) {
        console.error('Error loading resources:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading resources</p>
                <p>${error.message || 'Failed to load resources'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadView('resources')">
                    Try Again
                </button>
            </div>
        `;
    }
}




// Discussions view
async function loadDiscussions() {
    try {
        // Fetch discussions
        const discussionsResponse = await discussionService.getAllDiscussions();
        const discussions = discussionsResponse.data.discussions;
        
        // Fetch popular discussions
        let popularDiscussions = [];
        try {
            const popularResponse = await discussionService.getPopularDiscussions();
            popularDiscussions = popularResponse.data.discussions;
        } catch (error) {
            console.warn('Could not fetch popular discussions:', error);
            // If popular discussions endpoint fails, create a fallback
            popularDiscussions = discussions
                .slice() // Create a copy to avoid modifying the original
                .sort((a, b) => (b.replyCount || b.replies?.length || 0) - (a.replyCount || a.replies?.length || 0))
                .slice(0, 5);
        }
        
        // Fetch user's courses for filtering
        const coursesResponse = await courseService.getMyCourses();
        const courses = coursesResponse.data.courses;
        
        // Sort discussions by date (newest first)
        discussions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        content.innerHTML = `
            <div class="flex flex-wrap justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Discussions</h2>
                <div class="mt-2 sm:mt-0 flex flex-wrap gap-2">
                    <div class="relative">
                        <input type="text" id="searchDiscussions" placeholder="Search discussions..." class="pl-10 pr-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <div class="flex flex-wrap justify-between items-center mb-4">
                            <div class="flex flex-wrap gap-2 mb-2 sm:mb-0">
                                <button class="discussion-filter-btn px-3 py-1.5 bg-primary text-white rounded-lg text-sm" data-filter="all">All</button>
                                <button class="discussion-filter-btn px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm" data-filter="unread">Unread</button>
                                <button class="discussion-filter-btn px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm" data-filter="my">My Posts</button>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <select id="courseFilter" class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-800">
                                    <option value="all">All Courses</option>
                                    ${courses.map(course => `<option value="${course._id}">${course.code}</option>`).join('')}
                                </select>
                                <select id="discussionSort" class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-800">
                                    <option value="latest">Sort: Latest</option>
                                    <option value="active">Sort: Most Active</option>
                                    <option value="oldest">Sort: Oldest</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="discussionsList" class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${discussions.length === 0 ? `
                                <div class="py-6 text-center text-gray-500 dark:text-gray-400">
                                    <p>No discussions found.</p>
                                    <p class="mt-1 text-sm">Be the first to start a discussion!</p>
                                    <button id="emptyStateDiscussionBtn" class="mt-3 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                        <i class="fas fa-plus mr-1"></i> New Discussion
                                    </button>
                                </div>
                            ` : discussions.map(discussion => {
                                const course = discussion.course;
                                const isMyPost = discussion.author._id === currentUser._id;
                                
                                return `
                                    <div class="py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 -mx-5 px-5 transition discussion-item ${isMyPost ? 'my-discussion' : ''}" 
                                        data-course="${course._id}"
                                        data-mypost="${isMyPost}"
                                        onclick="loadView('discussion-detail', {discussionId: '${discussion._id}'})">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <div class="flex items-center gap-2">
                                                    <h4 class="font-medium">${discussion.title}</h4>
                                        
                                                    ${discussion.isPinned ? `
                                                        <span class="text-yellow-500 dark:text-yellow-400" title="Pinned">
                                                            <i class="fas fa-thumbtack"></i>
                                                        </span>
                                                    ` : ''}
                                                </div>
                                                <div class="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <span class="px-2 py-0.5 text-xs rounded-full" style="background-color: ${course.color || 'var(--tw-colors-blue-500)'}25; color: ${course.color || 'var(--tw-colors-blue-500)'};">
                                                        ${course.code}
                                                    </span>
                                                    <span class="mx-2">•</span>
                                                    <span>Started by ${discussion.author.firstName} ${discussion.author.lastName}</span>
                                                    <span class="mx-2">•</span>
                                                    <span>${formatTimeAgo(discussion.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                <i class="far fa-comment-alt mr-1"></i> ${discussion.replyCount || discussion.replies?.length || 0} replies
                                            </div>
                                        </div>
                                        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                            ${discussion.content}
                                        </p>
                                        ${discussion.tags && discussion.tags.length > 0 ? `
                                            <div class="mt-2 flex flex-wrap gap-1">
                                                ${discussion.tags.map(tag => `
                                                    <span class="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                                        ${tag}
                                                    </span>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        
                        ${discussions.length > 10 ? `
                            <div class="mt-4 text-center">
                                <button id="loadMoreBtn" class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-650 transition">
                                    Load More
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h3 class="text-lg font-semibold mb-4">Popular Discussions</h3>
                        <div class="space-y-3">
                            ${popularDiscussions.length > 0 ? popularDiscussions.slice(0, 5).map(discussion => `
                                <div class="flex items-start cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 -mx-5 px-5 py-2 transition" onclick="loadView('discussion-detail', {discussionId: '${discussion._id}'})">
                                    <div class="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 mr-3">
                                        <span class="text-xs font-semibold">${discussion.replyCount || discussion.replies?.length || 0}</span>
                                    </div>
                                    <div>
                                        <p class="font-medium line-clamp-1">${discussion.title}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                            ${discussion.course.code} • ${formatTimeAgo(discussion.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            `).join('') : `
                                <p class="text-gray-500 dark:text-gray-400">No popular discussions yet.</p>
                            `}
                        </div>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                        <h3 class="text-lg font-semibold mb-4">My Activity</h3>
                        <div>
                            ${discussions.filter(d => d.author._id === currentUser._id).length > 0 ? `
                                <div class="space-y-2">
                                    <p class="mb-2 text-gray-700 dark:text-gray-300">
                                        <span class="font-semibold">My Discussions:</span> ${discussions.filter(d => d.author._id === currentUser._id).length}
                                    </p>
                                    <p class="mb-2 text-gray-700 dark:text-gray-300">
                                        <span class="font-semibold">Total Replies:</span> ${discussions.reduce((total, discussion) => {
                                            const myReplies = (discussion.replies || []).filter(reply => reply.author._id === currentUser._id).length;
                                            return total + myReplies;
                                        }, 0)}
                                    </p>
                                    <button id="viewMyDiscussionsBtn" class="mt-2 w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                        View My Discussions
                                    </button>
                                </div>
                            ` : `
                                <p class="text-gray-500 dark:text-gray-400 mb-3">You haven't started any discussions yet.</p>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Setup event listeners
        
        const emptyStateDiscussionBtn = document.getElementById('emptyStateDiscussionBtn');
        if (emptyStateDiscussionBtn) {
            emptyStateDiscussionBtn.addEventListener('click', () => showNewDiscussionModal());
        }
        
        const startFirstDiscussionBtn = document.getElementById('startFirstDiscussionBtn');
        if (startFirstDiscussionBtn) {
            startFirstDiscussionBtn.addEventListener('click', () => showNewDiscussionModal());
        }
        
        const viewMyDiscussionsBtn = document.getElementById('viewMyDiscussionsBtn');
        if (viewMyDiscussionsBtn) {
            viewMyDiscussionsBtn.addEventListener('click', () => {
                // Select the "My Posts" filter button and trigger a click
                const myPostsBtn = document.querySelector('.discussion-filter-btn[data-filter="my"]');
                if (myPostsBtn) myPostsBtn.click();
            });
        }
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('.discussion-filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                filterButtons.forEach(btn => {
                    btn.classList.remove('bg-primary', 'text-white');
                    btn.classList.add('bg-gray-200', 'dark:bg-gray-700');
                });
                button.classList.remove('bg-gray-200', 'dark:bg-gray-700');
                button.classList.add('bg-primary', 'text-white');
                
                const filter = button.dataset.filter;
                const items = document.querySelectorAll('.discussion-item');
                
                items.forEach(item => {
                    if (filter === 'all') {
                        item.classList.remove('hidden');
                    } else if (filter === 'unread') {
                        // In a real app, you would check if the discussion is read
                        // For now, we'll just show all
                        item.classList.remove('hidden');
                    } else if (filter === 'my') {
                        const isMyPost = item.dataset.mypost === 'true';
                        item.classList.toggle('hidden', !isMyPost);
                    }
                });
                
                // Apply course filter if selected
                applyCourseFilter();
            });
        });
        
        // Course filter
        const courseFilter = document.getElementById('courseFilter');
        if (courseFilter) {
            courseFilter.addEventListener('change', applyCourseFilter);
        }
        
        function applyCourseFilter() {
            const courseId = courseFilter.value;
            const items = document.querySelectorAll('.discussion-item:not(.hidden)');
            
            items.forEach(item => {
                if (courseId === 'all') {
                    item.classList.remove('hidden-by-course');
                } else {
                    const itemCourseId = item.dataset.course;
                    item.classList.toggle('hidden-by-course', itemCourseId !== courseId);
                }
                
                // Finally check both filters
                item.style.display = (item.classList.contains('hidden') || item.classList.contains('hidden-by-course')) ? 'none' : '';
            });
        }
        
        // Sort dropdown
        const discussionSort = document.getElementById('discussionSort');
        if (discussionSort) {
            discussionSort.addEventListener('change', () => {
                const sortValue = discussionSort.value;
                const discussionsList = document.getElementById('discussionsList');
                const items = Array.from(discussionsList.querySelectorAll('.discussion-item'));
                
                // Sort the items
                items.sort((a, b) => {
                    const aData = discussions.find(d => d._id === a.getAttribute('onclick').match(/discussionId: '([^']+)'/)[1]);
                    const bData = discussions.find(d => d._id === b.getAttribute('onclick').match(/discussionId: '([^']+)'/)[1]);
                    
                    if (sortValue === 'latest') {
                        return new Date(bData.createdAt) - new Date(aData.createdAt);
                    } else if (sortValue === 'oldest') {
                        return new Date(aData.createdAt) - new Date(bData.createdAt);
                    } else if (sortValue === 'active') {
                        const aReplies = aData.replyCount || aData.replies?.length || 0;
                        const bReplies = bData.replyCount || bData.replies?.length || 0;
                        return bReplies - aReplies;
                    }
                    return 0;
                });
                
                // Re-append the items in the new order
                items.forEach(item => discussionsList.appendChild(item));
            });
        }
        
        // Search input
        const searchInput = document.getElementById('searchDiscussions');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const items = document.querySelectorAll('.discussion-item');
                
                items.forEach(item => {
                    const title = item.querySelector('h4').textContent.toLowerCase();
                    const content = item.querySelector('p.line-clamp-2').textContent.toLowerCase();
                    const hasMatch = title.includes(searchTerm) || content.includes(searchTerm);
                    
                    item.classList.toggle('hidden-by-search', !hasMatch);
                    
                    // Check all filter states
                    item.style.display = (
                        item.classList.contains('hidden') || 
                        item.classList.contains('hidden-by-course') ||
                        item.classList.contains('hidden-by-search')
                    ) ? 'none' : '';
                });
            });
        }
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            // In a real app, this would load the next page of discussions
            // For now, we'll just hide the button after clicking
            loadMoreBtn.addEventListener('click', () => {
                loadMoreBtn.textContent = 'No more discussions to load';
                loadMoreBtn.disabled = true;
                loadMoreBtn.classList.add('opacity-50', 'cursor-not-allowed');
            });
        }
        
    } catch (error) {
        console.error('Error loading discussions:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading discussions</p>
                <p>${error.message || 'Failed to load discussions'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadView('discussions')">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Show new discussion modal
function showNewDiscussionModal() {
    // First get user's courses for course selection
    courseService.getMyCourses()
        .then(response => {
            const courses = response.data.courses;
            
            // Show modal for creating a new discussion
            const modalHtml = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-semibold">Start New Discussion</h3>
                            <button id="closeDiscussionModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form id="createDiscussionForm" class="space-y-4">
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                                <input type="text" id="discussionTitle" required placeholder="Enter a descriptive title" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Course</label>
                                <select id="discussionCourse" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    <option value="">Select a course</option>
                                    ${courses.map(course => `<option value="${course._id}">${course.name} (${course.code})</option>`).join('')}
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Content</label>
                                <textarea id="discussionContent" rows="6" required placeholder="Share your thoughts or questions here..." class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    You can use Markdown for formatting
                                </p>
                            </div>
                            
                            <div id="discussionError" class="text-red-500 hidden"></div>
                            
                            <div class="flex justify-end">
                                <button type="button" id="cancelDiscussionBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                    Cancel
                                </button>
                                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    Create Discussion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            // Add modal to the document
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHtml;
            document.body.appendChild(modalContainer);
            
            // Setup event listeners
            document.getElementById('closeDiscussionModal').addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });
            
            document.getElementById('cancelDiscussionBtn').addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });
            
            // Set current course if we're in a course context
            if (currentCourse) {
                const courseSelect = document.getElementById('discussionCourse');
                const option = Array.from(courseSelect.options).find(opt => opt.value === currentCourse._id);
                if (option) {
                    option.selected = true;
                }
            }
            
            // Setup form submission
            document.getElementById('createDiscussionForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const discussionData = {
                        title: document.getElementById('discussionTitle').value,
                        content: document.getElementById('discussionContent').value,
                        course: document.getElementById('discussionCourse').value
                    };
                    
                    await discussionService.createDiscussion(discussionData);
                    document.body.removeChild(modalContainer);
                    showToast(`Discussion created successfully!`);
                    
                    // Reload discussions view
                    loadView('discussions');
                } catch (error) {
                    const errorDiv = document.getElementById('discussionError');
                    errorDiv.textContent = error.message;
                    errorDiv.classList.remove('hidden');
                }
            });
        })
        .catch(error => {
            console.error('Error fetching courses for discussion:', error);
            showToast('Failed to load courses. Please try again.', 'error');
        });
}


// Assignments view
// Assignments view with proper categorization for both roles
async function loadAssignments() {
    try {
        // Fetch all assignments
        const assignmentsResponse = await assignmentService.getAllAssignments();
        const assignments = assignmentsResponse.data.assignments;
        
        // Get all courses for filter
        const coursesResponse = await courseService.getMyCourses();
        const courses = coursesResponse.data.courses;
        
        // Group assignments by status
        const upcomingAssignments = []; // Not due yet
        const missedAssignments = [];   // Past due without submission
        const submittedAssignments = []; // Submitted but not graded
        const gradedAssignments = [];   // Submitted and graded
        
        // For instructors, track assignments needing grading
        const assignmentsToGrade = [];
        const pastDueAssignments = [];  // Past due assignments (instructor view)
        
        // Process each assignment
        for (const assignment of assignments) {
            // Get the current date for comparison
            const currentDate = new Date();
            const dueDate = new Date(assignment.dueDate);
            const isPastDue = dueDate < currentDate;
            
            // Check if the assignment has submissions
            let submissions = [];
            try {
                const submissionsResponse = await assignmentService.getSubmissions(assignment._id);
                submissions = submissionsResponse.data.submissions;
            } catch (error) {
                console.warn(`Could not fetch submissions for assignment ${assignment._id}:`, error);
            }
            
            // Store all submissions with the assignment for reference
            assignment.submissions = submissions;
            
            // Different processing based on user role
            if (currentUser.role === 'student') {
                // Find the student's own submission
                const mySubmission = submissions.find(s => 
                    (typeof s.student === 'object' && s.student._id === currentUser._id) || 
                    s.student === currentUser._id
                );
                
                if (mySubmission) {
                    // Store submission with assignment for reference
                    assignment.mySubmission = mySubmission;
                    
                    if (mySubmission.status === 'graded' || mySubmission.grade) {
                        // Assignment is graded
                        assignment.myGrade = mySubmission.grade;
                        gradedAssignments.push(assignment);
                    } else {
                        // Assignment is submitted but not graded
                        submittedAssignments.push(assignment);
                    }
                } else {
                    // No submission found
                    if (isPastDue) {
                        // Assignment is past due without submission
                        assignment.isPastDue = true;
                        missedAssignments.push(assignment);
                    } else {
                        // Assignment is still pending/upcoming
                        upcomingAssignments.push(assignment);
                    }
                }
            } else if (currentUser.role === 'instructor') {
                // For instructors, check if this is their course
                const isInstructorCourse = assignment.course.instructor === currentUser._id || 
                                          (typeof assignment.course.instructor === 'object' && 
                                           assignment.course.instructor._id === currentUser._id);
                
                if (!isInstructorCourse) {
                    // Skip assignments for courses where user is not the instructor
                    continue;
                }
                
                // Check for ungraded submissions
                const ungradedSubmissions = submissions.filter(s => 
                    !s.status || s.status !== 'graded' || !s.grade
                );
                
                if (ungradedSubmissions.length > 0) {
                    assignment.ungradedCount = ungradedSubmissions.length;
                    assignmentsToGrade.push(assignment);
                }
                
                // Categorize by due date for instructors
                if (isPastDue) {
                    pastDueAssignments.push(assignment);
                } else {
                    upcomingAssignments.push(assignment);
                }
            }
        }
        
        // Sort assignments by due date
        upcomingAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        missedAssignments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        submittedAssignments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        gradedAssignments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        assignmentsToGrade.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        pastDueAssignments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        
        content.innerHTML = `
            <div class="flex flex-wrap justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Assignments</h2>
                <div class="mt-2 sm:mt-0 flex space-x-2">
                    <select id="courseFilter" class="px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        <option value="all">All Courses</option>
                        ${courses.map(course => `<option value="${course._id}">${course.code} - ${course.name}</option>`).join('')}
                    </select>
                    
                    ${currentUser.role === 'instructor' ? `
                        <button id="createAssignmentBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            <i class="fas fa-plus mr-1"></i> New Assignment
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="flex mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <button id="upcomingTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-primary text-primary dark:text-primaryLight">
                    ${currentUser.role === 'student' ? 'Upcoming' : 'Active'} (${upcomingAssignments.length})
                </button>
                
                ${currentUser.role === 'student' ? `
                    <button id="missedTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        Missed (${missedAssignments.length})
                    </button>
                    <button id="submittedTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        Submitted (${submittedAssignments.length})
                    </button>
                    <button id="gradedTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        Graded (${gradedAssignments.length})
                    </button>
                ` : `
                    <button id="pastDueTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        Past Due (${pastDueAssignments.length})
                    </button>
                    ${assignmentsToGrade.length > 0 ? `
                        <button id="gradeTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            To Grade (${assignmentsToGrade.length})
                        </button>
                    ` : ''}
                `}
            </div>
            
            <!-- Upcoming/Active Assignments Tab -->
            <div id="upcomingTab-content" class="assignment-tab-content">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                    <h3 class="text-lg font-semibold mb-4">
                        ${currentUser.role === 'student' ? 'Upcoming Assignments' : 'Active Assignments'}
                    </h3>
                    ${upcomingAssignments.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                    ${upcomingAssignments.map(assignment => {
                                        const course = assignment.course;
                                        const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                                        let statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
                                        let statusText = 'Upcoming';
                                        
                                        if (daysLeft <= 1) {
                                            statusClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
                                            statusText = 'Due Soon';
                                        }
                                        
                                        const courseId = typeof course === 'object' ? course._id : course;
                                        const courseCode = typeof course === 'object' ? course.code : 'Course';
                                        const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';
                                        
                                        return `
                                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                <td class="px-4 py-4">
                                                    <p class="font-medium">${assignment.title}</p>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                </td>
                                                <td class="px-4 py-4">
                                                    <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                        ${courseCode}
                                                    </span>
                                                </td>
                                                <td class="px-4 py-4 whitespace-nowrap">
                                                    <p class="${daysLeft <= 1 ? 'text-red-500' : ''}">${formatDate(assignment.dueDate)}</p>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400">
                                                        ${daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                                                    </p>
                                                </td>
                                                <td class="px-4 py-4 whitespace-nowrap">
                                                    <span class="px-2 py-1 text-xs rounded-full ${statusClass}">
                                                        ${statusText}
                                                    </span>
                                                </td>
                                                <td class="px-4 py-4 whitespace-nowrap">
                                                    ${currentUser.role === 'student' ? `
                                                        <button class="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                            Start
                                                        </button>
                                                    ` : `
                                                        <div class="flex space-x-2">
                                                            <button class="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                                View
                                                            </button>
                                                            ${assignment.submissions?.length > 0 ? `
                                                                <button class="px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark text-sm rounded transition" onclick="viewSubmissions('${assignment._id}')">
                                                                    Submissions (${assignment.submissions.length})
                                                                </button>
                                                            ` : ''}
                                                        </div>
                                                    `}
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <p class="text-gray-500 dark:text-gray-400">No upcoming assignments. Enjoy your free time!</p>
                    `}
                </div>
            </div>
            
            ${currentUser.role === 'student' ? `
                <!-- Missed Assignments Tab -->
                <div id="missedTab-content" class="assignment-tab-content hidden">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h3 class="text-lg font-semibold mb-4">Missed Assignments</h3>
                        ${missedAssignments.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                        ${missedAssignments.map(assignment => {
                                            const course = assignment.course;
                                            const courseId = typeof course === 'object' ? course._id : course;
                                            const courseCode = typeof course === 'object' ? course.code : 'Course';
                                            const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';
                                            const daysPast = Math.ceil((new Date() - new Date(assignment.dueDate)) / (1000 * 60 * 60 * 24));
                                            
                                            return `
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                    <td class="px-4 py-4">
                                                        <p class="font-medium">${assignment.title}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                    </td>
                                                    <td class="px-4 py-4">
                                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                            ${courseCode}
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <p class="text-red-500">${formatDate(assignment.dueDate)}</p>
                                                        <p class="text-xs text-red-500">
                                                            ${daysPast} days overdue
                                                        </p>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                            Missed
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <button class="px-3 py-1.5 ${assignment.allowLateSubmissions ? 'bg-primary hover:bg-primaryDark text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'} text-sm rounded transition" 
                                                                onclick="showAssignmentModal('${assignment._id}')"
                                                                ${!assignment.allowLateSubmissions ? 'disabled' : ''}>
                                                            ${assignment.allowLateSubmissions ? 'Submit Late' : 'View'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No missed assignments. Keep up the good work!</p>
                        `}
                    </div>
                </div>
                
                <!-- Submitted Assignments Tab -->
                <div id="submittedTab-content" class="assignment-tab-content hidden">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h3 class="text-lg font-semibold mb-4">Submitted Assignments</h3>
                        ${submittedAssignments.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                        ${submittedAssignments.map(assignment => {
                                            const course = assignment.course;
                                            const courseId = typeof course === 'object' ? course._id : course;
                                            const courseCode = typeof course === 'object' ? course.code : 'Course';
                                            const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';
                                            
                                            const submission = assignment.mySubmission;
                                            const submittedDate = formatDate(submission.submittedAt);
                                            const isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);
                                            
                                            return `
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                    <td class="px-4 py-4">
                                                        <p class="font-medium">${assignment.title}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                    </td>
                                                    <td class="px-4 py-4">
                                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                            ${courseCode}
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap text-sm">
                                                        <p>${submittedDate}</p>
                                                        <p class="text-xs ${isLate ? 'text-orange-500' : 'text-green-500'}">
                                                            ${isLate ? 'Late submission' : 'On time'}
                                                        </p>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                            Awaiting Grade
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <button class="px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No submitted assignments awaiting grades.</p>
                        `}
                    </div>
                </div>
                
                <!-- Graded Assignments Tab -->
                <div id="gradedTab-content" class="assignment-tab-content hidden">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                        <h3 class="text-lg font-semibold mb-4">Graded Assignments</h3>
                        ${gradedAssignments.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                        ${gradedAssignments.map(assignment => {
                                            const course = assignment.course;
                                            const courseId = typeof course === 'object' ? course._id : course;
                                            const courseCode = typeof course === 'object' ? course.code : 'Course';
                                            const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';
                                            
                                            const grade = assignment.myGrade;
                                            const scorePercentage = (grade.score / assignment.pointsPossible) * 100;
                                            
                                            let gradeClass = 'text-green-500';
                                            if (scorePercentage < 60) {
                                                gradeClass = 'text-red-500';
                                            } else if (scorePercentage < 80) {
                                                gradeClass = 'text-yellow-500';
                                            }
                                            
                                            return `
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                    <td class="px-4 py-4">
                                                        <p class="font-medium">${assignment.title}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                    </td>
                                                    <td class="px-4 py-4">
                                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                            ${courseCode}
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        ${formatDate(assignment.dueDate)}
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <span class="font-bold ${gradeClass}">
                                                            ${grade.score}/${assignment.pointsPossible}
                                                        </span>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                                            ${scorePercentage.toFixed(1)}%
                                                        </p>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <button class="px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No graded assignments yet.</p>
                        `}
                    </div>
                </div>
            ` : `
                <!-- Past Due Assignments Tab (Instructor) -->
                <div id="pastDueTab-content" class="assignment-tab-content hidden">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h3 class="text-lg font-semibold mb-4">Past Due Assignments</h3>
                        ${pastDueAssignments.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submissions</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                        ${pastDueAssignments.map(assignment => {
                                            const course = assignment.course;
                                            const courseId = typeof course === 'object' ? course._id : course;
                                            const courseCode = typeof course === 'object' ? course.code : 'Course';
                                            const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';
                                            
                                            const daysPast = Math.ceil((new Date() - new Date(assignment.dueDate)) / (1000 * 60 * 60 * 24));
                                            const totalSubmissions = assignment.submissions?.length || 0;
                                            const totalStudents = typeof course === 'object' && course.students ? course.students.length : 0;
                                            
                                            return `
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                    <td class="px-4 py-4">
                                                        <p class="font-medium">${assignment.title}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                    </td>
                                                    <td class="px-4 py-4">
                                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                            ${courseCode}
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <p class="text-gray-700 dark:text-gray-300">${formatDate(assignment.dueDate)}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                                            ${daysPast} days ago
                                                        </p>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <p class="text-sm">${totalSubmissions} / ${totalStudents}</p>
                                                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                                                            <div class="bg-primary h-2.5 rounded-full" style="width: ${totalStudents > 0 ? (totalSubmissions / totalStudents) * 100 : 0}%"></div>
                                                        </div>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <div class="flex space-x-2">
                                                            <button class="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                                View
                                                            </button>
                                                            ${totalSubmissions > 0 ? `
                                                                <button class="px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark text-sm rounded transition" onclick="viewSubmissions('${assignment._id}')">
                                                                    Submissions (${totalSubmissions})
                                                                </button>
                                                            ` : ''}
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No past due assignments.</p>
                        `}
                    </div>
                </div>
                
                <!-- Assignments To Grade Tab (Instructor) -->
                <div id="gradeTab-content" class="assignment-tab-content hidden">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                        <h3 class="text-lg font-semibold mb-4">Assignments Waiting for Grading</h3>
                        ${assignmentsToGrade.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ungraded</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                        ${assignmentsToGrade.map(assignment => {
                                            const course = assignment.course;
                                            const courseId = typeof course === 'object' ? course._id : course;
                                            const courseCode = typeof course === 'object' ? course.code : 'Course';
                                            const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';
                                            
                                            const ungradedCount = assignment.ungradedCount;
                                            const totalSubmissions = assignment.submissions?.length || 0;
                                            const isPastDue = new Date(assignment.dueDate) < new Date();
                                            
                                            return `
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                    <td class="px-4 py-4">
                                                        <p class="font-medium">${assignment.title}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                    </td>
                                                    <td class="px-4 py-4">
                                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                            ${courseCode}
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        ${formatDate(assignment.dueDate)}
                                                        <p class="text-xs">
                                                            ${isPastDue ? 'Past due' : 'Active'}
                                                        </p>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                            ${ungradedCount} of ${totalSubmissions} ungraded
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <button class="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition" onclick="viewSubmissions('${assignment._id}')">
                                                            Grade Submissions
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No submissions waiting to be graded.</p>
                        `}
                    </div>
                </div>
            `}
        `;
        
        // Setup event listeners
        
        // Course filter
        const courseFilter = document.getElementById('courseFilter');
        if (courseFilter) {
            courseFilter.addEventListener('change', (e) => {
                const courseId = e.target.value;
                const rows = document.querySelectorAll('.assignment-row');
                
                rows.forEach(row => {
                    if (courseId === 'all' || row.dataset.course === courseId) {
                        row.classList.remove('hidden');
                    } else {
                        row.classList.add('hidden');
                    }
                });
            });
        }
        
        // Tab navigation
        const tabs = document.querySelectorAll('.assignment-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => {
                    t.classList.remove('border-primary', 'text-primary', 'dark:text-primaryLight');
                    t.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
                });
                tab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
                tab.classList.add('border-primary', 'text-primary', 'dark:text-primaryLight');
                
                // Show corresponding content
                const tabId = tab.id;
                const contentElements = document.querySelectorAll('.assignment-tab-content');
                contentElements.forEach(element => {
                    if (element.id === `${tabId}-content`) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });
            });
        });
        
        // Create assignment button (for instructors)
        const createAssignmentBtn = document.getElementById('createAssignmentBtn');
        if (createAssignmentBtn) {
            createAssignmentBtn.addEventListener('click', showCreateAssignmentModal);
        }
        
    } catch (error) {
        console.error('Error loading assignments:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading assignments</p>
                <p>${error.message || 'Failed to load assignments'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadView('assignments')">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Function for instructors to view and grade submissions
function viewSubmissions(assignmentId) {
    // Get the assignment and all submissions
    assignmentService.getAssignment(assignmentId)
        .then(async response => {
            const assignment = response.data.assignment;
            
            try {
                // Fetch submissions
                const submissionsResponse = await assignmentService.getSubmissions(assignmentId);
                const submissions = submissionsResponse.data.submissions;
                
                // Fetch course students
                const courseResponse = await courseService.getCourse(assignment.course._id);
                const course = courseResponse.data.course;
                
                // Create modal for viewing submissions
                const modalHtml = `
                    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xl font-semibold">Submissions: ${assignment.title}</h3>
                                <button id="closeSubmissionsModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <div class="mb-4">
                                <p><span class="font-medium">Course:</span> ${course.name} (${course.code})</p>
                                <p><span class="font-medium">Due Date:</span> ${formatDate(assignment.dueDate)}</p>
                                <p><span class="font-medium">Total Students:</span> ${course.students.length}</p>
                                <p><span class="font-medium">Submissions:</span> ${submissions.length} / ${course.students.length}</p>
                            </div>
                            
                            <div class="mb-4">
                                <div class="flex mb-2">
                                    <button id="allSubmissionsTab" class="submissions-tab px-4 py-2 bg-primary text-white rounded-tl-lg rounded-tr-lg">
                                        All Submissions (${submissions.length})
                                    </button>
                                    <button id="ungradedSubmissionsTab" class="submissions-tab px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-tl-lg rounded-tr-lg ml-2">
                                        Ungraded (${submissions.filter(s => !s.grade && s.status !== 'graded').length})
                                    </button>
                                    <button id="gradedSubmissionsTab" class="submissions-tab px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-tl-lg rounded-tr-lg ml-2">
                                        Graded (${submissions.filter(s => s.grade || s.status === 'graded').length})
                                    </button>
                                </div>
                                
                                <div id="submissionsList" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    ${submissions.length === 0 ? `
                                        <p class="text-center text-gray-500 dark:text-gray-400 py-6">
                                            No submissions for this assignment yet.
                                        </p>
                                    ` : `
                                        <div class="overflow-x-auto">
                                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead>
                                                    <tr>
                                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="submissionsTableBody" class="divide-y divide-gray-200 dark:divide-gray-700">
                                                    ${submissions.map(submission => {
                                                        const student = submission.student;
                                                        const studentName = typeof student === 'object' ? 
                                                            `${student.firstName} ${student.lastName}` : 'Student';
                                                        const studentEmail = typeof student === 'object' ? 
                                                            student.email : '';
                                                            
                                                        const submittedDate = formatDate(submission.submittedAt);
                                                        const isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);
                                                        const isGraded = submission.status === 'graded' || submission.grade;
                                                        
                                                        let statusBadge = '';
                                                        if (isGraded) {
                                                            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Graded</span>`;
                                                        } else if (isLate) {
                                                            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Late</span>`;
                                                        } else {
                                                            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Submitted</span>`;
                                                        }
                                                        
                                                        const grade = submission.grade || {};
                                                        
                                                        return `
                                                            <tr class="submission-row ${isGraded ? 'graded' : 'ungraded'}" data-submission-id="${submission._id}">
                                                                <td class="px-4 py-4">
                                                                    <div class="flex items-center">
                                                                        <img src="${getProfileImageUrl(student)}" alt="${studentName}" class="w-8 h-8 rounded-full mr-3">
                                                                        <div>
                                                                            <p class="font-medium">${studentName}</p>
                                                                            <p class="text-xs text-gray-500 dark:text-gray-400">${studentEmail}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td class="px-4 py-4 whitespace-nowrap">
                                                                    <p>${submittedDate}</p>
                                                                    <p class="text-xs ${isLate ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}">
                                                                        ${isLate ? 'Late' : 'On time'}
                                                                    </p>
                                                                </td>
                                                                <td class="px-4 py-4 whitespace-nowrap">
                                                                    ${statusBadge}
                                                                </td>
                                                                <td class="px-4 py-4 whitespace-nowrap">
                                                                    ${isGraded ? `
                                                                        <p class="font-medium">${grade.score}/${assignment.pointsPossible}</p>
                                                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                                                            ${((grade.score / assignment.pointsPossible) * 100).toFixed(1)}%
                                                                        </p>
                                                                    ` : `
                                                                        <p class="text-gray-500 dark:text-gray-400">Not graded</p>
                                                                    `}
                                                                </td>
                                                                <td class="px-4 py-4 whitespace-nowrap">
                                                                    <button class="view-submission-btn px-3 py-1.5 ${isGraded ? 'border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark' : 'bg-primary hover:bg-primaryDark text-white'} text-sm rounded transition" data-submission-id="${submission._id}">
                                                                        ${isGraded ? 'View' : 'Grade'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        `;
                                                    }).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add modal to DOM
                const modalContainer = document.createElement('div');
                modalContainer.innerHTML = modalHtml;
                document.body.appendChild(modalContainer);
                
                // Setup event listeners
                document.getElementById('closeSubmissionsModal').addEventListener('click', () => {
                    document.body.removeChild(modalContainer);
                });
                
                // Tab switching
                const submissionsTabs = document.querySelectorAll('.submissions-tab');
                submissionsTabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        // Update active tab
                        submissionsTabs.forEach(t => {
                            t.classList.remove('bg-primary', 'text-white');
                            t.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                        });
                        tab.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                        tab.classList.add('bg-primary', 'text-white');
                        
                        // Filter submissions
                        const rows = document.querySelectorAll('.submission-row');
                        if (tab.id === 'allSubmissionsTab') {
                            rows.forEach(row => row.classList.remove('hidden'));
                        } else if (tab.id === 'ungradedSubmissionsTab') {
                            rows.forEach(row => {
                                row.classList.toggle('hidden', row.classList.contains('graded'));
                            });
                        } else if (tab.id === 'gradedSubmissionsTab') {
                            rows.forEach(row => {
                                row.classList.toggle('hidden', !row.classList.contains('graded'));
                            });
                        }
                    });
                });
                
                // View/Grade submission buttons
                document.querySelectorAll('.view-submission-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const submissionId = button.dataset.submissionId;
                        const submission = submissions.find(s => s._id === submissionId);
                        
                        // Create submission detail modal
                        showSubmissionDetailModal(submission, assignment);
                    });
                });
                
            } catch (error) {
                console.error('Error loading submissions:', error);
                showToast('Failed to load submissions', 'error');
            }
        })
        .catch(error => {
            console.error('Error fetching assignment:', error);
            showToast('Failed to load assignment details', 'error');
        });
}

// Show submission detail modal with grading interface
function showSubmissionDetailModal(submission, assignment) {
    const student = submission.student;
    const studentName = typeof student === 'object' ? 
        `${student.firstName} ${student.lastName}` : 'Student';
    
    const isGraded = submission.status === 'graded' || submission.grade;
    const isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);
    const grade = submission.grade || {};
    
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Submission Review</h3>
                    <button id="closeSubmissionDetailModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <div class="flex flex-wrap items-start justify-between mb-4">
                        <div>
                            <p class="font-bold text-lg">${assignment.title}</p>
                            <p class="text-gray-600 dark:text-gray-400">${assignment.pointsPossible} points possible</p>
                        </div>
                        <div class="text-right">
                            <p class="flex items-center">
                                <span class="font-medium mr-2">Student:</span>
                                <img src="${getProfileImageUrl(student)}" alt="${studentName}" class="w-6 h-6 rounded-full mr-2">
                                ${studentName}
                            </p>
                            <p><span class="font-medium">Submitted:</span> ${formatDate(submission.submittedAt)} ${isLate ? '<span class="text-red-500">(Late)</span>' : ''}</p>
                        </div>
                    </div>
                    
                    <div class="border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-4">
                        <h4 class="font-medium mb-3">Submission</h4>
                        
                        ${submission.textContent ? `
                            <div class="mb-4">
                                <h5 class="text-sm font-medium mb-2">Text Response:</h5>
                                <div class="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                                    <p class="whitespace-pre-line">${submission.textContent}</p>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${submission.attachments && submission.attachments.length > 0 ? `
                            <div>
                                <h5 class="text-sm font-medium mb-2">Attachments:</h5>
                                <div class="space-y-2">
                                    ${submission.attachments.map(file => `
                                        <div class="bg-gray-50 dark:bg-gray-750 p-3 rounded-lg flex items-center">
                                            <i class="fas fa-file mr-2 text-gray-500"></i>
                                            <span class="flex-1">${file.fileName}</span>
                                            <a href="${file.fileUrl}" target="_blank" class="text-primary dark:text-primaryLight hover:underline">View</a>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No file attachments</p>
                        `}
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-medium mb-3">Grading</h4>
                        
                        <form id="gradingForm" class="space-y-4">
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Score (out of ${assignment.pointsPossible})</label>
                                <input type="number" id="gradeScore" min="0" max="${assignment.pointsPossible}" value="${isGraded ? grade.score : ''}" ${isGraded ? 'disabled' : 'required'} class="w-full md:w-1/3 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Feedback</label>
                                <textarea id="gradeFeedback" rows="4" ${isGraded ? 'disabled' : ''} class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">${isGraded ? grade.feedback || '' : ''}</textarea>
                            </div>
                            
                            <div id="gradingError" class="text-red-500 hidden"></div>
                            
                            <div class="flex justify-end space-x-2">
                                ${!isGraded ? `
                                    <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                        Submit Grade
                                    </button>
                                ` : `
                                    <button id="editGradeBtn" type="button" class="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark rounded-lg transition">
                                        Edit Grade
                                    </button>
                                `}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Setup event listeners
    document.getElementById('closeSubmissionDetailModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
    
    // Edit grade button (for already graded submissions)
    const editGradeBtn = document.getElementById('editGradeBtn');
    if (editGradeBtn) {
        editGradeBtn.addEventListener('click', () => {
            // Enable the form fields
            document.getElementById('gradeScore').disabled = false;
            document.getElementById('gradeFeedback').disabled = false;
            
            // Replace the edit button with submit button
            const buttonContainer = editGradeBtn.parentElement;
            buttonContainer.innerHTML = `
                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                    Update Grade
                </button>
            `;
        });
    }
    
    // Handle form submission
    const gradingForm = document.getElementById('gradingForm');
    if (gradingForm) {
        gradingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const score = parseInt(document.getElementById('gradeScore').value);
            const feedback = document.getElementById('gradeFeedback').value;
            const errorDiv = document.getElementById('gradingError');
            
            // Validate score
            if (isNaN(score) || score < 0 || score > assignment.pointsPossible) {
                errorDiv.textContent = `Score must be between 0 and ${assignment.pointsPossible}`;
                errorDiv.classList.remove('hidden');
                return;
            }
            
            try {
                errorDiv.classList.add('hidden');
                
                // Submit grade
                await assignmentService.gradeSubmission(submission._id, {
                    score,
                    feedback
                });
                
                document.body.removeChild(modalContainer);
                showToast('Assignment graded successfully!');
                
                // Reload the assignments view to show updated grades
                loadView('assignments');
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });
    }
}
// Profile view
async function loadProfile() {
    try {
        // Refresh user data to get the latest information
        const userData = await authService.getCurrentUser();
        const user = userData.data.user;
        
        // Get enrolled courses data
        let enrolledCourses = [];
        if (user.enrolledCourses && user.enrolledCourses.length > 0) {
            try {
                const coursesResponse = await courseService.getMyCourses();
                enrolledCourses = coursesResponse.data.courses;
            } catch (error) {
                console.error('Failed to load courses:', error);
            }
        }
        
        // Count assignments, resources, etc.
        let assignmentCount = 0;
        let resourceCount = 0;
        let discussionCount = 0;
        
        // Try to load assignments
        try {
            const assignmentsResponse = await assignmentService.getAllAssignments();
            assignmentCount = assignmentsResponse.data.assignments.length;
        } catch (error) {
            console.warn('Could not load assignment count:', error);
        }
        
        // Try to load resources
        try {
            const resourcesResponse = await resourceService.getAllResources();
            resourceCount = resourcesResponse.data.resources.length;
        } catch (error) {
            console.warn('Could not load resource count:', error);
        }
        
        // Try to load discussions
        try {
            const discussionsResponse = await discussionService.getAllDiscussions();
            discussionCount = discussionsResponse.data.discussions.filter(d => d.author._id === user._id).length;
        } catch (error) {
            console.warn('Could not load discussion count:', error);
        }
        
        content.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                <div class="h-40 bg-gradient-to-r from-primary to-purple-500"></div>
                <div class="p-5 relative">
                    <div class="absolute -top-16 left-5">
                        <img src="${getProfileImageUrl(user)}" alt="Profile" class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800">
                    </div>
                    <div class="mt-16 flex flex-wrap justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold">${user.firstName} ${user.lastName}</h2>
                            <p class="text-gray-600 dark:text-gray-400">${capitalizeFirstLetter(user.role)}${user.major ? ` • ${user.major}` : ''}</p>
                        </div>
                        <button id="editProfileBtn" class="mt-2 md:mt-0 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            <i class="fas fa-edit mr-2"></i>Edit Profile
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h3 class="text-lg font-semibold mb-4">About Me</h3>
                        ${user.bio ? `
                            <p class="text-gray-700 dark:text-gray-300">${user.bio}</p>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No bio information added yet.</p>
                        `}
                        
                        <div class="mt-5">
                            <h4 class="font-medium mb-2">Contact Information</h4>
                            <div class="flex flex-col space-y-2 text-gray-600 dark:text-gray-400">
                                <div class="flex items-center">
                                    <i class="fas fa-envelope w-5"></i>
                                    <span class="ml-2">${user.email}</span>
                                </div>
                                ${user.phone ? `
                                    <div class="flex items-center">
                                        <i class="fas fa-phone w-5"></i>
                                        <span class="ml-2">${user.phone}</span>
                                    </div>
                                ` : ''}
                                ${user.location ? `
                                    <div class="flex items-center">
                                        <i class="fas fa-map-marker-alt w-5"></i>
                                        <span class="ml-2">${user.location}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                        <h3 class="text-lg font-semibold mb-4">My Activity</h3>
                        
                        <div class="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                            <button class="px-4 py-2 border-b-2 border-primary text-primary dark:text-primaryLight">Recent</button>
                            <button class="px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Submissions</button>
                            <button class="px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Discussions</button>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex items-start">
                                <div class="min-w-10 mr-3">
                                    <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                                        <i class="fas fa-book-reader"></i>
                                    </div>
                                </div>
                                <div>
                                    <p class="font-medium">Joined <span class="text-primary dark:text-primaryLight">${enrolledCourses.length > 0 ? enrolledCourses[0].name : 'a course'}</span></p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">${formatTimeAgo(user.createdAt)}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start">
                                <div class="min-w-10 mr-3">
                                    <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500">
                                        <i class="fas fa-user-check"></i>
                                    </div>
                                </div>
                                <div>
                                    <p class="font-medium">Completed profile setup</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">${formatTimeAgo(user.updatedAt)}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start">
                                <div class="min-w-10 mr-3">
                                    <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500">
                                        <i class="fas fa-graduation-cap"></i>
                                    </div>
                                </div>
                                <div>
                                    <p class="font-medium">Joined the platform</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">${formatDate(user.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h3 class="text-lg font-semibold mb-4">My Courses</h3>
                        <div class="space-y-3">
                            ${enrolledCourses.length > 0 ? enrolledCourses.map(course => `
                                <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-750 rounded-lg cursor-pointer" onclick="loadView('course-detail', {courseId: '${course._id}'})">
                                    <div class="w-2 h-10 ${course.color || 'bg-blue-500'} rounded-full mr-3"></div>
                                    <div>
                                        <p class="font-medium">${course.name}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">${course.code} • ${course.instructor.firstName} ${course.instructor.lastName}</p>
                                    </div>
                                </div>
                            `).join('') : `
                                <p class="text-gray-500 dark:text-gray-400">You haven't enrolled in any courses yet.</p>
                            `}
                        </div>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                        <h3 class="text-lg font-semibold mb-4">Stats</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-primary dark:text-primaryLight">${enrolledCourses.length}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Courses</div>
                            </div>
                            <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-primary dark:text-primaryLight">${assignmentCount}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Assignments</div>
                            </div>
                            <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-primary dark:text-primaryLight">${discussionCount}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Discussions</div>
                            </div>
                            <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
                                <div class="text-2xl font-bold text-primary dark:text-primaryLight">${resourceCount}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Resources</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Set up event listeners
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            loadView('settings');
        });
        
    } catch (error) {
        console.error('Error loading profile:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading profile</p>
                <p>${error.message || 'Failed to load profile data'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadProfile()">Retry</button>
            </div>
        `;
    }
}


// Settings view
async function loadSettings() {
    try {
        // Make sure we have the latest user data
        const userData = await authService.getCurrentUser();
        const user = userData.data.user;
        
        content.innerHTML = `
            <h2 class="text-2xl font-bold mb-6">Settings</h2>
            
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                <div class="flex flex-wrap">
                    <div class="w-full md:w-1/4 bg-gray-50 dark:bg-gray-750">
                        <div class="p-5">
                            <h3 class="text-lg font-semibold mb-3">Settings</h3>
                            <nav class="settings-nav">
                                <a href="#" class="settings-nav-link block py-2 px-3 text-primary dark:text-primaryLight bg-white dark:bg-gray-700 rounded-lg mb-1" data-section="account">Account</a>
                                <a href="#" class="settings-nav-link block py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg mb-1" data-section="security">Security</a>
                                <a href="#" class="settings-nav-link block py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg mb-1" data-section="appearance">Appearance</a>
                                <a href="#" class="settings-nav-link block py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg mb-1" data-section="notifications">Notifications</a>
                            </nav>
                        </div>
                    </div>
                    
                    <div class="w-full md:w-3/4 p-5">
                        <!-- Account Section -->
                        <div id="account-section" class="settings-section">
                            <h3 class="text-lg font-semibold mb-4">Account Settings</h3>
                            
                            <div class="mb-6">
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
                                <div class="flex items-center">
                                    <img src="${getProfileImageUrl(user)}" alt="Profile" class="w-20 h-20 rounded-full mr-4">
                                    <button id="changePhotoBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">Change Photo</button>
                                </div>
                            </div>
                            
                            <form id="accountForm" class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label class="block text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                                        <input type="text" id="firstName" value="${user.firstName}" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                                        <input type="text" id="lastName" value="${user.lastName}" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    </div>
                                </div>
                                
                                <div class="mb-6">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                    <input type="email" id="email" value="${user.email}" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                                
                                <div class="mb-6">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Major/Field of Study</label>
                                    <input type="text" id="major" value="${user.major || ''}" placeholder="e.g., Computer Science, Mathematics" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                                
                                <div class="mb-6">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                                    <textarea id="bio" rows="4" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">${user.bio || ''}</textarea>
                                </div>
                                
                                <div id="accountError" class="text-red-500 hidden"></div>
                                
                                <div class="flex justify-end">
                                    <button type="button" id="cancelAccountBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</button>
                                    <button type="submit" id="saveAccountBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">Save Changes</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Security Section -->
                        <div id="security-section" class="settings-section hidden">
                            <h3 class="text-lg font-semibold mb-4">Security Settings</h3>
                            
                            <form id="passwordForm" class="space-y-4">
                                <div class="mb-6">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                                    <input type="password" id="currentPassword" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                                
                                <div class="mb-6">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                    <input type="password" id="newPassword" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                                
                                <div class="mb-6">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                    <input type="password" id="confirmPassword" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                                
                                <div id="passwordError" class="text-red-500 hidden"></div>
                                
                                <div class="flex justify-end">
                                    <button type="button" id="cancelPasswordBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</button>
                                    <button type="submit" id="savePasswordBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">Update Password</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Appearance Section -->
                        <div id="appearance-section" class="settings-section hidden">
                            <h3 class="text-lg font-semibold mb-4">Appearance Settings</h3>
                            
                            <div class="space-y-6">
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                                    <div class="flex space-x-4">
                                        <button id="lightThemeBtn" class="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition" ${!document.documentElement.classList.contains('dark') ? 'disabled' : ''}>
                                            <i class="fas fa-sun text-yellow-500 mr-2"></i>Light
                                        </button>
                                        <button id="darkThemeBtn" class="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg shadow-sm hover:bg-gray-900 transition" ${document.documentElement.classList.contains('dark') ? 'disabled' : ''}>
                                            <i class="fas fa-moon text-blue-300 mr-2"></i>Dark
                                        </button>
                                        <button id="systemThemeBtn" class="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-800 dark:text-white transition">
                                            <i class="fas fa-desktop mr-2"></i>System Default
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Font Size</label>
                                    <select id="fontSize" class="w-full md:w-1/3 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                        <option value="small">Small</option>
                                        <option value="medium" selected>Medium (Default)</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Notifications Section -->
                        <div id="notifications-section" class="settings-section hidden">
                            <h3 class="text-lg font-semibold mb-4">Notification Settings</h3>
                            
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                                    <div>
                                        <p class="font-medium">Assignment Reminders</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Receive notifications about upcoming assignments</p>
                                    </div>
                                    <label class="switch relative inline-block w-12 h-6">
                                        <input type="checkbox" checked class="opacity-0 w-0 h-0">
                                        <span class="slider absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition-all before:absolute before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all checked:bg-primary checked:before:translate-x-6"></span>
                                    </label>
                                </div>
                                
                                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                                    <div>
                                        <p class="font-medium">Discussion Replies</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Receive notifications when someone replies to your discussions</p>
                                    </div>
                                    <label class="switch relative inline-block w-12 h-6">
                                        <input type="checkbox" checked class="opacity-0 w-0 h-0">
                                        <span class="slider absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition-all before:absolute before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all checked:bg-primary checked:before:translate-x-6"></span>
                                    </label>
                                </div>
                                
                                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                                    <div>
                                        <p class="font-medium">Course Announcements</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Receive notifications about course announcements</p>
                                    </div>
                                    <label class="switch relative inline-block w-12 h-6">
                                        <input type="checkbox" checked class="opacity-0 w-0 h-0">
                                        <span class="slider absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition-all before:absolute before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all checked:bg-primary checked:before:translate-x-6"></span>
                                    </label>
                                </div>
                                
                                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                                    <div>
                                        <p class="font-medium">Resource Updates</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Receive notifications when new resources are added</p>
                                    </div>
                                    <label class="switch relative inline-block w-12 h-6">
                                        <input type="checkbox" class="opacity-0 w-0 h-0">
                                        <span class="slider absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition-all before:absolute before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all checked:bg-primary checked:before:translate-x-6"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Setup event listeners
        setupSettingsEventListeners();
        
    } catch (error) {
        console.error('Error loading settings:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading settings</p>
                <p>${error.message || 'Failed to load settings data'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadSettings()">Retry</button>
            </div>
        `;
    }
}

// Setup event listeners for settings page
function setupSettingsEventListeners() {
    // Navigation between settings sections
    const navLinks = document.querySelectorAll('.settings-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.dataset.section;
            
            // Hide all sections
            document.querySelectorAll('.settings-section').forEach(s => s.classList.add('hidden'));
            
            // Show selected section
            document.getElementById(`${section}-section`).classList.remove('hidden');
            
            // Update active nav link
            navLinks.forEach(l => {
                l.classList.remove('text-primary', 'dark:text-primaryLight', 'bg-white', 'dark:bg-gray-700');
                l.classList.add('text-gray-700', 'dark:text-gray-300');
            });
            e.target.classList.remove('text-gray-700', 'dark:text-gray-300');
            e.target.classList.add('text-primary', 'dark:text-primaryLight', 'bg-white', 'dark:bg-gray-700');
        });
    });
    
    // Account form submission
    const accountForm = document.getElementById('accountForm');
    if (accountForm) {
        accountForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                major: document.getElementById('major').value,
                bio: document.getElementById('bio').value
            };
            
            const errorDiv = document.getElementById('accountError');
            
            try {
                errorDiv.classList.add('hidden');
                await userService.updateProfile(userData);
                
                // Update the current user object with new data
                await authService.getCurrentUser();
                
                showToast('Profile updated successfully!');
                
                // Update the UI
                updateUserInfo();
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });
    }
    
    // Cancel account button
    const cancelAccountBtn = document.getElementById('cancelAccountBtn');
    if (cancelAccountBtn) {
        cancelAccountBtn.addEventListener('click', () => {
            loadSettings(); // Reload the settings page
        });
    }
    
    // Password form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorDiv = document.getElementById('passwordError');
            
            // Check if passwords match
            if (newPassword !== confirmPassword) {
                errorDiv.textContent = 'New passwords do not match';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            try {
                errorDiv.classList.add('hidden');
                
                await userService.updatePassword({
                    currentPassword,
                    password: newPassword,
                    passwordConfirm: confirmPassword
                });
                
                showToast('Password updated successfully!');
                
                // Clear the form
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });
    }
    
    // Cancel password button
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', () => {
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            document.getElementById('passwordError').classList.add('hidden');
        });
    }
    
    // Theme buttons
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    const systemThemeBtn = document.getElementById('systemThemeBtn');
    
    if (lightThemeBtn) {
        lightThemeBtn.addEventListener('click', () => {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            updateThemeButtons();
            showToast('Light theme applied');
        });
    }
    
    if (darkThemeBtn) {
        darkThemeBtn.addEventListener('click', () => {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            updateThemeButtons();
            showToast('Dark theme applied');
        });
    }
    
    if (systemThemeBtn) {
        systemThemeBtn.addEventListener('click', () => {
            localStorage.removeItem('theme');
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            updateThemeButtons();
            showToast('System theme preference applied');
        });
    }
    
    // Change photo button
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', () => {
            // In a real app, this would open a file picker
            // For now, we'll just show a toast message
            showToast('Profile picture upload functionality will be implemented soon', 'info');
        });
    }
    
    // Toggle switches for notifications
    document.querySelectorAll('.switch input').forEach(switchInput => {
        switchInput.addEventListener('change', (e) => {
            const setting = e.target.closest('.flex').querySelector('p.font-medium').textContent;
            const status = e.target.checked ? 'enabled' : 'disabled';
            showToast(`${setting} notifications ${status}`);
        });
    });
    
    // Helper function to update theme buttons state
    function updateThemeButtons() {
        const isDark = document.documentElement.classList.contains('dark');
        
        if (lightThemeBtn) {
            lightThemeBtn.disabled = !isDark;
            lightThemeBtn.classList.toggle('opacity-50', !isDark);
        }
        
        if (darkThemeBtn) {
            darkThemeBtn.disabled = isDark;
            darkThemeBtn.classList.toggle('opacity-50', isDark);
        }
    }
}

function showChangePasswordModal() {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Change Password</h3>
                    <button id="closePasswordModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="changePasswordForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                        <input type="password" id="currentPassword" required placeholder="Enter current password"
                            class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                        <input type="password" id="newPassword" required placeholder="Enter new password"
                            class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                        <input type="password" id="confirmNewPassword" required placeholder="Confirm new password"
                            class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    <div id="passwordChangeError" class="text-red-500 hidden"></div>
                    <div>
                        <button type="submit" class="w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);

    // Close modal event
    document.getElementById('closePasswordModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Form submit event
    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        const errorDiv = document.getElementById('passwordChangeError');

        // Validate passwords
        if (newPassword !== confirmNewPassword) {
            errorDiv.textContent = "❌ New passwords do not match!";
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            errorDiv.classList.add('hidden');

            // Call API
            await userService.updatePassword({ currentPassword, newPassword });

            // Show success toast
            showToast('✅ Password updated successfully! Please log in again.', 'success');

            // Logout and redirect to login
            authService.logout();
            loadLoginPage();

        } catch (error) {
            errorDiv.textContent = `❌ ${error.message}`;
            errorDiv.classList.remove('hidden');
        }
    });
}

// Load course links
async function loadCourseLinks(courseId) {
    const container = document.getElementById('courseLinksContainer');
    if (!container) return;
    
    try {
        const response = await courseLinkService.getCourseLinks(courseId);
        const links = response.data.courseLinks;
        
        if (links.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500 dark:text-gray-400">No enrollment links generated yet.</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Generate a link to allow students to join this course without an enrollment key.
                    </p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expires</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uses</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        ${links.map(link => {
                            const isValid = link.isActive && new Date(link.expiresAt) > new Date() && 
                                           (!link.maxUses || link.usedCount < link.maxUses);
                            const status = !link.isActive ? 'Revoked' : 
                                          new Date(link.expiresAt) <= new Date() ? 'Expired' :
                                          (link.maxUses && link.usedCount >= link.maxUses) ? 'Max uses reached' : 'Active';
                            const statusClass = status === 'Active' ? 'text-green-500' : 'text-red-500';
                            
                            const linkUrl = window.location.origin + '/join?token=' + link.token;
                            
                            return `
                                <tr>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center">
                                            <input type="text" value="${linkUrl}" readonly class="bg-gray-50 dark:bg-gray-700 text-sm p-1 rounded border border-gray-300 dark:border-gray-600 w-32 md:w-48" id="link-${link._id}">
                                            <button class="ml-2 text-primary dark:text-primaryLight" onclick="copyToClipboard('link-${link._id}')">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-sm">${formatDate(link.createdAt)}</td>
                                    <td class="px-4 py-3 text-sm">${formatDate(link.expiresAt)}</td>
                                    <td class="px-4 py-3 text-sm">${link.usedCount}${link.maxUses ? '/' + link.maxUses : ''}</td>
                                    <td class="px-4 py-3 text-sm ${statusClass}">${status}</td>
                                    <td class="px-4 py-3 text-sm">
                                        ${isValid ? `
                                            <button class="text-red-500 hover:text-red-700" onclick="revokeCourseLink('${link._id}')">
                                                Revoke
                                            </button>
                                        ` : ''}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error loading course links:', error);
        container.innerHTML = `
            <div class="text-center py-4">
                <p class="text-red-500">Error loading enrollment links</p>
                <button class="mt-2 text-primary dark:text-primaryLight hover:underline" onclick="loadCourseLinks('${courseId}')">
                    Try again
                </button>
            </div>
        `;
    }
}

// Show modal to generate a new course link
function showGenerateLinkModal() {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Generate Enrollment Link</h3>
                    <button id="closeLinkModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="generateLinkForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Expires in (hours)</label>
                        <div class="flex items-center">
                            <input type="number" id="expiresIn" min="1" value="168" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            <span class="ml-2 text-gray-600 dark:text-gray-400">hours</span>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Default is 168 hours (7 days). Enter 0 for no expiration.
                        </p>
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Maximum uses (optional)</label>
                        <input type="number" id="maxUses" min="0" placeholder="Unlimited" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Leave blank for unlimited uses.
                        </p>
                    </div>
                    <div id="generateLinkError" class="text-red-500 hidden"></div>
                    <div>
                        <button type="submit" class="w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Generate Link
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Setup event listeners
    document.getElementById('closeLinkModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
    
    document.getElementById('generateLinkForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const expiresIn = parseInt(document.getElementById('expiresIn').value) || 0;
        const maxUses = parseInt(document.getElementById('maxUses').value) || null;
        const errorDiv = document.getElementById('generateLinkError');
        
        try {
            errorDiv.classList.add('hidden');
            
            const options = {};
            if (expiresIn > 0) options.expiresIn = expiresIn;
            if (maxUses > 0) options.maxUses = maxUses;
            
            await courseLinkService.generateCourseLink(currentCourse._id, options);
            
            document.body.removeChild(modalContainer);
            showToast('Enrollment link generated successfully!');
            
            // Reload course links
            loadCourseLinks(currentCourse._id);
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}

// Revoke a course link
async function revokeCourseLink(linkId) {
    if (!confirm('Are you sure you want to revoke this enrollment link? This action cannot be undone.')) {
        return;
    }
    
    try {
        await courseLinkService.revokeCourseLink(linkId);
        showToast('Enrollment link revoked successfully');
        
        // Reload course links
        loadCourseLinks(currentCourse._id);
    } catch (error) {
        showToast(`Failed to revoke link: ${error.message}`, 'error');
    }
}

// Copy text to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    
    // Show toast notification
    showToast('Link copied to clipboard!');
}
// Add to js/views.js
// Function to handle joining a course via link
async function joinCourseViaLink(token) {
    // If no token is provided, do nothing
    if (!token) {
      showToast('No join token provided.', 'error');
      return;
    }
  
    // If the user is not logged in, save the token and redirect to login.
    if (!currentUser) {
      localStorage.setItem('pendingJoinToken', token);
      showToast('Please log in to join the course.', 'error');
      loadLoginPage();
      return;
    }
  
    // At this point, the user is logged in.
    showLoading();
    
    try {
      // Attempt to join the course via the secure link.
      const response = await courseLinkService.joinViaLink(token);
      // If the call is successful, display success toast and load courses view.
      showToast('Successfully joined the course!');
      loadView('courses');
    } catch (error) {
      // If an error occurs, display an error message in the content area.
      content.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[50vh] p-4">
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 w-full max-w-md">
                <p class="font-medium">Error joining course</p>
                <p>${error.message || 'The link may be invalid, expired, or has reached its maximum uses.'}</p>
            </div>
            <button onclick="loadView('courses')" class="mt-4 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                Back to Courses
            </button>
        </div>
      `;
    }
  }
  