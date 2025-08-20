const express = require('express');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const Course = require('../models/Course');
const router = express.Router();

// Create a new course
router.post('/courses', authenticateToken, restrictTo('admin'), async (req, res) => {
  try {
    // Log the incoming request body for debugging
    // console.log('Incoming course creation request:', JSON.stringify(req.body, null, 2));

    const { title, description, price, thumbnail, chapters } = req.body;

    // Basic validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Course title is required' });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'Course description is required' });
    }
    if (price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ message: 'Course price is required and must be a number' });
    }
    if (!Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({ message: 'At least one chapter is required' });
    }

    // thumbnail and pdf can be null
    const course = new Course({
      title,
      description,
      price: Number(price),
      thumbnail: thumbnail || null,
      chapters: chapters.map(ch => ({
        ...ch,
        pdf: ch.pdf || null
      }))
    });

    await course.save();
    res.status(201).json({ message: 'Course created', course });
  } catch (error) {
    // Log the error stack for debugging
    // console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
});

// Update an existing course
router.put('/courses/:id', authenticateToken, restrictTo('admin'), async (req, res) => {
  try {
    const { title, description, price, thumbnail, chapters } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        price,
        thumbnail: thumbnail || null,
        chapters: chapters?.map(ch => ({
          ...ch,
          pdf: ch.pdf || null
        }))
      },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course updated', course });
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
});

module.exports = router;
