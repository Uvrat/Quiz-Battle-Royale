const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Add question to arena
router.post('/', auth, async (req, res) => {
  try {
    const { 
      arenaId, 
      questionText, 
      options, 
      correctOption, 
      timeLimit, 
      points,
      order
    } = req.body;
    const userId = req.user.id;

    // Check if user is the arena creator
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
      select: { creatorId: true }
    });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (arena.creatorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to add questions to this arena' });
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        arenaId,
        questionText,
        options: JSON.stringify(options),
        correctOption,
        timeLimit,
        points: points || 10,
        order: order || 0
      }
    });

    res.status(201).json(question);
  } catch (err) {
    console.error('Error adding question:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get questions for an arena
router.get('/arena/:arenaId', auth, async (req, res) => {
  try {
    const { arenaId } = req.params;
    const userId = req.user.id;

    // Check if user is the arena creator
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
      select: { creatorId: true }
    });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (arena.creatorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view questions for this arena' });
    }

    // Get questions
    const questions = await prisma.question.findMany({
      where: { arenaId },
      orderBy: { order: 'asc' }
    });

    // Parse options from JSON string
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));

    res.json(parsedQuestions);
  } catch (err) {
    console.error('Error getting questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a question
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      questionText, 
      options, 
      correctOption, 
      timeLimit, 
      points,
      order
    } = req.body;
    const userId = req.user.id;

    // Get question with arena
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        arena: {
          select: { creatorId: true }
        }
      }
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the arena creator
    if (question.arena.creatorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this question' });
    }

    // Update question
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        questionText,
        options: options ? JSON.stringify(options) : undefined,
        correctOption,
        timeLimit,
        points,
        order
      }
    });

    res.json({
      ...updatedQuestion,
      options: JSON.parse(updatedQuestion.options)
    });
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a question
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get question with arena
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        arena: {
          select: { creatorId: true }
        }
      }
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the arena creator
    if (question.arena.creatorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    // Delete question
    await prisma.question.delete({
      where: { id }
    });

    res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reorder questions in an arena
router.post('/reorder', auth, async (req, res) => {
  try {
    const { arenaId, questionOrder } = req.body;
    const userId = req.user.id;

    // Check if user is the arena creator
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
      select: { creatorId: true }
    });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (arena.creatorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to reorder questions for this arena' });
    }

    // Update each question's order
    const updates = questionOrder.map((qId, index) => {
      return prisma.question.update({
        where: { id: qId },
        data: { order: index }
      });
    });

    await prisma.$transaction(updates);

    res.json({ message: 'Questions reordered successfully' });
  } catch (err) {
    console.error('Error reordering questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 