import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    LoginScreen,
    UserHomeDashboard,
    HomeScreen,
} from "../screens/Screens.js"
import { useSelector } from 'react-redux';
import CreateCustomer from '../screens/CreateCustomer.jsx';
import CustomerDetails from '../screens/CustomerDetails.jsx';
import SplashScreen from '../helper/SplashScreen.jsx';
import EditCustomer from '../screens/EditCustomer.jsx';
import SubmitForm from '../screens/DailyStockEntry/SubmitForm.jsx';
import ApproveCustomer from '../screens/ApproveCustomer.jsx';
import PaymentSubmitForm from '../screens/DailyPaymentEntry/PaymentSubmitForm.jsx';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {

    // const [isSplashVisible, setIsSplashVisible] = useState(true);
    const auth = useSelector((state) => state.auth?.status)
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setIsSplashVisible(false);
    //     }, 2000);

    //     return () => clearTimeout(timer);
    // }, []);

    // if (isSplashVisible) {
    //     return <SplashScreen />;
    // }
    // if (auth === "loading") {
    //     return <SplashScreen />;
    // }
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {auth === "authenticated" ? (
                <>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="UserHomeDashboard" component={UserHomeDashboard} />
                    <Stack.Screen name="CreateCustomer" component={CreateCustomer} />
                    <Stack.Screen name="EditCustomer" component={EditCustomer} />
                    <Stack.Screen name="CustomerDetails" component={CustomerDetails} />
                    <Stack.Screen name="SubmitForm" component={SubmitForm} />
                    <Stack.Screen name="PaymentSubmitForm" component={PaymentSubmitForm} />
                    <Stack.Screen name="ApproveCustomer" component={ApproveCustomer} />
                </>
            ) : (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                />
            )}
        </Stack.Navigator>
    );
};

export default StackNavigator;
