const express = require('express');
const { thumbnailUpload, pdfUpload } = require('../config/s3');
const { authenticateToken, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Test S3 connection
router.get('/test-s3', authenticateToken, restrictTo('admin'), async (req, res) => {
  try {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    const { s3Client } = require('../config/s3');
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME || 'jyoti-onlie-course',
      Key: 'test-file.txt',
      Body: 'Hello S3!',
      ContentType: 'text/plain'
    };
    
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    const url = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    
    res.json({
      status: 'success',
      message: 'S3 connection working',
      url: url
    });
  } catch (error) {
    console.error('S3 test error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Upload course thumbnail
router.post('/thumbnail', 
  authenticateToken, 
  restrictTo('admin'), 
  (req, res) => {
    thumbnailUpload.single('thumbnail')(req, res, (err) => {
      if (err) {
        console.error('Thumbnail upload error:', err);
        return res.status(500).json({ message: err.message });
      }
      
      if (!req.file) {

        return res.status(400).json({ message: 'No file uploaded' });
      }
      

      res.json({
        status: 'success',
        data: {
          url: req.file.location,
          key: req.file.key
        }
      });
    });
  }
);

// Upload chapter PDF
router.post('/pdf', 
  authenticateToken, 
  restrictTo('admin'), 
  (req, res) => {
    pdfUpload.single('pdf')(req, res, (err) => {
      if (err) {
        console.error('PDF upload error:', err);
        return res.status(500).json({ message: err.message });
      }
      
      if (!req.file) {

        return res.status(400).json({ message: 'No file uploaded' });
      }
      

      res.json({
        status: 'success',
        data: {
          url: req.file.location,
          key: req.file.key
        }
      });
    });
  }
);

module.exports = router;