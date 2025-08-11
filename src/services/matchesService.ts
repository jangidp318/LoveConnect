// Matches Service
// Handle match detection, management, filtering, and mutual like logic

import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService, createMatchNotification } from './notificationService';

export interface Match {
  id: string;
  userId: string;
  name: string;
  age: number;
  photos: string[];
  bio?: string;
  location?: string;
  distance?: number;
  lastMessage?: string;
  lastMessageTime?: Date;
  matchedAt: Date;
  isNewMatch: boolean;
  isOnline: boolean;
  unreadCount: number;
  isPremium: boolean;
  verified: boolean;
  interests?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio?: string;
  location?: string;
  interests?: string[];
  verified: boolean;
  isPremium: boolean;
  isOnline: boolean;
  lastActive?: Date;
}

export interface SwipeAction {
  userId: string;
  targetUserId: string;
  action: 'like' | 'pass' | 'super_like';
  timestamp: Date;
}

export interface MatchPreferences {
  minAge: number;
  maxAge: number;
  maxDistance: number;
  interestedIn: 'men' | 'women' | 'everyone';
  verifiedOnly: boolean;
  premiumOnly: boolean;
  showOnlineOnly: boolean;
}

class MatchesService {
  private matches: Match[] = [];
  private swipeHistory: SwipeAction[] = [];
  private userProfiles: UserProfile[] = [];
  private preferences: MatchPreferences = {
    minAge: 18,
    maxAge: 35,
    maxDistance: 50,
    interestedIn: 'everyone',
    verifiedOnly: false,
    premiumOnly: false,
    showOnlineOnly: false,
  };
  private listeners: ((matches: Match[]) => void)[] = [];

  // Initialize service
  async initialize(): Promise<void> {
    try {
      await this.loadMatches();
      await this.loadSwipeHistory();
      await this.loadPreferences();
      await this.generateMockProfiles();
    } catch (error) {
      console.error('Failed to initialize matches service:', error);
    }
  }

  // Get all matches
  getMatches(): Match[] {
    return this.matches;
  }

  // Get new matches
  getNewMatches(): Match[] {
    return this.matches.filter(match => match.isNewMatch);
  }

  // Get regular matches (not new)
  getRegularMatches(): Match[] {
    return this.matches.filter(match => !match.isNewMatch);
  }

  // Get match by ID
  getMatch(matchId: string): Match | null {
    return this.matches.find(match => match.id === matchId) || null;
  }

  // Process a swipe action
  async processSwipe(userId: string, targetUserId: string, action: 'like' | 'pass' | 'super_like'): Promise<{ match: Match | null; isMatch: boolean }> {
    try {
      // Record the swipe
      const swipeAction: SwipeAction = {
        userId,
        targetUserId,
        action,
        timestamp: new Date(),
      };
      this.swipeHistory.push(swipeAction);
      await this.saveSwipeHistory();

      // If it's a pass, no match is possible
      if (action === 'pass') {
        return { match: null, isMatch: false };
      }

      // Check if there's a mutual like
      const mutualSwipe = this.swipeHistory.find(
        swipe => 
          swipe.userId === targetUserId && 
          swipe.targetUserId === userId && 
          (swipe.action === 'like' || swipe.action === 'super_like')
      );

      if (mutualSwipe) {
        // Create a match!
        const targetProfile = this.userProfiles.find(profile => profile.id === targetUserId);
        if (targetProfile) {
          const match = await this.createMatch(userId, targetProfile, action === 'super_like' || mutualSwipe.action === 'super_like');
          return { match, isMatch: true };
        }
      }

      return { match: null, isMatch: false };
    } catch (error) {
      console.error('Failed to process swipe:', error);
      return { match: null, isMatch: false };
    }
  }

