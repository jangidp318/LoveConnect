import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import { useNavigation } from '@react-navigation/native';

interface Match {
  id: string;
  userId: string;
  name: string;
  age: number;
  photos: string[];
  lastMessage?: string;
  matchedAt: Date;
  isNewMatch: boolean;
  isOnline: boolean;
  unreadCount?: number;
}

const MatchesScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [matches, setMatches] = useState<Match[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock matches data
  const mockMatches: Match[] = [
    {
      id: '1',
      userId: '101',
      name: 'Emma',
      age: 25,
      photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'],
      lastMessage: 'Hey there! Thanks for the super like! 😊',
      matchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isNewMatch: true,
      isOnline: true,
      unreadCount: 2,
    },
    {
      id: '2',
      userId: '102',
      name: 'Sophia',
      age: 28,
      photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'],
      lastMessage: 'Would love to grab coffee sometime!',
      matchedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isNewMatch: false,
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: '3',
      userId: '103',
      name: 'Isabella',
      age: 24,
      photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'],
      matchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isNewMatch: false,
      isOnline: true,
    },
    {
      id: '4',
      userId: '104',
      name: 'Olivia',
      age: 26,
      photos: ['https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=400&fit=crop&crop=face'],
      lastMessage: 'Looking forward to our date! 🌟',
      matchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isNewMatch: false,
      isOnline: false,
      unreadCount: 1,
    },
    {
      id: '5',
      userId: '105',
      name: 'Ava',
      age: 27,
      photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face'],
      lastMessage: 'Your hiking photos are amazing!',
      matchedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      isNewMatch: false,
      isOnline: true,
    },
  ];

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = () => {
    // Simulate API call
    setTimeout(() => {
      setMatches(mockMatches);
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  const formatMatchTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleMatchPress = (match: Match) => {
    // Navigate to chat room
    navigation.navigate('ChatRoom' as never, {
      chatId: `match_${match.id}`,
      recipientId: match.userId,
      recipientName: match.name,
      recipientAvatar: match.photos[0],
    } as never);
  };

  const handleUnmatch = (match: Match) => {
    Alert.alert(
      'Unmatch',
      `Are you sure you want to unmatch with ${match.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: () => {
            setMatches(prev => prev.filter(m => m.id !== match.id));
            Alert.alert('Unmatched', `You have unmatched with ${match.name}`);
          },
        },
      ]
    );
  };

  const renderNewMatches = () => {
    const newMatches = matches.filter(match => match.isNewMatch);
    
    if (newMatches.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            New Matches
          </Text>
          <View style={styles.newMatchesBadge}>
            <Text style={styles.newMatchesCount}>{newMatches.length}</Text>
          </View>
        </View>
        
        <FlatList
          horizontal
          data={newMatches}
          keyExtractor={(item) => `new_${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.newMatchItem}
              onPress={() => handleMatchPress(item)}
            >
              <View style={styles.newMatchImageContainer}>
                <Image source={{ uri: item.photos[0] }} style={styles.newMatchImage} />
                {item.isOnline && <View style={styles.onlineIndicator} />}
                <View style={styles.newMatchOverlay}>
                  <Icon name="favorite" size={20} color="#fff" />
                </View>
              </View>
              <Text style={[styles.newMatchName, { color: theme.colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newMatchesList}
        />
      </View>
    );
  };

  const renderMatchItem = ({ item: match }: { item: Match }) => (
    <TouchableOpacity
      style={[styles.matchItem, { backgroundColor: theme.colors.card }]}
      onPress={() => handleMatchPress(match)}
      onLongPress={() => handleUnmatch(match)}
    >
      <View style={styles.matchImageContainer}>
        <Image source={{ uri: match.photos[0] }} style={styles.matchImage} />
        {match.isOnline && <View style={styles.matchOnlineIndicator} />}
        {match.unreadCount && match.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{match.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.matchInfo}>
        <View style={styles.matchHeader}>
          <Text style={[styles.matchName, { color: theme.colors.text }]}>
            {match.name}
          </Text>
          <Text style={[styles.matchTime, { color: theme.colors.textSecondary }]}>
            {formatMatchTime(match.matchedAt)}
          </Text>
        </View>

        {match.lastMessage ? (
          <Text style={[styles.lastMessage, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {match.lastMessage}
          </Text>
        ) : (
          <Text style={[styles.noMessage, { color: theme.colors.textSecondary }]}>
            Start the conversation! Say hi 👋
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => handleMatchPress(match)}
      >
        <Icon name="chat-bubble-outline" size={20} color={theme.colors.love} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="favorite-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No matches yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Start swiping on the Discovery tab to find your perfect match!
      </Text>
    </View>
  );

  const allMatches = matches.filter(match => !match.isNewMatch);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Matches
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="filter-list" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {matches.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={allMatches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          ListHeaderComponent={renderNewMatches}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.love}
              colors={[theme.colors.love]}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerButton: {
    padding: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  newMatchesBadge: {
    backgroundColor: '#ff4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  newMatchesCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  newMatchesList: {
    paddingHorizontal: 15,
  },
  newMatchItem: {
    alignItems: 'center',
    marginHorizontal: 5,
    width: 80,
  },
  newMatchImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  newMatchImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
  },
  newMatchOverlay: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  newMatchName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  matchImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  matchImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchOnlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  matchInfo: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
  },
  matchTime: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  noMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  chatButton: {
    padding: 10,
    marginLeft: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MatchesScreen;
