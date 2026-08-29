import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";

import { DrawerContentScrollView } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/FontAwesome6";

import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { handleLogout, logoutUser } from "../store/slice/Auth.slice";
import { CommonActions } from "@react-navigation/native";

import CustomBtn from "../helper/CustomBtn";

const CustomDrawer = (props) => {
    const [activeButton, setActiveButton] = useState("Home");

    const { navigation } = props;
    const dispatch = useDispatch();

    const empName = useSelector((state) => state.auth.userData?.Emp) || "User";
    const currUser = useSelector((state) => state.auth.userData);
    const isLoading = useSelector((state) => state.auth.loading);

    const getInitials = (name) => {
        if (!name) return "U";

        const words = name.trim().split(" ");

        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }

        return (
            words[0].charAt(0) +
            words[words.length - 1].charAt(0)
        ).toUpperCase();
    };

    const initials = getInitials(empName);

    const handleLogoutUser = async () => {
        try {
            await handleLogout();
            dispatch(logoutUser());

            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                })
            );

            Toast.show({
                type: "customNotificationSuccess",
                text1: "Logged Out Successfully",
                visibilityTime: 1000,
            });
        } catch (error) {
            Toast.show({
                type: "customNotificationError",
                text1: "Error Logging Out ",
                visibilityTime: 1000,
            });
            // console.log("Logout error:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.header}>

                {/* <View style={styles.brandRow}>
                    <View style={styles.brandIcon}>
                        <Icon
                            name="gas-pump"
                            size={18}
                            color="#4A90E2"
                        />
                    </View>

                    <View>
                        <Text style={styles.brandName}>
                            goGas
                        </Text>

                        <Text style={styles.brandSubtitle}>
                            Management System
                        </Text>
                    </View>
                </View> */}

                <View style={styles.profileSection}>

                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {initials}
                        </Text>
                    </View>

                    <View style={styles.profileInfo}>

                        <Text style={styles.welcomeText}>
                            Welcome back
                        </Text>

                        <Text
                            style={styles.nameText}
                            numberOfLines={1}
                        >
                            {empName}
                        </Text>

                        <View style={styles.roleContainer}>
                            <View style={styles.onlineDot} />

                            <Text style={styles.roleText}>
                                {currUser?.UserType === "Admin"
                                    ? "Administrator"
                                    : "Employee"}
                            </Text>
                        </View>

                    </View>

                </View>

            </View>

            {/* ================================================= */}
            {/* NAVIGATION */}
            {/* ================================================= */}

            <DrawerContentScrollView
                {...props}
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
            >

                {/* Section title */}

                <Text style={styles.sectionTitle}>
                    MENU
                </Text>

                {/* Home */}

                <CustomBtn
                    title="Home"
                    icon="house"
                    onPress={() => navigation.navigate("Home", { screen: "Home" })}
                    isActive={activeButton === "Home"}
                    setActive={setActiveButton}
                    navigation={navigation}
                />

                {/* Register users */}

                {currUser?.UserType === "Admin" && (
                    <CustomBtn
                        title="Create Customer"
                        icon="user-plus"
                        onPress={() => navigation.navigate("Home", { screen: "CreateCustomer" })}
                        isActive={activeButton === "Create Customer"}
                        setActive={setActiveButton}
                        navigation={navigation}
                    />
                )}
                <CustomBtn
                    title="Daily Stock Entry"
                    icon="arrow-right-arrow-left"
                    onPress={() => navigation.navigate("DailyStockEntry")}
                    isActive={activeButton === "Daily Stock Entry"}
                    setActive={setActiveButton}
                    navigation={navigation}
                />
                <CustomBtn
                    title="Daily Stock Entry Logs"
                    icon="clipboard-list"

                    onPress={() => navigation.navigate("EntryList")}
                    isActive={activeButton === "Daily Stock Entry Logs"}
                    setActive={setActiveButton}
                    navigation={navigation}
                />
            </DrawerContentScrollView>

            <View style={styles.footer}>

                {/* Divider */}

                <View style={styles.footerDivider} />

                {/* Logout */}

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.logoutButton}
                    onPress={handleLogoutUser}
                    disabled={isLoading}
                >

                    <View style={styles.logoutIconContainer}>
                        {isLoading ? (
                            <ActivityIndicator
                                size="small"
                                color="#D64545"
                            />
                        ) : (
                            <Icon
                                name="right-from-bracket"
                                size={14}
                                color="#D64545"
                            />
                        )}
                    </View>

                    <View style={styles.logoutTextContainer}>
                        <Text style={styles.logoutTitle}>
                            {isLoading
                                ? "Logging out..."
                                : "Logout"}
                        </Text>

                        {!isLoading && (
                            <Text style={styles.logoutSubtitle}>
                                Sign out of your account
                            </Text>
                        )}
                    </View>

                    {!isLoading && (
                        <Icon
                            name="chevron-right"
                            size={13}
                            color="#999"
                        />
                    )}

                </TouchableOpacity>

                {/* Version */}

                <Text style={styles.versionText}>
                    SmartBiz • v1.0
                </Text>

            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F7F9FC",
    },
    header: {
        marginTop: 40,
        // backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 22,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        borderBottomWidth: 1,
        borderBottomColor: "#5498ba",
    },

    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },

    brandIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,

        backgroundColor: "#EAF3FF",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 11,
    },

    brandName: {
        fontSize: 20,
        color: "#1E293B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",

        letterSpacing: 0.5,
    },

    brandSubtitle: {
        fontSize: 10,
        color: "#94A3B8",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        marginTop: 2,

        letterSpacing: 0.3,
    },


    profileSection: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 58,
        height: 58,

        borderRadius: 29,

        backgroundColor: "#4A90E2",

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#4A90E2",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 5,
    },

    avatarText: {
        color: "#FFFFFF",
        fontSize: 20,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",

        letterSpacing: 1,
    },

    profileInfo: {
        flex: 1,
        marginLeft: 14,
    },

    welcomeText: {
        fontSize: 11,
        color: "#94A3B8",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        marginBottom: 2,
    },

    nameText: {
        fontSize: 17,
        color: "#1E293B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",

        maxWidth: "90%",
    },

    roleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },

    onlineDot: {
        width: 7,
        height: 7,
        borderRadius: 4,

        backgroundColor: "#22C55E",

        marginRight: 6,
    },

    roleText: {
        fontSize: 10,
        color: "#64748B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        textTransform: "capitalize",
    },

    // ==================================================
    // BODY
    // ==================================================

    body: {
        flex: 1,
        backgroundColor: "#F7F9FC",
    },

    bodyContent: {
        paddingHorizontal: 14,
        paddingTop: 20,
        paddingBottom: 20,
    },

    sectionTitle: {
        fontSize: 10,
        color: "#94A3B8",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",

        letterSpacing: 1.5,

        marginLeft: 8,
        marginBottom: 10,
    },

    // ==================================================
    // FOOTER
    // ==================================================

    footer: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop:10,
        paddingBottom: 8,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: -3,
        },
        elevation: 8,
    },

    footerDivider: {
        height: 1,
        backgroundColor: "#EEF1F5",

        marginBottom: 10,
    },

    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        borderWidth: 1,
        borderColor: "#FFE0E0",
        borderRadius: 16,
        paddingHorizontal: 6,
        paddingVertical: 5,
    },

    logoutIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 12,
        backgroundColor: "#FFE7E7",
        justifyContent: "center",
        alignItems: "center",
    },

    logoutTextContainer: {
        flex: 1,
        marginLeft: 11,
    },

    logoutTitle: {
        fontSize: 12,
        color: "#B22222",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    logoutSubtitle: {
        fontSize: 8,
        color: "#A88",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        marginTop: 2,
    },

    versionText: {
        textAlign: "center",

        marginTop: 10,

        fontSize: 9,
        color: "#A0A8B5",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        letterSpacing: 0.5,
    },
});

export default CustomDrawer;