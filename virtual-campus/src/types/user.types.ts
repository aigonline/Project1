// types/user.types.ts
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  profilePicture?: string;
}

// types/course.types.ts
export interface Course {
  _id: string;
  name: string;
  code: string;
  color?: string;
  schedule: string;
  description: string;
  latestActivity: string;
  instructor: User | string;
  enrollmentCode?: string;
  students?: User[] | string[];
  createdAt: string;
  updatedAt: string;
}

// types/resource.types.ts
export interface Resource {
  _id: string;
  name: string;
  url: string;
  type: string; // e.g., 'pdf', 'link', 'video'
}

// types/assignment.types.ts
export interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  pointsPossible: number;
  submissionType: 'text' | 'file' | 'both';
  mySubmission?: any;
  allowLateSubmissions: boolean;
  course: Course | string;
  resources?: Resource[];
  submissions?: Submission[];
  createdAt: string;
  updatedAt: string;
}

// types/submission.types.ts
export interface Submission {
  _id: string;
  assignment: Assignment | string;
  student: User | string;
  textContent?: string;
  files?: {
    fileName: string;
    fileUrl: string;
  }[];
  submittedAt: string;
  status: 'pending' | 'graded';
  grade?: {
    score: number;
    feedback?: string;
    gradedAt?: string;
    gradedBy?: User | string;
  };
}

export interface Grade {
  score: number;
  feedback?: string;
  gradedBy?: string | User;
  gradedAt?: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Discussion {
  _id: string;
  title: string;
  content: string;
  author: string | User;
  course: string | Course;
  comments: Comment[] | string[];
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  resolved?: boolean;
}