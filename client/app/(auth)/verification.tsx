import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Snackbar } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth';

export default function VerificationScreen() {
  const [errorMessage, setErrorMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [code, setCode] = useState('');
  const { confirmSignUp, resendConfirmEmail } = useAuth();
  const router = useRouter();

  const params = useLocalSearchParams();
  const username = params.username as string;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    try {
      await resendConfirmEmail(username);
      setCountdown(30); // Reset countdown to 30 seconds
    } catch (error: any) {
      setErrorMessage(error.message);
      setVisible(true);
    }
  };

  const handleVerification = async () => {
    try {
      await confirmSignUp(username, code);
    } catch (error: any) {
      setErrorMessage(error.message);
      setVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.subtitle}>Please verify your email address</Text>

      <View style={styles.userInfo}>
        <Text style={styles.userInfo}>{username}</Text>
      </View>

      <TextInput
        label="Verification Code"
        value={code}
        onChangeText={(text) => {
          const value = text.replace(/[^0-9]/g, '');
          if (value.length <= 6) {
            setCode(value);
          }
        }}
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, alignItems: 'center' }}>
        <Text>Didn't receive code? </Text>
        <Button
          mode="text"
          compact
          onPress={handleResendEmail}
          disabled={countdown > 0}
        >
          Press here {countdown > 0 ? `(${countdown}s)` : ''}
        </Button>
      </View>

      <Button
        mode="contained"
        onPress={handleVerification}
        style={styles.button}
        disabled={code.length !== 6}
      >
        Verify Email
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
        duration={3000}
        action={{
          label: 'Close',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 24,
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginVertical: 8,
  },
});