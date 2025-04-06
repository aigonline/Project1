const Course = require('../models/course.js');
const User = require('../models/user.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures.js');
const mongoose = require('mongoose');
// Get all courses
exports.getAllCourses = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Course.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

        const courses = await Course.find();

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: { courses }
    });
});

// Get course by ID
exports.getCourse = catchAsync(async (req, res, next) => {
    const courseId = req.params.id;
    console.log('Fetching course with ID:', courseId); // Debugging log

    const course = await Course.findById(courseId)
        .populate('students', 'firstName lastName email profilePicture')
        .populate('assignments')
        .populate('resources')
        .populate('discussions');

    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { course }
    });
});

// Create new course
// Create a new course
exports.createCourse = catchAsync(async (req, res, next) => {
    // Check if the user is an instructor or admin
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return next(new AppError('Only instructors can create courses', 403));
    }
    
    // Set the current user as the instructor
    req.body.instructor = req.user.id;
    
    // Create the course
    const newCourse = await Course.create({
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      instructor: req.user.id,
      color: req.body.color || '#5D5CDE' // Support for course color
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        course: newCourse
      }
    });
  });

// Update course details
exports.updateCourse = catchAsync(async (req, res, next) => {
    // Validate ObjectId format to prevent unnecessary database lookup
  // Get the course
    const { courseId } = req.params;
    console.log('Received ID:', courseId); // Log the ID to see its exact value
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new AppError('Invalid course ID format', 400));
    }
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }
    
    // Check if user is authorized (instructor or admin)
    if (req.user.role !== 'instructor' && course.instructor.toString() !== req.user.id.toString()) {
      return next(new AppError('You do not have permission to update this course', 403));
    }
    
    // Fields that can be updated
    const allowedFields = [
      'name', 
      'code', 
      'description', 
      'color', 
      'enrollmentCode', 
      'allowEnrollment',
      'isArchived'
    ];
    
    // Filter request body to only include allowed fields
    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    
    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(courseId, filteredBody, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Course updated successfully',
      data: {
        course: updatedCourse
      }
    });
  });
  
  // Add a student to a course by email
  exports.addStudentToCourse = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { email } = req.body;
    
    // Check if email was provided
    if (!email) {
      return next(new AppError('Email is required', 400));
    }
    
    // Get the course
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }
    
    // Check if user is authorized (instructor or admin)
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id.toString()) {
      return next(new AppError('You do not have permission to manage students in this course', 403));
    }
    
    // Find the student user by email
    const student = await User.findOne({ email: email.toLowerCase() });
    if (!student) {
      return next(new AppError('No user found with that email address', 404));
    }
    
    // Check if the user is already enrolled
    if (course.students.includes(student._id)) {
      return next(new AppError('Student is already enrolled in this course', 400));
    }
    
    // Add the student to the course
    course.students.push(student._id);
    await course.save();
    
    // Add the course to the student's enrolled courses
    student.enrolledCourses = student.enrolledCourses || [];
    student.enrolledCourses.push(course._id);
    await student.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Student added to course successfully'
    });
  });
  
  // Remove a student from a course
  exports.removeStudentFromCourse = catchAsync(async (req, res, next) => {
    const { id, studentId } = req.params;
    
    // Get the course
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }
    
    // Check if user is authorized (instructor or admin)
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id.toString()) {
      return next(new AppError('You do not have permission to manage students in this course', 403));
    }
    
    // Find the student
    const student = await User.findById(studentId);
    if (!student) {
      return next(new AppError('No student found with that ID', 404));
    }
    
    // Remove student from course
    course.students = course.students.filter(
      id => id.toString() !== studentId.toString()
    );
    await course.save();
    
    // Remove course from student's enrolled courses
    if (student.enrolledCourses) {
      student.enrolledCourses = student.enrolledCourses.filter(
        id => id.toString() !== course._id.toString()
      );
      await student.save();
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Student removed from course successfully'
    });
  });
  
  // Delete a course
  exports.deleteCourse = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    // Get the course
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }
    
    // Check if user is authorized (instructor or admin)
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id.toString()) {
      return next(new AppError('You do not have permission to delete this course', 403));
    }
    
    // Delete the course
    await Course.findByIdAndDelete(id);
    
    // Remove course from all enrolled students
    await User.updateMany(
      { enrolledCourses: id },
      { $pull: { enrolledCourses: id } }
    );
    
    // Optional: Delete associated resources, assignments, discussions, etc.
    // Depends on your data model and cascading delete requirements
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

// Enroll in course
exports.enrollInCourse = catchAsync(async (req, res, next) => {
    const { courseId, enrollmentKey } = req.body;

    // Fetch course and ensure students is an array
    const course = await Course.findById(courseId).select("+enrollmentKey students");

    if (!course) {
        return next(new AppError("No course found with that ID", 404));
    }

    if (!Array.isArray(course.students)) {
        course.students = [];
    }

    // Verify enrollment key if required
    if (course.enrollmentKey && course.enrollmentKey !== enrollmentKey) {
        return next(new AppError("Invalid enrollment key", 401));
    }

    // Check if the user is already enrolled
    if (course.students.includes(req.user.id)) {
        return next(new AppError("You are already enrolled in this course", 400));
    }

    // Add student to course
    course.students.push(req.user.id);
    await course.save();

    // ✅ Update user without triggering password validation
    await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { enrolledCourses: course._id } // ✅ Prevents duplicate entries
    });

    res.status(200).json({
        status: "success",
        message: "Successfully enrolled in course",
        data: { course }
    });
});



// Unenroll from course
exports.unenrollFromCourse = catchAsync(async (req, res, next) => {
    const { courseId } = req.params; // ✅ Ensure we get courseId from params
    const userId = req.user.id; // ✅ Get logged-in user ID

    const course = await Course.findById(courseId).select("+students");

    if (!course) {
        return next(new AppError("No course found with that ID", 404));
    }

    // Ensure `students` is an array
    if (!Array.isArray(course.students)) {
        course.students = [];
    }

    // Check if the user is enrolled
    if (!course.students.includes(userId)) {
        return next(new AppError("You are not enrolled in this course", 400));
    }

    // Remove student from course
    course.students = course.students.filter(student => student.toString() !== userId);
    await course.save();

    // Remove course from user's enrolledCourses list
    await User.findByIdAndUpdate(userId, {
        $pull: { enrolledCourses: courseId }
    });

    res.status(200).json({
        status: "success",
        message: "Successfully unenrolled from course"
    });
});

// Get courses for current user
exports.getMyCourses = catchAsync(async (req, res, next) => {
    let courses;

    if (req.user.role === 'student') {
        courses = await Course.find({ students: req.user.id });
    } else if (req.user.role === 'instructor') {
        courses = await Course.find({ instructor: req.user.id });
    } else {
        courses = await Course.find();
    }

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: { courses }
    });
});
