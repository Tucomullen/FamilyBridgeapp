// Custom event emitter implementation

export type ScreenName = 
  | 'Home'
  | 'Call'
  | 'SOS'
  | 'Photos'
  | 'Settings'
  | 'Voice'
  | 'DevApi'
  | 'DevNotifications'
  | 'Onboarding';

export interface NavigationEntry {
  screen: ScreenName;
  params?: any;
  timestamp: number;
}

export interface NavigationListener {
  (history: NavigationEntry[]): void;
}

class NavigationService {
  private static instance: NavigationService;
  private history: NavigationEntry[] = [];
  private readonly maxHistorySize = 10;
  private navigationRef: any = null;
  private listeners: { [key: string]: Function[] } = {};

  private constructor() {}

  public on(event: string, listener: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  public off(event: string, listener: Function): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  public emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => listener(...args));
  }

  public static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  /**
   * Set the navigation reference for programmatic navigation
   */
  public setNavigationRef(ref: any): void {
    this.navigationRef = ref;
  }

  /**
   * Navigate to a screen and add to history
   */
  public navigate(screen: ScreenName, params?: any): void {
    try {
      // Add to history
      this.addToHistory(screen, params);
      
      // Navigate using React Navigation
      if (this.navigationRef) {
        this.navigationRef.navigate(screen, params);
      }
      
      console.log('🧭 Navigated to:', screen, params);
      this.notifyListeners();
    } catch (error) {
      console.error('🧭 Navigation error:', error);
    }
  }

  /**
   * Go back to previous screen or home if no history
   */
  public goBack(): void {
    try {
      if (this.canGoBack()) {
        // Remove current screen from history
        this.history.pop();
        this.notifyListeners();
        
        // Navigate back using React Navigation
        if (this.navigationRef) {
          this.navigationRef.goBack();
        }
        
        console.log('🧭 Went back to:', this.getCurrentScreen());
      } else {
        // No history, go to home
        this.resetToHome();
      }
    } catch (error) {
      console.error('🧭 Go back error:', error);
      // Fallback to home
      this.resetToHome();
    }
  }

  /**
   * Reset navigation to home screen
   */
  public resetToHome(): void {
    try {
      // Clear history except for home
      this.history = [{ screen: 'Home', timestamp: Date.now() }];
      
      // Navigate to home
      if (this.navigationRef) {
        this.navigationRef.navigate('Home');
      }
      
      console.log('🧭 Reset to home');
      this.notifyListeners();
    } catch (error) {
      console.error('🧭 Reset to home error:', error);
    }
  }

  /**
   * Get current navigation history
   */
  public getHistory(): NavigationEntry[] {
    return [...this.history];
  }

  /**
   * Get current screen
   */
  public getCurrentScreen(): ScreenName | null {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1].screen;
  }

  /**
   * Check if can go back
   */
  public canGoBack(): boolean {
    return this.history.length > 1;
  }

  /**
   * Get breadcrumb trail (max 2 levels)
   */
  public getBreadcrumbTrail(): Array<{label: string, screen: ScreenName, onPress?: () => void}> {
    const trail = [];
    
    if (this.history.length === 0) {
      return [{ label: 'Inicio', screen: 'Home' }];
    }
    
    if (this.history.length === 1) {
      const current = this.history[0];
      return [{ label: this.getScreenLabel(current.screen), screen: current.screen }];
    }
    
    // Max 2 levels - show previous and current
    const previous = this.history[this.history.length - 2];
    const current = this.history[this.history.length - 1];
    
    trail.push({
      label: this.getScreenLabel(previous.screen),
      screen: previous.screen,
      onPress: () => this.goBack()
    });
    
    trail.push({
      label: this.getScreenLabel(current.screen),
      screen: current.screen
    });
    
    return trail;
  }

  /**
   * Add screen to history with deduplication
   */
  private addToHistory(screen: ScreenName, params?: any): void {
    const entry: NavigationEntry = {
      screen,
      params,
      timestamp: Date.now()
    };
    
    // Check if we're navigating to the same screen as current
    const currentScreen = this.getCurrentScreen();
    if (currentScreen === screen) {
      // Replace current entry instead of adding duplicate
      this.history[this.history.length - 1] = entry;
      return;
    }
    
    // Add new entry
    this.history.push(entry);
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get screen display label
   */
  private getScreenLabel(screen: ScreenName): string {
    const labels: Record<ScreenName, string> = {
      'Home': 'Inicio',
      'Call': 'Llamada',
      'SOS': 'SOS',
      'Photos': 'Fotos',
      'Settings': 'Ajustes',
      'Voice': 'Voz',
      'DevApi': 'API Dev',
      'DevNotifications': 'Notificaciones',
      'Onboarding': 'Configuración'
    };
    
    return labels[screen] || screen;
  }

  /**
   * Subscribe to navigation changes
   */
  public observe(listener: NavigationListener): () => void {
    this.on('navigationChanged', listener);
    
    // Return unsubscribe function
    return () => {
      this.off('navigationChanged', listener);
    };
  }

  /**
   * Notify listeners of navigation changes
   */
  private notifyListeners(): void {
    this.emit('navigationChanged', this.history);
  }

  /**
   * Initialize with home screen
   */
  public initialize(): void {
    if (this.history.length === 0) {
      this.history = [{ screen: 'Home', timestamp: Date.now() }];
      this.notifyListeners();
    }
  }

  /**
   * Clear navigation history
   */
  public clearHistory(): void {
    this.history = [];
    this.notifyListeners();
  }

  /**
   * Get navigation depth
   */
  public getDepth(): number {
    return this.history.length;
  }

  /**
   * Check if user is on home screen
   */
  public isOnHome(): boolean {
    return this.getCurrentScreen() === 'Home';
  }
}

// Export singleton instance
export const navigationService = NavigationService.getInstance();
