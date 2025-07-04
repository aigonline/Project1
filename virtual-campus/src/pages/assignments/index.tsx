import { useEffect, useState, useContext } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { AuthContext } from "../../contexts/AuthContext";
import assignmentService from "../../services/assignment.service";
import courseService from "../../services/course.service";
import { Assignment } from "../../types/user.types";
import { Course } from "../../types/user.types";
import AssignmentModal from "../../components/modals/AssignmentModal";
import { formatDate } from "../../utils/date.utils";

type TabKey =
  | "upcoming"
  | "missed"
  | "submitted"
  | "graded"
  | "pastDue"
  | "toGrade";

const tabLabels: Record<TabKey, string> = {
  upcoming: "Upcoming",
  missed: "Missed",
  submitted: "Submitted",
  graded: "Graded",
  pastDue: "Past Due",
  toGrade: "To Grade",
};

export default function AssignmentsPage() {
  const { currentUser } = useContext(AuthContext);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [modalAssignment, setModalAssignment] = useState<Assignment | null>(
    null
  );

  // Fetch assignments and courses
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [assignmentsRes, coursesRes] = await Promise.all([
          assignmentService.getAllAssignments(),
          courseService.getMyCourses(),
        ]);
        setAssignments(assignmentsRes.data.assignments);
        setCourses(coursesRes.data.courses);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Group assignments by status (replicate vanilla logic)
  const now = new Date();
  const grouped = {
    upcoming: [] as Assignment[],
    missed: [] as Assignment[],
    submitted: [] as Assignment[],
    graded: [] as Assignment[],
    pastDue: [] as Assignment[],
    toGrade: [] as Assignment[],
  };

  assignments.forEach((assignment) => {
    const due = new Date(assignment.dueDate);
    const now = new Date();

    // Student view
    if (currentUser?.role === "student") {
      const mySubmission = assignment.mySubmission;
      if (!mySubmission) {
        // Not submitted
        if (due > now) {
          grouped.upcoming.push(assignment);
        } else {
          grouped.missed.push(assignment);
        }
      } else {
        // Submitted
        grouped.submitted.push(assignment);
        if (mySubmission.status === "graded" || mySubmission.grade) {
          grouped.graded.push(assignment);
        }
        if (due < now && !mySubmission.grade) {
          grouped.pastDue.push(assignment);
        }
      }
    }

    // Instructor view
    if (currentUser?.role === "instructor") {
      // To Grade: assignments with ungraded submissions
      if (
        assignment.submissions &&
        assignment.submissions.some((s: any) => s.status !== "graded")
      ) {
        grouped.toGrade.push(assignment);
      }
      // Graded: all submissions graded
      if (
        assignment.submissions &&
        assignment.submissions.length > 0 &&
        assignment.submissions.every((s: any) => s.status === "graded")
      ) {
        grouped.graded.push(assignment);
      }
      // Past Due: due date passed, not all graded
      if (
        due < now &&
        assignment.submissions &&
        assignment.submissions.some((s: any) => s.status !== "graded")
      ) {
        grouped.pastDue.push(assignment);
      }
      // Upcoming: due date in future
      if (due > now) {
        grouped.upcoming.push(assignment);
      }
    }
  });

  // Filter by course
  const filteredAssignments = grouped[activeTab].filter(
    (a) =>
      selectedCourse === "all" ||
      a.course === selectedCourse ||
      (typeof a.course === "object" && a.course._id === selectedCourse)
  );

  return (
    <MainLayout>
      <div className="fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Assignments</h1>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
            {/* Instructor: New Assignment Button */}
            {currentUser?.role === "instructor" && (
              <button className="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                + New Assignment
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {Object.entries(tabLabels).map(([key, label]) => {
            // Only show relevant tabs for role
            if (
              (currentUser?.role === "student" &&
                ["toGrade", "pastDue"].includes(key)) ||
              (currentUser?.role === "instructor" &&
                ["missed", "submitted", "graded"].includes(key))
            )
              return null;
            return (
              <button
                key={key}
                className={`assignment-tab whitespace-nowrap px-4 py-2 border-b-2 ${
                  activeTab === key
                    ? "border-primary text-primary dark:text-primaryLight"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab(key as TabKey)}
              >
                {label} ({grouped[key as TabKey].length})
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner w-10 h-10 border-4 border-gray-300 dark:border-gray-600 rounded-full"></div>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No assignments in this category.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    {/* Add more columns as needed */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    {currentUser?.role === "student" && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Grade
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAssignments.map((assignment) => (
                    <tr
                      key={assignment._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {assignment.pointsPossible} points
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {/* TODO: Show course code/color */}
                          {typeof assignment.course === "object"
                            ? assignment.course.code
                            : "Course"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {formatDate(assignment.dueDate)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          className="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition"
                          onClick={() => setModalAssignment(assignment)}
                        >
                          View
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        {/* Status badge */}
                        {currentUser?.role === "student" ? (
                          assignment.mySubmission ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              Submitted
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                              Not Submitted
                            </span>
                          )
                        ) : (
                          // Instructor: show number of submissions/graded
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {assignment.submissions?.length || 0} submissions
                          </span>
                        )}
                      </td>
                      {currentUser?.role === "student" && (
                        <td className="px-4 py-4">
                          {assignment.mySubmission?.grade?.score !== undefined
                            ? `${assignment.mySubmission.grade.score} / ${assignment.pointsPossible}`
                            : "--"}
                        </td>
                      )}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          className="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition"
                          onClick={() => setModalAssignment(assignment)}
                        >
                          View
                        </button>
                        {currentUser?.role === "student" &&
                          !assignment.mySubmission && (
                            <button
                              className="ml-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
                              // onClick={...} // open submit modal
                            >
                              Submit
                            </button>
                          )}
                        {currentUser?.role === "instructor" && (
                          <button
                            className="ml-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition"
                            // onClick={...} // open grade modal
                          >
                            Grade
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assignment Modal */}
        {modalAssignment && (
          <AssignmentModal
            assignmentId={modalAssignment._id}
            onClose={() => setModalAssignment(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}
