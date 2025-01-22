import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, Menu } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation, useQuery } from '@apollo/client';
import { GET_EVENT, UPDATE_EVENT, DELETE_EVENT } from '@/graphql/events';
import { useAppData } from '@/context/app';
import { parseEventResponse } from '@/graphql/parser';

const pastelColors = [
  { label: 'Pink', value: '#FFD1DC' },
  { label: 'Blue', value: '#ADD8E6' },
  { label: 'Green', value: '#98FF98' },
  { label: 'Yellow', value: '#FFFACD' },
  { label: 'Purple', value: '#E6E6FA' },
  { label: 'Orange', value: '#FFE5B4' },
];

export default function EventScreenImpl() {
  const { id } = useLocalSearchParams();
  const { events, setEvents } = useAppData();
  const event = events.find(e => e.id === parseInt(id as string));
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);

  // Form state
  const [eventType, setEventType] = useState(event?.event_type || '');
  const [eventDate, setEventDate] = useState(new Date(event?.event_date || Date.now()));
  const [selectedColor, setSelectedColor] = useState(event?.color || pastelColors[0].value);

  console.log("event details", event);
  console.log("event type", eventType);

  const [updateEvent] = useMutation(UPDATE_EVENT);
  const [deleteEvent] = useMutation(DELETE_EVENT);

  const handleSave = async () => {
    try {
      const response = await updateEvent({
        variables: {
          id,
          input: {
            event_type: eventType,
            event_date: eventDate.toISOString(),
            color: selectedColor,
          },
        },
      });
      const updatedEvent = parseEventResponse(response.data.updateEvent);
      setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent({ variables: { id } });
      setEvents(events.filter(e => e.id !== parseInt(id as string)));
      router.back();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  if (!event) return <Text>Event not found</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Event Details</Text>
        <Button
          mode="contained"
          onPress={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <>
            <TextInput
              label="Event Type"
              value={eventType}
              onChangeText={setEventType}
              style={styles.input}
            />

            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              Select Date: {eventDate.toLocaleDateString()}
            </Button>

            {showDatePicker && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setEventDate(selectedDate);
                }}
              />
            )}

            <Menu
              visible={showColorMenu}
              onDismiss={() => setShowColorMenu(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setShowColorMenu(true)}
                  style={[styles.colorButton, { borderColor: selectedColor }]}
                >
                  Select Color
                </Button>
              }
            >
              {pastelColors.map((color) => (
                <Menu.Item
                  key={color.value}
                  onPress={() => {
                    setSelectedColor(color.value);
                    setShowColorMenu(false);
                  }}
                  title={color.label}
                  style={[styles.menuItem, { backgroundColor: color.value }]}
                />
              ))}
            </Menu>

            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveButton}
              >
                Save
              </Button>
              <Button
                mode="contained"
                onPress={handleDelete}
                buttonColor="red"
              >
                Delete
              </Button>
            </View>
          </>
        ) : (
          <>
            <View style={styles.field}>
              <Text variant="labelLarge">Event Type</Text>
              <Text variant="bodyLarge">{eventType}</Text>
            </View>

            <View style={styles.field}>
              <Text variant="labelLarge">Date</Text>
              <Text variant="bodyLarge">{eventDate.toLocaleDateString()}</Text>
            </View>

            <View style={styles.field}>
              <Text variant="labelLarge">Color</Text>
              <View style={[styles.colorPreview, getColorStyle(selectedColor)]} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const getColorStyle = (color: string) => ({
  backgroundColor: color,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  content: {
    gap: 16,
  },
  field: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  dateButton: {
    marginVertical: 8,
  },
  colorButton: {
    marginVertical: 8,
    borderWidth: 2,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  saveButton: {
    flex: 1,
    marginRight: 12,
  },
  menuItem: {
    padding: 8,
  },
});