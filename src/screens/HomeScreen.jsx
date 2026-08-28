import { Button, Modal, StyleSheet, Text, View, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changePassword } from '../store/slice/Auth.slice'
import * as Yup from 'yup';
import { Formik } from 'formik'
import Toast from 'react-native-toast-message'
import UserHomeDashboard from './UserHomeDashboard'
// import AdminHome from '../admin screens/AdminHome'

const HomeScreen = () => {
    const dispatch = useDispatch()
    const [passwordModalVisible, setPasswordModalVisible] = useState(false)
    const empDetails = useSelector((state) => state.auth.userData)
    // const id = empDetails.EmpId

    // const passwordUpdateSchema = Yup.object().shape({
    //     newPassword: Yup.string()
    //         .min(6, 'Password must be at least 6 characters long'),
    //     // .matches(/[0-9]/, 'Password must contain at least one number')
    //     // .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    //     // .required('Password is required'),
    //     confirmNewPassword: Yup.string()
    //         .min(6, 'Password must be at least 6 characters long')
    //     // .matches(/[0-9]/, 'Password must contain at least one number')
    //     // .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    //     // .required('Password is required')
    // });

    // const handleChangePassword = async (values) => {
    //     if (values.newPassword != values.confirmNewPassword) {
    //         Toast.show({
    //             type: 'customNotificationError',
    //             text1: "Both passwords must be same",
    //             visibilityTime: 1000
    //         });
    //     } else {
    //         try {
    //             const data = await dispatch(changePassword({ id, newPwd: values.newPassword }))
    //             if (data.payload.Status === "Sucess") {
    //                 Toast.show({
    //                     type: 'customNotificationSuccess',
    //                     text1: "Password Changed SucessFully",
    //                     visibilityTime: 1000
    //                 });
    //             }
    //         } catch (error) {
    //             Toast.show({
    //                 type: 'customNotificationError',
    //                 text1: "error updating password",
    //                 visibilityTime: 1000
    //             });
    //         }
    //     }
    // }

    // useEffect(() => {
    //     if (empDetails.flag == 0) {
    //         setPasswordModalVisible(true);
    //     }
    // }, [empDetails.flag]);

    return (
        <>
            {/* {empDetails.UserType === "User" ? < UserHomeDashboard /> : <AdminHome />} */}
            < UserHomeDashboard />
            {/* <View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={passwordModalVisible}
                    onRequestClose={() => setPasswordModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Update Password</Text>
                            <Text style={styles.warningTitle}>Don't press back </Text>
                            <Text style={styles.warningTitle}>You won't be able to do this afterward  </Text>
                            <Formik
                                initialValues={{ confirmNewPassword: "", newPassword: "" }}
                                validationSchema={passwordUpdateSchema}
                                onSubmit={handleChangePassword}>
                                {({
                                    handleChange,
                                    handleBlur,
                                    handleSubmit,
                                    values,
                                    errors,
                                    touched,
                                }) => (
                                    <View>
                                        <TextInput
                                            placeholder="New Password"
                                            placeholderTextColor="#000"
                                            style={styles.input}
                                            onChangeText={handleChange('newPassword')}
                                            onBlur={handleBlur('newPassword')}
                                            secureTextEntry
                                            value={values.newPassword}
                                        />
                                        {touched.newPassword && errors.newPassword && (
                                            <Text style={styles.error}>{errors.newPassword}</Text>
                                        )}
                                        <TextInput
                                            placeholder="confirm New Password"
                                            placeholderTextColor="#000"
                                            style={styles.input}
                                            onChangeText={handleChange('confirmNewPassword')}
                                            onBlur={handleBlur('confirmNewPassword')}
                                            secureTextEntry
                                            value={values.confirmNewPassword}
                                        />
                                        {touched.confirmNewPassword && errors.confirmNewPassword && (
                                            <Text style={styles.error}>{errors.confirmNewPassword}</Text>
                                        )}
                                        <View style={styles.buttonContainer}>
                                            <Button title="Submit" onPress={() => {
                                                handleSubmit()
                                                setPasswordModalVisible(false)
                                            }} />
                                           
                                        </View>
                                    </View>
                                )}
                            </Formik>
                        </View>
                    </View>
                </Modal>
            </View> */}
        </>

    )
}

export default HomeScreen

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    warningTitle: {
        fontSize: 15,
        color: "#FF0000",
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCC',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        color: "#000"
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        width: "70%"
    },
    error: {
        color: 'red',
        fontSize: 12
    },
})