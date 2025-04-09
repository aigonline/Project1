// models/Activity.js

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Activity must belong to a user']
    },
    type: {
        type: String,
        enum: [
            'login',
            'enrollment',
            'submission',
            'comment',
            'resource',
            'grade',
            'discussion',
            'course_creation',
            'other'
        ],
        required: [true, 'Activity must have a type']
    },
    description: {
        type: String,
        required: [true, 'Activity must have a description']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
    },
    discussion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;