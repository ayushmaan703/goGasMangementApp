import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import CustomNavBar from "../helper/CustomNavBar";
import { registerUser } from "../store/slice/Auth.slice";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import CheckBox from "@react-native-community/checkbox";
import { registerAdmin } from "../store/slice/Admin.slice";

const RegisterAppUsers = ({ navigation }) => {

    const dispatch = useDispatch();
    const [form, setForm] = useState({
        fullName: "",
        mobileNo: "",
        password: "",
    });

    const [isAdmin, setIsAdmin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const loading = useSelector((state) => state.auth.loading);

    const handleChange = (name, value) => {
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {


        if (!form.fullName.trim()) {
            Toast.show({
                type: 'customNotificationError',
                text1: "Please enter full name.",
                visibilityTime: 1000
            });
            return;
        }
        if (!form.mobileNo.trim()) {
            Toast.show({
                type: 'customNotificationError',
                text1: "Please enter mobile number.",
                visibilityTime: 1000
            });
            return;
        }
        if (form.mobileNo.length !== 10) {
            Toast.show({
                type: 'customNotificationError',
                text1: "Mobile number must be 10 digits.",
                visibilityTime: 1000
            });
            return;
        }
        if (!form.password.trim()) {
            Toast.show({
                type: 'customNotificationError',
                text1: "Please enter password.",
                visibilityTime: 1000
            });
            return;
        }
        if (isAdmin) {
            const res = await dispatch(registerAdmin(form));
            if (res.type === "registerAdmin/fulfilled") {
                Toast.show({
                    type: 'customNotificationSuccess',
                    text1: "Admin Registered Successfully",
                    visibilityTime: 1000
                });
                setForm({
                    fullName: "",
                    mobileNo: "",
                    password: "",
                });
            }
        } else {

            const res = await dispatch(registerUser(form));
            if (res.type === "registerUser/fulfilled") {
                Toast.show({
                    type: 'customNotificationSuccess',
                    text1: "User Registered Successfully",
                    visibilityTime: 1000
                });
                setForm({
                    fullName: "",
                    mobileNo: "",
                    password: "",
                });
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            <CustomNavBar title={"Register App Users"} />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.heading}>Create Employee</Text>

                {/* Full Name */}
                <View style={styles.inputContainer}>
                    <FontAwesome6
                        name="user"
                        size={18}
                        color="#666"
                        style={styles.icon}
                    />

                    <TextInput
                        placeholder="Full Name"
                        value={form.fullName}
                        placeholderTextColor="#000"
                        onChangeText={(text) =>
                            handleChange("fullName", text)
                        }
                        style={styles.input}
                    />
                </View>

                {/* Mobile Number */}
                <View style={styles.inputContainer}>
                    <FontAwesome6
                        name="phone"
                        size={18}
                        color="#666"
                        style={styles.icon}
                    />

                    <TextInput
                        placeholder="Mobile Number"
                        keyboardType="number-pad"
                        placeholderTextColor="#000"
                        maxLength={10}
                        value={form.mobileNo}
                        onChangeText={(text) =>
                            handleChange("mobileNo", text.replace(/[^0-9]/g, ""))
                        }
                        style={styles.input}
                    />
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                    <FontAwesome6
                        name="lock"
                        size={18}
                        color="#666"
                        style={styles.icon}
                    />

                    <TextInput
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#000"
                        value={form.password}
                        onChangeText={(text) =>
                            handleChange("password", text)
                        }
                        style={[styles.input, { flex: 1 }]}
                    />

                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <FontAwesome6
                            name={showPassword ? "eye-slash" : "eye"}
                            size={18}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.checkboxContainer}>
                    <CheckBox
                        value={isAdmin}
                        onValueChange={() => setIsAdmin(!isAdmin)}
                        tintColors={{
                            true: "#4A90E2",
                            false: "#B0B0B0",
                        }}
                    />

                    <View style={{ flex: 1 }}>
                        <Text style={styles.checkboxTitle}>Make this user an Admin</Text>
                        <Text style={styles.checkboxSubtitle}>
                            Admin users can access administrative features.
                        </Text>
                    </View>
                </View>
                {/* Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <FontAwesome6
                                name="plus"
                                size={18}
                                color="#fff"
                            />
                            <Text style={styles.buttonText}>
                                Create User
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default RegisterAppUsers;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        marginTop: 20,
    },
    scrollContainer: {
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: "700",
        color: "#222",
        marginBottom: 25,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 18,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 55,
        fontSize: 16,
        color: "#000",
    },
    button: {
        backgroundColor: "rgba(74, 144, 226, 0.85)",
        height: 55,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        marginTop: 15,
    },
    buttonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600",
        marginLeft: 10,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    checkboxTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#222",
    },

    checkboxSubtitle: {
        fontSize: 13,
        color: "#777",
        marginTop: 2,
    },
});