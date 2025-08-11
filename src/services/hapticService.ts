import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export type HapticFeedbackType = 
  | 'selection'
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'notificationError';

class HapticService {
  private isEnabled: boolean = true;

  // Configure haptic feedback options
  private options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  /**
   * Enable or disable haptic feedback
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Check if haptic feedback is enabled
   */
  isHapticEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Trigger haptic feedback
   */
  trigger(type: HapticFeedbackType) {
    if (!this.isEnabled) return;

    try {
      ReactNativeHapticFeedback.trigger(type, this.options);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  // Convenience methods for common use cases

  /**
   * Light selection feedback (for button taps, toggles)
   */
  selection() {
    this.trigger('selection');
  }

  /**
   * Light impact feedback (for light interactions)
   */
  light() {
    this.trigger('impactLight');
  }

  /**
   * Medium impact feedback (for moderate interactions)
   */
  medium() {
    this.trigger('impactMedium');
  }

  /**
   * Heavy impact feedback (for strong interactions like swipes)
   */
  heavy() {
    this.trigger('impactHeavy');
  }

  /**
   * Success notification feedback
   */
  success() {
    this.trigger('notificationSuccess');
  }

  /**
   * Warning notification feedback
   */
  warning() {
    this.trigger('notificationWarning');
  }

  /**
   * Error notification feedback
   */
  error() {
    this.trigger('notificationError');
  }

  // App-specific convenience methods

  /**
   * Feedback for liking a profile
   */
  like() {
    this.trigger('impactLight');
  }

  /**
   * Feedback for passing on a profile
   */
  pass() {
    this.trigger('selection');
  }

  /**
   * Feedback for super liking a profile
   */
  superLike() {
    this.trigger('impactMedium');
  }

  /**
   * Feedback for receiving a match
   */
  match() {
    this.trigger('notificationSuccess');
  }

  /**
   * Feedback for receiving a message
   */
  message() {
    this.trigger('impactLight');
  }

  /**
   * Feedback for walkie-talkie interactions
   */
  walkieTalkie() {
    this.trigger('impactMedium');
  }

  /**
   * Feedback for button presses
   */
  buttonPress() {
    this.trigger('selection');
  }

  /**
   * Feedback for navigation
   */
  navigation() {
    this.trigger('selection');
  }
}

// Export singleton instance
export const hapticService = new HapticService();
export default hapticService;
