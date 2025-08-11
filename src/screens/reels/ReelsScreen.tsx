import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import { reelsService, Reel } from '../../services/reelsService';

interface ReelData {
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
  isLiked: boolean;
  music?: string;
  hashtags: string[];
  verified: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const REEL_HEIGHT = SCREEN_HEIGHT - 100; // Account for status bar and bottom tabs

const ReelsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [reels, setReels] = useState<ReelData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Mock reels data
  const mockReels: ReelData[] = [
    {
      id: '1',
      userId: '101',
      username: 'emma_adventures',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      videoUrl: 'https://example.com/reel1.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face',
      description: 'Beautiful sunset hike today! 🌅 #hiking #sunset #nature',
      likes: 1247,
      comments: 89,
      shares: 23,
      isLiked: false,
      music: 'Original Audio - emma_adventures',
      hashtags: ['#hiking', '#sunset', '#nature'],
      verified: true,
    },
    {
      id: '2',
      userId: '102',
      username: 'sophia_artist',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      videoUrl: 'https://example.com/reel2.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face',
      description: 'Creating art in my studio ✨ What do you think? #art #painting #creative',
      likes: 2156,
      comments: 234,
      shares: 67,
      isLiked: true,
      music: 'Lo-fi Beats - Chill Music',
      hashtags: ['#art', '#painting', '#creative'],
      verified: false,
    },
    {
      id: '3',
      userId: '103',
      username: 'isabella_fitness',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      videoUrl: 'https://example.com/reel3.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
      description: 'Morning workout routine 💪 Who wants to join me? #fitness #workout #motivation',
      likes: 3421,
      comments: 456,
      shares: 123,
      isLiked: false,
      music: 'Pump It Up - Workout Mix',
      hashtags: ['#fitness', '#workout', '#motivation'],
      verified: true,
    },
    {
      id: '4',
      userId: '104',
      username: 'olivia_foodie',
      userAvatar: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=100&h=100&fit=crop&crop=face',
      videoUrl: 'https://example.com/reel4.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=600&fit=crop&crop=face',
      description: 'Cooking my favorite pasta recipe 🍝 Recipe in comments! #cooking #food #pasta',
      likes: 1876,
      comments: 312,
      shares: 89,
      isLiked: true,
      music: 'Cooking Vibes - Kitchen Beats',
      hashtags: ['#cooking', '#food', '#pasta'],
      verified: false,
    },
    {
      id: '5',
      userId: '105',
      username: 'ava_travel',
      userAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=face',
      videoUrl: 'https://example.com/reel5.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face',
      description: 'Exploring the streets of Paris 🇫🇷 Can\'t wait to share more! #travel #paris #explore',
      likes: 4567,
      comments: 678,
      shares: 234,
      isLiked: false,
      music: 'French Café - Ambient Sounds',
      hashtags: ['#travel', '#paris', '#explore'],
      verified: true,
    },
  ];

  useEffect(() => {
    initializeAndLoadReels();
    
    // Subscribe to reels updates
    const unsubscribe = reelsService.subscribe((updatedReels) => {
      const convertedReels = updatedReels.map(convertReelToReelData);
      setReels(convertedReels);
    });
    
    return unsubscribe;
  }, []);

  const initializeAndLoadReels = async () => {
    await reelsService.initialize();
    await loadReels();
  };

  const convertReelToReelData = (reel: Reel): ReelData => {
    return {
      id: reel.id,
      userId: reel.userId,
      username: reel.username,
      userAvatar: reel.userAvatar,
      videoUrl: reel.videoUrl,
      thumbnailUrl: reel.thumbnailUrl,
      description: reel.description,
      likes: reel.likes,
      comments: reel.comments,
      shares: reel.shares,
      isLiked: reel.isLiked,
      music: reel.music,
      hashtags: reel.hashtags,
      verified: reel.verified,
    };
  };

  const loadReels = async () => {
    try {
      const serviceReels = reelsService.getReels();
      if (serviceReels.length === 0) {
        // Fallback to mock data if no reels in service
        setReels(mockReels);
      } else {
        const convertedReels = serviceReels.map(convertReelToReelData);
        setReels(convertedReels);
      }
    } catch (error) {
      console.error('Failed to load reels:', error);
      setReels(mockReels);
    }
  };

