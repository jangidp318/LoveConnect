// Reels Service
// Handle video reels upload, management, feed, likes, comments, and sharing

import AsyncStorage from '@react-native-async-storage/async-storage';
import { photoService } from './photoService';

export interface Reel {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  duration: number;
  isLiked: boolean;
  music?: string;
  hashtags: string[];
  location?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReelComment {
  id: string;
  reelId: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
}

export interface ReelUploadOptions {
  videoPath: string;
  description: string;
  hashtags: string[];
  music?: string;
  location?: string;
  thumbnailTime?: number; // seconds
}

class ReelsService {
  private reels: Reel[] = [];
  private comments: { [reelId: string]: ReelComment[] } = {};
  private listeners: ((reels: Reel[]) => void)[] = [];

  // Initialize service
  async initialize(): Promise<void> {
    try {
      await this.loadReels();
      await this.loadComments();
    } catch (error) {
      console.error('Failed to initialize reels service:', error);
    }
  }

  // Get reels feed
  getReels(): Reel[] {
    return this.reels;
  }

  // Get reels by user
  getUserReels(userId: string): Reel[] {
    return this.reels.filter(reel => reel.userId === userId);
  }

  // Get reel by ID
  getReel(reelId: string): Reel | null {
    return this.reels.find(reel => reel.id === reelId) || null;
  }

