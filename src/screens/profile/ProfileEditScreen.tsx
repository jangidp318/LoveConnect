import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActionSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import { useNavigation } from '@react-navigation/native';
import LoveButton from '../../components/buttons/LoveButton';
import LoveInput from '../../components/inputs/LoveInput';

const { width } = Dimensions.get('window');

interface ProfileData {
  name: string;
  age: string;
  bio: string;
  occupation: string;
  education: string;
  location: string;
  height: string;
  interests: string[];
  photos: string[];
  lookingFor: string;
  relationshipGoals: string;
}

const ProfileEditScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Profile data state
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Emma Johnson',
    age: '25',
    bio: 'Love hiking, yoga, and good coffee. Looking for someone who enjoys adventures and deep conversations ☕️',
    occupation: 'Software Designer',
    education: 'Stanford University',
    location: 'San Francisco, CA',
    height: '5\'6"',
    interests: ['Hiking', 'Yoga', 'Coffee', 'Travel', 'Reading', 'Photography', 'Cooking'],
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face',
    ],
    lookingFor: 'Serious Relationship',
    relationshipGoals: 'Looking for my life partner',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  
  const availableInterests = [
    'Travel', 'Photography', 'Music', 'Movies', 'Books', 'Fitness', 'Cooking',
    'Dancing', 'Art', 'Sports', 'Gaming', 'Nature', 'Fashion', 'Technology',
    'Wine', 'Dogs', 'Cats', 'Running', 'Swimming', 'Cycling', 'Beach',
    'Mountains', 'Food', 'Comedy', 'Museums', 'Concerts', 'Festivals'
  ];
  
  const relationshipOptions = [
    'Casual Dating',
    'Serious Relationship',
    'Marriage',
    'Friendship',
    'Networking',
    'Something Casual',
    'Long-term Partnership'
  ];
  
  const handleSave = () => {
    // Validate required fields
    if (!profile.name.trim() || !profile.age.trim() || !profile.bio.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Age, Bio)');
      return;
    }
    
    // Here you would typically save to backend
    Alert.alert(
      'Profile Updated',
      'Your profile has been successfully updated!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };
  
  const handlePhotoAdd = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you\'d like to add a photo:',
      [
        {
          text: 'Camera',
          onPress: () => Alert.alert('Camera', 'Camera integration coming soon!'),
        },
        {
          text: 'Photo Library',
          onPress: () => Alert.alert('Photo Library', 'Photo library integration coming soon!'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };
  
  const handlePhotoDelete = (index: number) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newPhotos = [...profile.photos];
            newPhotos.splice(index, 1);
            setProfile(prev => ({ ...prev, photos: newPhotos }));
          },
        },
      ]
    );
  };
  
  const handleInterestAdd = (interest: string) => {
    if (!profile.interests.includes(interest)) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interest],
      }));
    }
  };
  
  const handleInterestRemove = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }));
  };
  
  const handleCustomInterestAdd = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest('');
    }
  };
  
  const renderPhoto = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.photoContainer}>
      <Image source={{ uri: item }} style={styles.photo} />
      <TouchableOpacity
        style={styles.deletePhotoButton}
        onPress={() => handlePhotoDelete(index)}
      >
        <Icon name="close" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
  
  const renderAddPhoto = () => (
    <TouchableOpacity style={styles.addPhotoButton} onPress={handlePhotoAdd}>
      <Icon name="add-a-photo" size={32} color={theme.colors.textSecondary} />
      <Text style={[styles.addPhotoText, { color: theme.colors.textSecondary }]}>
        Add Photo
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Edit Profile
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={[styles.saveText, { color: theme.colors.love }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Photos
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Add up to 6 photos. Your first photo will be your main profile picture.
          </Text>
          
          <FlatList
            horizontal
            data={[...profile.photos, 'add']}
            keyExtractor={(item, index) => item === 'add' ? 'add' : `photo-${index}`}
            renderItem={({ item, index }) => 
              item === 'add' ? renderAddPhoto() : renderPhoto({ item, index })
            }
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosList}
          />
        </View>
        
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Basic Information
          </Text>
          
          <LoveInput
            placeholder="Name"
            value={profile.name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
            maxLength={50}
            style={styles.input}
          />
          
          <LoveInput
            placeholder="Age"
            value={profile.age}
            onChangeText={(text) => setProfile(prev => ({ ...prev, age: text }))}
            keyboardType="numeric"
            maxLength={2}
            style={styles.input}
          />
          
          <LoveInput
            placeholder="Occupation"
            value={profile.occupation}
            onChangeText={(text) => setProfile(prev => ({ ...prev, occupation: text }))}
            maxLength={100}
            style={styles.input}
          />
          
          <LoveInput
            placeholder="Education"
            value={profile.education}
            onChangeText={(text) => setProfile(prev => ({ ...prev, education: text }))}
            maxLength={100}
            style={styles.input}
          />
          
          <LoveInput
            placeholder="Location"
            value={profile.location}
            onChangeText={(text) => setProfile(prev => ({ ...prev, location: text }))}
            maxLength={100}
            style={styles.input}
          />
          
          <LoveInput
            placeholder="Height"
            value={profile.height}
            onChangeText={(text) => setProfile(prev => ({ ...prev, height: text }))}
            maxLength={20}
            style={styles.input}
          />
        </View>
        
        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            About Me
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Write a bio that showcases your personality
          </Text>
          
          <View style={[styles.bioContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.bioInput, { color: theme.colors.text }]}
              placeholder="Tell others about yourself..."
              placeholderTextColor={theme.colors.textSecondary}
              value={profile.bio}
              onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
              {profile.bio.length}/500
            </Text>
          </View>
        </View>
        
        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Interests
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Add up to 10 interests to help others find common ground
          </Text>
          
          {/* Selected Interests */}
          <View style={styles.interestsContainer}>
            {profile.interests.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[styles.interestTag, styles.selectedInterest, { backgroundColor: theme.colors.love }]}
                onPress={() => handleInterestRemove(interest)}
              >
                <Text style={styles.interestText}>{interest}</Text>
                <Icon name="close" size={16} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Available Interests */}
          <View style={styles.interestsContainer}>
            {availableInterests
              .filter(interest => !profile.interests.includes(interest))
              .slice(0, 12)
              .map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[styles.interestTag, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => handleInterestAdd(interest)}
                >
                  <Text style={[styles.interestText, { color: theme.colors.text }]}>
                    {interest}
                  </Text>
                  <Icon name="add" size={16} color={theme.colors.text} />
                </TouchableOpacity>
              ))
            }
          </View>
          
          {/* Add Custom Interest */}
          <View style={styles.customInterestContainer}>
            <LoveInput
              placeholder="Add custom interest"
              value={newInterest}
              onChangeText={setNewInterest}
              maxLength={30}
              style={styles.customInterestInput}
              onSubmitEditing={handleCustomInterestAdd}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addInterestButton, { backgroundColor: theme.colors.love }]}
              onPress={handleCustomInterestAdd}
            >
              <Icon name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Relationship Goals */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            What are you looking for?
          </Text>
          
          <View style={styles.relationshipOptions}>
            {relationshipOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.relationshipOption,
                  {
                    backgroundColor: profile.lookingFor === option 
                      ? theme.colors.love + '20' 
                      : theme.colors.card,
                    borderColor: profile.lookingFor === option 
                      ? theme.colors.love 
                      : theme.colors.border,
                  },
                ]}
                onPress={() => setProfile(prev => ({ ...prev, lookingFor: option }))}
              >
                <Text
                  style={[
                    styles.relationshipOptionText,
                    {
                      color: profile.lookingFor === option 
                        ? theme.colors.love 
                        : theme.colors.text,
                    },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <LoveInput
            placeholder="Describe what you're looking for in more detail (optional)"
            value={profile.relationshipGoals}
            onChangeText={(text) => setProfile(prev => ({ ...prev, relationshipGoals: text }))}
            maxLength={200}
            multiline
            style={[styles.input, styles.relationshipGoalsInput]}
          />
        </View>
        
        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <LoveButton
            title="Save Changes"
            onPress={handleSave}
            style={styles.saveButtonLarge}
          />
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  photosList: {
    paddingRight: 20,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 100,
    height: 140,
    borderRadius: 12,
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addPhotoText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  bioContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  bioInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  selectedInterest: {
    borderColor: 'transparent',
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  customInterestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customInterestInput: {
    flex: 1,
    marginBottom: 0,
  },
  addInterestButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relationshipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  relationshipOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  relationshipOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  relationshipGoalsInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  saveButtonLarge: {
    paddingVertical: 16,
  },
});

export default ProfileEditScreen;
