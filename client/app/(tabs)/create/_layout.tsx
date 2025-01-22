import { Stack } from 'expo-router';
import { useAppData } from '@/context/app';

export default function CreateLayout() {
  const { user } = useAppData();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Create",
        }}
      />
      <Stack.Screen
        name="event/[id]"
        options={{
          headerTitle: "Event Details",
        }}
      />
    </Stack>
  );
}