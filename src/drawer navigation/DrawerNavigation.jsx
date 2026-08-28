import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import StackNavigator from '../stack navigation/StackNavigaiton';
// import { Expenses } from '../screens/Screens.js';
import CustomDrawer from './CustomDrawer';
// import AdminCustomDrawer from '../admin screens/AdminCustomDrawer.jsx';
import { useSelector } from 'react-redux';
import RegisterAppUsers from '../screens/RegisterAppUsers';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    const isAdmin = useSelector((state) => state.auth.userData?.UserType)

    return (
        <Drawer.Navigator
            // drawerContent={props => (isAdmin == "Admin") ? <AdminCustomDrawer {...props} /> : <CustomDrawer {...props} />}
            drawerContent={props => <CustomDrawer {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: 300,
                },
                // drawerLabelStyle: {
                //     fontSize: 16,
                //     fontFamily: 'Arial',
                // },
            }}
        >
            <Drawer.Screen name="Home" component={StackNavigator} />
            {/* <Drawer.Screen name="RegisterAppUsers" component={RegisterAppUsers} /> */}
            {/* <Drawer.Screen name="TaskHist" component={CompletedTaskDetails} /> */}
            {/* <Drawer.Screen name="expenses" component={Expenses} /> */}
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
