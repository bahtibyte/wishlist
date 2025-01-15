import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Avatar, Button } from 'react-native-paper';
import { useAuth } from '../../../context/auth';
import { router } from 'expo-router';
import { useAppData } from '@/context/app';
import { useState, useEffect } from 'react';
import { saveImageLocally, getLocalImage } from '../../../utils/storage';

const events = [
  { id: '1', title: 'Birthday Party', daysAway: 5, color: '#FFB5E8' },
  { id: '2', title: 'Wedding', daysAway: 12, color: '#B5EAEA' },
  { id: '3', title: 'Graduation', daysAway: 25, color: '#E7FFAC' },
  { id: '4', title: 'Christmas', daysAway: 45, color: '#FFC9DE' },
];

const wishes = [
  { id: '1', emoji: '📱' },
  { id: '2', emoji: '💻' },
  { id: '3', emoji: '🎮' },
  { id: '4', emoji: '⌚️' },
  { id: '5', emoji: '🎧' },
  { id: '6', emoji: '📚' },
];

export default function ProfileScreen() {
  const { user } = useAppData();
  const { signOut } = useAuth();
  const [localIconUri, setLocalIconUri] = useState<string | null>(null);

  useEffect(() => {
    const loadLocalIcon = async () => {
      if (!user) return;

      try {
        // Check if we have the correct version stored locally
        let localUri = await getLocalImage(user.id, user.icon);

        // If not found locally or if the user's icon has changed, download it
        if (!localUri) {
          localUri = await saveImageLocally(user.icon, user.id);
        }

        setLocalIconUri(localUri);
      } catch (error) {
        console.error('Error loading local icon:', error);
        // Fallback to remote URL if local storage fails
        setLocalIconUri(user.icon);
      }
    };

    loadLocalIcon();
  }, [user?.id, user?.icon]);

  const screenWidth = Dimensions.get('window').width;
  const imageSize = (screenWidth - 48) / 2; // 2 columns with padding

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileTopRow}>
          <View style={styles.avatarContainer}>
            {localIconUri ? (
              <Avatar.Image size={80} source={{ uri: localIconUri }} />
            ) : (
              <Text style={styles.avatarEmoji}>👤</Text>
            )}
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.profileName}>{user?.profile_name}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>156</Text>
                <Text style={styles.statLabel}>Wishes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2.3k</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>
          </View>
        </View>
        <Button
          mode="outlined"
          onPress={() => router.push('/profile/edit')}
          style={styles.editButton}
        >
          Edit Profile
        </Button>
        <Button
          mode="outlined"
          onPress={signOut}
          style={[styles.editButton, styles.signOutButton]}
        >
          Sign Out
        </Button>
      </View>

      {/* Events Section */}
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.eventsContainer}
      >
        {events.map((event) => (
          <View
            key={event.id}
            style={[styles.eventCard, { backgroundColor: event.color }]}
          >
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDays}>{event.daysAway} days away</Text>
          </View>
        ))}
      </ScrollView>

      {/* Wishes Grid Section */}
      <Text style={styles.sectionTitle}>My Wishes</Text>
      <View style={styles.wishesGrid}>
        {wishes.map((wish) => (
          <TouchableOpacity
            key={wish.id}
            onPress={() => { }}
            style={[styles.wishItem, { width: imageSize, height: imageSize }]}
          >
            <Text style={styles.wishEmoji}>{wish.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
  },
  signOutButton: {
    borderColor: '#ff4444',
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    justifyContent: 'space-around',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  userInfoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 12,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    marginHorizontal: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
  },
  editButton: {
    marginTop: 10,
    width: 150,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
  },
  eventsContainer: {
    paddingLeft: 16,
    marginBottom: 20,
  },
  eventCard: {
    padding: 15,
    marginRight: 12,
    borderRadius: 12,
    width: 150,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  eventDays: {
    color: '#666',
  },
  wishesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  wishItem: {
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishEmoji: {
    fontSize: 40,
  },
});