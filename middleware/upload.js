const multer = require('multer');
const AppError = require('../utils/appError.js');
const fs = require('fs');
const path = require('path');

// Ensure profile uploads directory exists
const profileUploadsDir = 'uploads/profile';
if (!fs.existsSync(profileUploadsDir)) {
    fs.mkdirSync(profileUploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Check if this is an avatar upload
        if (file.fieldname === 'avatar') {
            cb(null, 'uploads/profile/');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        
        // For avatar uploads, use a more specific naming convention
        if (file.fieldname === 'avatar') {
            const ext = path.extname(file.originalname);
            cb(null, `avatar-${uniqueSuffix}${ext}`);
        } else {
            cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
        }
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // For avatar uploads, only allow images
    if (file.fieldname === 'avatar') {
        if (!file.mimetype.startsWith('image/')) {
            cb(new AppError('Please upload only image files for profile pictures.', 400), false);
            return;
        }
        cb(null, true);
        return;
    }

    // For other uploads, keep existing logic
    if (
        file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/vnd.ms-powerpoint' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
        cb(null, true);
    } else {
        cb(new AppError('Not a supported file format! Please upload only images, PDFs, DOC, DOCX, PPT or PPTX files.', 400), false);
    }
};


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
        files: 5 // Limit to 5 files per upload
    },
    fileFilter: fileFilter
}).single('file'); // Default to single file upload

// Wrapper function to handle multer errors
const handleUpload = (req, res, next) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new AppError('File is too large. Maximum size is 10MB', 400));
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return next(new AppError('Too many files. Maximum is 5 files', 400));
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return next(new AppError('Unexpected field name for file upload', 400));
            }
            return next(new AppError(err.message || 'File upload error', 400));
        } else if (err) {
            return next(new AppError(err.message || 'Error processing upload', 500));
        }
        
        // Check if file exists when required
        if (!req.file && !req.files) {
            return next(new AppError('Please provide a file to upload', 400));
        }
        
        next();
    });
};

// Export the enhanced version
module.exports = {
    uploadFile: handleUpload,
    uploadAvatar: multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for avatars
        fileFilter: fileFilter
    }).single('avatar'),
    uploadMultiple: multer({
        storage: storage,
        limits: {
            fileSize: 10 * 1024 * 1024,
            files: 5
        },
        fileFilter: fileFilter
    }).array('files', 5)
};