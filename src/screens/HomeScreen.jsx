import { Button, Modal, StyleSheet, Text, View, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changePassword, handleLogout, logoutUser } from '../store/slice/Auth.slice'
import * as Yup from 'yup';
import { Formik } from 'formik'
import Toast from 'react-native-toast-message'
import UserHomeDashboard from './UserHomeDashboard'

const HomeScreen = () => {

    // useEffect(() => {
    //     if (empDetails.flag == 0) {
    //         setPasswordModalVisible(true);
    //     }
    // }, [empDetails.flag]);

    return (
        <>
            {/* {empDetails.UserType === "User" ? < UserHomeDashboard /> : <AdminHome />} */}
            < UserHomeDashboard />
        </>

    )
}

export default HomeScreen

