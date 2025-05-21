import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import DrawerNavigator from './src/navigation/DrawerNavigator';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
};

export default App;