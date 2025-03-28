const Course = require('../models/course.js');
const User = require('../models/user.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures.js');

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
exports.createCourse = catchAsync(async (req, res, next) => {
    if (!req.body.instructor) req.body.instructor = req.user.id;

    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return next(new AppError('Only instructors and admins can create courses', 403));
    }

    const newCourse = await Course.create(req.body);

    res.status(201).json({
        status: 'success',
        data: { course: newCourse }
    });
});

// Update course
exports.updateCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }

    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id.toString()) {
        return next(new AppError('You do not have permission to update this course', 403));
    }

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: { course: updatedCourse }
    });
});

// Delete course
exports.deleteCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }

    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id.toString()) {
        return next(new AppError('You do not have permission to delete this course', 403));
    }

    await Course.findByIdAndDelete(req.params.id);

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
