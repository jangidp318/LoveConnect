// Search Screen
// Advanced search and filtering for user discovery

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Switch,
  Slider,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';

interface SearchFilters {
  ageRange: [number, number];
  distance: number;
  interests: string[];
  relationshipGoals: string[];
  education: string[];
  occupation: string[];
  height: [number, number];
  smoking: string[];
  drinking: string[];
  children: string[];
  pets: string[];
  location: string;
  isOnline: boolean;
  hasPhotos: boolean;
  isVerified: boolean;
  sortBy: 'distance' | 'age' | 'activity' | 'compatibility';
}

interface SearchScreenProps {
  navigation: any;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  
  const [filters, setFilters] = useState<SearchFilters>({
    ageRange: [18, 35],
    distance: 50,
    interests: [],
    relationshipGoals: [],
    education: [],
    occupation: [],
    height: [150, 200],
    smoking: [],
    drinking: [],
    children: [],
    pets: [],
    location: '',
    isOnline: false,
    hasPhotos: true,
    isVerified: false,
    sortBy: 'distance',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Available filter options
  const interestOptions = [
    'Music', 'Travel', 'Sports', 'Movies', 'Reading', 'Cooking', 'Art', 'Photography',
    'Dancing', 'Hiking', 'Gaming', 'Fitness', 'Fashion', 'Technology', 'Food', 'Nature'
  ];

  const relationshipGoalOptions = [
    'Long-term relationship', 'Something casual', 'New friends', 'Not sure yet'
  ];

  const educationOptions = [
    'High School', 'Some College', 'Bachelor\'s', 'Master\'s', 'PhD', 'Trade School'
  ];

  const occupationOptions = [
    'Student', 'Professional', 'Healthcare', 'Education', 'Technology', 'Business',
    'Creative', 'Service Industry', 'Government', 'Retired', 'Other'
  ];

  const lifestyleOptions = {
    smoking: ['Never', 'Socially', 'Regularly', 'Trying to quit'],
    drinking: ['Never', 'Socially', 'Regularly', 'Sober'],
    children: ['Don\'t have', 'Have kids', 'Want someday', 'Don\'t want'],
    pets: ['No pets', 'Dog lover', 'Cat lover', 'Other pets'],
  };

  const sortOptions = [
    { value: 'distance', label: 'Distance' },
    { value: 'age', label: 'Age' },
    { value: 'activity', label: 'Recently Active' },
    { value: 'compatibility', label: 'Compatibility' },
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterToggle = (key: keyof SearchFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterChange(key, newArray);
  };

  const resetFilters = () => {
    setFilters({
      ageRange: [18, 35],
      distance: 50,
      interests: [],
      relationshipGoals: [],
      education: [],
      occupation: [],
      height: [150, 200],
      smoking: [],
      drinking: [],
      children: [],
      pets: [],
      location: '',
      isOnline: false,
      hasPhotos: true,
      isVerified: false,
      sortBy: 'distance',
    });
  };

  const applySearch = () => {
    // This would trigger the search with current filters
    console.log('Applying search with filters:', filters);
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    headerTitle: {
      fontSize: theme.typography.h2,
      fontWeight: '700',
      color: theme.colors.text,
    },
    headerButton: {
      padding: theme.spacing.xs,
    },
    headerButtonText: {
      fontSize: theme.typography.body,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.cardSecondary,
      borderRadius: 25,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      margin: theme.spacing.md,
    },
    searchInput: {
      flex: 1,
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },
    section: {
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.h3,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    rangeSlider: {
      marginVertical: theme.spacing.sm,
    },
    rangeLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    rangeText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.sm,
    },
    chip: {
      backgroundColor: theme.colors.cardSecondary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 20,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    chipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipText: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    chipTextSelected: {
      color: 'white',
      fontWeight: '600',
    },
    advancedToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.cardSecondary,
      marginBottom: theme.spacing.md,
    },
    advancedToggleText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginLeft: theme.spacing.xs,
    },
    applyButton: {
      backgroundColor: theme.colors.love,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      shadowColor: theme.colors.love,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    applyButtonText: {
      color: 'white',
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
    sortContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.sm,
    },
    sortOption: {
      backgroundColor: theme.colors.cardSecondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    sortOptionSelected: {
      backgroundColor: theme.colors.primary,
    },
    sortOptionText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
    },
    sortOptionTextSelected: {
      color: 'white',
      fontWeight: '600',
    },
  });

  const renderChipGroup = (
    options: string[],
    selectedValues: string[],
    onToggle: (value: string) => void
  ) => (
    <View style={styles.chipContainer}>
      {options.map(option => {
        const isSelected = selectedValues.includes(option);
        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onToggle(option)}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search & Filters</Text>
        <TouchableOpacity style={styles.headerButton} onPress={resetFilters}>
          <Text style={styles.headerButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, interests, or location..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Basic Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Filters</Text>
          
          {/* Age Range */}
          <View style={styles.rangeSlider}>
            <View style={styles.rangeLabel}>
              <Text style={styles.rangeText}>Age</Text>
              <Text style={styles.rangeText}>
                {filters.ageRange[0]} - {filters.ageRange[1]} years
              </Text>
            </View>
            {/* Note: Slider would need react-native-slider or similar */}
            <View style={{ height: 20, backgroundColor: theme.colors.cardSecondary, borderRadius: 10 }} />
          </View>

          {/* Distance */}
          <View style={styles.rangeSlider}>
            <View style={styles.rangeLabel}>
              <Text style={styles.rangeText}>Distance</Text>
              <Text style={styles.rangeText}>{filters.distance} km</Text>
            </View>
            <View style={{ height: 20, backgroundColor: theme.colors.cardSecondary, borderRadius: 10 }} />
          </View>

          {/* Quick Toggles */}
          <View style={styles.row}>
            <Text style={styles.rangeText}>Online now</Text>
            <Switch
              value={filters.isOnline}
              onValueChange={(value) => handleFilterChange('isOnline', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rangeText}>Has photos</Text>
            <Switch
              value={filters.hasPhotos}
              onValueChange={(value) => handleFilterChange('hasPhotos', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rangeText}>Verified profiles only</Text>
            <Switch
              value={filters.isVerified}
              onValueChange={(value) => handleFilterChange('isVerified', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          {renderChipGroup(
            interestOptions,
            filters.interests,
            (interest) => handleArrayFilterToggle('interests', interest)
          )}
        </View>

        {/* Sort By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <View style={styles.sortContainer}>
            {sortOptions.map(option => {
              const isSelected = filters.sortBy === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.sortOption, isSelected && styles.sortOptionSelected]}
                  onPress={() => handleFilterChange('sortBy', option.value)}
                >
                  <Text style={[styles.sortOptionText, isSelected && styles.sortOptionTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Advanced Filters Toggle */}
        <TouchableOpacity 
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Icon 
            name={showAdvanced ? 'expand-less' : 'expand-more'} 
            size={20} 
            color={theme.colors.text} 
          />
          <Text style={styles.advancedToggleText}>Advanced Filters</Text>
        </TouchableOpacity>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            {/* Relationship Goals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Looking For</Text>
              {renderChipGroup(
                relationshipGoalOptions,
                filters.relationshipGoals,
                (goal) => handleArrayFilterToggle('relationshipGoals', goal)
              )}
            </View>

            {/* Education */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {renderChipGroup(
                educationOptions,
                filters.education,
                (edu) => handleArrayFilterToggle('education', edu)
              )}
            </View>

            {/* Lifestyle */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Smoking</Text>
              {renderChipGroup(
                lifestyleOptions.smoking,
                filters.smoking,
                (smoking) => handleArrayFilterToggle('smoking', smoking)
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Drinking</Text>
              {renderChipGroup(
                lifestyleOptions.drinking,
                filters.drinking,
                (drinking) => handleArrayFilterToggle('drinking', drinking)
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Children</Text>
              {renderChipGroup(
                lifestyleOptions.children,
                filters.children,
                (children) => handleArrayFilterToggle('children', children)
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Apply Button */}
      <TouchableOpacity style={styles.applyButton} onPress={applySearch}>
        <Text style={styles.applyButtonText}>Apply Filters</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SearchScreen;
