import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import hapticService from '../../services/hapticService';
import { matchesService, UserProfile as MatchUserProfile } from '../../services/matchesService';
import { pushNotificationService } from '../../services/pushNotificationService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.6;
const SWIPE_THRESHOLD = screenWidth * 0.25;

interface UserProfile {
  id: string;
  name: string;
  age: number;
  distance: number;
  bio: string;
  photos: string[];
  interests: string[];
  verified: boolean;
  isOnline: boolean;
}

interface SwipeableCardProps {
  profile: UserProfile;
  onSwipeLeft: (profile: UserProfile) => void;
  onSwipeRight: (profile: UserProfile) => void;
  onSwipeUp: (profile: UserProfile) => void;
  isTopCard: boolean;
  index: number;
  theme: any;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isTopCard,
  index,
  theme,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (isTopCard) {
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isTopCard) return;

        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right (like)
          hapticService.like();
          Animated.timing(pan, {
            toValue: { x: screenWidth + 100, y: gestureState.dy },
            duration: 300,
            useNativeDriver: false,
          }).start(() => onSwipeRight(profile));
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left (pass)
          hapticService.pass();
          Animated.timing(pan, {
            toValue: { x: -screenWidth - 100, y: gestureState.dy },
            duration: 300,
            useNativeDriver: false,
          }).start(() => onSwipeLeft(profile));
        } else if (gestureState.dy < -SWIPE_THRESHOLD) {
          // Swipe up (super like)
          hapticService.superLike();
          Animated.timing(pan, {
            toValue: { x: gestureState.dx, y: -screenHeight - 100 },
            duration: 300,
            useNativeDriver: false,
          }).start(() => onSwipeUp(profile));
        } else {
          // Return to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const superLikeOpacity = pan.y.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev < profile.photos.length - 1 ? prev + 1 : 0
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev > 0 ? prev - 1 : profile.photos.length - 1
    );
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate },
          ],
          zIndex: isTopCard ? 10 : 10 - index,
          opacity: isTopCard ? 1 : 0.8,
          elevation: isTopCard ? 10 : 5,
        },
      ]}
      {...(isTopCard ? panResponder.panHandlers : {})}
    >
      {/* Photo Section */}
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: profile.photos[currentPhotoIndex] }}
          style={styles.photo}
        />
        
        {/* Photo Navigation */}
        <TouchableOpacity style={styles.photoNavLeft} onPress={prevPhoto} />
        <TouchableOpacity style={styles.photoNavRight} onPress={nextPhoto} />
        
        {/* Photo Indicators */}
        <View style={styles.photoIndicators}>
          {profile.photos.map((_, i) => (
            <View
              key={i}
              style={[
                styles.photoIndicator,
                {
                  backgroundColor: i === currentPhotoIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                },
              ]}
            />
          ))}
        </View>

        {/* Online Status */}
        {profile.isOnline && (
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        )}

        {/* Verified Badge */}
        {profile.verified && (
          <View style={styles.verifiedBadge}>
            <Icon name="verified" size={20} color="#4CAF50" />
          </View>
        )}

        {/* Swipe Overlays */}
        <Animated.View
          style={[styles.swipeOverlay, styles.likeOverlay, { opacity: likeOpacity }]}
        >
          <Text style={styles.swipeText}>LIKE</Text>
        </Animated.View>

        <Animated.View
          style={[styles.swipeOverlay, styles.passOverlay, { opacity: passOpacity }]}
        >
          <Text style={styles.swipeText}>PASS</Text>
        </Animated.View>

        <Animated.View
          style={[styles.swipeOverlay, styles.superLikeOverlay, { opacity: superLikeOpacity }]}
        >
          <Text style={styles.swipeText}>SUPER LIKE</Text>
        </Animated.View>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {profile.name}, {profile.age}
          </Text>
          <Text style={[styles.distance, { color: theme.colors.textSecondary }]}>
            {profile.distance}km away
          </Text>
        </View>

        <Text style={[styles.bio, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {profile.bio}
        </Text>

        {/* Interests */}
        <View style={styles.interests}>
          {profile.interests.slice(0, 3).map((interest, i) => (
            <View
              key={i}
              style={[styles.interestTag, { backgroundColor: `${theme.colors.love}20` }]}
            >
              <Text style={[styles.interestText, { color: theme.colors.love }]}>
                {interest}
              </Text>
            </View>
          ))}
          {profile.interests.length > 3 && (
            <Text style={[styles.moreInterests, { color: theme.colors.textSecondary }]}>
              +{profile.interests.length - 3} more
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const DiscoveryScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock profiles data
  const mockProfiles: UserProfile[] = [
    {
      id: '1',
      name: 'Emma',
      age: 25,
      distance: 2,
      bio: 'Love hiking, yoga, and good coffee. Looking for someone who enjoys adventures and deep conversations ☕️',
      photos: [
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face',
      ],
      interests: ['Hiking', 'Yoga', 'Coffee', 'Travel', 'Reading'],
      verified: true,
      isOnline: true,
    },
    {
      id: '2',
      name: 'Sophia',
      age: 28,
      distance: 5,
      bio: 'Artist and dog lover 🎨🐕 Always up for trying new restaurants and exploring the city',
      photos: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=600&fit=crop&crop=face',
      ],
      interests: ['Art', 'Dogs', 'Food', 'Museums', 'Photography'],
      verified: false,
      isOnline: false,
    },
    {
      id: '3',
      name: 'Isabella',
      age: 24,
      distance: 8,
      bio: 'Fitness enthusiast and foodie. Believe in living life to the fullest! 💪',
      photos: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=600&fit=crop&crop=face',
      ],
      interests: ['Fitness', 'Food', 'Travel', 'Dancing', 'Music'],
      verified: true,
      isOnline: true,
    },
    {
      id: '4',
      name: 'Olivia',
      age: 26,
      distance: 12,
      bio: 'Book worm and nature lover. Weekend getaways and cozy evenings are my thing 📚🌲',
      photos: [
        'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop&crop=face',
      ],
      interests: ['Reading', 'Nature', 'Writing', 'Camping', 'Wine'],
      verified: false,
      isOnline: false,
    },
  ];

  useEffect(() => {
    setProfiles(mockProfiles);
    // Initialize services
    initializeServices();
  }, []);

  const initializeServices = async () => {
    await matchesService.initialize();
    await pushNotificationService.initialize();
  };

  const handleSwipeLeft = async (profile: UserProfile) => {
    console.log('Passed on:', profile.name);
    
    // Process the swipe with matchesService
    const result = await matchesService.processSwipe('current_user_id', profile.id, 'pass');
    
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeRight = async (profile: UserProfile) => {
    console.log('Liked:', profile.name);
    
    // Process the swipe with matchesService
    const result = await matchesService.processSwipe('current_user_id', profile.id, 'like');
    
    if (result.isMatch) {
      hapticService.match();
      Alert.alert('It\'s a Match! 💕', `You and ${profile.name} liked each other!`);
      
      // Send push notification for the match
      await pushNotificationService.sendMatchNotification(profile.name, profile.photos[0]);
    }
    
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeUp = async (profile: UserProfile) => {
    console.log('Super liked:', profile.name);
    
    // Process the swipe with matchesService
    const result = await matchesService.processSwipe('current_user_id', profile.id, 'super_like');
    
    if (result.isMatch) {
      hapticService.match();
      Alert.alert('It\'s a Match! 💕', `You and ${profile.name} super liked each other!`);
      
      // Send push notification for the match
      await pushNotificationService.sendMatchNotification(profile.name, profile.photos[0]);
    } else {
      Alert.alert('Super Like! ⭐', `You super liked ${profile.name}!`);
    }
    
    setCurrentIndex(prev => prev + 1);
  };

  const handleButtonAction = (action: 'pass' | 'like' | 'superlike') => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    // Add button press haptic feedback
    hapticService.buttonPress();

    switch (action) {
      case 'pass':
        handleSwipeLeft(currentProfile);
        break;
      case 'like':
        handleSwipeRight(currentProfile);
        break;
      case 'superlike':
        handleSwipeUp(currentProfile);
        break;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="favorite" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No more profiles
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Check back later for new matches!
      </Text>
      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: theme.colors.love }]}
        onPress={() => {
          setCurrentIndex(0);
          setProfiles(mockProfiles);
        }}
      >
        <Icon name="refresh" size={20} color="#fff" />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (currentIndex >= profiles.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="tune" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.love }]}>
          Discover
        </Text>
        
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="chat-bubble-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Cards Stack */}
      <View style={styles.cardsContainer}>
        {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => (
          <SwipeableCard
            key={profile.id}
            profile={profile}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeUp={handleSwipeUp}
            isTopCard={index === 0}
            index={index}
            theme={theme}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={[
        styles.actionButtons,
        {
          paddingBottom: Math.max(insets.bottom + 20, 30),
          marginBottom: Platform.OS === 'ios' ? 0 : 10,
        }
      ]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleButtonAction('pass')}
          activeOpacity={0.8}
        >
          <Icon name="close" size={28} color="#ff4444" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => handleButtonAction('superlike')}
          activeOpacity={0.8}
        >
          <Icon name="star" size={24} color="#4FC3F7" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleButtonAction('like')}
          activeOpacity={0.8}
        >
          <Icon name="favorite" size={28} color={theme.colors.love} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  photoContainer: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoNavLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
  },
  photoNavRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
  },
  photoIndicators: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  photoIndicator: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 40,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  onlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
  },
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  likeOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  passOverlay: {
    backgroundColor: 'rgba(255, 68, 68, 0.8)',
  },
  superLikeOverlay: {
    backgroundColor: 'rgba(79, 195, 247, 0.8)',
  },
  swipeText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  infoContainer: {
    padding: 16,
    minHeight: 110,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
  },
  distance: {
    fontSize: 14,
    fontWeight: '500',
  },
  bio: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  interests: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreInterests: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Math.max(screenWidth * 0.1, 40),
    paddingTop: 10,
    gap: Math.max(screenWidth * 0.05, 20),
    // Ensure buttons are always visible on all screen sizes
    minHeight: 80,
    position: 'relative',
    zIndex: 100,
  },
  actionButton: {
    width: Math.max(screenWidth * 0.15, 56),
    height: Math.max(screenWidth * 0.15, 56),
    borderRadius: Math.max(screenWidth * 0.075, 28),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Add backdrop for better visibility
    backgroundColor: '#fff',
  },
  passButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  superLikeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4FC3F7',
  },
  likeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  refreshText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DiscoveryScreen;
