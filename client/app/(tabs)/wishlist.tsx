import { View, ScrollView, Image, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

// Dummy data
const wishlistItems = [
  {
    id: '1',
    title: 'Nintendo Switch OLED',
    description: 'Latest Nintendo gaming console with enhanced display',
    imageUrl: 'https://placehold.co/300x200',
  },
  {
    id: '2',
    title: 'MacBook Pro M2',
    description: 'Powerful laptop with Apple Silicon chip for professional work',
    imageUrl: 'https://placehold.co/300x200',
  },
  {
    id: '3',
    title: 'Sony WH-1000XM4',
    description: 'Premium noise-cancelling headphones with great sound quality',
    imageUrl: 'https://placehold.co/300x200',
  },
  {
    id: '4',
    title: 'iPad Air',
    description: 'Versatile tablet perfect for creativity and productivity',
    imageUrl: 'https://placehold.co/300x200',
  },
  {
    id: '5',
    title: 'DJI Mini 3 Pro',
    description: 'Compact drone with 4K camera and intelligent features',
    imageUrl: 'https://placehold.co/300x200',
  },
];

export default function WishlistScreen() {
  return (
    <ScrollView style={styles.container}>
      {wishlistItems.map((item) => (
        <Card key={item.id} style={styles.card}>
          <Card.Cover source={{ uri: item.imageUrl }} />
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodyMedium">
              {item.description}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    marginVertical: 8,
  },
});
