type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

const patterns: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [40],
  heavy: [80],
  success: [40, 60, 40],
  error: [80, 30, 80],
  warning: [40, 20, 40],
};

class HapticFeedback {
  private static instance: HapticFeedback;
  private isEnabled: boolean = true;

  private constructor() {
    // Check if the device supports vibration
    this.isEnabled = typeof window !== 'undefined' && 'vibrate' in navigator;
  }

  public static getInstance(): HapticFeedback {
    if (!HapticFeedback.instance) {
      HapticFeedback.instance = new HapticFeedback();
    }
    return HapticFeedback.instance;
  }

  public trigger(pattern: HapticPattern = 'light'): void {
    if (!this.isEnabled) return;

    try {
      navigator.vibrate(patterns[pattern]);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public enable(): void {
    this.isEnabled = typeof window !== 'undefined' && 'vibrate' in navigator;
  }
}

export const haptics = HapticFeedback.getInstance(); 