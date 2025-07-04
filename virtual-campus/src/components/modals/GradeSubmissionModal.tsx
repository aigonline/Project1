import { useState, FormEvent } from 'react';
import { Assignment } from '../../types/user.types';
import { Submission } from '../../types/user.types';
import assignmentService from '../../services/assignment.service';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/date.utils';
import { getProfileImageUrl } from '../../utils/user.utils';
import { marked } from 'marked';

interface GradeSubmissionModalProps {
  assignment: Assignment;
  submission: Submission;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GradeSubmissionModal({
  assignment,
  submission,
  onClose,
  onSuccess
}: GradeSubmissionModalProps) {
  const { showToast } = useToast();
  const [score, setScore] = useState(submission.grade?.score || '');
  const [feedback, setFeedback] = useState(submission.grade?.feedback || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate score
      const scoreNum = Number(score);
      if (isNaN(scoreNum)) {
        throw new Error('Please enter a valid score.');
      }
      if (scoreNum < 0) {
        throw new Error('Score cannot be negative.');
      }
      if (scoreNum > assignment.pointsPossible) {
        throw new Error(`Score cannot exceed the maximum points (${assignment.pointsPossible}).`);
      }

      setLoading(true);

      // Grade data
      const gradeData = {
        score: scoreNum,
        feedback: feedback
      };

      await assignmentService.gradeSubmission(submission._id, gradeData);
      
      showToast('Submission graded successfully!', { type: 'success' });
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to grade submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStudentObject = typeof submission.student === 'object' && submission.student !== null && 'firstName' in submission.student && 'lastName' in submission.student;
  const student: import('../../types/user.types').User | string = submission.student;
  const studentName = isStudentObject
    ? `${(submission.student as import('../../types/user.types').User).firstName} ${(submission.student as import('../../types/user.types').User).lastName}`
    : 'Student';
  
  const isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Grade Submission</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
              src={getProfileImageUrl(student)}
              alt={studentName}
              className="w-10 h-10 rounded-full mr-3"
          <div className="flex items-center mb-4">
            <img 
              src={getProfileImageUrl(student)} 
              alt={studentName} 
              className="w-10 h-10 rounded-full mr-3" 
            />
            <div>
              <div className="font-medium">{studentName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Submitted {formatDate(submission.submittedAt)}
                {isLate && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    Late
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-4">
          <h4 className="font-medium mb-3">Submission</h4>
          
          {submission.textContent && (
            <div className="mb-4">
              <h5 className="text-sm font-medium mb-2">Text Response:</h5>
              <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                <p className="whitespace-pre-line">{submission.textContent}</p>
              </div>
            </div>
          )}
          
          {'attachments' in submission && Array.isArray((submission as any).attachments) && (submission as any).attachments.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-2">Attachments:</h5>
              <div className="space-y-2">
                {(submission as any).attachments.map((file: { url: string; originalName?: string; name?: string; size: number }, index: number) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-750 p-3 rounded-lg flex items-center">
                    <i className="fas fa-file mr-2 text-gray-500"></i>
                    <div className="flex-1 truncate">
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary dark:text-primaryLight hover:underline"
                      >
                        {file.originalName || file.name || "Attachment"}
                      </a>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <a 
                      href={file.url} 
                      download
                      className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <i className="fas fa-download"></i>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-gray-700 dark:text-gray-300">
                Score
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Out of {assignment.pointsPossible}
              </span>
            </div>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min="0"
              max={assignment.pointsPossible}
              step="0.1"
              required
              className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"
              placeholder="Provide feedback on the submission..."
            ></textarea>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You can use Markdown formatting
            </p>
          </div>
          
          {isLate && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
              <p>This submission was submitted after the due date.</p>
              <p className="text-sm mt-1">Consider if this should affect the score.</p>
            </div>
          )}
          
          {error && (
            <div className="text-red-500">{error}</div>
          )}
          
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Submit Grade'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}