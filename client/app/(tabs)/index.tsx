import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';

// Dummy data for feed items
const feedItems = [
  {
    id: '1',
    event: 'Birthday',
    daysAway: 5,
    user: {
      name: 'Sarah Johnson',
      avatar: '👩',
    },
    wishes: [
      { id: '1', emoji: '📱' },
      { id: '2', emoji: '💻' },
      { id: '3', emoji: '🎮' },
      { id: '4', emoji: '🎧' },
    ],
    color: '#FFB5E8',
  },
  {
    id: '2',
    event: 'Wedding',
    daysAway: 12,
    user: {
      name: 'Mike Chen',
      avatar: '👨',
    },
    wishes: [
      { id: '1', emoji: '🏠' },
      { id: '2', emoji: '✈️' },
      { id: '3', emoji: '🍷' },
      { id: '4', emoji: '🎁' },
    ],
    color: '#B5EAEA',
  },
  {
    id: '3',
    event: 'Graduation',
    daysAway: 15,
    user: {
      name: 'Emma Wilson',
      avatar: '👱‍♀️',
    },
    wishes: [
      { id: '1', emoji: '📚' },
      { id: '2', emoji: '💼' },
      { id: '3', emoji: '⌚️' },
      { id: '4', emoji: '🎓' },
    ],
    color: '#E7FFAC',
  },
  {
    id: '4',
    event: 'Christmas',
    daysAway: 25,
    user: {
      name: 'John Smith',
      avatar: '🧔',
    },
    wishes: [
      { id: '1', emoji: '🎄' },
      { id: '2', emoji: '🎁' },
      { id: '3', emoji: '🧥' },
      { id: '4', emoji: '⌚️' },
    ],
    color: '#FFC9DE',
  },
];

export default function HomeFeedScreen() {
  return (
    <ScrollView style={styles.container}>
      {feedItems.map((item) => (
        <View key={item.id} style={styles.feedItem}>
          {/* Event Banner */}
          <View style={[styles.banner, { backgroundColor: item.color }]}>
            <Text style={styles.bannerText}>
              Upcoming {item.event} in {item.daysAway} days
            </Text>
          </View>

          {/* User Info and Wishes */}
          <View style={styles.contentContainer}>
            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.avatar}>{item.user.avatar}</Text>
              <Text style={styles.userName}>{item.user.name}</Text>
            </View>

            {/* Wishes ScrollView */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.wishesContainer}
            >
              {item.wishes.map((wish) => (
                <View key={wish.id} style={styles.wishItem}>
                  <Text style={styles.wishEmoji}>{wish.emoji}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  feedItem: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  banner: {
    padding: 12,
    width: '100%',
  },
  bannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 24,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  wishesContainer: {
    marginLeft: 32, // Indent to align with username
  },
  wishItem: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishEmoji: {
    fontSize: 32,
  },
});