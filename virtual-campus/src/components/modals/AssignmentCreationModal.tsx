import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Course } from '../../types/user.types';
import assignmentService from '../../services/assignment.service';
import { useToast } from '../../hooks/useToast';

interface CreateAssignmentModalProps {
  courses: Course[];
  courseId?: string; // Optional pre-selected course ID
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateAssignmentModal({
  courses,
  courseId,
  onClose,
  onSuccess
}: CreateAssignmentModalProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    dueDate: '',
    pointsPossible: 100,
    submissionType: 'both',
    allowLateSubmissions: false,
    course: courseId || ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form values
      if (!formValues.title.trim()) {
        throw new Error('Please enter an assignment title.');
      }
      if (!formValues.description.trim()) {
        throw new Error('Please enter assignment instructions.');
      }
      if (!formValues.dueDate) {
        throw new Error('Please set a due date.');
      }
      if (!formValues.course) {
        throw new Error('Please select a course.');
      }

      const assignmentData = {
        title: formValues.title,
        description: formValues.description,
        dueDate: formValues.dueDate,
        pointsPossible: Number(formValues.pointsPossible),
        submissionType: formValues.submissionType,
        allowLateSubmissions: formValues.allowLateSubmissions,
        course: formValues.course
      };

      const response = await assignmentService.createAssignment(assignmentData);
      showToast('Assignment created successfully!', { type: 'success' });
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormValues({ ...formValues, [name]: checked });
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
  };

  // Set minimum date as today
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Create Assignment</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form id="createAssignmentForm" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Assignment Title</label>
            <input
              type="text"
              name="title"
              value={formValues.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Instructions</label>
            <textarea
              name="description"
              value={formValues.description}
              onChange={handleChange}
              rows={5}
              required
              className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"
            ></textarea>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You can use Markdown formatting</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formValues.dueDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Points Possible</label>
              <input
                type="number"
                name="pointsPossible"
                value={formValues.pointsPossible}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Course</label>
              <select
                name="course"
                value={formValues.course}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Submission Type</label>
              <select
                name="submissionType"
                value={formValues.submissionType}
                onChange={handleChange}
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="both">Text and File Upload</option>
                <option value="text">Text Only</option>
                <option value="file">File Upload Only</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="allowLateSubmissions"
              id="allowLateSubmissions"
              checked={formValues.allowLateSubmissions}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="allowLateSubmissions" className="text-gray-700 dark:text-gray-300">
              Allow late submissions
            </label>
          </div>
          
          {error && (
            <div id="assignmentError" className="text-red-500">{error}</div>
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
                  Creating...
                </>
              ) : (
                'Create Assignment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}