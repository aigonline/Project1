// filepath: c:\Users\Admin\Documents\Project1\virtual-campus\src\pages\dashboard.tsx
import { useContext, useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';
import assignmentService from '../services/assignment.service';
import courseService from '../services/course.service';
import discussionService from '../services/discussion.service';
import { Course } from '../types/user.types';
import { Assignment } from '../types/user.types';
import { Discussion } from '../types/user.types';
import DashboardCard from '../components/dashboard/DashboardCard';
import UpcomingAssignments from '../components/dashboard/UpcomingAssignments';
import CourseList from '../components/dashboard/CourseList';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import RecentDiscussions from '../components/dashboard/RecentDiscussions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faTasks, faCheckCircle, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

export default function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    upcomingDue: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get user's courses
        const coursesResponse = await courseService.getMyCourses();
        setCourses(coursesResponse.data.courses.slice(0, 3)); // Get first 3 courses
        
        // Get assignments based on role
        let assignmentsResponse;
        if (currentUser?.role === 'student') {
          assignmentsResponse = await assignmentService.getMyAssignments();
        } else {
          assignmentsResponse = await assignmentService.getInstructorAssignments();
        }
        
        const assignmentList = assignmentsResponse.data.assignments;
        setAssignments(assignmentList.slice(0, 5)); // Get first 5 assignments
        
        // Get recent discussions
        const discussionsResponse = await discussionService.getRecentDiscussions();
        setDiscussions(discussionsResponse.data.discussions.slice(0, 3)); // Get first 3 discussions
        
        // Calculate stats
        const now = new Date();
        const upcomingAssignments = assignmentList.filter((a: Assignment) => 
          new Date(a.dueDate) > now
        );
        
        const statsData = {
          totalCourses: coursesResponse.data.courses.length,
          totalAssignments: assignmentList.length,
          completedAssignments: currentUser?.role === 'student' 
            ? assignmentList.filter((a: any) => a.submission).length
            : assignmentList.filter((a: any) => a.allGraded).length,
          upcomingDue: upcomingAssignments.length
        };
        
        setStats(statsData);
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        showToast(error.message || 'Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser, showToast]);

  return (
    <MainLayout>
      <div className="fade-in">
        <h1 className="text-2xl font-bold mb-6">
          Welcome back, {currentUser?.firstName}!
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard
            title="My Courses"
            value={stats.totalCourses.toString()}
            icon={faBook}
            color="blue"
          />
          <DashboardCard
            title="Total Assignments"
            value={stats.totalAssignments.toString()}
            icon={faTasks}
            color="green"
          />
          <DashboardCard
            title={currentUser?.role === 'student' ? "Completed" : "Graded"}
            value={`${stats.completedAssignments}/${stats.totalAssignments}`}
            icon={faCheckCircle}
            color="purple"
          />
          <DashboardCard
            title="Upcoming Due"
            value={stats.upcomingDue.toString()}
            icon={faCalendarAlt}
            color="yellow"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upcoming Assignments</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="spinner w-10 h-10 border-4 border-gray-300 dark:border-gray-600 rounded-full"></div>
                </div>
              ) : (
                <UpcomingAssignments assignments={assignments} />
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner w-10 h-10 border-4 border-gray-300 dark:border-gray-600 rounded-full"></div>
                  </div>
                ) : (
                  <CalendarWidget assignments={assignments} />
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Recent Discussions</h2>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner w-10 h-10 border-4 border-gray-300 dark:border-gray-600 rounded-full"></div>
                  </div>
                ) : (
                  <RecentDiscussions discussions={discussions} />
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Courses</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="spinner w-10 h-10 border-4 border-gray-300 dark:border-gray-600 rounded-full"></div>
                </div>
              ) : (
                <CourseList courses={courses} />
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}