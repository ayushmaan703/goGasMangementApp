import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword, logoutUser } from '../store/slice/Auth.slice';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome6';

const PasswordModal = ({
    passwordModalVisible,
    setPasswordModalVisible,
}) => {
    const dispatch = useDispatch();

    const empDetails = useSelector((state) => state.auth.userData);
    const id = empDetails?.EmpId;

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordUpdateSchema = Yup.object().shape({
        newPassword: Yup.string()
            .required('Password is required')
            .min(4, 'Password must be at least 4 characters long'),

        confirmNewPassword: Yup.string()
            .required('Please confirm your password')
            .oneOf(
                [Yup.ref('newPassword')],
                'Passwords do not match'
            )
            .min(4, 'Password must be at least 4 characters long'),
    });

    const handleChangePassword = async (values, { resetForm }) => {
        try {
            setIsSubmitting(true);

            const data = await dispatch(
                changePassword({
                    id,
                    newPwd: values.newPassword,
                })
            );

            if (
                data.type === 'changePassword/fulfilled' &&
                data.payload?.[0]?.Status === 'Sucess'
            ) {
                Toast.show({
                    type: 'customNotificationSuccess',
                    text1: 'Password Updated Successfully',
                    text2: 'Please login again with your new PIN',
                    visibilityTime: 3000,
                });

                resetForm();
                setPasswordModalVisible(false);

                // Logout user after successful password change
                // dispatch(logoutUser());
            } else {
                Toast.show({
                    type: 'customNotificationError',
                    text1: 'Unable to update password',
                    text2: 'Please try again',
                    visibilityTime: 2500,
                });
            }
        } catch (error) {
            Toast.show({
                type: 'customNotificationError',
                text1: 'Error updating password',
                text2: 'Something went wrong. Please try again.',
                visibilityTime: 2500,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        if (!isSubmitting) {
            setPasswordModalVisible(false);
            setShowPassword(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent
            visible={passwordModalVisible}
            onRequestClose={closeModal}
        >
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.modalContainer}>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerIcon}>
                            <Icon
                                name="lock"
                                size={20}
                                color="#2563EB"
                            />
                        </View>

                        <View style={styles.headerTextContainer}>
                            <Text style={styles.modalTitle}>
                                Update Password
                            </Text>

                            <Text style={styles.modalSubtitle}>
                                Create a new 4-digit PIN
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeModal}
                            disabled={isSubmitting}
                        >
                            <Icon
                                name="xmark"
                                size={18}
                                color="#64748B"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Warning */}
                    <View style={styles.warningBox}>
                        <View style={styles.warningIcon}>
                            <Icon
                                name="triangle-exclamation"
                                size={15}
                                color="#D97706"
                            />
                        </View>

                        <View style={styles.warningContent}>
                            <Text style={styles.warningTitle}>
                                Important
                            </Text>

                            <Text style={styles.warningText}>
                                Remember the password after changing it.
                            </Text>
                        </View>
                    </View>

                    <Formik
                        initialValues={{
                            newPassword: '',
                            confirmNewPassword: '',
                        }}
                        validationSchema={passwordUpdateSchema}
                        onSubmit={handleChangePassword}
                    >
                        {({
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            values,
                            errors,
                            touched,
                            isValid,
                        }) => (
                            <View>

                                {/* New PIN */}
                                <Text style={styles.label}>
                                    New PIN
                                </Text>

                                <View
                                    style={[
                                        styles.inputContainer,
                                        touched.newPassword &&
                                        errors.newPassword &&
                                        styles.inputError,
                                    ]}
                                >
                                    <Icon
                                        name="lock"
                                        size={16}
                                        color="#64748B"
                                        style={styles.inputIcon}
                                    />

                                    <TextInput
                                        placeholder="Enter 4-digit PIN"
                                        placeholderTextColor="#94A3B8"
                                        style={styles.input}
                                        onChangeText={handleChange('newPassword')}
                                        onBlur={handleBlur('newPassword')}
                                        secureTextEntry={!showPassword}
                                        // keyboardType="number-pad"
                                        value={values.newPassword}
                                        editable={!isSubmitting}
                                    />

                                    <TouchableOpacity
                                        onPress={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        disabled={isSubmitting}
                                    >
                                        <Icon
                                            name={
                                                showPassword
                                                    ? 'eye-slash'
                                                    : 'eye'
                                            }
                                            size={17}
                                            color="#64748B"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {touched.newPassword &&
                                    errors.newPassword && (
                                        <Text style={styles.error}>
                                            {errors.newPassword}
                                        </Text>
                                    )}

                                {/* Confirm PIN */}
                                <Text style={styles.label}>
                                    Confirm PIN
                                </Text>

                                <View
                                    style={[
                                        styles.inputContainer,
                                        touched.confirmNewPassword &&
                                        errors.confirmNewPassword &&
                                        styles.inputError,
                                    ]}
                                >
                                    <Icon
                                        name="shield-halved"
                                        size={16}
                                        color="#64748B"
                                        style={styles.inputIcon}
                                    />

                                    <TextInput
                                        placeholder="Re-enter 4-digit PIN"
                                        placeholderTextColor="#94A3B8"
                                        style={styles.input}
                                        onChangeText={handleChange(
                                            'confirmNewPassword'
                                        )}
                                        onBlur={handleBlur(
                                            'confirmNewPassword'
                                        )}
                                        secureTextEntry={!showPassword}
                                        // keyboardType="number-pad"
                                        value={
                                            values.confirmNewPassword
                                        }
                                        editable={!isSubmitting}
                                    />

                                    <Icon
                                        name={
                                            values.confirmNewPassword &&
                                                values.newPassword ===
                                                values.confirmNewPassword
                                                ? 'circle-check'
                                                : 'circle'
                                        }
                                        size={17}
                                        color={
                                            values.confirmNewPassword &&
                                                values.newPassword ===
                                                values.confirmNewPassword
                                                ? '#16A34A'
                                                : '#CBD5E1'
                                        }
                                    />
                                </View>

                                {touched.confirmNewPassword &&
                                    errors.confirmNewPassword && (
                                        <Text style={styles.error}>
                                            {errors.confirmNewPassword}
                                        </Text>
                                    )}

                                {/* PIN requirement */}
                                <View style={styles.requirement}>
                                    <Icon
                                        name={
                                            values.newPassword.length === 4
                                                ? 'circle-check'
                                                : 'circle'
                                        }
                                        size={13}
                                        color={
                                            values.newPassword.length === 4
                                                ? '#16A34A'
                                                : '#94A3B8'
                                        }
                                    />

                                    <Text style={styles.requirementText}>
                                        PIN must contain atleast 4 digits
                                    </Text>
                                </View>

                                {/* Submit */}
                                <TouchableOpacity
                                    style={[
                                        styles.submitButton,
                                        (!isValid ||
                                            !values.newPassword ||
                                            !values.confirmNewPassword ||
                                            isSubmitting) &&
                                        styles.submitButtonDisabled,
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={
                                        !isValid ||
                                        !values.newPassword ||
                                        !values.confirmNewPassword ||
                                        isSubmitting
                                    }
                                    activeOpacity={0.8}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <ActivityIndicator
                                                size="small"
                                                color="#FFFFFF"
                                            />

                                            <Text
                                                style={
                                                    styles.submitButtonText
                                                }
                                            >
                                                Updating...
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Icon
                                                name="check"
                                                size={16}
                                                color="#FFFFFF"
                                            />

                                            <Text
                                                style={
                                                    styles.submitButtonText
                                                }
                                            >
                                                Update Password
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {/* Cancel */}
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={closeModal}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        )}
                    </Formik>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default PasswordModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    modalContainer: {
        width: '100%',
        maxWidth: 430,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 22,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },

    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },

    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    headerTextContainer: {
        flex: 1,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
    },

    modalSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 3,
    },

    closeButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* Warning */
    warningBox: {
        flexDirection: 'row',
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },

    warningIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    warningContent: {
        flex: 1,
    },

    warningTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#92400E',
        marginBottom: 2,
    },

    warningText: {
        fontSize: 12,
        lineHeight: 17,
        color: '#92400E',
    },

    /* Inputs */
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 7,
        marginTop: 4,
    },

    inputContainer: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 10,
        paddingHorizontal: 13,
        backgroundColor: '#F8FAFC',
    },

    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },

    inputIcon: {
        marginRight: 10,
    },

    input: {
        flex: 1,
        height: '100%',
        color: '#0F172A',
        fontSize: 12,
        // letterSpacing: 2,
        paddingVertical: 0,
    },

    error: {
        color: '#DC2626',
        fontSize: 11,
        marginTop: 5,
        marginBottom: 5,
    },

    /* Requirement */
    requirement: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 20,
    },

    requirementText: {
        fontSize: 12,
        color: '#64748B',
        marginLeft: 7,
    },

    /* Submit */
    submitButton: {
        height: 50,
        borderRadius: 10,
        backgroundColor: '#2563EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,

        shadowColor: '#2563EB',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },

    submitButtonDisabled: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0,
        elevation: 0,
    },

    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    /* Cancel */
    cancelButton: {
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },

    cancelButtonText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    },
});

