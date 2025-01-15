import { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { manipulateAsync, SaveFormat, ImageResult } from 'expo-image-manipulator'
import { User } from '@/graphql/types';
import { useAppData } from '@/context/app';
import { updateProfile } from '@/utils/api';

const IMAGE_SIZE = 300;
const RESIZE_OPTIONS = { width: IMAGE_SIZE, height: IMAGE_SIZE }
const RESIZE_ACTION = [{ resize: RESIZE_OPTIONS }]
const FORMAT = { format: SaveFormat.JPEG }

export default function EditProfileScreen() {
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<ImageResult | null>(null);
  const [name, setName] = useState<string>('');

  const { setUser } = useAppData();

  const pickImage = async () => {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(await manipulateAsync(uri, RESIZE_ACTION, FORMAT));
    }
  };

  const handleSave = async () => {
    if (!image && name === '') return;

    const formData = new FormData();
    if (name !== '') {
      console.log("including name", name);
      formData.append('profile_name', name);
    }
    if (image) {
      formData.append('image', {
        uri: image.uri,
        type: 'image/jpg',
        name: 'profile-image.jpg'
      } as any);
    }

    try {
      const response = await updateProfile(formData);
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUser(data.user as User);

      router.back();
    } catch (error: any) {
      setName('');
      setImage(null);
      setError(error.message);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image ? image.uri : image }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>👤</Text>
            <Text>Tap to change photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        label="Name"
        value={name}
        onChangeText={(text) => {
          setError(null);
          setName(text);
        }}
        style={styles.input}
        mode="outlined"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.button}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          disabled={!image && name === ''}
        >
          Save
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  input: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
});
