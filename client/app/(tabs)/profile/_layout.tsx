import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerTitle: "Profile",
        }} 
      />
      <Stack.Screen 
        name="edit"
        options={{
          headerTitle: 'Edit Profile',
        }}
      />
    </Stack>
  );
} 