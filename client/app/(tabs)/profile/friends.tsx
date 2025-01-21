import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import CachedImage from '@/utils/cached-image';

// Dummy friends data
const friends = [
  { id: '1', name: 'Sarah Johnson', icon: '' },
  { id: '2', name: 'Mike Peters', icon: '' },
  { id: '3', name: 'Emma Wilson', icon: '' },
  { id: '4', name: 'James Brown', icon: '' },
  { id: '5', name: 'Lisa Anderson', icon: '' },
];

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendRow}>
            <CachedImage source={item.icon} size={50} />
            <Text style={styles.friendName}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  friendRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendName: {
    marginLeft: 16,
    fontSize: 16,
  },
});
