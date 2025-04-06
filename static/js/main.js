// DOM Elements
const appContainer = document.getElementById('appContainer');
const content = document.getElementById('content');
const sidebar = document.getElementById('sidebar');
const modalBackdrop = document.getElementById('modalBackdrop');
const mobileHeader = document.getElementById('mobileHeader');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const navLinks = document.querySelectorAll('.nav-link');
const toggleDarkModeBtn = document.getElementById('toggleDarkModeBtn');
const desktopDarkModeBtn = document.getElementById('desktopDarkModeBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Add to your main.js - code that runs when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check for course join links in URL
    const urlParams = new URLSearchParams(window.location.search);
    const joinToken = urlParams.get('join');
    
    if (joinToken) {
        // Clear the URL parameter to prevent repeated join attempts on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Process the join token after a slight delay to ensure auth is loaded
        setTimeout(() => {
            processCourseJoinLink(joinToken);
        }, 1000);
    }
});

// Function to process a course join link
async function processCourseJoinLink(token) {
    try {
        // Show loading indicator
        showToast('Processing enrollment link...', 'info');
        
        // Call the API to join the course
        const response = await courseLinkService.joinViaLink(token);
        
        // Handle successful join
        showToast('Successfully enrolled in course!', 'success');
        
        // Redirect to the joined course
        if (response.data && response.data.course) {
            loadView('course-detail', { courseId: response.data.course._id });
        } else {
            loadView('courses');
        }
    } catch (error) {
        console.error('Error joining course via link:', error);
        showToast(error.message || 'Failed to join course. The link may be invalid or expired.', 'error');
        loadView('courses');
    }
}



// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    
    // Check for dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });
});

// Initialize app
async function initializeApp() {
    const joinToken = new URLSearchParams(window.location.search).get('token');
    
    if (!await checkAuth()) {
        // Save pending join token if not logged in
        if (joinToken) {
            localStorage.setItem('pendingJoinToken', joinToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        loadLoginPage();
        return;
    }
    
    // User is authenticated; update UI
    updateUserInfo();
    
    // If there's a pending join token (either from URL or local storage), process it
    const tokenToJoin = joinToken || localStorage.getItem('pendingJoinToken');
    if (tokenToJoin) {
        window.history.replaceState({}, document.title, window.location.pathname);
        await joinCourseViaLink(tokenToJoin);
        localStorage.removeItem('pendingJoinToken');
    } else {
        loadView('dashboard');
    }
}


// Check if user is authenticated
async function checkAuth() {
    // Check if token exists
    if (!token) {
        return false;
    }
    
    try {
        // Verify token by getting user data
        await authService.getCurrentUser();
        showUIElements();
        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
        return false;
    }
}

// Show main UI elements
function showUIElements() {
    mobileHeader.classList.remove('hidden');
    sidebar.classList.remove('hidden');
}

// Hide main UI elements
function hideUIElements() {
    mobileHeader.classList.add('hidden');
    sidebar.classList.add('hidden');
}

// Update user info in the UI
function updateUserInfo() {
    if (currentUser) {
        // Update sidebar profile
        document.getElementById('sidebarUserName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('sidebarUserRole').textContent = capitalizeFirstLetter(currentUser.role);
        
        // Update profile images
        const profileImageUrl = getProfileImageUrl(currentUser);
        document.getElementById('sidebarProfileImage').src = profileImageUrl;
        document.getElementById('mobileProfileImage').src = profileImageUrl;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            loadView(view);
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-primary', 'dark:text-primaryLight'));
            e.currentTarget.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-primary', 'dark:text-primaryLight');
            
            // Hide sidebar on mobile after navigation
            if (window.innerWidth < 768) {
                sidebar.classList.add('hidden');
                modalBackdrop.classList.add('hidden');
            }
        });
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', toggleSidebar);
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    modalBackdrop.addEventListener('click', toggleSidebar);

    // Dark mode toggles
    toggleDarkModeBtn.addEventListener('click', toggleDarkMode);
    desktopDarkModeBtn.addEventListener('click', toggleDarkMode);
}

// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('hidden');
    modalBackdrop.classList.toggle('hidden');
    
    if (!sidebar.classList.contains('hidden')) {
        sidebar.classList.add('fixed', 'top-0', 'left-0', 'z-20', 'h-full');
    } else {
        sidebar.classList.remove('fixed', 'top-0', 'left-0', 'z-20', 'h-full');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
}

// Show loading spinner
function showLoading() {
    content.innerHTML = `
        <div class="flex justify-center items-center h-64">
            <div class="spinner w-12 h-12 border-4 border-gray-300 dark:border-gray-600 rounded-full"></div>
        </div>
    `;
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // Set color based on type
    if (type === 'success') {
        toast.classList.remove('border-red-500', 'border-blue-500');
        toast.classList.add('border-green-500');
    } else if (type === 'error') {
        toast.classList.remove('border-green-500', 'border-blue-500');
        toast.classList.add('border-red-500');
    } else {
        toast.classList.remove('border-green-500', 'border-red-500');
        toast.classList.add('border-blue-500');
    }
    
    // Show toast
    toast.classList.remove('hidden');
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-20', 'opacity-0');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Load different views
function loadView(view, params = {}) {
    currentView = view;
    showLoading();

    const viewPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            content.classList.remove('fade-in');
            void content.offsetWidth; // Force reflow
            content.classList.add('fade-in');

            switch (view) {
                case 'dashboard':
                    loadDashboard().then(resolve).catch(reject);
                    break;
                case 'login':
                    loadLoginPage().then(resolve).catch(reject);
                    break;
                case 'courses':
                    loadCourses().then(resolve).catch(reject);
                    break;
                case 'course-detail':
                    loadCourseDetail(params.courseId).then(resolve).catch(reject);
                    break;
                case 'resources':
                    loadResources().then(resolve).catch(reject); // ✅ Load user-specific resources
                    break;
                case 'assignments':
                    loadAssignments().then(resolve).catch(reject); // ✅ Load user-specific assignments
                    break;
                case 'discussions':
                    loadDiscussions().then(resolve).catch(reject); // ✅ Load user-specific discussions
                    break;
                case 'discussion-detail':
                if (!params.discussionId) {
                    showToast('Discussion ID is required', 'error');
                    loadDiscussions();
                    return;
                }
                loadDiscussionDetail(params.discussionId);
                break;
                case 'profile':
                    loadProfile().then(resolve).catch(reject);
                    break;
                case 'settings':
                    loadSettings().then(resolve).catch(reject);
                    break;
                case 'join-course':
                    joinCourseViaLink(params.token).then(resolve).catch(reject);
                    break;
                    
                default:
                    loadDashboard().then(resolve).catch(reject);
            }
        }, 300);
    });

    viewPromise
        .then(() => {
            console.log(`Successfully loaded ${view} view`);
        })
        .catch((error) => {
            console.error(`Error loading ${view} view:`, error);
            content.innerHTML = `
                <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                    <p class="font-medium">Error</p>
                    <p>${error.message || 'Something went wrong. Please try again.'}</p>
                </div>
                <button onclick="loadView('${currentView}')" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg">
                    Try Again
                </button>
            `;
        });
}
// Modal functions

