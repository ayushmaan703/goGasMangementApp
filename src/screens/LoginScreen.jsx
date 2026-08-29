import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    PermissionsAndroid,
    ActivityIndicator,
    Keyboard,
    StatusBar,
} from "react-native";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { Formik } from "formik";
import * as Yup from "yup";

import { useDispatch, useSelector } from "react-redux";

import Toast from "react-native-toast-message";

import {  userLogin } from "../store/slice/Auth.slice.js";

import { KeyboardAwareScrollView } from
    "react-native-keyboard-aware-scroll-view";

import logo from "../data/logo-CCalxPd4.jpg";

const LoginScreen = () => {
    const dispatch = useDispatch();

    const isLoading = useSelector(
        (state) => state.auth.loading
    );

    const [showPassword, setShowPassword] =
        useState(false);

    // ==================================================
    // NOTIFICATION PERMISSION
    // ==================================================

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    const requestNotificationPermission = async () => {
        if (Platform.OS !== "android") {
            return;
        }

        try {
            const granted =
                await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS
                        .POST_NOTIFICATIONS
                );

            if (
                granted ===
                PermissionsAndroid.RESULTS.GRANTED
            ) {
                // getFcmToken();
            } else {
                // getFcmToken();
            }
        } catch (err) {
            console.warn(err);
        }
    };

    // ==================================================
    // LOGIN
    // ==================================================

    const handleLogin = async (
        values,
        { resetForm }
    ) => {
        const {
            mobileNo,
            password,
        } = values;

        const result = await dispatch(
            userLogin({
                mobileNo,
                password,
            })
        );


        if (result.type === "userLogin/fulfilled" && result.payload?.Status != "Invalid User") {
            Toast.show({
                type: "customNotificationSuccess",
                text1: "Login Successful",
                visibilityTime: 1000,
            });
            resetForm();
        } else {
            Toast.show({
                type: "customNotificationError",
                text1: result.payload?.Status || "Login Failed",
                visibilityTime: 1000,
            });
            resetForm()
        }
    };

    // ==================================================
    // VALIDATION
    // ==================================================

    const loginSchema = Yup.object().shape({
        mobileNo: Yup.string()
            .min(
                10,
                "Mobile number must be 10 digits"
            )
            .max(
                10,
                "Mobile number must be 10 digits"
            )
            .matches(
                /^\d+$/,
                "Enter a valid mobile number"
            )
            .required(
                "Mobile number is required"
            ),

        password: Yup.string()
            .required("Password is required"),
    });

    return (
        <View style={styles.container}>

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#F6F9FD"
            />

            <KeyboardAvoidingView
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : "height"
                }
                style={styles.keyboardContainer}
            >

                <KeyboardAwareScrollView
                    contentContainerStyle={
                        styles.scrollContainer
                    }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                >

                    {/* ==========================================
              BACKGROUND DECORATION
          ========================================== */}

                    <View style={styles.backgroundCircleOne} />

                    <View style={styles.backgroundCircleTwo} />

                    {/* ==========================================
              BRAND
          ========================================== */}

                    <View style={styles.brandSection}>

                        <View style={styles.logoWrapper}>

                            <Image
                                source={logo}
                                style={styles.logo}
                            />

                        </View>

                        <Text style={styles.brandName}>
                            SmartBiz
                        </Text>

                        <Text style={styles.brandTagline}>
                            Gas Station Management
                        </Text>

                    </View>

                    {/* ==========================================
              LOGIN CARD
          ========================================== */}

                    <View style={styles.loginCard}>

                        {/* Header */}

                        <View style={styles.cardHeader}>

                            <Text style={styles.title}>
                                Welcome back
                            </Text>

                            <Text style={styles.subtitle}>
                                Sign in to continue to your account
                            </Text>

                        </View>

                        {/* ========================================
                FORM
            ======================================== */}

                        <Formik
                            initialValues={{
                                mobileNo: "",
                                password: "",
                            }}
                            validationSchema={loginSchema}
                            onSubmit={handleLogin}
                        >
                            {({
                                handleChange,
                                handleBlur,
                                handleSubmit,
                                values,
                                errors,
                                touched,
                            }) => (
                                <View style={styles.form}>

                                    {/* ==================================
                      MOBILE NUMBER
                  ================================== */}

                                    <View style={styles.fieldContainer}>

                                        <Text style={styles.label}>
                                            Mobile Number
                                        </Text>

                                        <View
                                            style={[
                                                styles.inputContainer,
                                                touched.mobileNo &&
                                                errors.mobileNo &&
                                                styles.inputError,
                                            ]}
                                        >

                                            <View
                                                style={styles.inputIcon}
                                            >
                                                <MaterialIcons
                                                    name="phone"
                                                    size={19}
                                                    color="#4A90E2"
                                                />
                                            </View>

                                            <TextInput
                                                placeholder="Enter mobile number"
                                                placeholderTextColor="#9AA5B5"
                                                style={styles.input}
                                                keyboardType="phone-pad"
                                                maxLength={10}
                                                onChangeText={handleChange(
                                                    "mobileNo"
                                                )}
                                                onBlur={handleBlur(
                                                    "mobileNo"
                                                )}
                                                value={values.mobileNo}
                                            />

                                        </View>

                                        {touched.mobileNo &&
                                            errors.mobileNo && (
                                                <View
                                                    style={
                                                        styles.errorContainer
                                                    }
                                                >
                                                    <MaterialIcons
                                                        name="error-outline"
                                                        size={14}
                                                        color="#D64545"
                                                    />

                                                    <Text
                                                        style={styles.error}
                                                    >
                                                        {errors.mobileNo}
                                                    </Text>
                                                </View>
                                            )}

                                    </View>

                                    {/* ==================================
                      PASSWORD
                  ================================== */}

                                    <View style={styles.fieldContainer}>

                                        <Text style={styles.label}>
                                            Password
                                        </Text>

                                        <View
                                            style={[
                                                styles.inputContainer,
                                                touched.password &&
                                                errors.password &&
                                                styles.inputError,
                                            ]}
                                        >

                                            <View
                                                style={styles.inputIcon}
                                            >
                                                <MaterialIcons
                                                    name="lock-outline"
                                                    size={19}
                                                    color="#4A90E2"
                                                />
                                            </View>

                                            <TextInput
                                                placeholder="Enter your password"
                                                placeholderTextColor="#9AA5B5"
                                                style={styles.input}
                                                secureTextEntry={
                                                    !showPassword
                                                }
                                                onChangeText={handleChange(
                                                    "password"
                                                )}
                                                onBlur={handleBlur(
                                                    "password"
                                                )}
                                                value={values.password}
                                            />

                                            <TouchableOpacity
                                                style={
                                                    styles.passwordButton
                                                }
                                                onPress={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                activeOpacity={0.7}
                                            >
                                                <MaterialIcons
                                                    name={
                                                        showPassword
                                                            ? "visibility-off"
                                                            : "visibility"
                                                    }
                                                    size={20}
                                                    color="#7D8795"
                                                />
                                            </TouchableOpacity>

                                        </View>

                                        {touched.password &&
                                            errors.password && (
                                                <View
                                                    style={
                                                        styles.errorContainer
                                                    }
                                                >
                                                    <MaterialIcons
                                                        name="error-outline"
                                                        size={14}
                                                        color="#D64545"
                                                    />

                                                    <Text
                                                        style={styles.error}
                                                    >
                                                        {errors.password}
                                                    </Text>
                                                </View>
                                            )}

                                    </View>

                                    {/* ==================================
                      LOGIN BUTTON
                  ================================== */}

                                    <TouchableOpacity
                                        style={[
                                            styles.loginButton,
                                            isLoading &&
                                            styles.disabledButton,
                                        ]}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            handleSubmit();
                                        }}
                                        disabled={isLoading}
                                        activeOpacity={0.85}
                                    >

                                        {isLoading ? (
                                            <ActivityIndicator
                                                size="small"
                                                color="#FFFFFF"
                                            />
                                        ) : (
                                            <View
                                                style={
                                                    styles.loginButtonContent
                                                }
                                            >

                                                <Text
                                                    style={
                                                        styles.loginButtonText
                                                    }
                                                >
                                                    Login In
                                                </Text>

                                                <View
                                                    style={styles.arrowCircle}
                                                >
                                                    <MaterialIcons name="arrow-forward" size={18} color="#4A90E2" />
                                                </View>

                                            </View>
                                        )}

                                    </TouchableOpacity>

                                </View>
                            )}
                        </Formik>

                        <View style={styles.securityRow}>

                            <MaterialIcons
                                name="verified-user"
                                size={15}
                                color="#4CAF50"
                            />

                            <Text style={styles.securityText}>
                                Secure access to your SmartBiz account
                            </Text>

                        </View>

                    </View>

                    {/* ==========================================
              APP FOOTER
          ========================================== */}

                    <Text style={styles.footerText}>
                        SmartBiz • Manage Smart. Grow Faster
                    </Text>

                    <Text style={styles.versionText}>
                        Version 1.0
                    </Text>

                </KeyboardAwareScrollView>

            </KeyboardAvoidingView>

        </View>
    );
};

