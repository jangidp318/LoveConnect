// Search Service
// Handle user discovery, filtering, advanced search, and recommendations

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from './matchesService';
import { locationService } from './locationService';

export interface SearchFilters {
  ageRange: { min: number; max: number };
  distanceRadius: number;
  interests?: string[];
  verifiedOnly: boolean;
  premiumOnly: boolean;
  onlineOnly: boolean;
  hasPhotos: boolean;
  recentlyActive: boolean; // Active within last 7 days
  location?: string;
  education?: string;
  occupation?: string;
  height?: { min: number; max: number }; // in cm
  relationshipType?: 'casual' | 'serious' | 'friendship' | 'any';
}

export interface SearchResult {
  profile: UserProfile;
  distance?: number;
  matchScore: number; // 0-100 compatibility score
  commonInterests: string[];
  lastActive?: Date;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
  lastUsed: Date;
}

export interface RecentSearch {
  id: string;
  query: string;
  filters?: Partial<SearchFilters>;
  timestamp: Date;
  resultCount: number;
}

class SearchService {
  private userProfiles: UserProfile[] = [];
  private savedSearches: SavedSearch[] = [];
  private recentSearches: RecentSearch[] = [];
  private searchHistory: string[] = [];
  private currentLocation?: { latitude: number; longitude: number };

  // Initialize service
  async initialize(): Promise<void> {
    try {
      await this.loadSavedSearches();
      await this.loadRecentSearches();
      await this.loadSearchHistory();
      await this.generateMockProfiles();
      this.currentLocation = await locationService.getCurrentLocation();
    } catch (error) {
      console.error('Failed to initialize search service:', error);
    }
  }

