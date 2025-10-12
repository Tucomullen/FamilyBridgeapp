import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Mock user database (in production, this would be a real database)
const mockUsers = [
  {
    id: '1',
    email: 'senior@familybridge.com',
    password: 'password123', // In production, this would be hashed
    name: 'María García',
    role: 'senior',
    familyId: 'family-001',
  },
  {
    id: '2',
    email: 'family@familybridge.com',
    password: 'password123',
    name: 'Carlos García',
    role: 'family',
    familyId: 'family-001',
  },
];

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Find user in mock database
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        familyId: user.familyId 
      },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '24h' }
    );

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      token,
      user: userWithoutPassword,
      expiresIn: '24h',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Get user profile (protected route)
router.get('/profile', authMiddleware, (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    // Find user in mock database
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Verify token endpoint
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: (req as any).user,
    message: 'Token is valid',
  });
});

export { router as authRoutes };