const styles = StyleSheet.create({

    // ==================================================
    // MAIN
    // ==================================================

    container: {
        flex: 1,
        backgroundColor: "#F6F9FD",
    },

    keyboardContainer: {
        flex: 1,
    },

    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 35,
        position: "relative",
    },

    // ==================================================
    // BACKGROUND DECORATION
    // ==================================================

    backgroundCircleOne: {
        position: "absolute",

        width: 240,
        height: 240,

        borderRadius: 120,

        backgroundColor: "#EAF3FF",

        top: -80,
        right: -100,
    },

    backgroundCircleTwo: {
        position: "absolute",

        width: 180,
        height: 180,

        borderRadius: 90,

        backgroundColor: "#EEF7FF",

        bottom: -70,
        left: -90,
    },

    // ==================================================
    // BRAND
    // ==================================================

    brandSection: {
        alignItems: "center",

        marginBottom: 24,
    },

    logoWrapper: {
        width: 86,
        height: 86,

        borderRadius: 24,

        backgroundColor: "#FFFFFF",

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#4A90E2",
        shadowOpacity: 0.14,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 5,
        },

        elevation: 5,

        overflow: "hidden",
    },

    logo: {
        width: 70,
        height: 70,
        resizeMode: "contain",
    },

    brandName: {
        marginTop: 12,

        fontSize: 25,

        color: "#1E293B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",

        letterSpacing: 1,
    },

    brandTagline: {
        marginTop: 4,

        fontSize: 10,

        color: "#8A96A6",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        letterSpacing: 0.5,
    },

    // ==================================================
    // LOGIN CARD
    // ==================================================

    loginCard: {
        width: "100%",
        maxWidth: 390,

        backgroundColor: "#FFFFFF",

        borderRadius: 28,

        paddingHorizontal: 24,
        paddingVertical: 26,

        shadowColor: "#1E293B",
        shadowOpacity: 0.09,
        shadowRadius: 22,
        shadowOffset: {
            width: 0,
            height: 8,
        },

        elevation: 7,
    },

    cardHeader: {
        marginBottom: 24,
    },

    title: {
        fontSize: 24,

        color: "#1E293B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",

        letterSpacing: 0.2,
    },

    subtitle: {
        marginTop: 7,

        fontSize: 11,

        lineHeight: 18,

        color: "#8A96A6",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        letterSpacing: 0.2,
    },

    // ==================================================
    // FORM
    // ==================================================

    form: {
        width: "100%",
    },

    fieldContainer: {
        marginBottom: 17,
    },

    label: {
        fontSize: 11,

        color: "#475569",

        marginBottom: 7,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",

        letterSpacing: 0.3,
    },

    inputContainer: {
        height: 54,

        width: "100%",

        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#F8FAFD",

        borderRadius: 15,

        borderWidth: 1,
        borderColor: "#E3EAF2",
    },

    inputError: {
        borderColor: "#E78B8B",
        backgroundColor: "#FFF9F9",
    },

    inputIcon: {
        width: 44,

        justifyContent: "center",
        alignItems: "center",
    },

    input: {
        flex: 1,

        height: "100%",

        paddingHorizontal: 0,

        color: "#1E293B",

        fontSize: 13,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },

    passwordButton: {
        width: 46,
        height: "100%",

        justifyContent: "center",
        alignItems: "center",
    },

    // ==================================================
    // ERRORS
    // ==================================================

    errorContainer: {
        flexDirection: "row",
        alignItems: "center",

        marginTop: 6,
        marginLeft: 3,
    },

    error: {
        color: "#D64545",

        fontSize: 9,

        marginLeft: 4,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",

        letterSpacing: 0.2,
    },

    // ==================================================
    // LOGIN BUTTON
    // ==================================================

    loginButton: {
        width: "100%",
        height: 55,

        marginTop: 6,

        borderRadius: 16,

        backgroundColor: "#4A90E2",

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#4A90E2",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 5,
        },

        elevation: 5,
    },

    disabledButton: {
        opacity: 0.7,
    },

    loginButtonContent: {
        width: "100%",

        flexDirection: "row",

        alignItems: "center",
        justifyContent: "center",
    },

    loginButtonText: {
        color: "#FFFFFF",

        fontSize: 14,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",

        letterSpacing: 0.6,

        marginRight: 12,
    },

    arrowCircle: {
        width: 30,
        height: 30,

        borderRadius: 15,

        backgroundColor: "#FFFFFF",

        justifyContent: "center",
        alignItems: "center",
    },

    // ==================================================
    // SECURITY
    // ==================================================

    securityRow: {
        flexDirection: "row",

        alignItems: "center",
        justifyContent: "center",

        marginTop: 20,
    },

    securityText: {
        marginLeft: 6,

        fontSize: 9,

        color: "#8A96A6",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        letterSpacing: 0.2,
    },

    // ==================================================
    // FOOTER
    // ==================================================

    footerText: {
        marginTop: 22,

        fontSize: 9,

        color: "#9AA5B5",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        letterSpacing: 0.5,
    },

    versionText: {
        marginTop: 4,

        fontSize: 8,

        color: "#B4BDC8",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        letterSpacing: 0.3,
    },
});

export default LoginScreen;