import { useEffect, useState } from 'react';
import { User } from '../../types/user.types';

interface PerformanceData {
  totalAssignments: number;
  completedAssignments: number;
  onTimeSubmissions: number;
  lateSubmissions: number;
  averageScore: number;
  gradeDistribution: {
    a: number;
    b: number;
    c: number;
    d: number;
    f: number;
  };
  courses: number;
  resources: number;
  discussions: number;
  badges: string[];
}

interface PerformanceAnalyticsProps {
  user: User;
}

export default function PerformanceAnalytics({ user }: PerformanceAnalyticsProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    totalAssignments: 0,
    completedAssignments: 0,
    onTimeSubmissions: 0,
    lateSubmissions: 0,
    averageScore: 0,
    gradeDistribution: { a: 0, b: 0, c: 0, d: 0, f: 0 },
    courses: 0,
    resources: 0,
    discussions: 0,
    badges: []
  });

  // In a real app, we would fetch this data from an API
  useEffect(() => {
    // This is mock data - in production, you'd call your API here
    setPerformanceData({
      totalAssignments: 42,
      completedAssignments: 38,
      onTimeSubmissions: 35,
      lateSubmissions: 3,
      averageScore: 88.5,
      gradeDistribution: { a: 21, b: 12, c: 4, d: 1, f: 0 },
      courses: 5,
      resources: 27,
      discussions: 14,
      badges: ['Perfect Attendance', 'Early Bird', 'Overachiever']
    });
  }, [user]);

  const calculateCompletionRate = () => {
    return performanceData.totalAssignments > 0
      ? (performanceData.completedAssignments / performanceData.totalAssignments) * 100
      : 0;
  };

  const calculateOnTimeRate = () => {
    return performanceData.completedAssignments > 0
      ? (performanceData.onTimeSubmissions / performanceData.completedAssignments) * 100
      : 0;
  };

  const getOnTimeRateColor = () => {
    const rate = calculateOnTimeRate();
    if (rate >= 90) return 'text-green-500';
    if (rate >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  const generateSubmissionStatsBar = () => {
    const onTimePercent = performanceData.totalAssignments > 0
      ? (performanceData.onTimeSubmissions / performanceData.totalAssignments) * 100
      : 0;
    const latePercent = performanceData.totalAssignments > 0
      ? (performanceData.lateSubmissions / performanceData.totalAssignments) * 100
      : 0;
    const missedPercent = 100 - onTimePercent - latePercent;

    return (
      <div className="flex h-4 overflow-hidden">
        <div 
          className="bg-green-500" 
          style={{width: `${onTimePercent}%`}}
          title={`On-time: ${performanceData.onTimeSubmissions}`}
        ></div>
        <div 
          className="bg-yellow-500" 
          style={{width: `${latePercent}%`}}
          title={`Late: ${performanceData.lateSubmissions}`}
        ></div>
        <div 
          className="bg-red-500" 
          style={{width: `${missedPercent}%`}}
          title={`Missed: ${performanceData.totalAssignments - performanceData.completedAssignments}`}
        ></div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Performance Analytics</h2>
      
      {/* Completion stats */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-1">
          <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Assignment Completion
          </h4>
          <div className="text-sm font-medium">
            {performanceData.completedAssignments}/{performanceData.totalAssignments} ({calculateCompletionRate().toFixed(1)}%)
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-primary h-4" 
            style={{width: `${calculateCompletionRate()}%`}}
          ></div>
        </div>
      </div>
      
      {/* Submission breakdown */}
      <div className="mb-6">
        <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Submission Stats
        </h4>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          {generateSubmissionStatsBar()}
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> 
            On-time ({performanceData.onTimeSubmissions})
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span> 
            Late ({performanceData.lateSubmissions})
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span> 
            Missed ({performanceData.totalAssignments - performanceData.completedAssignments})
          </span>
        </div>
      </div>
      
      {/* Average score */}
      <div className="mb-6">
        <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Average Score
        </h4>
        <div className="flex items-center">
          <div className="text-3xl font-bold text-primary dark:text-primaryLight mr-2">
            {performanceData.averageScore.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Across {performanceData.completedAssignments} submissions
          </div>
        </div>
      </div>
      
      {/* Grade distribution */}
      <div className="mb-6">
        <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Grade Distribution
        </h4>
        <div className="grid grid-cols-5 gap-2 text-center">
          {['A', 'B', 'C', 'D', 'F'].map((grade, index) => {
            const key = grade.toLowerCase() as keyof typeof performanceData.gradeDistribution;
            const count = performanceData.gradeDistribution[key];
            const percentage = performanceData.completedAssignments > 0
              ? (count / performanceData.completedAssignments) * 100
              : 0;
            
            let bgClass = '';
            switch (grade) {
              case 'A': bgClass = 'bg-green-500'; break;
              case 'B': bgClass = 'bg-blue-500'; break;
              case 'C': bgClass = 'bg-yellow-500'; break;
              case 'D': bgClass = 'bg-orange-500'; break;
              case 'F': bgClass = 'bg-red-500'; break;
            }
            
            return (
              <div key={grade} className="flex flex-col items-center">
                <div className="font-bold">{grade}</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-24 rounded-lg relative mt-1">
                  <div 
                    className={`${bgClass} absolute bottom-0 left-0 right-0 rounded-b-lg`}
                    style={{height: `${percentage}%`}}
                  ></div>
                </div>
                <div className="text-sm mt-1">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Activity metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Courses</p>
          <p className="text-2xl font-bold">{performanceData.courses}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Resources</p>
          <p className="text-2xl font-bold">{performanceData.resources}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Discussions</p>
          <p className="text-2xl font-bold">{performanceData.discussions}</p>
        </div>
      </div>
      
      {/* Badges */}
      <div>
        <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Badges Earned
        </h4>
        <div className="flex flex-wrap gap-2">
          {performanceData.badges.map((badge) => (
            <div 
              key={badge}
              className="px-3 py-1 bg-primary/10 text-primary dark:text-primaryLight rounded-full text-sm"
            >
              {badge}
            </div>
          ))}
          {performanceData.badges.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No badges earned yet</p>
          )}
        </div>
      </div>
    </div>
  );
}