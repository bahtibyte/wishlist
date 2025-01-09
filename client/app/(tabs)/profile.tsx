import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Avatar, Button } from 'react-native-paper';
import { useAuth } from '../../context/auth';

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
  const { signOut } = useAuth();

  const screenWidth = Dimensions.get('window').width;
  const imageSize = (screenWidth - 48) / 2; // 2 columns with padding

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
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
        <Button
          mode="outlined"
          onPress={() => { }}
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
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 15,
  },
  statItem: {
    marginHorizontal: 20,
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