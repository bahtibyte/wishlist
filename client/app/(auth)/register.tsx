import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/context/auth';

export default function CreateProfileScreen() {
  const [errorMessage, setErrorMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { signUp } = useAuth();

  const handleCreate = async () => {
    try {
      await signUp(email, username, password);
      // User needs to verify email, redirect to verification screen.
      router.push({
        pathname: '/(auth)/verification',
        params: { username }
      });
    } catch (error: any) {
      setErrorMessage(error.message);
      setVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCorrect={false}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleCreate}
        style={styles.button}
      >
        Create Profile
      </Button>
      <Button
        mode="outlined"
        onPress={() => router.back()}
        style={styles.button}
      >
        Back
      </Button>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setVisible(false),
        }}
      >
        {errorMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginVertical: 8,
  },
});