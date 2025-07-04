import Link from 'next/link';
import EmptyState from '../common/EmptyState';

export const UpcomingAssignmentsEmpty = () => (
  <EmptyState
    title="You're all caught up!"
    message="No upcoming assignments due."
    icon="check"
    variant="success"
  />
);

export const MissedAssignmentsEmpty = () => (
  <EmptyState
    title="No missed assignments."
    message="Keep up the good work!"
    icon="thumbs-up"
    variant="success"
  />
);

export const SubmittedAssignmentsEmpty = () => (
  <EmptyState
    title="No submitted assignments yet."
    message="Submit an assignment to see it here."
    icon="file-alt"
    variant="info"
  />
);

export const GradedAssignmentsEmpty = () => (
  <EmptyState
    title="No graded assignments yet."
    message="Your submissions will appear here once graded."
    icon="star"
    variant="info"
  />
);

export const AssignmentsToGradeEmpty = () => (
  <EmptyState
    title="No submissions waiting to be graded."
    message="You're all caught up with grading!"
    icon="check-circle"
    variant="success"
  />
);

export const PastDueAssignmentsEmpty = () => (
  <EmptyState
    title="No past due assignments."
    icon="calendar-check"
    variant="info"
  />
);

export const CreateAssignmentCTA = () => (
  <EmptyState
    title="No assignments created yet."
    message="Create your first assignment to get started."
    icon="file-plus"
    variant="info"
    action={
      <Link href="/assignments/create"
        className="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
          Create Assignment
      </Link>
    }
  />
);