import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import StackNavigator from '../stack navigation/StackNavigaiton';
// import { Expenses } from '../screens/Screens.js';
import CustomDrawer from './CustomDrawer';
// import AdminCustomDrawer from '../admin screens/AdminCustomDrawer.jsx';
import { useSelector } from 'react-redux';
import RegisterAppUsers from '../screens/RegisterAppUsers';
import DailyStockEntry from '../screens/DailyStockEntry/DailyStockEntry';
import EntryList from '../screens/DailyStockEntry/EntryList';
import PaymentEntryList from '../screens/DailyPaymentEntry/PaymentEntryList';
import DailyPaymentEntry from '../screens/DailyPaymentEntry/DailyPaymentEntry';
import ProfilePage from '../screens/ProfilePage';
import CustomerList from '../screens/CustomerList';

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
                    width: 250,
                },
                // drawerLabelStyle: {
                //     fontSize: 16,
                //     fontFamily: 'Arial',
                // },
            }}
        >
            <Drawer.Screen name="Home" component={StackNavigator} />
            <Drawer.Screen name="DailyStockEntry" component={DailyStockEntry} />
            <Drawer.Screen name="EntryList" component={EntryList} />
            <Drawer.Screen name="DailyPaymentEntry" component={DailyPaymentEntry} />
            <Drawer.Screen name="PaymentEntryList" component={PaymentEntryList} />
            <Drawer.Screen name="ProfilePage" component={ProfilePage} />
            <Drawer.Screen name="CustomerList" component={CustomerList} />
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
