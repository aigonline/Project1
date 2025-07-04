// filepath: c:\Users\Admin\Documents\Project1\virtual-campus\src\components\dashboard\CalendarWidget.tsx
import { useState, useEffect } from 'react';
import { Assignment } from '../../types/user.types';
import Link from 'next/link';
import { formatDate } from '../../utils/date.utils';

interface CalendarWidgetProps {
  assignments: Assignment[];
}

export default function CalendarWidget({ assignments }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Array<{
    date: Date | null;
    isCurrentMonth: boolean;
    hasAssignment: boolean;
    assignmentCount: number;
    assignments: Assignment[];
  }>>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayAssignments, setDayAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, assignments]);

  useEffect(() => {
    if (selectedDate) {
      const dateAssignments = assignments.filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        return dueDate.getFullYear() === selectedDate.getFullYear() &&
               dueDate.getMonth() === selectedDate.getMonth() &&
               dueDate.getDate() === selectedDate.getDate();
      });
      setDayAssignments(dateAssignments);
    } else {
      setDayAssignments([]);
    }
  }, [selectedDate, assignments]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0-6, 0 is Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const prevMonthDays = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, -i + firstDayOfWeek);
      const dayAssignments = getAssignmentsForDate(date);
      prevMonthDays.unshift({
        date,
        isCurrentMonth: false,
        hasAssignment: dayAssignments.length > 0,
        assignmentCount: dayAssignments.length,
        assignments: dayAssignments
      });
    }
    
    // Calculate days from current month
    const currentMonthDays = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dayAssignments = getAssignmentsForDate(date);
      currentMonthDays.push({
        date,
        isCurrentMonth: true,
        hasAssignment: dayAssignments.length > 0,
        assignmentCount: dayAssignments.length,
        assignments: dayAssignments
      });
    }
    
    // Calculate days from next month to show
    const totalDaysShown = 42; // 6 rows of 7 days
    const nextMonthDays = [];
    const daysToAdd = totalDaysShown - (prevMonthDays.length + currentMonthDays.length);
    for (let i = 1; i <= daysToAdd; i++) {
      const date = new Date(year, month + 1, i);
      const dayAssignments = getAssignmentsForDate(date);
      nextMonthDays.push({
        date,
        isCurrentMonth: false,
        hasAssignment: dayAssignments.length > 0,
        assignmentCount: dayAssignments.length,
        assignments: dayAssignments
      });
    }
    
    setCalendarDays([...prevMonthDays, ...currentMonthDays, ...nextMonthDays]);
  };

  const getAssignmentsForDate = (date: Date): Assignment[] => {
    return assignments.filter(assignment => {
      const dueDate = new Date(assignment.dueDate);
      return dueDate.getFullYear() === date.getFullYear() &&
             dueDate.getMonth() === date.getMonth() &&
             dueDate.getDate() === date.getDate();
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
    setDayAssignments([]);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
    setDayAssignments([]);
  };

  const getCurrentMonth = (): string => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  const handleDateClick = (day: { date: Date | null; assignments: Assignment[] }) => {
    if (day.date) {
      if (selectedDate && 
          selectedDate.getFullYear() === day.date.getFullYear() && 
          selectedDate.getMonth() === day.date.getMonth() && 
          selectedDate.getDate() === day.date.getDate()) {
        // Clicking the same date again deselects it
        setSelectedDate(null);
        setDayAssignments([]);
      } else {
        setSelectedDate(day.date);
        setDayAssignments(day.assignments);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Calendar</h2>
        <div className="flex space-x-2">
          <button 
            onClick={goToPreviousMonth}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={goToNextMonth}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:p-5 flex-1 flex flex-col">
          <div className="font-semibold text-lg mb-2">{getCurrentMonth()}</div>
          
          <div className="grid grid-cols-7 gap-1 text-xs mb-2">
            <div className="text-center font-semibold">Sun</div>
            <div className="text-center font-semibold">Mon</div>
            <div className="text-center font-semibold">Tue</div>
            <div className="text-center font-semibold">Wed</div>
            <div className="text-center font-semibold">Thu</div>
            <div className="text-center font-semibold">Fri</div>
            <div className="text-center font-semibold">Sat</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 flex-1">
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                onClick={() => handleDateClick(day)}
                className={`
                  p-1 rounded-md text-center relative min-h-[2.5rem] flex flex-col items-center justify-center cursor-pointer
                  ${day.isCurrentMonth ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}
                  ${isToday(day.date!) ? 'bg-primary/10 font-bold' : ''}
                  ${day.hasAssignment ? 'font-medium' : ''}
                  ${selectedDate && selectedDate.getTime() === day.date?.getTime() ? 'bg-primary/20 dark:bg-primary/30' : 'hover:bg-gray-100 dark:hover:bg-gray-750'}
                `}
              >
                <span className="text-sm">{day.date!.getDate()}</span>
                {day.hasAssignment && (
                  <div className="absolute bottom-1">
                    <div className="w-1.5 h-1.5 bg-primary dark:bg-primaryLight rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {selectedDate && dayAssignments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium mb-2">
                Assignments due on {selectedDate.toLocaleDateString()}:
              </h4>
              <ul className="space-y-2 text-sm">
                {dayAssignments.map((assignment) => {
                  const courseColor = typeof assignment.course === 'object' && assignment.course.color 
                    ? assignment.course.color 
                    : '#5D5CDE';
                  const courseCode = typeof assignment.course === 'object' && assignment.course.code 
                    ? assignment.course.code 
                    : '';

                  return (
                    <li key={assignment._id}>
                      <Link href={`/assignments/${assignment._id}`}
                         className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-750 rounded">
                          <div className="font-medium">{assignment.title}</div>
                          {courseCode && (
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
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          {selectedDate && dayAssignments.length === 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
              No assignments due on {selectedDate.toLocaleDateString()}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}