// components/modals/AssignmentModal.tsx
import { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faDownload,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { marked } from "marked";
import { AuthContext } from "../../contexts/AuthContext";
import { Assignment } from "../../types/user.types";
import { Submission } from "../../types/user.types";
import assignmentService from "../../services/assignment.service";
import { formatDate } from "../../utils/date.utils";
import { getGradeColorClass } from "../../utils/user.utils";
import { LanguageContext } from "../../contexts/LanguageContext";

interface AssignmentModalProps {
  assignmentId: string;
  onClose: () => void;
}

export default function AssignmentModal({
  assignmentId,
  onClose,
}: AssignmentModalProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionStats, setSubmissionStats] = useState({
    total: 0,
    graded: 0,
    late: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentUser } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const loadAssignmentData = async () => {
      try {
        setLoading(true);
        const assignmentData = await assignmentService.getAssignment(
          assignmentId
        );
        setAssignment(assignmentData.data.assignment);

        if (currentUser?.role === "student") {
          // For students, get their submission
          if (assignmentData.data.mySubmission) {
            setMySubmission(assignmentData.data.mySubmission);
          }
        } else if (currentUser?.role === "instructor") {
          // For instructors, get all submissions
          const submissionsData = await assignmentService.getSubmissions(
            assignmentId
          );
          setSubmissions(submissionsData.data.submissions);

          // Calculate stats
          const stats = {
            total: submissionsData.data.submissions.length,
            graded: submissionsData.data.submissions.filter(
              (s: Submission) => s.status === "graded"
            ).length,
            late: submissionsData.data.submissions.filter(
              (s: Submission) =>
                new Date(s.submittedAt) >
                new Date(assignmentData.data.assignment.dueDate)
            ).length,
          };
          setSubmissionStats(stats);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load assignment details");
      } finally {
        setLoading(false);
      }
    };

    loadAssignmentData();
  }, [assignmentId, currentUser]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-center items-center h-40 w-40">
            <div className="spinner w-12 h-12 border-4 border-gray-300 dark:border-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-red-500">Error</h3>
          <p>{error || "Assignment not found"}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Calculate time information
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);
  const isPastDue = now > dueDate;
  const timeDiff = Math.abs(dueDate.getTime() - now.getTime());
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const daysOverdue = isPastDue ? daysLeft : 0;

  // Get course code
  const courseCode =
    typeof assignment.course === "object" ? assignment.course.code : "";

  // Format description with markdown
  const [formattedDescription, setFormattedDescription] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const renderMarkdown = async () => {
      const result = await marked(assignment.description);
      if (isMounted) setFormattedDescription(result as string);
    };
    renderMarkdown();
    return () => {
      isMounted = false;
    };
  }, [assignment.description]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Modal content based on user role */}
        {currentUser?.role === "student" ? (
          <StudentAssignmentView
            assignment={assignment}
            mySubmission={mySubmission}
            isPastDue={isPastDue}
            daysLeft={daysLeft}
            daysOverdue={daysOverdue}
            courseCode={courseCode}
            formattedDescription={formattedDescription}
            onClose={onClose}
          />
        ) : (
          <InstructorAssignmentView
            assignment={assignment}
            submissions={submissions}
            submissionStats={submissionStats}
            isPastDue={isPastDue}
            daysLeft={daysLeft}
            courseCode={courseCode}
            formattedDescription={formattedDescription}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

// Student and Instructor view components would be defined here...

interface StudentAssignmentViewProps {
  assignment: Assignment;
  mySubmission: Submission | null;
  isPastDue: boolean;
  daysLeft: number;
  daysOverdue: number;
  courseCode: string;
  formattedDescription: string;
  onClose: () => void;
}

function StudentAssignmentView({
  assignment,
  mySubmission,
  isPastDue,
  daysLeft,
  daysOverdue,
  courseCode,
  formattedDescription,
  onClose,
}: StudentAssignmentViewProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{assignment.title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="mb-2 text-sm text-gray-500">{courseCode}</div>
      <div
        className="mb-4"
        dangerouslySetInnerHTML={{ __html: formattedDescription }}
      />
      <div className="mb-4">
        <span className="font-semibold">Due:</span>{" "}
        {formatDate(assignment.dueDate)}
        {isPastDue ? (
          <span className="ml-2 text-red-500">
            (Overdue by {daysOverdue} days)
          </span>
        ) : (
          <span className="ml-2 text-green-600">({daysLeft} days left)</span>
        )}
      </div>
      {mySubmission ? (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div>
            <span className="font-semibold">Your Submission:</span>
            <span className="ml-2">{formatDate(mySubmission.submittedAt)}</span>
          </div>
          <div>
            <span className="font-semibold">Status:</span>
            <span className="ml-2">{mySubmission.status}</span>
          </div>
          {mySubmission.grade !== undefined && (
            <div>
              <span className="font-semibold">Grade:</span>
              <span
                className={`ml-2 ${getGradeColorClass(
                  mySubmission.grade.score
                )}`}
              >
                {mySubmission.grade.score}
              </span>
            </div>
          )}
          {mySubmission.grade?.feedback && (
            <div>
              <span className="font-semibold">Feedback:</span>
              <span className="ml-2">{mySubmission.grade.feedback}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-700 rounded-lg">
          <span>You have not submitted this assignment yet.</span>
        </div>
      )}
    </div>
  );
}

interface InstructorAssignmentViewProps {
  assignment: Assignment;
  submissions: Submission[];
  submissionStats: { total: number; graded: number; late: number };
  isPastDue: boolean;
  daysLeft: number;
  courseCode: string;
  formattedDescription: string;
  onClose: () => void;
}

function InstructorAssignmentView({
  assignment,
  submissions,
  submissionStats,
  isPastDue,
  daysLeft,
  courseCode,
  formattedDescription,
  onClose,
}: InstructorAssignmentViewProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{assignment.title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="mb-2 text-sm text-gray-500">{courseCode}</div>
      <div
        className="mb-4"
        dangerouslySetInnerHTML={{ __html: formattedDescription }}
      />
      <div className="mb-4">
        <span className="font-semibold">Due:</span>{" "}
        {formatDate(assignment.dueDate)}
        {isPastDue ? (
          <span className="ml-2 text-red-500">
            (Overdue by {daysLeft} days)
          </span>
        ) : (
          <span className="ml-2 text-green-600">({daysLeft} days left)</span>
        )}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Submissions:</span>
        <span className="ml-2">{submissionStats.total}</span>
        <span className="ml-4 font-semibold">Graded:</span>
        <span className="ml-2">{submissionStats.graded}</span>
        <span className="ml-4 font-semibold">Late:</span>
        <span className="ml-2">{submissionStats.late}</span>
      </div>
      <div>
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Student</th>
              <th className="border px-2 py-1">Submitted At</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Grade</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission._id}>
                <td className="border px-2 py-1">
                  {typeof submission.student === "object"
                    ? `${submission.student.firstName ?? ""} ${
                        submission.student.lastName ?? ""
                      }`.trim() || "Unknown"
                    : submission.student || "Unknown"}
                </td>
                <td className="border px-2 py-1">
                  {formatDate(submission.submittedAt)}
                </td>
                <td className="border px-2 py-1">{submission.status}</td>
                <td className="border px-2 py-1">
                  {submission.grade !== undefined
                    ? submission.grade.score
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
