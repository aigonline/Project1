import { useRouter } from 'next/router';
import Link from 'next/link';
import { Course } from '../../types/user.types';
import { formatDate } from '../../utils/date.utils';

interface CourseListProps {
  courses: Course[];
}

export default function CourseList({ courses }: CourseListProps) {
  const router = useRouter();

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p>No courses found</p>
        <p className="text-sm mt-1">You're not enrolled in any courses yet</p>
      </div>
    );
  }

  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  return (
    <div className="space-y-4">
      {courses.map(course => {
        const courseColor = course.color || '#5D5CDE';
        
        return (
          <div 
            key={course._id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition"
            onClick={() => handleCourseClick(course._id)}
          >
            <div 
              className="h-3" 
              style={{ backgroundColor: courseColor }}
            ></div>
            <div className="p-4">
              <h3 className="font-medium">
                <span className="inline-block mr-2">{course.code}</span>
                {course.name}
              </h3>
              <div className="mt-2 flex justify-between text-sm">
                <div className="text-gray-600 dark:text-gray-300">
                  {course.schedule || "No schedule set"}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {course.students?.length || 0} students
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
                <div className="text-gray-500 dark:text-gray-400">
                  {course.latestActivity 
                    ? `Updated ${formatDate(course.latestActivity)}`
                    : "No recent activity"}
                </div>
                <span className="text-primary dark:text-primaryLight">View Course</span>
              </div>
            </div>
          </div>
        );
      })}

      <div className="text-center pt-3">
        <Link href="/courses"
           className="text-primary dark:text-primaryLight hover:underline">
            View All Courses
        </Link>
      </div>
    </div>
  );
}