import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock data for farm management
const mockCows = [
  { id: 'cow1', name: 'Bessie', sensorId: 'SEN001', location: 'North Pen', active: true },
  { id: 'cow2', name: 'Daisy', sensorId: 'SEN002', location: 'East Pen', active: true },
  { id: 'cow3', name: 'Buttercup', sensorId: 'SEN003', location: 'North Pen', active: true },
  { id: 'cow4', name: 'Clover', sensorId: 'SEN004', location: 'West Pen', active: true },
  { id: 'cow5', name: 'Milky', sensorId: 'SEN005', location: 'South Pen', active: true },
];

const mockLocations = [
  { id: 'loc1', name: 'North Pen', cowCount: 2, gpsZone: { lat: 34.0522, lng: -118.2437, radius: 50 } },
  { id: 'loc2', name: 'East Pen', cowCount: 1, gpsZone: { lat: 34.0523, lng: -118.2430, radius: 45 } },
  { id: 'loc3', name: 'West Pen', cowCount: 1, gpsZone: { lat: 34.0521, lng: -118.2445, radius: 40 } },
  { id: 'loc4', name: 'South Pen', cowCount: 1, gpsZone: { lat: 34.0518, lng: -118.2437, radius: 55 } },
];

const mockSensors = [
  { id: 'SEN001', type: 'Full Package', battery: 85, lastCalibration: '2023-09-15', status: 'active' },
  { id: 'SEN002', type: 'Full Package', battery: 72, lastCalibration: '2023-09-20', status: 'active' },
  { id: 'SEN003', type: 'Full Package', battery: 93, lastCalibration: '2023-09-10', status: 'active' },
  { id: 'SEN004', type: 'Full Package', battery: 45, lastCalibration: '2023-08-30', status: 'warning' },
  { id: 'SEN005', type: 'Full Package', battery: 67, lastCalibration: '2023-09-05', status: 'active' },
  { id: 'SEN006', type: 'Heart Rate Only', battery: 90, lastCalibration: '2023-09-25', status: 'inactive' },
];

// Cow list item component
const CowListItem = ({ cow, onEdit, onDelete }) => (
  <View style={styles.listItem}>
    <View style={styles.listItemContent}>
      <Text style={styles.listItemTitle}>{cow.name}</Text>
      <Text style={styles.listItemSubtitle}>Sensor: {cow.sensorId} • {cow.location}</Text>
    </View>
    <View style={styles.listItemActions}>
      <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(cow)}>
        <Ionicons name="pencil" size={18} color="#4dabf7" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(cow.id)}>
        <Ionicons name="trash" size={18} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  </View>
);

// Location list item component
const LocationListItem = ({ location, onEdit, onDelete }) => (
  <View style={styles.listItem}>
    <View style={styles.listItemContent}>
      <Text style={styles.listItemTitle}>{location.name}</Text>
      <Text style={styles.listItemSubtitle}>
        {location.cowCount} cows • GPS: {location.gpsZone.lat.toFixed(4)}, {location.gpsZone.lng.toFixed(4)}
      </Text>
    </View>
    <View style={styles.listItemActions}>
      <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(location)}>
        <Ionicons name="pencil" size={18} color="#4dabf7" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(location.id)}>
        <Ionicons name="trash" size={18} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  </View>
);

// Sensor list item component
const SensorListItem = ({ sensor, onEdit, onCalibrate }) => (
  <View style={styles.listItem}>
    <View style={styles.listItemContent}>
      <Text style={styles.listItemTitle}>{sensor.id}</Text>
      <Text style={styles.listItemSubtitle}>
        {sensor.type} • Battery: {sensor.battery}% • 
        Last calibrated: {new Date(sensor.lastCalibration).toLocaleDateString()}
      </Text>
    </View>
    <View style={styles.listItemActions}>
      <TouchableOpacity 
        style={[
          styles.statusIndicator, 
          { backgroundColor: sensor.status === 'active' ? '#51cf66' : 
                           sensor.status === 'warning' ? '#ffa94d' : '#adb5bd' }
        ]} 
      />
      <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(sensor)}>
        <Ionicons name="pencil" size={18} color="#4dabf7" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => onCalibrate(sensor.id)}>
        <Ionicons name="options" size={18} color="#4dabf7" />
      </TouchableOpacity>
    </View>
  </View>
);

