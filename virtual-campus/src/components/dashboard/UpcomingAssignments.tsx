import Link from 'next/link';
import { Assignment } from '../../types/user.types';
import { formatDate } from '../../utils/date.utils';

interface UpcomingAssignmentsProps {
  assignments: Assignment[];
}

export default function UpcomingAssignments({ assignments }: UpcomingAssignmentsProps) {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p>You're all caught up!</p>
        <p className="text-sm mt-1">No upcoming assignments due</p>
      </div>
    );
  }

  // Sort by due date, closest first
  const sortedAssignments = [...assignments].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedAssignments.map(assignment => {
        const dueDate = new Date(assignment.dueDate);
        const courseColor = typeof assignment.course === 'object' && assignment.course.color 
          ? assignment.course.color 
          : '#5D5CDE';
        const courseCode = typeof assignment.course === 'object' && assignment.course.code 
          ? assignment.course.code 
          : 'Course';
        const isSubmitted = assignment.mySubmission !== undefined;
        
        // Calculate days remaining
        const now = new Date();
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return (
          <Link href={`/assignments/${assignment._id}`} key={assignment._id}
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{assignment.title}</h3>
                {isSubmitted ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Submitted
                  </span>
                ) : diffDays <= 1 ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    Due Soon
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Upcoming
                  </span>
                )}
              </div>
              <div className="flex items-center mt-2">
                <span 
                  className="px-2 py-0.5 text-xs rounded-full" 
                  style={{
                    backgroundColor: `${courseColor}25`,
                    color: courseColor
                  }}
                >
                  {courseCode}
                </span>
                <div className="mx-2 text-xs text-gray-500 dark:text-gray-400">•</div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Due {formatDate(assignment.dueDate)}
                </span>
                <div className="mx-2 text-xs text-gray-500 dark:text-gray-400">•</div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {assignment.pointsPossible} points
                </span>
              </div>
            
          </Link>
        );
      })}
      
      <div className="text-center pt-3">
        <Link href="/assignments"
          className="text-primary dark:text-primaryLight hover:underline">
            View All Assignments
          
        </Link>
      </div>
    </div>
  );
}