import { navigationService, ScreenName } from '../../../src/app/services/navigation/NavigationService';

// Mock navigation ref
const mockNavigationRef = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('NavigationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    navigationService.setNavigationRef(mockNavigationRef);
    navigationService.clearHistory();
  });

  describe('Initialization', () => {
    test('should initialize with empty history', () => {
      navigationService.initialize();
      expect(navigationService.getHistory()).toHaveLength(1);
      expect(navigationService.getCurrentScreen()).toBe('Home');
    });

    test('should set navigation reference', () => {
      navigationService.setNavigationRef(mockNavigationRef);
      expect(mockNavigationRef).toBeDefined();
    });
  });

  describe('Navigation', () => {
    test('should navigate to screen and add to history', () => {
      navigationService.navigate('Call');
      
      expect(mockNavigationRef.navigate).toHaveBeenCalledWith('Call', undefined);
      expect(navigationService.getCurrentScreen()).toBe('Call');
      expect(navigationService.getHistory()).toHaveLength(2);
    });

    test('should navigate with parameters', () => {
      const params = { roomId: 'test-room' };
      navigationService.navigate('Call', params);
      
      expect(mockNavigationRef.navigate).toHaveBeenCalledWith('Call', params);
      expect(navigationService.getCurrentScreen()).toBe('Call');
    });

    test('should replace duplicate consecutive screens', () => {
      navigationService.navigate('Call');
      navigationService.navigate('Call'); // Same screen
      
      expect(navigationService.getHistory()).toHaveLength(2); // Home + Call
      expect(navigationService.getCurrentScreen()).toBe('Call');
    });
  });

  describe('Back Navigation', () => {
    test('should go back when history exists', () => {
      navigationService.navigate('Call');
      navigationService.navigate('SOS');
      
      navigationService.goBack();
      
      expect(mockNavigationRef.goBack).toHaveBeenCalled();
      expect(navigationService.getCurrentScreen()).toBe('Call');
    });

    test('should reset to home when no history', () => {
      navigationService.clearHistory();
      navigationService.goBack();
      
      expect(navigationService.getCurrentScreen()).toBe('Home');
      expect(mockNavigationRef.navigate).toHaveBeenCalledWith('Home');
    });

    test('should check if can go back', () => {
      expect(navigationService.canGoBack()).toBe(false);
      
      navigationService.navigate('Call');
      expect(navigationService.canGoBack()).toBe(true);
    });
  });

  describe('Reset to Home', () => {
    test('should reset to home and clear history', () => {
      navigationService.navigate('Call');
      navigationService.navigate('SOS');
      
      navigationService.resetToHome();
      
      expect(navigationService.getCurrentScreen()).toBe('Home');
      expect(navigationService.getHistory()).toHaveLength(1);
      expect(mockNavigationRef.navigate).toHaveBeenCalledWith('Home');
    });
  });

  describe('History Management', () => {
    test('should limit history size', () => {
      // Add more than max history size
      for (let i = 0; i < 15; i++) {
        navigationService.navigate('Call');
      }
      
      expect(navigationService.getHistory().length).toBeLessThanOrEqual(10);
    });

    test('should get current screen', () => {
      expect(navigationService.getCurrentScreen()).toBe('Home');
      
      navigationService.navigate('Call');
      expect(navigationService.getCurrentScreen()).toBe('Call');
    });

    test('should get navigation depth', () => {
      expect(navigationService.getDepth()).toBe(1); // Home only
      
      navigationService.navigate('Call');
      expect(navigationService.getDepth()).toBe(2);
    });
  });

  describe('Breadcrumb Trail', () => {
    test('should return single item for home', () => {
      const trail = navigationService.getBreadcrumbTrail();
      expect(trail).toHaveLength(1);
      expect(trail[0].label).toBe('Inicio');
      expect(trail[0].screen).toBe('Home');
    });

    test('should return two items for navigation', () => {
      navigationService.navigate('Call');
      const trail = navigationService.getBreadcrumbTrail();
      
      expect(trail).toHaveLength(2);
      expect(trail[0].label).toBe('Inicio');
      expect(trail[0].screen).toBe('Home');
      expect(trail[0].onPress).toBeDefined();
      expect(trail[1].label).toBe('Llamada');
      expect(trail[1].screen).toBe('Call');
    });

    test('should limit to 2 levels', () => {
      navigationService.navigate('Call');
      navigationService.navigate('SOS');
      navigationService.navigate('Photos');
      
      const trail = navigationService.getBreadcrumbTrail();
      expect(trail).toHaveLength(2);
      expect(trail[0].label).toBe('SOS'); // Previous screen
      expect(trail[1].label).toBe('Fotos'); // Current screen
    });
  });

  describe('Screen Labels', () => {
    test('should return correct Spanish labels', () => {
      const labels = {
        'Home': 'Inicio',
        'Call': 'Llamada',
        'SOS': 'SOS',
        'Photos': 'Fotos',
        'Settings': 'Ajustes',
        'Voice': 'Voz',
      };

      Object.entries(labels).forEach(([screen, expectedLabel]) => {
        navigationService.clearHistory();
        navigationService.navigate(screen as ScreenName);
        const trail = navigationService.getBreadcrumbTrail();
        expect(trail[0].label).toBe(expectedLabel);
      });
    });
  });

  describe('Event Listeners', () => {
    test('should notify listeners on navigation changes', () => {
      const listener = jest.fn();
      navigationService.observe(listener);
      
      navigationService.navigate('Call');
      
      expect(listener).toHaveBeenCalledWith(expect.any(Array));
    });

    test('should unsubscribe listeners', () => {
      const listener = jest.fn();
      const unsubscribe = navigationService.observe(listener);
      
      unsubscribe();
      navigationService.navigate('Call');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Home Detection', () => {
    test('should detect when on home screen', () => {
      expect(navigationService.isOnHome()).toBe(true);
      
      navigationService.navigate('Call');
      expect(navigationService.isOnHome()).toBe(false);
      
      navigationService.resetToHome();
      expect(navigationService.isOnHome()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle navigation errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockNavigationRef.navigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });
      
      navigationService.navigate('Call');
      
      expect(consoleSpy).toHaveBeenCalledWith('🧭 Navigation error:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    test('should handle go back errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockNavigationRef.goBack.mockImplementation(() => {
        throw new Error('Go back error');
      });
      
      navigationService.navigate('Call');
      navigationService.goBack();
      
      expect(consoleSpy).toHaveBeenCalledWith('🧭 Go back error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
