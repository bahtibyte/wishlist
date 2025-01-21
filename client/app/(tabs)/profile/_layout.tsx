import { Stack } from 'expo-router';
import { useAppData } from '@/context/app';
export default function ProfileLayout() {
  const {user} = useAppData();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerTitle: user ? user.username : "Profile",
        }} 
      />
      <Stack.Screen 
        name="edit"
        options={{
          headerTitle: 'Edit Profile',
        }}
      />
       <Stack.Screen 
        name="friends"
        options={{
          headerTitle: 'Friends',
        }}
      />
    </Stack>
  );
} 