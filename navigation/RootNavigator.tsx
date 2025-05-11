import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen'; // tạo 1 màn này đơn giản là được
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
  {user ? (
    <>
      {/* @ts-ignore */}
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </>
  ) : (
    <>
      {/* @ts-ignore */}
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </>
  )}
</NavigationContainer>


  );
};

export default RootNavigator;