  // Basic text search
  async searchUsers(query: string, filters?: Partial<SearchFilters>, limit: number = 20): Promise<SearchResult[]> {
    try {
      const results = await this.performSearch(query, filters, limit);
      
      // Save to recent searches
      await this.addToRecentSearches(query, filters, results.length);
      
      // Save to search history
      if (query.trim()) {
        await this.addToSearchHistory(query.trim());
      }

      return results;
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  // Advanced search with filters
  async advancedSearch(filters: SearchFilters, limit: number = 50): Promise<SearchResult[]> {
    try {
      return await this.performSearch('', filters, limit);
    } catch (error) {
      console.error('Failed to perform advanced search:', error);
      return [];
    }
  }

  // Get recommended users based on preferences and activity
  async getRecommendedUsers(userId: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      // Get user's profile to understand preferences
      const userProfile = this.userProfiles.find(p => p.id === userId);
      if (!userProfile) return [];

      // Create recommendation filters based on user's profile
      const recommendationFilters: SearchFilters = {
        ageRange: { min: Math.max(18, userProfile.age - 10), max: userProfile.age + 10 },
        distanceRadius: 50,
        verifiedOnly: false,
        premiumOnly: false,
        onlineOnly: false,
        hasPhotos: true,
        recentlyActive: true,
        interests: userProfile.interests,
      };

      const results = await this.performSearch('', recommendationFilters, limit * 2);
      
      // Sort by match score and return top results
      return results
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get recommended users:', error);
      return [];
    }
  }

  // Search by interests
  async searchByInterests(interests: string[], limit: number = 20): Promise<SearchResult[]> {
    try {
      const filters: SearchFilters = {
        ageRange: { min: 18, max: 65 },
        distanceRadius: 100,
        interests,
        verifiedOnly: false,
        premiumOnly: false,
        onlineOnly: false,
        hasPhotos: true,
        recentlyActive: false,
      };

      return await this.performSearch('', filters, limit);
    } catch (error) {
      console.error('Failed to search by interests:', error);
      return [];
    }
  }

  // Search nearby users
  async searchNearby(radiusKm: number = 25, limit: number = 20): Promise<SearchResult[]> {
    try {
      if (!this.currentLocation) {
        this.currentLocation = await locationService.getCurrentLocation();
      }

      const filters: SearchFilters = {
        ageRange: { min: 18, max: 65 },
        distanceRadius: radiusKm,
        verifiedOnly: false,
        premiumOnly: false,
        onlineOnly: false,
        hasPhotos: true,
        recentlyActive: false,
      };

      return await this.performSearch('', filters, limit);
    } catch (error) {
      console.error('Failed to search nearby:', error);
      return [];
    }
  }

  // Save search for later use
  async saveSearch(name: string, filters: SearchFilters): Promise<boolean> {
    try {
      const savedSearch: SavedSearch = {
        id: this.generateId(),
        name,
        filters,
        createdAt: new Date(),
        lastUsed: new Date(),
      };

      this.savedSearches.push(savedSearch);
      await this.saveSavedSearches();
      return true;
    } catch (error) {
      console.error('Failed to save search:', error);
      return false;
    }
  }

  // Get saved searches
  getSavedSearches(): SavedSearch[] {
    return this.savedSearches.sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
  }

  // Delete saved search
  async deleteSavedSearch(searchId: string): Promise<boolean> {
    try {
      const index = this.savedSearches.findIndex(s => s.id === searchId);
      if (index === -1) return false;

      this.savedSearches.splice(index, 1);
      await this.saveSavedSearches();
      return true;
    } catch (error) {
      console.error('Failed to delete saved search:', error);
      return false;
    }
  }

  // Execute saved search
  async executeSavedSearch(searchId: string, limit: number = 20): Promise<SearchResult[]> {
    try {
      const savedSearch = this.savedSearches.find(s => s.id === searchId);
      if (!savedSearch) return [];

      // Update last used timestamp
      savedSearch.lastUsed = new Date();
      await this.saveSavedSearches();

      return await this.performSearch('', savedSearch.filters, limit);
    } catch (error) {
      console.error('Failed to execute saved search:', error);
      return [];
    }
  }

  // Get recent searches
  getRecentSearches(): RecentSearch[] {
    return this.recentSearches
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  // Clear recent searches
  async clearRecentSearches(): Promise<void> {
    try {
      this.recentSearches = [];
      await this.saveRecentSearches();
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  }

  // Get search history
  getSearchHistory(): string[] {
    return [...this.searchHistory].reverse().slice(0, 20);
  }

  // Clear search history
  async clearSearchHistory(): Promise<void> {
    try {
      this.searchHistory = [];
      await this.saveSearchHistory();
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }

  // Get popular search terms
  getPopularSearches(): string[] {
    // Return some popular/trending search terms
    return [
      'fitness',
      'travel',
      'photography',
      'music',
      'art',
      'cooking',
      'hiking',
      'yoga',
      'coffee',
      'reading',
    ];
  }

  // Update user location for distance calculations
  async updateLocation(location: { latitude: number; longitude: number }): Promise<void> {
    this.currentLocation = location;
  }

  // Private methods
  private async performSearch(query: string, filters?: Partial<SearchFilters>, limit: number = 20): Promise<SearchResult[]> {
    let results: SearchResult[] = [];
    const lowercaseQuery = query.toLowerCase();

    // Filter profiles based on query and filters
    const filteredProfiles = this.userProfiles.filter(profile => {
      // Text search
      if (query && !this.matchesQuery(profile, lowercaseQuery)) {
        return false;
      }

      // Apply filters
      if (filters && !this.matchesFilters(profile, filters)) {
        return false;
      }

      return true;
    });

    // Convert to search results with scores
    results = filteredProfiles.map(profile => {
      const result: SearchResult = {
        profile,
        matchScore: this.calculateMatchScore(profile, query, filters),
        commonInterests: this.findCommonInterests(profile, filters?.interests),
      };

      // Add distance if we have location
      if (this.currentLocation && profile.location) {
        result.distance = this.calculateDistance(profile);
      }

      return result;
    });

    // Sort by match score and distance
    results.sort((a, b) => {
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

    return results.slice(0, limit);
  }

  private matchesQuery(profile: UserProfile, query: string): boolean {
    return (
      profile.name.toLowerCase().includes(query) ||
      profile.bio?.toLowerCase().includes(query) ||
      profile.interests?.some(interest => interest.toLowerCase().includes(query)) ||
      profile.location?.toLowerCase().includes(query)
    );
  }

  private matchesFilters(profile: UserProfile, filters: Partial<SearchFilters>): boolean {
    if (filters.ageRange) {
      if (profile.age < filters.ageRange.min || profile.age > filters.ageRange.max) {
        return false;
      }
    }

    if (filters.verifiedOnly && !profile.verified) {
      return false;
    }

    if (filters.premiumOnly && !profile.isPremium) {
      return false;
    }

    if (filters.onlineOnly && !profile.isOnline) {
      return false;
    }

    if (filters.hasPhotos && (!profile.photos || profile.photos.length === 0)) {
      return false;
    }

    if (filters.recentlyActive && profile.lastActive) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (profile.lastActive < sevenDaysAgo) {
        return false;
      }
    }

    if (filters.distanceRadius && this.currentLocation && profile.location) {
      const distance = this.calculateDistance(profile);
      if (distance && distance > filters.distanceRadius) {
        return false;
      }
    }

    if (filters.interests && filters.interests.length > 0) {
      const hasCommonInterest = profile.interests?.some(interest =>
        filters.interests!.some(filterInterest =>
          interest.toLowerCase().includes(filterInterest.toLowerCase())
        )
      );
      if (!hasCommonInterest) {
        return false;
      }
    }

    return true;
  }

  private calculateMatchScore(profile: UserProfile, query?: string, filters?: Partial<SearchFilters>): number {
    let score = 50; // Base score

    // Boost for verified profiles
    if (profile.verified) score += 10;

    // Boost for premium profiles
    if (profile.isPremium) score += 5;

    // Boost for online status
    if (profile.isOnline) score += 10;

    // Boost for having photos
    if (profile.photos && profile.photos.length > 0) {
      score += Math.min(profile.photos.length * 2, 10);
    }

    // Boost for having bio
    if (profile.bio && profile.bio.length > 50) score += 5;

    // Boost for common interests
    if (filters?.interests) {
      const commonInterests = this.findCommonInterests(profile, filters.interests);
      score += commonInterests.length * 5;
    }

    // Boost for query match
    if (query && query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      if (profile.name.toLowerCase().includes(lowercaseQuery)) score += 15;
      if (profile.bio?.toLowerCase().includes(lowercaseQuery)) score += 10;
      if (profile.interests?.some(i => i.toLowerCase().includes(lowercaseQuery))) score += 8;
    }

    // Distance penalty
    if (this.currentLocation) {
      const distance = this.calculateDistance(profile);
      if (distance) {
        score -= Math.min(distance, 20); // Max 20 point penalty for distance
      }
    }

    // Recent activity boost
    if (profile.lastActive) {
      const hoursSinceActive = (Date.now() - profile.lastActive.getTime()) / (1000 * 60 * 60);
      if (hoursSinceActive < 24) score += 10;
      else if (hoursSinceActive < 168) score += 5; // Within a week
    }

    return Math.max(0, Math.min(100, score));
  }

  private findCommonInterests(profile: UserProfile, interests?: string[]): string[] {
    if (!interests || !profile.interests) return [];

    return profile.interests.filter(profileInterest =>
      interests.some(interest =>
        profileInterest.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(profileInterest.toLowerCase())
      )
    );
  }

  private calculateDistance(profile: UserProfile): number | undefined {
    if (!this.currentLocation || !profile.location) return undefined;

    // Mock distance calculation - would use real geolocation
    return Math.random() * 50 + 1; // 1-51 km
  }

  private async addToRecentSearches(query: string, filters?: Partial<SearchFilters>, resultCount: number = 0): Promise<void> {
    const recentSearch: RecentSearch = {
      id: this.generateId(),
      query,
      filters,
      timestamp: new Date(),
      resultCount,
    };

    // Remove duplicate if exists
    this.recentSearches = this.recentSearches.filter(s => s.query !== query);
    
    // Add to beginning
    this.recentSearches.unshift(recentSearch);
    
    // Keep only last 20
    if (this.recentSearches.length > 20) {
      this.recentSearches = this.recentSearches.slice(0, 20);
    }

    await this.saveRecentSearches();
  }

  private async addToSearchHistory(query: string): Promise<void> {
    // Remove duplicate if exists
    this.searchHistory = this.searchHistory.filter(s => s !== query);
    
    // Add to beginning
    this.searchHistory.unshift(query);
    
    // Keep only last 50
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(0, 50);
    }

    await this.saveSearchHistory();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async generateMockProfiles(): Promise<void> {
    // Only generate if we don't have profiles already
    if (this.userProfiles.length > 0) return;

    // Extended mock profiles for search functionality
    this.userProfiles = [
      {
        id: '201',
        name: 'Aria',
        age: 24,
        photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'],
        bio: 'Passionate photographer and world traveler 📸 Love capturing moments and creating memories. Always ready for the next adventure!',
        location: 'New York, NY',
        interests: ['photography', 'travel', 'adventure', 'art', 'coffee'],
        verified: true,
        isPremium: false,
        isOnline: true,
        lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        id: '202',
        name: 'Luna',
        age: 27,
        photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'],
        bio: 'Yoga instructor and wellness coach 🧘‍♀️ Helping people find their inner peace and strength through mindful movement.',
        location: 'Los Angeles, CA',
        interests: ['yoga', 'meditation', 'wellness', 'fitness', 'spirituality'],
        verified: false,
        isPremium: true,
        isOnline: false,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: '203',
        name: 'Nova',
        age: 25,
        photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'],
        bio: 'Software engineer by day, musician by night 🎵 Building apps and composing melodies. Let\'s create something beautiful together.',
        location: 'San Francisco, CA',
        interests: ['technology', 'music', 'programming', 'guitar', 'innovation'],
        verified: true,
        isPremium: false,
        isOnline: true,
        lastActive: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      },
      {
        id: '204',
        name: 'Zara',
        age: 26,
        photos: ['https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=400&fit=crop&crop=face'],
        bio: 'Food blogger and culinary adventurer 🍴 Exploring flavors from around the world and sharing the love for good food.',
        location: 'Chicago, IL',
        interests: ['cooking', 'food', 'blogging', 'travel', 'wine'],
        verified: false,
        isPremium: false,
        isOnline: true,
        lastActive: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      },
      {
        id: '205',
        name: 'Sage',
        age: 28,
        photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face'],
        bio: 'Environmental scientist and nature lover 🌱 Working to protect our planet while finding joy in the simple things.',
        location: 'Portland, OR',
        interests: ['nature', 'environment', 'hiking', 'science', 'sustainability'],
        verified: true,
        isPremium: true,
        isOnline: false,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      },
    ];
  }

  private async loadSavedSearches(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_saved_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.savedSearches = parsed.map((search: any) => ({
          ...search,
          createdAt: new Date(search.createdAt),
          lastUsed: new Date(search.lastUsed),
        }));
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  }

  private async saveSavedSearches(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_saved_searches', JSON.stringify(this.savedSearches));
    } catch (error) {
      console.error('Failed to save saved searches:', error);
    }
  }

  private async loadRecentSearches(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.recentSearches = parsed.map((search: any) => ({
          ...search,
          timestamp: new Date(search.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }

  private async saveRecentSearches(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_recent_searches', JSON.stringify(this.recentSearches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }

  private async loadSearchHistory(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_search_history');
      if (stored) {
        this.searchHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }

  private async saveSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();