  const handleLike = async (reelId: string) => {
    try {
      const success = await reelsService.toggleLike(reelId, 'current_user_id');
      if (!success) {
        // Fallback to local state update if service fails
        setReels(prevReels =>
          prevReels.map(reel =>
            reel.id === reelId
              ? {
                  ...reel,
                  isLiked: !reel.isLiked,
                  likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1,
                }
              : reel
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleComment = (reel: ReelData) => {
    Alert.alert('Comments', `View comments for ${reel.username}'s reel`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'View Comments', onPress: () => navigateToComments(reel.id) },
    ]);
  };

  const handleShare = async (reel: ReelData) => {
    try {
      const success = await reelsService.shareReel(reel.id);
      if (success) {
        Alert.alert('Shared!', `${reel.username}'s reel has been shared!`);
      } else {
        Alert.alert('Share', `Share ${reel.username}'s reel`);
      }
    } catch (error) {
      console.error('Failed to share reel:', error);
      Alert.alert('Share', `Share ${reel.username}'s reel`);
    }
  };

  const navigateToComments = (reelId: string) => {
    // Navigate to comments screen - would be implemented with navigation
    console.log('Navigate to comments for reel:', reelId);
  };

  const handleProfilePress = (reel: ReelData) => {
    Alert.alert('Profile', `View ${reel.username}'s profile`);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const onScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.y / viewSize.height);
    setCurrentIndex(pageNum);
  };

  const renderReelItem = ({ item: reel, index }: { item: ReelData; index: number }) => (
    <View style={styles.reelContainer}>
      {/* Video/Image placeholder */}
      <Image 
        source={{ uri: reel.thumbnailUrl }} 
        style={styles.reelMedia}
        resizeMode="cover"
      />

      {/* Play button overlay */}
      <TouchableOpacity style={styles.playButton}>
        <Icon name="play-arrow" size={60} color="rgba(255, 255, 255, 0.9)" />
      </TouchableOpacity>

      {/* Gradient overlay */}
      <View style={styles.gradientOverlay} />

      {/* User info and actions */}
      <View style={styles.contentOverlay}>
        {/* Left side - User info and description */}
        <View style={styles.leftContent}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => handleProfilePress(reel)}
          >
            <Image source={{ uri: reel.userAvatar }} style={styles.userAvatar} />
            <View style={styles.userDetails}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>{reel.username}</Text>
                {reel.verified && (
                  <Icon name="verified" size={16} color="#4FC3F7" style={styles.verifiedIcon} />
                )}
              </View>
              {reel.music && (
                <Text style={styles.musicText} numberOfLines={1}>
                  🎵 {reel.music}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.description} numberOfLines={3}>
            {reel.description}
          </Text>
        </View>

        {/* Right side - Action buttons */}
        <View style={styles.rightContent}>
          {/* Like button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(reel.id)}
          >
            <Icon 
              name={reel.isLiked ? "favorite" : "favorite-outline"} 
              size={28} 
              color={reel.isLiked ? "#ff4444" : "#fff"} 
            />
            <Text style={styles.actionCount}>
              {formatCount(reel.likes)}
            </Text>
          </TouchableOpacity>

          {/* Comment button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleComment(reel)}
          >
            <Icon name="chat-bubble-outline" size={28} color="#fff" />
            <Text style={styles.actionCount}>
              {formatCount(reel.comments)}
            </Text>
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShare(reel)}
          >
            <Icon name="share" size={28} color="#fff" />
            <Text style={styles.actionCount}>
              {formatCount(reel.shares)}
            </Text>
          </TouchableOpacity>

          {/* More options */}
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="more-horiz" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>Reels</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="camera-alt" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Reels List */}
      <FlatList
        ref={flatListRef}
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={renderReelItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={REEL_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        style={styles.reelsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButton: {
    padding: 8,
  },
  reelsList: {
    flex: 1,
  },
  reelContainer: {
    width: SCREEN_WIDTH,
    height: REEL_HEIGHT,
    position: 'relative',
  },
  reelMedia: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    zIndex: 5,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 100, // Account for bottom tabs
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  leftContent: {
    flex: 1,
    marginRight: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  musicText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  rightContent: {
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  actionCount: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    fontWeight: '600',
  },
});

export default ReelsScreen;
