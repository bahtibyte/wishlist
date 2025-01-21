import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Portal, Dialog, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAppData } from '@/context/app';
import { useAuth } from '../../../context/auth';
import CachedImage from '@/utils/cached-image';

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
  const [showDialog, setShowDialog] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const imageSize = (screenWidth - 48) / 2; // 2 columns with padding

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileTopRow}>
          <View style={styles.avatarContainer}>
            {user && <CachedImage source={user.icon} size={80} />}
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.profileName}>{user?.profile_name}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.stats.events ?? 0}</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.stats.wishes ?? 0}</Text>
                <Text style={styles.statLabel}>Wishes</Text>
              </View>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/profile/friends')}
              >
                <Text style={styles.statNumber}>{user?.stats.friends ?? 0}</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </TouchableOpacity>
              <IconButton
                icon="cog"
                size={24}
                onPress={() => setShowDialog(true)}
                style={styles.settingsButton}
              />
            </View>
          </View>
        </View>
        <Portal>
          <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
            <Dialog.Title>Settings</Dialog.Title>
            <Dialog.Content>
              <Button
                mode="text"
                onPress={() => {
                  setShowDialog(false);
                  router.push('/profile/edit');
                }}
                style={styles.dialogButton}
              >
                Edit Profile
              </Button>
              <Button
                mode="text"
                onPress={() => {
                  setShowDialog(false);
                  signOut();
                }}
                textColor="#ff4444"
                style={styles.dialogButton}
              >
                Sign Out
              </Button>
            </Dialog.Content>
          </Dialog>
        </Portal>
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
    justifyContent: 'flex-start',
    flex: 1,
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nameAndSettingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialogButton: {
    padding: 10,
  },
  settingsButton: {
    marginLeft: 'auto',
  },
});