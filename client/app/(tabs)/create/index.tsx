import { View, ScrollView, StyleSheet } from 'react-native';
import { RadioButton, Text, TextInput, Button, SegmentedButtons, Menu } from 'react-native-paper';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

const commonEvents = [
  { label: 'Birthday', value: 'birthday' },
  { label: 'Wedding', value: 'wedding' },
  { label: 'Graduation', value: 'graduation' },
  { label: 'Christmas', value: 'christmas' },
  { label: 'Other', value: 'other' },
];

export default function CreateWishScreen() {
  const [type, setType] = useState('wish');
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customEvent, setCustomEvent] = useState('');
  const [wishName, setWishName] = useState('');
  const [wishLink, setWishLink] = useState('');
  const [wishNotes, setWishNotes] = useState('');

  const handleCreate = () => {
    // Handle creation logic here
    console.log('Creating:', type === 'wish' ? 'Wish' : 'Event');
  };

  return (
    <ScrollView style={styles.container}>
      <SegmentedButtons
        value={type}
        onValueChange={setType}
        buttons={[
          { value: 'wish', label: 'New Wish' },
          { value: 'event', label: 'New Event' },
        ]}
        style={styles.segmentedButton}
      />

      {type === 'event' ? (
        // Event Form
        <View style={styles.formContainer}>
          <Text style={styles.label}>Event Type</Text>
          <RadioButton.Group 
            onValueChange={value => setEventType(value)} 
            value={eventType}
          >
            {commonEvents.map((event) => (
              <RadioButton.Item
                key={event.value}
                label={event.label}
                value={event.value}
                style={styles.radioItem}
              />
            ))}
          </RadioButton.Group>

          {eventType === 'other' && (
            <TextInput
              label="Custom Event Name"
              value={customEvent}
              onChangeText={setCustomEvent}
              style={styles.input}
            />
          )}

          <Button 
            mode="outlined" 
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            Select Date: {date.toLocaleDateString()}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>
      ) : (
        // Wish Form
        <View style={styles.formContainer}>
          <TextInput
            label="Wish Name"
            value={wishName}
            onChangeText={setWishName}
            style={styles.input}
          />

          <TextInput
            label="Product Link (Optional)"
            value={wishLink}
            onChangeText={setWishLink}
            style={styles.input}
          />

          <TextInput
            label="Notes"
            value={wishNotes}
            onChangeText={setWishNotes}
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <Button 
            mode="outlined" 
            icon="camera"
            onPress={() => {/* Handle image upload */}}
            style={styles.uploadButton}
          >
            Upload Image
          </Button>
        </View>
      )}

      <Button 
        mode="contained" 
        onPress={handleCreate}
        style={styles.createButton}
      >
        Create {type === 'wish' ? 'Wish' : 'Event'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  segmentedButton: {
    marginBottom: 20,
  },
  formContainer: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  radioItem: {
    paddingVertical: 4,
  },
  dateButton: {
    marginVertical: 8,
  },
  uploadButton: {
    marginVertical: 8,
  },
  createButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});