// Show enrollment key modal
// Show enrollment modal for 
function showEnrollmentModal(course) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Enroll in Course</h3>
                    <button id="closeEnrollModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-4">
                    <p class="font-medium">${course.name} (${course.code})</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Instructor: ${course.instructor.firstName} ${course.instructor.lastName}</p>
                </div>
                
                <form id="enrollForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Enrollment Code <span class="text-red-500">*</span></label>
                        <input type="text" id="enrollmentCode" required placeholder="Enter the course enrollment code" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div id="enrollError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-end pt-2">
                        <button type="button" id="cancelEnrollBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Enroll
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Set up event listeners
    document.getElementById('closeEnrollModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
    
    document.getElementById('cancelEnrollBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
    
    // Form submission
    document.getElementById('enrollForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const enrollmentCode = document.getElementById('enrollmentCode').value;
        const errorDiv = document.getElementById('enrollError');
        
        errorDiv.classList.add('hidden');
        
        if (!enrollmentCode) {
            errorDiv.textContent = 'Please enter the enrollment code.';
            errorDiv.classList.remove('hidden');
            return;
        }
        
        try {
            // Enroll in course
            await courseService.enrollInCourse({
                courseId: course._id,
                enrollmentCode
            });
            
            // Close modal and refresh course
            document.body.removeChild(modalContainer);
            showToast('Successfully enrolled in course!');
            loadCourseDetail(course._id);
        } catch (error) {
            console.error('Error enrolling in course:', error);
            errorDiv.textContent = error.message || 'Invalid enrollment code. Please check and try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}

// Show assignment modal - different views for students vs instructors
function showAssignmentModal(assignmentId) {
    // Fetch assignment details
    assignmentService.getAssignment(assignmentId)
        .then(async response => {
            const assignment = response.data.assignment;
            
            // Fetch submissions for this assignment
            let submissions = [];
            try {
                const submissionsResponse = await assignmentService.getSubmissions(assignmentId);
                submissions = submissionsResponse.data.submissions;
            } catch (error) {
                console.warn(`Could not fetch submissions for assignment ${assignmentId}:`, error);
            }
            
            // For students: find their own submission (if any)
            let mySubmission = null;
            if (currentUser.role === 'student') {
                mySubmission = submissions.find(s => 
                    (typeof s.student === 'object' && s.student._id === currentUser._id) || 
                    s.student === currentUser._id
                );
            }
            
            // Determine assignment state
            const now = new Date();
            const dueDate = new Date(assignment.dueDate);
            const isPastDue = dueDate < now;
            const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
            
            // Calculate submission statistics (for instructors)
            const submissionStats = {
                total: submissions.length,
                graded: submissions.filter(s => s.status === 'graded' || s.grade).length,
                late: submissions.filter(s => new Date(s.submittedAt) > dueDate).length
            };
            
            // Course information
            const course = assignment.course;
            const courseCode = typeof course === 'object' ? course.code : 'Course';
            
            // Format for displaying the assignment description with Markdown
            const formattedDescription = assignment.description ? 
                marked.parse(assignment.description) : 
                'No detailed instructions provided.';
            
            // Create different modal content based on user role
            const modalContent = currentUser.role === 'student' ? 
                generateStudentModal(assignment, mySubmission, isPastDue, daysLeft, daysOverdue, courseCode, formattedDescription) :
                generateInstructorModal(assignment, submissions, submissionStats, isPastDue, daysLeft, courseCode, formattedDescription);
            
            // Create the modal container
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalContent;
            document.body.appendChild(modalContainer);
            
            // Set up shared event listeners
            document.getElementById('closeAssignmentModal').addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });
            
            // Set up role-specific event listeners
            if (currentUser.role === 'student') {
                setupStudentEventListeners(assignment, mySubmission, modalContainer);
            } else {
                setupInstructorEventListeners(assignment, submissions, modalContainer);
            }
        })
        .catch(error => {
            console.error('Error fetching assignment:', error);
            showToast('Failed to load assignment details', 'error');
        });
}

// Generate modal HTML for students
function generateStudentModal(assignment, mySubmission, isPastDue, daysLeft, daysOverdue, courseCode, formattedDescription) {
    const isSubmitted = !!mySubmission;
    const isGraded = isSubmitted && (mySubmission.status === 'graded' || mySubmission.grade);
    const isLateSubmission = isSubmitted && new Date(mySubmission.submittedAt) > new Date(assignment.dueDate);
    const canSubmitLate = isPastDue && assignment.allowLateSubmissions && !isSubmitted;
    
    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">${assignment.title}</h3>
                    <button id="closeAssignmentModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Assignment header -->
                <div class="flex flex-wrap justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="mb-2 md:mb-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                            <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                ${courseCode}
                            </span>
                            <span class="px-2 py-1 text-xs rounded-full ${isPastDue ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}">
                                ${isPastDue ? `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}` : `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
                            </span>
                            ${isSubmitted ? `
                                <span class="px-2 py-1 text-xs rounded-full ${isGraded ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}">
                                    ${isGraded ? 'Graded' : 'Submitted'}
                                </span>
                                ${isLateSubmission ? `
                                    <span class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                        Late Submission
                                    </span>
                                ` : ''}
                            ` : ''}
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Due: ${formatDate(assignment.dueDate)} (${isPastDue ? 'Past due' : `${daysLeft} days left`})</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Worth: ${assignment.pointsPossible} points</p>
                    </div>
                    
                    <!-- Grade display - only shown if graded -->
                    ${isGraded && mySubmission.grade ? `
                        <div class="flex flex-col items-end">
                            <div class="text-2xl font-bold ${getGradeColorClass(mySubmission.grade.score, assignment.pointsPossible)}">
                                ${mySubmission.grade.score} / ${assignment.pointsPossible}
                            </div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">
                                ${((mySubmission.grade.score / assignment.pointsPossible) * 100).toFixed(1)}%
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Assignment content section -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3">Instructions</h4>
                    <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mb-4 prose dark:prose-invert max-w-none">
                        ${formattedDescription}
                    </div>
                    
                    <!-- Display resources/attachments if any -->
                    ${assignment.resources && assignment.resources.length > 0 ? `
                        <div class="mt-4">
                            <h5 class="font-medium mb-2">Resources</h5>
                            <div class="space-y-2">
                                ${assignment.resources.map(resource => `
                                    <div class="flex items-center p-2 bg-gray-50 dark:bg-gray-750 rounded-lg">
                                        <i class="fas fa-file mr-2 text-primary"></i>
                                        <span class="flex-1">${resource.title || 'Resource'}</span>
                                        <a href="#" class="text-primary hover:underline">View</a>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Submission section -->
                ${isGraded ? `
                    <!-- Show graded submission -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                        <h4 class="font-semibold mb-3">Your Submission</h4>
                        <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                            ${mySubmission.textContent ? `
                                <div class="mb-4">
                                    <h5 class="text-sm font-medium mb-2">Your Response:</h5>
                                    <div class="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                        <p class="whitespace-pre-line text-gray-800 dark:text-gray-200">${mySubmission.textContent}</p>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${mySubmission.attachments && mySubmission.attachments.length > 0 ? `
                                <div class="mb-4">
                                    <h5 class="text-sm font-medium mb-2">Your Attachments:</h5>
                                    <div class="space-y-2">
                                        ${mySubmission.attachments.map(file => `
                                            <div class="flex items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                <i class="fas fa-file mr-2 text-gray-500"></i>
                                                <span class="flex-1">${file.fileName || 'File'}</span>
                                                <a href="${file.fileUrl || '#'}" target="_blank" class="text-primary dark:text-primaryLight hover:underline">View</a>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <h5 class="text-sm font-medium mb-2">Feedback:</h5>
                                ${mySubmission.grade && mySubmission.grade.feedback ? `
                                    <div class="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                        <p class="whitespace-pre-line text-gray-800 dark:text-gray-200">${mySubmission.grade.feedback}</p>
                                    </div>
                                ` : `
                                    <p class="text-gray-500 dark:text-gray-400">No feedback provided.</p>
                                `}
                            </div>
                        </div>
                    </div>
                ` : isSubmitted ? `
                    <!-- Show ungraded submission -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                        <h4 class="font-semibold mb-3">Your Submission</h4>
                        <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                            ${mySubmission.textContent ? `
                                <div class="mb-4">
                                    <h5 class="text-sm font-medium mb-2">Your Response:</h5>
                                    <div class="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                        <p class="whitespace-pre-line text-gray-800 dark:text-gray-200">${mySubmission.textContent}</p>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${mySubmission.attachments && mySubmission.attachments.length > 0 ? `
                                <div>
                                    <h5 class="text-sm font-medium mb-2">Your Attachments:</h5>
                                    <div class="space-y-2">
                                        ${mySubmission.attachments.map(file => `
                                            <div class="flex items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                <i class="fas fa-file mr-2 text-gray-500"></i>
                                                <span class="flex-1">${file.fileName || 'File'}</span>
                                                <a href="${file.fileUrl || '#'}" target="_blank" class="text-primary dark:text-primaryLight hover:underline">View</a>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
                                <p><i class="fas fa-info-circle mr-2"></i> Your submission is awaiting grading.</p>
                                <p class="text-sm mt-1">Submitted on ${formatDate(mySubmission.submittedAt)}</p>
                            </div>
                        </div>
                    </div>
                ` : isPastDue && !assignment.allowLateSubmissions ? `
                    <!-- Past due without submission and late submissions not allowed -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                        <div class="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300">
                            <p class="font-medium"><i class="fas fa-exclamation-circle mr-2"></i> Assignment Past Due</p>
                            <p class="mt-1">This assignment was due on ${formatDate(assignment.dueDate)} and cannot be submitted late.</p>
                        </div>
                    </div>
                ` : `
                    <!-- Show submission form -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 class="font-semibold mb-3">
                            ${canSubmitLate ? 'Submit Late Assignment' : 'Your Submission'}
                            ${canSubmitLate ? `
                                <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                    Late
                                </span>
                            ` : ''}
                        </h4>
                        
                        ${canSubmitLate ? `
                            <div class="p-3 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
                                <p><i class="fas fa-exclamation-triangle mr-2"></i> This assignment is past due, but late submissions are allowed.</p>
                                <p class="text-sm mt-1">Note: Late submissions may receive reduced points.</p>
                            </div>
                        ` : ''}
                        
                        <form id="assignmentSubmitForm" class="space-y-4">
                            ${assignment.submissionType !== 'file' ? `
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Your Response</label>
                                    <textarea id="submissionText" rows="5" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                                </div>
                            ` : ''}
                            
                            ${assignment.submissionType !== 'text' ? `
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Upload Files</label>
                                    <input type="file" id="submissionFile" multiple class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        You can upload multiple files. Maximum size: 10MB per file.
                                    </p>
                                </div>
                            ` : ''}
                            
                            <div id="submissionError" class="text-red-500 hidden"></div>
                            
                            <div class="flex justify-end">
                                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    ${canSubmitLate ? 'Submit Late Assignment' : 'Submit Assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Generate modal HTML for instructors
function generateInstructorModal(assignment, submissions, submissionStats, isPastDue, daysLeft, courseCode, formattedDescription) {
    // Determine if instructor can edit the assignment (shouldn't edit after submissions)
    const canEdit = submissions.length === 0;
    
    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">${assignment.title}</h3>
                    <div class="flex items-center">
                        ${canEdit ? `
                            <button id="editAssignmentBtn" class="mr-2 text-primary dark:text-primaryLight hover:text-primaryDark dark:hover:text-primaryLight">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        <button id="closeAssignmentModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Assignment header -->
                <div class="flex flex-wrap justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="mb-2 md:mb-0">
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                            <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                ${courseCode}
                            </span>
                            <span class="px-2 py-1 text-xs rounded-full ${isPastDue ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}">
                                ${isPastDue ? 'Past Due' : 'Active'}
                            </span>
                            ${assignment.allowLateSubmissions ? `
                                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    Late Submissions Allowed
                                </span>
                            ` : ''}
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Due: ${formatDate(assignment.dueDate)} (${isPastDue ? 'Past due' : `${daysLeft} days left`})</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Worth: ${assignment.pointsPossible} points</p>
                    </div>
                    
                    <!-- Submission stats card -->
                    <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-3">
                        <h4 class="text-sm font-medium mb-2">Submission Summary:</h4>
                        <div class="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <div class="text-lg font-bold">${submissionStats.total}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Total</div>
                            </div>
                            <div>
                                <div class="text-lg font-bold">${submissionStats.graded}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Graded</div>
                            </div>
                            <div>
                                <div class="text-lg font-bold">${submissionStats.late}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Late</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Assignment content section -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3">Assignment Details</h4>
                    <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mb-4 prose dark:prose-invert max-w-none">
                        ${formattedDescription}
                    </div>
                    
                    <!-- Display resources/attachments if any -->
                    ${assignment.resources && assignment.resources.length > 0 ? `
                        <div class="mt-4">
                            <h5 class="font-medium mb-2">Resources</h5>
                            <div class="space-y-2">
                                ${assignment.resources.map(resource => `
                                    <div class="flex items-center p-2 bg-gray-50 dark:bg-gray-750 rounded-lg">
                                        <i class="fas fa-file mr-2 text-primary"></i>
                                        <span class="flex-1">${resource.title || 'Resource'}</span>
                                        <a href="#" class="text-primary hover:underline">View</a>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            <p><span class="font-medium">Submission Type:</span> ${getSubmissionTypeLabel(assignment.submissionType)}</p>
                            <p><span class="font-medium">Allow Late Submissions:</span> ${assignment.allowLateSubmissions ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                            <p><span class="font-medium">Created:</span> ${formatDate(assignment.createdAt)}</p>
                            <p><span class="font-medium">Last Updated:</span> ${formatDate(assignment.updatedAt || assignment.createdAt)}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Submission section -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="font-semibold">Student Submissions</h4>
                        <button id="viewAllSubmissionsBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                            View All Submissions
                        </button>
                    </div>
                    
                    ${submissions.length === 0 ? `
                        <div class="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg text-gray-500 dark:text-gray-400 text-center">
                            <p><i class="far fa-clock mr-2"></i> No submissions yet.</p>
                        </div>
                    ` : `
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-750">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    ${submissions.slice(0, 3).map(submission => {
                                        const student = submission.student;
                                        const studentName = typeof student === 'object' ? 
                                            `${student.firstName} ${student.lastName}` : 'Student';
                                            
                                        const isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);
                                        const isGraded = submission.status === 'graded' || submission.grade;
                                        
                                        let statusBadge = '';
                                        if (isGraded) {
                                            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Graded</span>`;
                                        } else if (isLate) {
                                            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Late</span>`;
                                        } else {
                                            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Submitted</span>`;
                                        }
                                        
                                        return `
                                            <tr>
                                                <td class="px-4 py-2">
                                                    <div class="flex items-center">
                                                        <img src="${getProfileImageUrl(student)}" alt="${studentName}" class="w-7 h-7 rounded-full mr-2">
                                                        <span>${studentName}</span>
                                                    </div>
                                                </td>
                                                <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                                    ${formatDate(submission.submittedAt)}
                                                </td>
                                                <td class="px-4 py-2">
                                                    ${statusBadge}
                                                </td>
                                                <td class="px-4 py-2">
                                                    <button class="view-submission-btn px-3 py-1 text-sm ${isGraded ? 'text-primary dark:text-primaryLight hover:underline' : 'bg-primary hover:bg-primaryDark text-white rounded'}" data-submission-id="${submission._id}">
                                                        ${isGraded ? 'View' : 'Grade'}
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                            ${submissions.length > 3 ? `
                                <div class="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                                    Showing 3 of ${submissions.length} submissions
                                </div>
                            ` : ''}
                        </div>
                    `}
                    
                    <div class="mt-4 flex justify-end">
                        <button id="downloadsBtn" class="mr-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <i class="fas fa-download mr-1"></i> Export Grades
                        </button>
                        <button id="viewAllSubmissionsBtn2" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Manage Submissions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Set up event listeners for student assignment modal
function setupStudentEventListeners(assignment, mySubmission, modalContainer) {
    // Handle assignment submission
    const submitForm = document.getElementById('assignmentSubmitForm');
    if (submitForm) {
        submitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const textContent = document.getElementById('submissionText')?.value || '';
            const fileInput = document.getElementById('submissionFile');
            const errorDiv = document.getElementById('submissionError');
            
            // Validate submission based on assignment requirements
            if (assignment.submissionType === 'text' && !textContent.trim()) {
                errorDiv.textContent = 'Please enter your response before submitting.';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            if (assignment.submissionType === 'file' && 
                (!fileInput || !fileInput.files || fileInput.files.length === 0)) {
                errorDiv.textContent = 'Please upload at least one file before submitting.';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            // Create FormData object
            const formData = new FormData();
            formData.append('textContent', textContent);
            
            // Add files if any
            if (fileInput && fileInput.files.length > 0) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append('files', fileInput.files[i]);
                }
            }
            
            // Submit
            try {
                errorDiv.classList.add('hidden');
                
                // Show loading state
                const submitBtn = submitForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting...';
                
                await assignmentService.submitAssignment(assignment._id, formData);
                
                // Remove modal and show success message
                document.body.removeChild(modalContainer);
                showToast('Assignment submitted successfully!');
                
                // Reload the assignment view
                loadView('assignments');
            } catch (error) {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                // Show error
                errorDiv.textContent = error.message || 'Failed to submit assignment. Please try again.';
                errorDiv.classList.remove('hidden');
            }
        });
    }
}

// Set up event listeners for instructor assignment modal
function setupInstructorEventListeners(assignment, submissions, modalContainer) {
    // View all submissions button
    const viewAllSubmissionsBtn = document.getElementById('viewAllSubmissionsBtn');
    const viewAllSubmissionsBtn2 = document.getElementById('viewAllSubmissionsBtn2');
    
    if (viewAllSubmissionsBtn) {
        viewAllSubmissionsBtn.addEventListener('click', () => {
            // Close the current modal
            document.body.removeChild(modalContainer);
            // Show submissions view
            viewSubmissions(assignment._id);
        });
    }
    
    if (viewAllSubmissionsBtn2) {
        viewAllSubmissionsBtn2.addEventListener('click', () => {
            // Close the current modal
            document.body.removeChild(modalContainer);
            // Show submissions view
            viewSubmissions(assignment._id);
        });
    }
    
    // Edit assignment button
    const editAssignmentBtn = document.getElementById('editAssignmentBtn');
    if (editAssignmentBtn) {
        editAssignmentBtn.addEventListener('click', () => {
            // Close the current modal
            document.body.removeChild(modalContainer);
            // Show edit assignment modal
            showEditAssignmentModal(assignment);
        });
    }
    
    // Export grades button
    const downloadsBtn = document.getElementById('downloadsBtn');
    if (downloadsBtn) {
        downloadsBtn.addEventListener('click', () => {
            // This would normally trigger a download API call
            // For now, just show a toast since iframe doesn't allow downloads
            showToast('CSV export would be downloaded in a production environment. Downloads are not supported in this demo.', 'info');
        });
    }
    
    // Individual submission view/grade buttons
    document.querySelectorAll('.view-submission-btn').forEach(button => {
        button.addEventListener('click', () => {
            const submissionId = button.dataset.submissionId;
            const submission = submissions.find(s => s._id === submissionId);
            
            if (submission) {
                // Close the current modal
                document.body.removeChild(modalContainer);
                // Show submission detail modal
                showSubmissionDetailModal(submission, assignment);
            }
        });
    });
}

// Utility function to get grade color class based on score
function getGradeColorClass(score, total) {
    const percentage = (score / total) * 100;
    
    if (percentage >= 90) {
        return 'text-green-500';
    } else if (percentage >= 80) {
        return 'text-blue-500';
    } else if (percentage >= 70) {
        return 'text-yellow-500';
    } else if (percentage >= 60) {
        return 'text-orange-500';
    } else {
        return 'text-red-500';
    }
}

// Utility function to get submission type label
function getSubmissionTypeLabel(type) {
    switch (type) {
        case 'text':
            return 'Text Only';
        case 'file':
            return 'File Upload Only';
        case 'both':
        default:
            return 'Text and File Upload';
    }
}

// Edit assignment modal - for instructors only
function showEditAssignmentModal(assignment) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Edit Assignment</h3>
                    <button id="closeEditModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="editAssignmentForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Assignment Title</label>
                        <input type="text" id="assignmentTitle" value="${assignment.title}" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Instructions</label>
                        <textarea id="assignmentDescription" rows="6" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">${assignment.description || ''}</textarea>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">You can use Markdown formatting</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                            <input type="datetime-local" id="assignmentDueDate" value="${new Date(assignment.dueDate).toISOString().slice(0, 16)}" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Points Possible</label>
                            <input type="number" id="assignmentPoints" value="${assignment.pointsPossible}" min="0" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Submission Type</label>
                            <select id="assignmentSubmissionType" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                <option value="both" ${assignment.submissionType === 'both' ? 'selected' : ''}>Text and File Upload</option>
                                <option value="text" ${assignment.submissionType === 'text' ? 'selected' : ''}>Text Only</option>
                                <option value="file" ${assignment.submissionType === 'file' ? 'selected' : ''}>File Upload Only</option>
                            </select>
                        </div>
                        <div class="flex items-center h-full pt-8">
                            <input type="checkbox" id="assignmentAllowLate" class="mr-2" ${assignment.allowLateSubmissions ? 'checked' : ''}>
                            <label for="assignmentAllowLate" class="text-gray-700 dark:text-gray-300">Allow late submissions</label>
                        </div>
                    </div>
                    
                    <div id="assignmentError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-between pt-2">
                        <button type="button" id="deleteAssignmentBtn" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
                            Delete Assignment
                        </button>
                        <div>
                            <button type="button" id="cancelEditBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                Cancel
                            </button>
                            <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add to DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Set up event listeners
    document.getElementById('closeEditModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
    
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        // Show the assignment modal again
        showAssignmentModal(assignment._id);
    });
    
    document.getElementById('deleteAssignmentBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
          try {
            // Call the API to delete the assignment
            await assignmentService.deleteAssignment(assignment._id);
            showToast('Assignment deleted successfully!');
            // Remove the modal from the DOM
            document.body.removeChild(modalContainer);
            // Optionally, refresh the assignments view
            loadView('assignments');
          } catch (error) {
            console.error('Error deleting assignment:', error);
            showToast(`Failed to delete assignment: ${error.message}`, 'error');
          }
        }
      });
      
    
    // Form submission
    document.getElementById('editAssignmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        // Get form values
        const title = document.getElementById('assignmentTitle').value;
        const description = document.getElementById('assignmentDescription').value;
        const dueDate = document.getElementById('assignmentDueDate').value;
        const pointsPossible = parseInt(document.getElementById('assignmentPoints').value);
        const submissionType = document.getElementById('assignmentSubmissionType').value;
        const allowLateSubmissions = document.getElementById('assignmentAllowLate').checked;
        
        // Create the data object to update
        const assignmentData = {
          title,
          description,
          dueDate,
          pointsPossible,
          submissionType,
          allowLateSubmissions
        };
      
        try {
          // Call  API to update the assignment.
          // Make sure assignmentId is defined in the current scope (passed in from the modal, for example)
          await assignmentService.updateAssignment(assignment._id, assignmentData);
          
          showToast('Assignment updated successfully!');
          document.body.removeChild(modalContainer);
          
          // Reload the assignments view to reflect the changes.
          loadView('assignments');
        } catch (error) {
          console.error('Error updating assignment:', error);
          showToast(`Failed to update assignment: ${error.message}`, 'error');
        }
      });
      
}
// Get submission form HTML
function getSubmissionForm(assignment) {
    return `
        <form id="assignmentSubmitForm" class="space-y-4">
            ${assignment.submissionType !== 'file' ? `
                <div>
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Your Response</label>
                    <textarea id="submissionText" rows="5" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                </div>
            ` : ''}
            
            ${assignment.submissionType !== 'text' ? `
                <div>
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Upload Files</label>
                    <input type="file" id="submissionFile" multiple class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        You can upload multiple files. Maximum size: 10MB per file.
                    </p>
                </div>
            ` : ''}
            
            <div id="submissionError" class="text-red-500 hidden"></div>
            
            <div>
                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                    Submit Assignment
                </button>
            </div>
        </form>
    `;
}

// Show upload resource modal
async function showUploadResourceModal() {
    let courses = [];
    if (currentUser.role === 'instructor') {
      try {
        const response = await courseService.getMyCourses();
        courses = response.data.courses;
      } catch (error) {
        console.error("Error fetching courses for resource modal:", error);
      }
    }
  
    const modalHtml = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Upload Resource</h3>
            <button id="closeResourceModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <i class="fas fa-times"></i>
            </button>
          </div>
  
          <form id="uploadResourceForm" class="space-y-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Resource Title</label>
              <input type="text" id="resourceTitle" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200">
            </div>
  
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea id="resourceDescription" rows="3" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
            </div>
  
            ${currentUser.role === 'instructor' ? `
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
                <select id="resourceCourse" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200">
                  <option value="">Select a course</option>
                  ${courses.map(course => `<option value="${course._id}">${course.name} (${course.code})</option>`).join('')}
                </select>
              </div>
            ` : ''}
  
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Resource Type</label>
              <select id="resourceType" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200">
                <option value="PDF">PDF</option>
                <option value="PPT">PowerPoint</option>
                <option value="DOC">Document</option>
                <option value="Video">Video</option>
                <option value="Link">Web Link</option>
                <option value="Other">Other</option>
              </select>
            </div>
  
            <div id="fileUploadSection">
              <label class="block text-gray-700 dark:text-gray-300 mb-2">File</label>
              <input type="file" id="resourceFile" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200">
            </div>
  
            <div id="linkSection" class="hidden">
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Resource Link</label>
              <input type="url" id="resourceLink" placeholder="https://example.com" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200">
            </div>
  
            <div id="resourceError" class="text-red-500 hidden"></div>
  
            <div>
              <button type="submit" class="w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                Upload Resource
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
  
    document.getElementById('closeResourceModal').addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });
  
    const resourceTypeSelect = document.getElementById('resourceType');
    resourceTypeSelect.addEventListener('change', (e) => {
      const isLink = e.target.value === 'Link';
      document.getElementById('fileUploadSection').classList.toggle('hidden', isLink);
      document.getElementById('linkSection').classList.toggle('hidden', !isLink);
    });
  
    // Pre-select course if available
    if (currentUser.role === 'instructor' && currentCourse) {
      const courseSelect = document.getElementById('resourceCourse');
      const optionToSelect = Array.from(courseSelect.options).find(opt => opt.value === currentCourse._id);
      if (optionToSelect) optionToSelect.selected = true;
    }
  
    document.getElementById('uploadResourceForm').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const title = document.getElementById('resourceTitle').value;
      const description = document.getElementById('resourceDescription').value;
      const type = resourceTypeSelect.value;
      const isLink = type === 'Link';
  
      // Get course ID
      let courseId;
      if (currentUser.role === 'instructor') {
        const courseSelect = document.getElementById('resourceCourse');
        if (courseSelect.value) {
          courseId = courseSelect.value;
        } else if (currentCourse && currentCourse._id) {
          courseId = currentCourse._id;
        } else {
          const errorDiv = document.getElementById('resourceError');
          errorDiv.textContent = "No course selected for resource upload.";
          errorDiv.classList.remove('hidden');
          return;
        }
      } else {
        if (currentCourse && currentCourse._id) {
          courseId = currentCourse._id;
        } else {
          const errorDiv = document.getElementById('resourceError');
          errorDiv.textContent = "No course context available.";
          errorDiv.classList.remove('hidden');
          return;
        }
      }
  
      try {
        if (isLink) {
          const link = document.getElementById('resourceLink').value;
          if (!link) throw new Error("Please provide a valid link.");
  
          await resourceService.uploadResource({ title, description, type, link, course: courseId });
        } else {
          const fileInput = document.getElementById('resourceFile');
          if (!fileInput.files.length) throw new Error("Please select a file.");
  
          const formData = new FormData();
          formData.append('title', title);
          formData.append('description', description);
          formData.append('type', type);
          formData.append('course', courseId);
          formData.append('file', fileInput.files[0]);
  
          await resourceService.createResource(courseId, formData);
        }
  
        document.body.removeChild(modalContainer);
        showToast('Resource uploaded successfully!');
        loadView('course-detail', { courseId });
      } catch (error) {
        const errorDiv = document.getElementById('resourceError');
        errorDiv.textContent = error.message || "Failed to upload resource.";
        errorDiv.classList.remove('hidden');
      }
    });
  }
  
