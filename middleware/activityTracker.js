// middleware/activityTracker.js

const Activity = require('../models/activity.js');

// Function to record user activity
exports.recordActivity = async (user, type, description, details = {}) => {
    try {
        await Activity.create({
            user: user._id,
            type,
            description,
            course: details.course || null,
            resource: details.resource || null,
            assignment: details.assignment || null,
            discussion: details.discussion || null,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error recording activity:', error);
    }
};

// Middleware to track login activities
exports.trackLogin = (req, res, next) => {
    // Store original send method
    const originalSend = res.send;
    
    // Override send method
    res.send = function(body) {
        // Check if this is a successful login response
        try {
            const data = JSON.parse(body);
            if (data.status === 'success' && data.token) {
                // This is a successful login, record the activity
                const user = req.user || data.data.user;
                
                if (user) {
                    // Update last login time and increment login count
                    User.findByIdAndUpdate(
                        user._id,
                        {
                            lastLogin: new Date(),
                            $inc: { loginCount: 1 }
                        },
                        { new: true }
                    ).catch(err => console.error('Error updating login stats:', err));
                    
                    // Record login activity
                    exports.recordActivity(
                        user,
                        'login',
                        'User logged in',
                        {}
                    );
                }
            }
        } catch (error) {
            // Not JSON or other error, ignore
        }
        
        // Call original send
        return originalSend.call(this, body);
    };
    
    next();
};

// Other middleware functions for different activity types...