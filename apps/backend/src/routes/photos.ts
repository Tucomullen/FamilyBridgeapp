import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Mock photo database (in production, this would be a real database)
const mockPhotos = [
  {
    id: 'photo-001',
    title: 'Familia en Navidad',
    uri: 'mock://photo-001',
    timestamp: new Date('2024-12-25').toISOString(),
    size: 1024000,
    width: 1080,
    height: 1080,
    isLocal: true,
    familyId: 'family-001',
    uploadedBy: '1',
  },
  {
    id: 'photo-002',
    title: 'Cumpleaños de María',
    uri: 'mock://photo-002',
    timestamp: new Date('2024-11-15').toISOString(),
    size: 2048000,
    width: 1080,
    height: 1080,
    isLocal: false,
    familyId: 'family-001',
    uploadedBy: '2',
  },
  {
    id: 'photo-003',
    title: 'Vacaciones en la playa',
    uri: 'mock://photo-003',
    timestamp: new Date('2024-08-20').toISOString(),
    size: 1536000,
    width: 1080,
    height: 1080,
    isLocal: true,
    familyId: 'family-001',
    uploadedBy: '1',
  },
];

// Get photos for authenticated user's family
router.get('/', authMiddleware, (req, res) => {
  try {
    const familyId = (req as any).user?.familyId;
    
    if (!familyId) {
      return res.status(401).json({
        error: 'Family ID not found in token',
      });
    }

    // Filter photos by family ID
    const familyPhotos = mockPhotos.filter(photo => photo.familyId === familyId);
    
    res.json({
      success: true,
      photos: familyPhotos,
      count: familyPhotos.length,
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Get specific photo by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const familyId = (req as any).user?.familyId;
    
    if (!familyId) {
      return res.status(401).json({
        error: 'Family ID not found in token',
      });
    }

    const photo = mockPhotos.find(p => p.id === id && p.familyId === familyId);
    
    if (!photo) {
      return res.status(404).json({
        error: 'Photo not found',
      });
    }

    res.json({
      success: true,
      photo,
    });
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Upload photo (stub for now)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, uri, size, width, height } = req.body;
    const familyId = (req as any).user?.familyId;
    const uploadedBy = (req as any).user?.userId;
    
    if (!familyId || !uploadedBy) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    if (!title || !uri) {
      return res.status(400).json({
        error: 'Title and URI are required',
      });
    }

    // Create new photo (in production, this would be saved to database)
    const newPhoto = {
      id: `photo-${Date.now()}`,
      title,
      uri,
      timestamp: new Date().toISOString(),
      size: size || 0,
      width: width || 1080,
      height: height || 1080,
      isLocal: false,
      familyId,
      uploadedBy,
    };

    // Add to mock database
    mockPhotos.push(newPhoto);

    res.status(201).json({
      success: true,
      photo: newPhoto,
      message: 'Photo uploaded successfully',
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Delete photo
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const familyId = (req as any).user?.familyId;
    
    if (!familyId) {
      return res.status(401).json({
        error: 'Family ID not found in token',
      });
    }

    const photoIndex = mockPhotos.findIndex(p => p.id === id && p.familyId === familyId);
    
    if (photoIndex === -1) {
      return res.status(404).json({
        error: 'Photo not found',
      });
    }

    // Remove photo from mock database
    mockPhotos.splice(photoIndex, 1);

    res.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export { router as photosRoutes };
