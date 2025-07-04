import Link from 'next/link';
import { Discussion } from '../../types/user.types';
import { formatTimeAgo } from '../../utils/date.utils';

interface RecentDiscussionsProps {
  discussions: Discussion[];
}

export default function RecentDiscussions({ discussions }: RecentDiscussionsProps) {
  if (!discussions || discussions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="fas fa-comments text-gray-500 dark:text-gray-400 text-xl"></i>
        </div>
        <p>No recent discussions</p>
        <p className="text-sm mt-1">Start a conversation to see updates here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {discussions.map((discussion) => {
        const courseColor = typeof discussion.course === 'object' && discussion.course.color 
          ? discussion.course.color 
          : '#5D5CDE';
        const courseCode = typeof discussion.course === 'object' && discussion.course.code 
          ? discussion.course.code 
          : 'Course';
        const authorName = typeof discussion.author === 'object' 
          ? `${discussion.author.firstName} ${discussion.author.lastName}`
          : 'User';

        return (
          <Link href={`/discussions/${discussion._id}`} key={discussion._id}
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition">
              <h4 className="font-medium">{discussion.title}</h4>
              <div className="flex items-center mt-1">
                <span 
                  className="px-2 py-0.5 text-xs rounded-full" 
                  style={{
                    backgroundColor: `${courseColor}25`,
                    color: courseColor
                  }}
                >
                  {courseCode}
                </span>
                <span className="mx-2 text-xs text-gray-500 dark:text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  by {authorName}
                </span>
                <span className="mx-2 text-xs text-gray-500 dark:text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(discussion.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                {discussion.content}
              </p>
          </Link>
        );
      })}
      
      <div className="text-center pt-3">
        <Link href="/discussions"
          className="text-primary dark:text-primaryLight hover:underline">
            View All Discussions
        
        </Link>
      </div>
    </div>
  );
}