  // Get potential matches for discovery
  async getPotentialMatches(userId: string, limit: number = 10): Promise<UserProfile[]> {
    try {
      // Get users we haven't swiped on yet
      const swipedUserIds = this.swipeHistory
        .filter(swipe => swipe.userId === userId)
        .map(swipe => swipe.targetUserId);

      // Get existing match user IDs
      const matchedUserIds = this.matches.map(match => match.userId);

      // Filter profiles based on preferences and history
      let potentialMatches = this.userProfiles.filter(profile => {
        // Don't show self, already swiped, or already matched users
        if (profile.id === userId || 
            swipedUserIds.includes(profile.id) || 
            matchedUserIds.includes(profile.id)) {
          return false;
        }

        // Apply filters
        if (profile.age < this.preferences.minAge || profile.age > this.preferences.maxAge) {
          return false;
        }

        if (this.preferences.verifiedOnly && !profile.verified) {
          return false;
        }

        if (this.preferences.premiumOnly && !profile.isPremium) {
          return false;
        }

        if (this.preferences.showOnlineOnly && !profile.isOnline) {
          return false;
        }

        return true;
      });

      // Sort by online status and premium status
      potentialMatches.sort((a, b) => {
        if (a.isOnline !== b.isOnline) {
          return b.isOnline ? 1 : -1;
        }
        if (a.isPremium !== b.isPremium) {
          return b.isPremium ? 1 : -1;
        }
        return Math.random() - 0.5; // Random order
      });

      return potentialMatches.slice(0, limit);
    } catch (error) {
      console.error('Failed to get potential matches:', error);
      return [];
    }
  }

  // Unmatch with a user
  async unmatch(matchId: string, userId: string): Promise<boolean> {
    try {
      const matchIndex = this.matches.findIndex(match => match.id === matchId);
      if (matchIndex === -1) return false;

      // Remove the match
      this.matches.splice(matchIndex, 1);
      await this.saveMatches();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to unmatch:', error);
      return false;
    }
  }

  // Mark match as not new
  async markMatchAsSeen(matchId: string): Promise<boolean> {
    try {
      const match = this.matches.find(m => m.id === matchId);
      if (!match) return false;

      match.isNewMatch = false;
      await this.saveMatches();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to mark match as seen:', error);
      return false;
    }
  }

