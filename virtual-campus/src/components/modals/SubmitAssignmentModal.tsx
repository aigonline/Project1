import { useState, FormEvent, useRef } from 'react';
import { Assignment } from '../../types/user.types';
import assignmentService from '../../services/assignment.service';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/date.utils';

interface SubmitAssignmentModalProps {
  assignment: Assignment;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SubmitAssignmentModal({
  assignment,
  onClose,
  onSuccess
}: SubmitAssignmentModalProps) {
  const { showToast } = useToast();
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate based on assignment requirements
      if (assignment.submissionType === 'text' && !textContent.trim()) {
        throw new Error('Please enter your response before submitting.');
      }

      if (assignment.submissionType === 'file' && (!files || files.length === 0)) {
        throw new Error('Please upload at least one file before submitting.');
      }

      setLoading(true);

      // Create FormData object
      const formData = new FormData();
      formData.append('textContent', textContent);

      // Add files if any
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
      }

      await assignmentService.submitAssignment(assignment._id, formData);
      
      showToast('Assignment submitted successfully!', { type: 'success' });
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isPastDue = new Date(assignment.dueDate) < new Date();
  const canSubmitLate = isPastDue && assignment.allowLateSubmissions;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{assignment.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-3">
            {canSubmitLate ? 'Submit Late Assignment' : 'Submit Assignment'}
            {canSubmitLate && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                Late
              </span>
            )}
          </h4>
          
          {canSubmitLate && (
            <div className="p-3 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
              <p><i className="fas fa-exclamation-triangle mr-2"></i> This assignment is past due, but late submissions are allowed.</p>
              <p className="text-sm mt-1">Note: Late submissions may receive reduced points.</p>
            </div>
          )}
          
          <form id="assignmentSubmitForm" onSubmit={handleSubmit} className="space-y-4">
            {assignment.submissionType !== 'file' && (
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Your Response</label>
                <textarea
                  id="submissionText"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"
                ></textarea>
              </div>
            )}
            
            {assignment.submissionType !== 'text' && (
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Upload Files</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="submissionFile"
                  onChange={(e) => setFiles(e.target.files)}
                  multiple
                  className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You can upload multiple files. Maximum size: 10MB per file.
                </p>
              </div>
            )}
            
            {error && (
              <div id="submissionError" className="text-red-500">{error}</div>
            )}
            
            <div className="flex justify-end">
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
                    Submitting...
                  </>
                ) : (
                  canSubmitLate ? 'Submit Late Assignment' : 'Submit Assignment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}