  // Upload new reel
  async uploadReel(userId: string, options: ReelUploadOptions): Promise<Reel | null> {
    try {
      // Validate video
      const videoInfo = await this.validateVideo(options.videoPath);
      if (!videoInfo.isValid) {
        throw new Error(videoInfo.error);
      }

      // Generate thumbnail
      const thumbnailUrl = await this.generateThumbnail(options.videoPath, options.thumbnailTime || 1);

      // Upload video to storage (mock Firebase Storage)
      const videoUrl = await this.uploadVideoToStorage(options.videoPath);

      // Create reel object
      const reel: Reel = {
        id: this.generateId(),
        userId,
        username: 'Current User', // Would get from auth service
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        videoUrl,
        thumbnailUrl,
        description: options.description,
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        duration: videoInfo.duration,
        isLiked: false,
        music: options.music,
        hashtags: options.hashtags,
        location: options.location,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to reels array
      this.reels.unshift(reel);
      await this.saveReels();
      this.notifyListeners();

      return reel;
    } catch (error) {
      console.error('Failed to upload reel:', error);
      return null;
    }
  }

  // Update reel
  async updateReel(reelId: string, updates: Partial<Pick<Reel, 'description' | 'hashtags' | 'location'>>): Promise<boolean> {
    try {
      const reel = this.reels.find(r => r.id === reelId);
      if (!reel) return false;

      Object.assign(reel, updates, { updatedAt: new Date() });
      await this.saveReels();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to update reel:', error);
      return false;
    }
  }

  // Delete reel
  async deleteReel(reelId: string, userId: string): Promise<boolean> {
    try {
      const reelIndex = this.reels.findIndex(r => r.id === reelId && r.userId === userId);
      if (reelIndex === -1) return false;

      const reel = this.reels[reelIndex];
      
      // Delete video and thumbnail from storage
      await this.deleteFromStorage(reel.videoUrl);
      await this.deleteFromStorage(reel.thumbnailUrl);

      // Remove reel
      this.reels.splice(reelIndex, 1);
      delete this.comments[reelId];

      await this.saveReels();
      await this.saveComments();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to delete reel:', error);
      return false;
    }
  }

  // Like/Unlike reel
  async toggleLike(reelId: string, userId: string): Promise<boolean> {
    try {
      const reel = this.reels.find(r => r.id === reelId);
      if (!reel) return false;

      reel.isLiked = !reel.isLiked;
      reel.likes = reel.isLiked ? reel.likes + 1 : Math.max(0, reel.likes - 1);
      reel.updatedAt = new Date();

      await this.saveReels();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to toggle like:', error);
      return false;
    }
  }

  // Share reel
  async shareReel(reelId: string): Promise<boolean> {
    try {
      const reel = this.reels.find(r => r.id === reelId);
      if (!reel) return false;

      reel.shares += 1;
      reel.updatedAt = new Date();

      await this.saveReels();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to share reel:', error);
      return false;
    }
  }

  // Record view
  async recordView(reelId: string): Promise<void> {
    try {
      const reel = this.reels.find(r => r.id === reelId);
      if (!reel) return;

      reel.views += 1;
      await this.saveReels();
      // Don't notify listeners for view updates to avoid unnecessary re-renders
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  }

  // Comments management
  async getComments(reelId: string): Promise<ReelComment[]> {
    return this.comments[reelId] || [];
  }

  async addComment(reelId: string, userId: string, text: string): Promise<ReelComment | null> {
    try {
      const reel = this.reels.find(r => r.id === reelId);
      if (!reel) return null;

      const comment: ReelComment = {
        id: this.generateId(),
        reelId,
        userId,
        username: 'Current User', // Would get from auth service
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        text,
        likes: 0,
        isLiked: false,
        createdAt: new Date(),
      };

      if (!this.comments[reelId]) {
        this.comments[reelId] = [];
      }
      this.comments[reelId].push(comment);

      // Update comment count
      reel.comments += 1;
      reel.updatedAt = new Date();

      await this.saveComments();
      await this.saveReels();
      this.notifyListeners();
      
      return comment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      return null;
    }
  }

  async deleteComment(reelId: string, commentId: string, userId: string): Promise<boolean> {
    try {
      const reelComments = this.comments[reelId];
      if (!reelComments) return false;

      const commentIndex = reelComments.findIndex(c => c.id === commentId && c.userId === userId);
      if (commentIndex === -1) return false;

      reelComments.splice(commentIndex, 1);

      // Update comment count
      const reel = this.reels.find(r => r.id === reelId);
      if (reel) {
        reel.comments = Math.max(0, reel.comments - 1);
        reel.updatedAt = new Date();
      }

      await this.saveComments();
      await this.saveReels();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to delete comment:', error);
      return false;
    }
  }

  // Search reels
  searchReels(query: string): Reel[] {
    const lowercaseQuery = query.toLowerCase();
    return this.reels.filter(reel =>
      reel.description.toLowerCase().includes(lowercaseQuery) ||
      reel.hashtags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      reel.username.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get trending reels
  getTrendingReels(limit: number = 20): Reel[] {
    return [...this.reels]
      .sort((a, b) => {
        const aScore = a.likes + a.comments + a.shares + (a.views / 10);
        const bScore = b.likes + b.comments + b.shares + (b.views / 10);
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  // Subscribe to updates
  subscribe(listener: (reels: Reel[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Private methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener([...this.reels]);
    });
  }

  private async validateVideo(videoPath: string): Promise<{ isValid: boolean; duration?: number; error?: string }> {
    try {
      // Mock validation - in real app would use react-native-video or similar
      // Check file exists, format, duration, size, etc.
      const duration = Math.random() * 60 + 5; // 5-65 seconds
      
      if (duration > 60) {
        return { isValid: false, error: 'Video must be 60 seconds or less' };
      }

      return { isValid: true, duration };
    } catch (error) {
      return { isValid: false, error: 'Invalid video file' };
    }
  }

  private async generateThumbnail(videoPath: string, time: number): Promise<string> {
    try {
      // Mock thumbnail generation - would use FFmpeg or similar
      // For now return a placeholder
      return `https://via.placeholder.com/400x600/ff4444/ffffff?text=Thumbnail`;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return `https://via.placeholder.com/400x600/cccccc/ffffff?text=Error`;
    }
  }

  private async uploadVideoToStorage(videoPath: string): Promise<string> {
    try {
      // Mock upload to Firebase Storage
      // In real app would upload actual video file
      return `https://mock-storage.example.com/videos/${this.generateId()}.mp4`;
    } catch (error) {
      console.error('Failed to upload video:', error);
      throw error;
    }
  }

  private async deleteFromStorage(url: string): Promise<void> {
    try {
      // Mock delete from Firebase Storage
      console.log('Deleted from storage:', url);
    } catch (error) {
      console.error('Failed to delete from storage:', error);
    }
  }

  private async loadReels(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_reels');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert dates back to Date objects
        this.reels = parsed.map((reel: any) => ({
          ...reel,
          createdAt: new Date(reel.createdAt),
          updatedAt: new Date(reel.updatedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load reels:', error);
    }
  }

  private async saveReels(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_reels', JSON.stringify(this.reels));
    } catch (error) {
      console.error('Failed to save reels:', error);
    }
  }

  private async loadComments(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_reel_comments');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert dates back to Date objects
        this.comments = {};
        Object.keys(parsed).forEach(reelId => {
          this.comments[reelId] = parsed[reelId].map((comment: any) => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
          }));
        });
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }

  private async saveComments(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_reel_comments', JSON.stringify(this.comments));
    } catch (error) {
      console.error('Failed to save comments:', error);
    }
  }
}

// Export singleton instance
export const reelsService = new ReelsService();