// Add/Edit cow form component
const CowForm = ({ cow, onSave, onCancel }) => {
  const [name, setName] = useState(cow?.name || '');
  const [sensorId, setSensorId] = useState(cow?.sensorId || '');
  const [location, setLocation] = useState(cow?.location || '');
  const [active, setActive] = useState(cow?.active !== false);

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{cow ? 'Edit Cow' : 'Add New Cow'}</Text>
      
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Name</Text>
        <TextInput
          style={styles.formInput}
          value={name}
          onChangeText={setName}
          placeholder="Enter cow name"
        />
      </View>
      
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Sensor ID</Text>
        <TextInput
          style={styles.formInput}
          value={sensorId}
          onChangeText={setSensorId}
          placeholder="Enter sensor ID"
        />
      </View>
      
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Location</Text>
        <TextInput
          style={styles.formInput}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
        />
      </View>
      
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Active</Text>
        <Switch
          value={active}
          onValueChange={setActive}
          trackColor={{ false: '#767577', true: '#4dabf7' }}
          thumbColor="#f4f3f4"
        />
      </View>
      
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={() => onSave({ id: cow?.id, name, sensorId, location, active })}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FarmManagementScreen = () => {
  const [activeTab, setActiveTab] = useState('cows');
  const [cows, setCows] = useState(mockCows);
  const [locations, setLocations] = useState(mockLocations);
  const [sensors, setSensors] = useState(mockSensors);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddCow = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditCow = (cow) => {
    setEditingItem(cow);
    setShowForm(true);
  };

  const handleDeleteCow = (id) => {
    setCows(cows.filter(cow => cow.id !== id));
  };

  const handleSaveCow = (cow) => {
    if (editingItem) {
      setCows(cows.map(c => c.id === cow.id ? cow : c));
    } else {
      const newCow = {
        ...cow,
        id: `cow${cows.length + 1}`,
      };
      setCows([...cows, newCow]);
    }
    setShowForm(false);
  };

  const handleCalibrateSensor = (id) => {
    // In a real app, this would open a calibration interface
    alert(`Calibrating sensor ${id}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Farm & Sensor Management</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'cows' && styles.activeTab]} 
          onPress={() => setActiveTab('cows')}
        >
          <Text style={[styles.tabText, activeTab === 'cows' && styles.activeTabText]}>Cows</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'locations' && styles.activeTab]} 
          onPress={() => setActiveTab('locations')}
        >
          <Text style={[styles.tabText, activeTab === 'locations' && styles.activeTabText]}>Locations</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'sensors' && styles.activeTab]} 
          onPress={() => setActiveTab('sensors')}
        >
          <Text style={[styles.tabText, activeTab === 'sensors' && styles.activeTabText]}>Sensors</Text>
        </TouchableOpacity>
      </View>
      
      {showForm && activeTab === 'cows' ? (
        <CowForm 
          cow={editingItem} 
          onSave={handleSaveCow} 
          onCancel={() => setShowForm(false)} 
        />
      ) : (
        <>
          {activeTab === 'cows' && (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Monitored Cows</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddCow}>
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
              
              {cows.map(cow => (
                <CowListItem 
                  key={cow.id} 
                  cow={cow} 
                  onEdit={handleEditCow} 
                  onDelete={handleDeleteCow} 
                />
              ))}
            </>
          )}
          
          {activeTab === 'locations' && (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Farm Locations</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => {}}>
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
              
              {locations.map(location => (
                <LocationListItem 
                  key={location.id} 
                  location={location} 
                  onEdit={() => {}} 
                  onDelete={() => {}} 
                />
              ))}
            </>
          )}
          
          {activeTab === 'sensors' && (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>IoT Sensors</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => {}}>
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
              
              {sensors.map(sensor => (
                <SensorListItem 
                  key={sensor.id} 
                  sensor={sensor} 
                  onEdit={() => {}} 
                  onCalibrate={handleCalibrateSensor} 
                />
              ))}
              
              <View style={styles.sensorLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#51cf66' }]} />
                  <Text style={styles.legendText}>Active</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ffa94d' }]} />
                  <Text style={styles.legendText}>Warning</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#adb5bd' }]} />
                  <Text style={styles.legendText}>Inactive</Text>
                </View>
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4dabf7',
  },
  tabText: {
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4dabf7',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#495057',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4dabf7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sensorLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default FarmManagementScreen;