  // Update match preferences
  async updatePreferences(newPreferences: Partial<MatchPreferences>): Promise<void> {
    try {
      this.preferences = { ...this.preferences, ...newPreferences };
      await this.savePreferences();
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  }

  // Get match preferences
  getPreferences(): MatchPreferences {
    return this.preferences;
  }

  // Get swipe statistics
  getSwipeStats(userId: string): { likes: number; passes: number; superLikes: number; matches: number } {
    const userSwipes = this.swipeHistory.filter(swipe => swipe.userId === userId);
    return {
      likes: userSwipes.filter(s => s.action === 'like').length,
      passes: userSwipes.filter(s => s.action === 'pass').length,
      superLikes: userSwipes.filter(s => s.action === 'super_like').length,
      matches: this.matches.length,
    };
  }

  // Search matches
  searchMatches(query: string): Match[] {
    const lowercaseQuery = query.toLowerCase();
    return this.matches.filter(match =>
      match.name.toLowerCase().includes(lowercaseQuery) ||
      match.bio?.toLowerCase().includes(lowercaseQuery) ||
      match.interests?.some(interest => interest.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Sort matches
  sortMatches(sortBy: 'recent' | 'unread' | 'online' | 'name'): Match[] {
    const sorted = [...this.matches];
    
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => {
          const aTime = a.lastMessageTime || a.matchedAt;
          const bTime = b.lastMessageTime || b.matchedAt;
          return bTime.getTime() - aTime.getTime();
        });
      case 'unread':
        return sorted.sort((a, b) => b.unreadCount - a.unreadCount);
      case 'online':
        return sorted.sort((a, b) => {
          if (a.isOnline !== b.isOnline) {
            return b.isOnline ? 1 : -1;
          }
          return 0;
        });
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }

  // Subscribe to updates
  subscribe(listener: (matches: Match[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Private methods
  private async createMatch(userId: string, targetProfile: UserProfile, isSuperLike: boolean): Promise<Match> {
    const match: Match = {
      id: this.generateId(),
      userId: targetProfile.id,
      name: targetProfile.name,
      age: targetProfile.age,
      photos: targetProfile.photos,
      bio: targetProfile.bio,
      location: targetProfile.location,
      matchedAt: new Date(),
      isNewMatch: true,
      isOnline: targetProfile.isOnline,
      unreadCount: 0,
      isPremium: targetProfile.isPremium,
      verified: targetProfile.verified,
      interests: targetProfile.interests,
    };

    this.matches.unshift(match);
    await this.saveMatches();
    this.notifyListeners();

    // Create notification
    notificationService.addNotification(
      createMatchNotification(targetProfile.name, targetProfile.id)
    );

    return match;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener([...this.matches]);
    });
  }

  private async generateMockProfiles(): Promise<void> {
    // Only generate if we don't have profiles already
    if (this.userProfiles.length > 0) return;

    const mockProfiles: UserProfile[] = [
      {
        id: '101',
        name: 'Emma',
        age: 25,
        photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'],
        bio: 'Love hiking and coffee ☕ Looking for genuine connections',
        location: 'New York, NY',
        interests: ['hiking', 'coffee', 'photography', 'travel'],
        verified: true,
        isPremium: false,
        isOnline: true,
      },
      {
        id: '102',
        name: 'Sophia',
        age: 28,
        photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'],
        bio: 'Artist and dreamer 🎨 Love creating beautiful things',
        location: 'Los Angeles, CA',
        interests: ['art', 'painting', 'music', 'museums'],
        verified: false,
        isPremium: true,
        isOnline: false,
      },
      {
        id: '103',
        name: 'Isabella',
        age: 24,
        photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'],
        bio: 'Fitness enthusiast 💪 Yoga instructor and wellness coach',
        location: 'Miami, FL',
        interests: ['fitness', 'yoga', 'wellness', 'nutrition'],
        verified: true,
        isPremium: false,
        isOnline: true,
      },
      {
        id: '104',
        name: 'Olivia',
        age: 26,
        photos: ['https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=400&fit=crop&crop=face'],
        bio: 'Foodie and chef 👩‍🍳 Love trying new cuisines',
        location: 'San Francisco, CA',
        interests: ['cooking', 'food', 'restaurants', 'wine'],
        verified: false,
        isPremium: false,
        isOnline: false,
      },
      {
        id: '105',
        name: 'Ava',
        age: 27,
        photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face'],
        bio: 'Travel blogger ✈️ Always planning the next adventure',
        location: 'Seattle, WA',
        interests: ['travel', 'photography', 'writing', 'adventure'],
        verified: true,
        isPremium: true,
        isOnline: true,
      },
      {
        id: '106',
        name: 'Charlotte',
        age: 23,
        photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'],
        bio: 'Music lover 🎵 Plays guitar and writes songs',
        location: 'Austin, TX',
        interests: ['music', 'guitar', 'concerts', 'festivals'],
        verified: false,
        isPremium: false,
        isOnline: true,
      },
      {
        id: '107',
        name: 'Amelia',
        age: 29,
        photos: ['https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=400&fit=crop&crop=face'],
        bio: 'Bookworm and writer 📚 Love deep conversations',
        location: 'Chicago, IL',
        interests: ['reading', 'writing', 'literature', 'coffee'],
        verified: true,
        isPremium: false,
        isOnline: false,
      },
      {
        id: '108',
        name: 'Harper',
        age: 30,
        photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'],
        bio: 'Tech entrepreneur 💻 Building the future one app at a time',
        location: 'Boston, MA',
        interests: ['technology', 'startups', 'innovation', 'coding'],
        verified: true,
        isPremium: true,
        isOnline: true,
      },
    ];

    this.userProfiles = mockProfiles;
  }

  private async loadMatches(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_matches');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.matches = parsed.map((match: any) => ({
          ...match,
          matchedAt: new Date(match.matchedAt),
          lastMessageTime: match.lastMessageTime ? new Date(match.lastMessageTime) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  }

  private async saveMatches(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_matches', JSON.stringify(this.matches));
    } catch (error) {
      console.error('Failed to save matches:', error);
    }
  }

  private async loadSwipeHistory(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_swipe_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.swipeHistory = parsed.map((swipe: any) => ({
          ...swipe,
          timestamp: new Date(swipe.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load swipe history:', error);
    }
  }

  private async saveSwipeHistory(): Promise<void> {
    try {
      // Keep only last 1000 swipes to prevent unlimited growth
      if (this.swipeHistory.length > 1000) {
        this.swipeHistory = this.swipeHistory.slice(-1000);
      }
      await AsyncStorage.setItem('love_connect_swipe_history', JSON.stringify(this.swipeHistory));
    } catch (error) {
      console.error('Failed to save swipe history:', error);
    }
  }

  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_match_preferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }

  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_match_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }
}

// Export singleton instance
export const matchesService = new MatchesService();
