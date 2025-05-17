const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Create a new arena
router.post('/', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    const arena = await prisma.arena.create({
      data: {
        title,
        description,
        creatorId: userId
      }
    });

    res.status(201).json(arena);
  } catch (err) {
    console.error('Error creating arena:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all active arenas
router.get('/', async (req, res) => {
  try {
    const arenas = await prisma.arena.findMany({
      where: {
        isActive: true
      },
      include: {
        creator: {
          select: {
            username: true
          }
        },
        _count: {
          select: {
            questions: true,
            participations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(arenas);
  } catch (err) {
    console.error('Error getting arenas:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get arena by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const arena = await prisma.arena.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        questions: {
          select: {
            id: true,
            questionText: true,
            options: true,
            timeLimit: true,
            points: true,
            order: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        participations: {
          where: {
            isCompleted: true
          },
          orderBy: [
            { totalScore: 'desc' },
            { totalTimeTaken: 'asc' }
          ],
          take: 10,
          include: {
            user: {
              select: {
                username: true
              }
            }
          }
        }
      }
    });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    res.json(arena);
  } catch (err) {
    console.error('Error getting arena:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an arena
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    const userId = req.user.id;

    // Check if user is the creator
    const arena = await prisma.arena.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (arena.creatorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this arena' });
    }

    // Update arena
    const updatedArena = await prisma.arena.update({
      where: { id },
      data: {
        title,
        description,
        isActive
      }
    });

    res.json(updatedArena);
  } catch (err) {
    console.error('Error updating arena:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an arena
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is the creator
    const arena = await prisma.arena.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (arena.creatorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this arena' });
    }

    // Delete arena (will cascade to questions and participations)
    await prisma.arena.delete({
      where: { id }
    });

    res.json({ message: 'Arena deleted' });
  } catch (err) {
    console.error('Error deleting arena:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get arenas created by user
router.get('/user/created', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const arenas = await prisma.arena.findMany({
      where: {
        creatorId: userId
      },
      include: {
        _count: {
          select: {
            questions: true,
            participations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(arenas);
  } catch (err) {
    console.error('Error getting user arenas:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get arenas participated in by user
router.get('/user/participated', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const participations = await prisma.participation.findMany({
      where: {
        userId
      },
      include: {
        arena: {
          include: {
            creator: {
              select: {
                username: true
              }
            },
            _count: {
              select: {
                questions: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    res.json(participations);
  } catch (err) {
    console.error('Error getting participations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 