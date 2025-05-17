const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // React Vite default port
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/arenas', require('./routes/arenas'));
app.use('/api/questions', require('./routes/questions'));

// Socket.IO event handling
const activeArenas = {};
const userSessions = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins an arena
  socket.on('join_arena', async ({ userId, arenaId, isCreator = false }) => {
    try {
      // Add user to arena room
      socket.join(arenaId);
      userSessions[socket.id] = { userId, arenaId, isCreator };

      // Get arena details
      const arena = await prisma.arena.findUnique({
        where: { id: arenaId },
        include: { 
          questions: { 
            select: {
              id: true,
              questionText: true,
              options: true,
              timeLimit: true,
              points: true,
              order: true
            },
            orderBy: { order: 'asc' }
          },
          participations: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          }
        }
      });

      if (!arena) {
        socket.emit('arena_error', { message: 'Arena not found' });
        return;
      }

      // Initialize arena in active arenas if not exists
      if (!activeArenas[arenaId]) {
        activeArenas[arenaId] = {
          participants: [],
          currentQuestion: 0,
          isActive: true
        };
      }

      // Check if creator is joining as monitor
      if (isCreator) {
        // Get the user's username
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { username: true }
        });

        // Send all arena info to creator for monitoring
        socket.emit('arena_joined', {
          arena: {
            id: arena.id,
            title: arena.title,
            description: arena.description,
            questionCount: arena.questions.length
          },
          isCreator: true
        });

        // Ensure creator is in participants list but without participation record
        const existingCreatorIndex = activeArenas[arenaId].participants.findIndex(p => p.userId === userId);
        if (existingCreatorIndex === -1 && user) {
          activeArenas[arenaId].participants.push({
            userId,
            username: user.username,
            isCreator: true
          });
          
          // Notify all participants in the arena that creator is monitoring
          io.to(arenaId).emit('user_joined', {
            participants: activeArenas[arenaId].participants
          });
        }
        
        return;
      }

      // Check if user is already participating
      const existingParticipation = await prisma.participation.findFirst({
        where: {
          userId,
          arenaId,
          isCompleted: false
        }
      });

      let participation;
      
      if (existingParticipation) {
        // User is already participating, use existing record
        participation = existingParticipation;
        
        // Check if user is already in participants list
        const existingParticipantIndex = activeArenas[arenaId].participants.findIndex(p => p.userId === userId);
        if (existingParticipantIndex === -1) {
          // User reconnected, add back to participants
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true }
          });
          
          activeArenas[arenaId].participants.push({
            participationId: participation.id,
            userId,
            username: user.username,
            score: participation.totalScore,
            timeTaken: participation.totalTimeTaken
          });
        }
      } else {
        // Create new participation record
        participation = await prisma.participation.create({
          data: {
            userId,
            arenaId,
          },
          include: {
            user: {
              select: {
                username: true
              }
            }
          }
        });
        
        // Add participant to active arena
        activeArenas[arenaId].participants.push({
          participationId: participation.id,
          userId,
          username: participation.user.username,
          score: 0,
          timeTaken: 0
        });
      }

      // Notify all participants in the arena
      io.to(arenaId).emit('user_joined', {
        participants: activeArenas[arenaId].participants
      });

      // Send arena details to participant
      socket.emit('arena_joined', {
        arena: {
          id: arena.id,
          title: arena.title,
          description: arena.description,
          questionCount: arena.questions.length
        },
        participationId: participation.id
      });

    } catch (err) {
      console.error('Error joining arena:', err);
      socket.emit('arena_error', { message: 'Error joining arena' });
    }
  });

  // Add question during live quiz
  socket.on('add_live_question', async ({ arenaId, userId, questionData }) => {
    try {
      const { isCreator } = userSessions[socket.id] || {};
      
      if (!isCreator) {
        socket.emit('arena_error', { message: 'Only the creator can add questions' });
        return;
      }
      
      // Get the arena
      const arena = await prisma.arena.findUnique({
        where: { id: arenaId },
        select: { creatorId: true }
      });
      
      if (!arena || arena.creatorId !== userId) {
        socket.emit('arena_error', { message: 'Not authorized to add questions to this arena' });
        return;
      }
      
      // Create the new question
      const newQuestion = await prisma.question.create({
        data: {
          arenaId,
          questionText: questionData.questionText,
          options: JSON.stringify(questionData.options),
          correctOption: questionData.correctOption,
          timeLimit: questionData.timeLimit,
          points: questionData.points || 10,
          order: questionData.order || 999 // Add to end
        }
      });
      
      // Notify creator that question was added successfully
      socket.emit('question_added', {
        success: true,
        question: {
          ...newQuestion,
          options: JSON.parse(newQuestion.options)
        }
      });
      
    } catch (err) {
      console.error('Error adding live question:', err);
      socket.emit('arena_error', { message: 'Error adding question' });
    }
  });

  // User submits an answer
  socket.on('submit_answer', async ({ participationId, questionId, selectedOption, timeTaken }) => {
    try {
      const { arenaId } = userSessions[socket.id];
      
      // Get question details
      const question = await prisma.question.findUnique({
        where: { id: questionId }
      });

      if (!question) {
        socket.emit('answer_error', { message: 'Question not found' });
        return;
      }

      // Determine if answer is correct
      const isCorrect = selectedOption === question.correctOption;
      
      // Calculate points based on correctness and time taken
      const maxPoints = question.points;
      const timeRatio = Math.max(0, (question.timeLimit * 1000 - timeTaken) / (question.timeLimit * 1000));
      const points = isCorrect ? Math.round(maxPoints * (0.6 + 0.4 * timeRatio)) : 0;

      // Save answer
      await prisma.answer.create({
        data: {
          participationId,
          questionId,
          selectedOption,
          isCorrect,
          timeTaken,
          points
        }
      });

      // Update participation record
      const participation = await prisma.participation.update({
        where: { id: participationId },
        data: {
          totalScore: { increment: points },
          totalTimeTaken: { increment: timeTaken }
        },
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        }
      });

      // Update leaderboard for this arena
      const participantIndex = activeArenas[arenaId].participants.findIndex(
        p => p.participationId === participationId
      );
      
      if (participantIndex !== -1) {
        activeArenas[arenaId].participants[participantIndex].score = participation.totalScore;
        activeArenas[arenaId].participants[participantIndex].timeTaken = participation.totalTimeTaken;
        
        // Sort participants by score (desc) and time taken (asc)
        activeArenas[arenaId].participants.sort((a, b) => {
          if (a.score !== b.score) return b.score - a.score;
          return a.timeTaken - b.timeTaken;
        });
      }

      // Send updated leaderboard to all participants in the arena
      io.to(arenaId).emit('leaderboard_update', {
        participants: activeArenas[arenaId].participants
      });

      // Confirm answer submission to the user
      socket.emit('answer_submitted', {
        isCorrect,
        points,
        totalScore: participation.totalScore
      });

    } catch (err) {
      console.error('Error submitting answer:', err);
      socket.emit('answer_error', { message: 'Error submitting answer' });
    }
  });

  // Creator starts the quiz
  socket.on('start_quiz', async ({ arenaId, userId }) => {
    try {
      const arena = await prisma.arena.findUnique({
        where: { id: arenaId },
        include: { 
          questions: { 
            select: {
              id: true,
              questionText: true,
              options: true,
              timeLimit: true,
              points: true,
              order: true
            },
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!arena) {
        socket.emit('arena_error', { message: 'Arena not found' });
        return;
      }

      if (arena.creatorId !== userId) {
        socket.emit('arena_error', { message: 'Only the creator can start the quiz' });
        return;
      }

      if (arena.questions.length === 0) {
        socket.emit('arena_error', { message: 'Arena has no questions' });
        return;
      }

      // Start quiz
      activeArenas[arenaId].isActive = true;
      activeArenas[arenaId].currentQuestion = 0;

      // Send first question to all participants
      const firstQuestion = arena.questions[0];
      const sanitizedQuestion = {
        id: firstQuestion.id,
        questionText: firstQuestion.questionText,
        options: JSON.parse(firstQuestion.options),
        timeLimit: firstQuestion.timeLimit,
        order: firstQuestion.order
      };

      io.to(arenaId).emit('question', {
        question: sanitizedQuestion,
        questionNumber: 1,
        totalQuestions: arena.questions.length
      });

      // Set timeout for next question
      setTimeout(() => {
        sendNextQuestion(arenaId, arena.questions);
      }, firstQuestion.timeLimit * 1000 + 3000); // Add 3 seconds buffer between questions

    } catch (err) {
      console.error('Error starting quiz:', err);
      socket.emit('arena_error', { message: 'Error starting quiz' });
    }
  });

  // Complete quiz participation
  socket.on('complete_participation', async ({ participationId }) => {
    try {
      await prisma.participation.update({
        where: { id: participationId },
        data: {
          isCompleted: true,
          endTime: new Date()
        }
      });

      socket.emit('participation_completed');
    } catch (err) {
      console.error('Error completing participation:', err);
      socket.emit('arena_error', { message: 'Error completing participation' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const session = userSessions[socket.id];
    if (session) {
      const { arenaId, userId } = session;
      
      if (activeArenas[arenaId]) {
        // Remove participant from active arena
        activeArenas[arenaId].participants = activeArenas[arenaId].participants.filter(
          p => p.userId !== userId
        );
        
        // Notify remaining participants
        io.to(arenaId).emit('user_left', {
          userId,
          participants: activeArenas[arenaId].participants
        });
        
        // Clean up if no participants remain
        if (activeArenas[arenaId].participants.length === 0) {
          delete activeArenas[arenaId];
        }
      }
      
      // Clean up session
      delete userSessions[socket.id];
    }
    
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Helper function to send next question
function sendNextQuestion(arenaId, questions) {
  if (!activeArenas[arenaId] || !activeArenas[arenaId].isActive) {
    return;
  }

  const currentQuestionIndex = activeArenas[arenaId].currentQuestion + 1;
  
  // Check if we've gone through all questions
  if (currentQuestionIndex >= questions.length) {
    io.to(arenaId).emit('quiz_ended', {
      participants: activeArenas[arenaId].participants
    });
    return;
  }

  // Update current question
  activeArenas[arenaId].currentQuestion = currentQuestionIndex;
  
  // Get next question
  const question = questions[currentQuestionIndex];
  const sanitizedQuestion = {
    id: question.id,
    questionText: question.questionText,
    options: JSON.parse(question.options),
    timeLimit: question.timeLimit,
    order: question.order
  };

  // Send to all participants
  io.to(arenaId).emit('question', {
    question: sanitizedQuestion,
    questionNumber: currentQuestionIndex + 1,
    totalQuestions: questions.length
  });

  // Set timeout for next question
  setTimeout(() => {
    sendNextQuestion(arenaId, questions);
  }, question.timeLimit * 1000 + 3000); // Add 3 seconds buffer between questions
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 