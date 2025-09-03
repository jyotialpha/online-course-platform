const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});



// Multer S3 storage for course thumbnails
const thumbnailUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME || 'jyoti-onlie-course',
    key: function (req, file, cb) {
      const fileName = `course-images/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Multer S3 storage for PDFs
const pdfUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME || 'jyoti-onlie-course',
    key: function (req, file, cb) {
      const fileName = `course-pdfs/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

module.exports = { s3Client, thumbnailUpload, pdfUpload };