// View resource
function viewResource(resourceId) {
    resourceService.getResource(resourceId)
        .then(response => {
            const resource = response.data.resource;
            
            // ✅ Check if the current user is allowed to delete
            const canDelete = resource.addedBy._id === currentUser._id || ['instructor', 'admin'].includes(currentUser.role);

            // Create modal HTML
            const modalHtml = `
                <div id="resourceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-semibold">${resource.title}</h3>
                            <button id="closeResourceModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="mb-4">
                            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <span class="mr-3">Type: ${resource.type}</span>
                                <span>Added by: ${resource.addedBy.firstName} ${resource.addedBy.lastName}</span>
                            </div>

                            ${resource.description ? `
                                <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mt-2 mb-4">
                                    <h4 class="font-medium mb-1">Description</h4>
                                    <p class="text-gray-700 dark:text-gray-300">${resource.description}</p>
                                </div>
                            ` : ''}

                            ${resource.link ? `
                                <div class="mt-4">
                                    <a href="${resource.link}" target="_blank" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition inline-flex items-center">
                                        <i class="fas fa-external-link-alt mr-2"></i>
                                        Visit Link
                                    </a>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        URL: ${resource.link}
                                    </p>
                                </div>
                            ` : resource.file ? `
                                <div class="mt-4 text-center">
                                    ${['PDF', 'Image'].includes(resource.type) ? `
                                        <div class="bg-gray-100 dark:bg-gray-750 p-6 rounded-lg">
                                            <i class="fas fa-file-${resource.type === 'PDF' ? 'pdf text-red-500' : 'image text-blue-500'} text-6xl"></i>
                                        </div>
                                    ` : `
                                        <i class="fas fa-file text-gray-500 text-6xl"></i>
                                    `}
                                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">
                                        ${resource.file.fileName} (${formatFileSize(resource.file.fileSize)})
                                    </p>
                                    <a href="#" class="mt-4 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition inline-flex items-center">
                                        <i class="fas fa-download mr-2"></i>
                                        Download File
                                    </a>
                                </div>
                            ` : `
                                <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg text-center">
                                    <i class="fas fa-info-circle text-blue-500 mr-1"></i>
                                    No file or link available for this resource.
                                </div>
                            `}

                            <!-- ✅ Delete Button (Visible Only to Authorized Users) -->
                            ${canDelete ? `
                                <div class="mt-6">
                                    <button id="deleteResourceBtn" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
                                        <i class="fas fa-trash-alt mr-2"></i>Delete Resource
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            // Add modal to the document
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHtml;
            document.body.appendChild(modalContainer);

            // Setup event listeners
            document.getElementById('closeResourceModal').addEventListener('click', () => {
                document.getElementById('resourceModal').remove();
            });

            // ✅ Handle resource deletion
            if (canDelete) {
                document.getElementById('deleteResourceBtn').addEventListener('click', async () => {
                    if (confirm("Are you sure you want to delete this resource?")) {
                        try {
                            await resourceService.deleteResource(resourceId);
                            showToast("Resource deleted successfully!");
                            
                            // ✅ Remove the modal immediately
                            document.getElementById('resourceModal').remove();

                            // ✅ Remove the deleted resource from the UI
                            const resourceItem = document.querySelector(`[data-resource-id="${resourceId}"]`);
                            if (resourceItem) resourceItem.remove();

                            // ✅ Refresh resources view
                            loadView('resources');

                        } catch (error) {
                            showToast("Failed to delete resource", "error");
                        }
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error fetching resource:', error);
            showToast('Failed to load resource details', 'error');
        });
}

// Show new discussion modal
function showNewAnnouncementModal() {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Create Announcement</h3>
                    <button id="closeAnnouncementModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="createAnnouncementForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                        <input type="text" id="announcementTitle" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Content</label>
                        <textarea id="announcementContent" rows="6" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                    </div>

                    <div id="announcementError" class="text-red-500 hidden"></div>

                    <div>
                        <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Post Announcement
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
    document.getElementById('closeAnnouncementModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('createAnnouncementForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const announcementData = {
                title: document.getElementById('announcementTitle').value,
                content: document.getElementById('announcementContent').value,
                course: currentCourse._id,
            };

            await announcementService.createAnnouncement(announcementData);
            document.body.removeChild(modalContainer);
            showToast('Announcement created successfully!');
            loadCourseDetail(currentCourse._id);
        } catch (error) {
            const errorDiv = document.getElementById('announcementError');
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}


// Show create assignment modal
async function showCreateAssignmentModal() {
    let courses = [];
    if (currentUser.role === 'instructor') {
      try {
        const response = await courseService.getMyCourses();
        courses = response.data.courses;
      } catch (error) {
        console.error("Error fetching courses for assignment modal:", error);
      }
    }
  
    const modalHtml = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Create New Assignment</h3>
            <button id="closeAssignmentModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <form id="createAssignmentForm" class="space-y-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Assignment Title</label>
              <input type="text" id="assignmentTitle" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
            </div>
            
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Instructions</label>
              <textarea id="assignmentDescription" rows="5" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
            </div>

            <!-- Course selection for instructors -->
            ${currentUser.role === 'instructor' ? `
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
                <select id="assignmentCourse" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                  <option value="">Select a course</option>
                  ${courses.map(course => `<option value="${course._id}">${course.name} (${course.code})</option>`).join('')}
                </select>
              </div>
            ` : ''}
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                <input type="datetime-local" id="assignmentDueDate" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Points Possible</label>
                <input type="number" id="assignmentPoints" value="100" min="0" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Submission Type</label>
                <select id="assignmentSubmissionType" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                  <option value="both">Text and File Upload</option>
                  <option value="text">Text Only</option>
                  <option value="file">File Upload Only</option>
                </select>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="assignmentAllowLate" class="mr-2">
                <label for="assignmentAllowLate" class="text-gray-700 dark:text-gray-300">Allow late submissions</label>
              </div>
            </div>
            
            <div id="assignmentError" class="text-red-500 hidden"></div>
            
            <div>
              <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                Create Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Close modal
    document.getElementById('closeAssignmentModal').addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });
    
    // Set default due date to 1 week from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);
    document.getElementById('assignmentDueDate').value = defaultDueDate.toISOString().slice(0, 16);
    
    // Pre-select course if currentCourse is defined (for instructors)
    if (currentUser.role === 'instructor' && currentCourse) {
      const courseSelect = document.getElementById('assignmentCourse');
      if (courseSelect) {
        const optionToSelect = Array.from(courseSelect.options).find(opt => opt.value === currentCourse._id);
        if (optionToSelect) {
          optionToSelect.selected = true;
        }
      }
    }
    
    // Setup form submission
    document.getElementById('createAssignmentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Determine the course ID to use
      let courseId;
      if (currentUser.role === 'instructor') {
        const courseSelect = document.getElementById('assignmentCourse');
        if (courseSelect && courseSelect.value) {
          courseId = courseSelect.value;
        } else if (currentCourse && currentCourse._id) {
          courseId = currentCourse._id;
        } else {
          const errorDiv = document.getElementById('assignmentError');
          errorDiv.textContent = "No course selected for assignment creation.";
          errorDiv.classList.remove('hidden');
          return;
        }
      } else {
        // For students, currentCourse should exist
        if (currentCourse && currentCourse._id) {
          courseId = currentCourse._id;
        } else {
          const errorDiv = document.getElementById('assignmentError');
          errorDiv.textContent = "No course context available.";
          errorDiv.classList.remove('hidden');
          return;
        }
      }
      
      try {
        const assignmentData = {
          title: document.getElementById('assignmentTitle').value,
          description: document.getElementById('assignmentDescription').value,
          dueDate: document.getElementById('assignmentDueDate').value,
          pointsPossible: parseInt(document.getElementById('assignmentPoints').value),
          submissionType: document.getElementById('assignmentSubmissionType').value,
          allowLateSubmissions: document.getElementById('assignmentAllowLate').checked,
          course: courseId
        };
        
        await assignmentService.createAssignment(assignmentData);
        document.body.removeChild(modalContainer);
        showToast('Assignment created successfully!');
        loadView('course-detail', { courseId: assignmentData.course });
      } catch (error) {
        const errorDiv = document.getElementById('assignmentError');
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
      }
    });
  }
  
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to log out?")) {
                authService.logout();
                window.location.href = "index.html"; // Redirect to login page
            }
        });
    }
});

async function togglePinResource(id) {
    try {
        const response = await resourceService.togglePin(id);
        showToast(response.data.message);
        loadView('resources'); // Refresh resource list
    } catch (error) {
        showToast('Error pinning resource', 'error');
    }
}

  


