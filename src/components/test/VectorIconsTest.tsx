import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import Foundation from 'react-native-vector-icons/Foundation';
import Octicons from 'react-native-vector-icons/Octicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Zocial from 'react-native-vector-icons/Zocial';
import { useTheme } from '../../store/themeStore';

interface IconTestRowProps {
  title: string;
  children: React.ReactNode;
}

const IconTestRow: React.FC<IconTestRowProps> = ({ title, children }) => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.iconsContainer}>
        {children}
      </View>
    </View>
  );
};

const VectorIconsTest: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text }]}>
        Vector Icons Test
      </Text>
      
      <IconTestRow title="Material Icons">
        <MaterialIcons name="home" size={30} color={theme.colors.primary} />
        <MaterialIcons name="person" size={30} color={theme.colors.primary} />
        <MaterialIcons name="settings" size={30} color={theme.colors.primary} />
        <MaterialIcons name="favorite" size={30} color={theme.colors.love} />
      </IconTestRow>
      
      <IconTestRow title="Material Community Icons">
        <MaterialCommunityIcons name="heart" size={30} color={theme.colors.love} />
        <MaterialCommunityIcons name="message" size={30} color={theme.colors.primary} />
        <MaterialCommunityIcons name="phone" size={30} color={theme.colors.primary} />
        <MaterialCommunityIcons name="microphone" size={30} color={theme.colors.primary} />
      </IconTestRow>
      
      <IconTestRow title="FontAwesome">
        <FontAwesome name="user" size={30} color={theme.colors.primary} />
        <FontAwesome name="star" size={30} color={theme.colors.primary} />
        <FontAwesome name="heart" size={30} color={theme.colors.love} />
        <FontAwesome name="comment" size={30} color={theme.colors.primary} />
      </IconTestRow>
      
      <IconTestRow title="Ionicons">
        <Ionicons name="home" size={30} color={theme.colors.primary} />
        <Ionicons name="person" size={30} color={theme.colors.primary} />
        <Ionicons name="settings" size={30} color={theme.colors.primary} />
        <Ionicons name="heart" size={30} color={theme.colors.love} />
      </IconTestRow>
      
      <IconTestRow title="AntDesign">
        <AntDesign name="home" size={30} color={theme.colors.primary} />
        <AntDesign name="user" size={30} color={theme.colors.primary} />
        <AntDesign name="setting" size={30} color={theme.colors.primary} />
        <AntDesign name="heart" size={30} color={theme.colors.love} />
      </IconTestRow>
      
      <IconTestRow title="Entypo">
        <Entypo name="home" size={30} color={theme.colors.primary} />
        <Entypo name="user" size={30} color={theme.colors.primary} />
        <Entypo name="cog" size={30} color={theme.colors.primary} />
        <Entypo name="heart" size={30} color={theme.colors.love} />
      </IconTestRow>
      
      <IconTestRow title="EvilIcons">
        <EvilIcons name="user" size={30} color={theme.colors.primary} />
        <EvilIcons name="heart" size={30} color={theme.colors.love} />
        <EvilIcons name="comment" size={30} color={theme.colors.primary} />
        <EvilIcons name="gear" size={30} color={theme.colors.primary} />
      </IconTestRow>
      
      <IconTestRow title="Feather">
        <Feather name="home" size={30} color={theme.colors.primary} />
        <Feather name="user" size={30} color={theme.colors.primary} />
        <Feather name="settings" size={30} color={theme.colors.primary} />
        <Feather name="heart" size={30} color={theme.colors.love} />
      </IconTestRow>
      
      <IconTestRow title="Foundation">
        <Foundation name="home" size={30} color={theme.colors.primary} />
        <Foundation name="torso" size={30} color={theme.colors.primary} />
        <Foundation name="heart" size={30} color={theme.colors.love} />
        <Foundation name="comment" size={30} color={theme.colors.primary} />
      </IconTestRow>
      
      <IconTestRow title="Octicons">
        <Octicons name="home" size={30} color={theme.colors.primary} />
        <Octicons name="person" size={30} color={theme.colors.primary} />
        <Octicons name="gear" size={30} color={theme.colors.primary} />
        <Octicons name="heart" size={30} color={theme.colors.love} />
      </IconTestRow>
      
      <IconTestRow title="SimpleLineIcons">
        <SimpleLineIcons name="home" size={30} color={theme.colors.primary} />
        <SimpleLineIcons name="user" size={30} color={theme.colors.primary} />
        <SimpleLineIcons name="settings" size={30} color={theme.colors.primary} />
        <SimpleLineIcons name="heart" size={30} color={theme.colors.love} />
      </IconTestRow>
      
      <IconTestRow title="Zocial">
        <Zocial name="facebook" size={30} color={theme.colors.primary} />
        <Zocial name="twitter" size={30} color={theme.colors.primary} />
        <Zocial name="instagram" size={30} color={theme.colors.primary} />
        <Zocial name="github" size={30} color={theme.colors.primary} />
      </IconTestRow>
      
      <Text style={[styles.footer, { color: theme.colors.textSecondary }]}>
        If all icons above are visible, Vector Icons integration is working correctly!
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  row: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default VectorIconsTest;
