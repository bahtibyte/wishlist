import { View, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import { Text, Avatar, List } from 'react-native-paper';

// Dummy data for chat groups
const chatGroups = [
  {
    id: '1',
    title: 'Family Group',
    lastMessage: 'Mom: Are you coming for dinner tonight?',
    avatar: '👨‍👩‍👧‍👦',
    time: '5m',
  },
  {
    id: '2',
    title: 'Work Team',
    lastMessage: 'Sarah: Updated the project timeline...',
    avatar: '💼',
    time: '15m',
  },
  {
    id: '3',
    title: 'Gaming Squad',
    lastMessage: 'Mike: Anyone up for Fortnite?',
    avatar: '🎮',
    time: '1h',
  },
  {
    id: '4',
    title: 'Book Club',
    lastMessage: 'Emma: What did everyone think of chapter 5?',
    avatar: '📚',
    time: '2h',
  },
  {
    id: '5',
    title: 'Gym Buddies',
    lastMessage: 'John: Morning workout tomorrow at 7?',
    avatar: '💪',
    time: '3h',
  },
  {
    id: '6',
    title: 'Travel Planning',
    lastMessage: 'Lisa: I found some great flight deals!',
    avatar: '✈️',
    time: '5h',
  },
  {
    id: '7',
    title: 'Cooking Club',
    lastMessage: 'David: Here\'s my grandma\'s recipe...',
    avatar: '👨‍🍳',
    time: '1d',
  },
  {
    id: '8',
    title: 'Photography',
    lastMessage: 'Alex: Check out these sunset shots!',
    avatar: '📸',
    time: '1d',
  },
  {
    id: '9',
    title: 'Movie Night',
    lastMessage: 'Rachel: How about Saturday at 8?',
    avatar: '🎬',
    time: '2d',
  },
  {
    id: '10',
    title: 'Hiking Group',
    lastMessage: 'Tom: Weather looks perfect for Sunday',
    avatar: '🏔️',
    time: '2d',
  },
];

export default function MessagesScreen() {
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={{ height: screenHeight - 80 }}>
      <ScrollView style={styles.container}>
        {chatGroups.map((chat) => (
          <List.Item
            key={chat.id}
            title={chat.title}
            description={chat.lastMessage}
            left={() => (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>{chat.avatar}</Text>
              </View>
            )}
            right={() => (
              <Text style={styles.time}>{chat.time}</Text>
            )}
            style={styles.chatItem}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatar: {
    fontSize: 24,
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
