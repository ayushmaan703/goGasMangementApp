import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './drawer navigation/DrawerNavigation';
import { handleLogout, initializeAuth, logoutUser, setUser } from './store/slice/Auth.slice';
import { useDispatch } from 'react-redux';
import * as Keychain from 'react-native-keychain';
import SplashScreen from './helper/SplashScreen';

export default function App() {
  const dispatch = useDispatch();

  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userCredentials = await Keychain.getGenericPassword({ service: "userData", });
        const authCredentials = await Keychain.getGenericPassword({ service: "userAuth", });

        // No complete session found
        if (!userCredentials || !authCredentials) {
          dispatch(logoutUser());
          return;
        }

        const user = JSON.parse(userCredentials.password);
        const auth = JSON.parse(authCredentials.password);

        const data = { user, auth, };

        if (auth.status === "authenticated") {
          dispatch(setUser(data));
        } else {
          await handleLogout();
          dispatch(logoutUser());
        }
      } catch (error) {
        await handleLogout();
        dispatch(logoutUser());
      } finally {
        setTimeout(() => {
          setIsRestoring(false);
        }, 1800)
      }
    };

    restoreSession();
  }, []);

  if (isRestoring) {
    return <SplashScreen />
  }

  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}