import { useEffect, useState } from 'react';
import { User } from '../../types/user.types';

interface InstructorAnalyticsProps {
  user: User;
}

interface InstructorStats {
  totalStudents: number;
  totalCourses: number;
  totalAssignments: number;
  pendingGrading: number;
  averageScore: number;
  resources: number;
  discussions: number;
  announcements: number;
}

export default function InstructorAnalytics({ user }: InstructorAnalyticsProps) {
  const [stats, setStats] = useState<InstructorStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalAssignments: 0,
    pendingGrading: 0,
    averageScore: 0,
    resources: 0,
    discussions: 0,
    announcements: 0
  });

  // In a real app, fetch this from API
  useEffect(() => {
    // Mock data
    setStats({
      totalStudents: 87,
      totalCourses: 4,
      totalAssignments: 28,
      pendingGrading: 12,
      averageScore: 82.3,
      resources: 35,
      discussions: 24,
      announcements: 18
    });
  }, [user]);

  const getGradingPercentage = () => {
    return stats.totalAssignments > 0
      ? ((stats.totalAssignments - stats.pendingGrading) / stats.totalAssignments) * 100
      : 0;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Instructor Dashboard</h2>
      
      {/* Students & courses metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Students</p>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Active Courses</p>
              <p className="text-2xl font-bold">{stats.totalCourses}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Grading progress */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-1">
          <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Grading Progress
          </h4>
          <div className="text-sm font-medium">
            {stats.totalAssignments - stats.pendingGrading}/{stats.totalAssignments} ({getGradingPercentage().toFixed(1)}%)
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-primary h-4" 
            style={{width: `${getGradingPercentage()}%`}}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 bg-primary rounded-full mr-1"></span> 
            Graded
          </span>
          <span className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-1"></span> 
            Pending ({stats.pendingGrading})
          </span>
        </div>
      </div>
      
      {/* Average score */}
      <div className="mb-6">
        <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Average Student Score
        </h4>
        <div className="flex items-center">
          <div className="text-3xl font-bold text-primary dark:text-primaryLight mr-2">
            {stats.averageScore.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Across all courses
          </div>
        </div>
      </div>
      
      {/* Content metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Resources</p>
          <p className="text-2xl font-bold">{stats.resources}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Discussions</p>
          <p className="text-2xl font-bold">{stats.discussions}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Announcements</p>
          <p className="text-2xl font-bold">{stats.announcements}</p>
        </div>
      </div>
      
      {/* Quick actions */}
      <div>
        <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
            Grade Assignments
          </button>
          <button className="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
            Create Assignment
          </button>
          <button className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark rounded-lg transition">
            Upload Resource
          </button>
          <button className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark rounded-lg transition">
            Post Announcement
          </button>
        </div>
      </div>
    </div>
  );
}