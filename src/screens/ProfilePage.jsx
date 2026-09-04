import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import CustomNavBar from "../helper/CustomNavBar";
import { handleLogout, logoutUser } from "../store/slice/Auth.slice";
import { useDispatch, useSelector } from "react-redux";
import PasswordModal from "../helper/PasswordModal";
import Toast from "react-native-toast-message";

// Replace these with your actual imports
// import CustomNavBar from "../components/CustomNavBar";
// import ChangePasswordModal from "../components/ChangePasswordModal";

const ProfilePage = ({ navigation }) => {

    const dispatch = useDispatch()

    const user = useSelector(state => state.auth.userData)
    const LoginStatus = useSelector(state => state.auth.status)
    const [passwordModalVisible, setPasswordModalVisible] = useState(false)

    const isActive = LoginStatus === "authenticated";

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
        <View style={styles.container}>

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#F8FAFC"
            />
            <CustomNavBar navName={"My Profile"} subtitle={"Manage your account"} />{/* HEADER */}
            {/* <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <FontAwesome6Icon
                        name="arrow-left"
                        size={16}
                        color="#1E293B"
                    />
                </TouchableOpacity>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>
                        My Profile
                    </Text>

                    <Text style={styles.headerSubtitle}>
                        Manage your account
                    </Text>
                </View>
            </View> */}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                {/* PROFILE CARD */}
                <View style={styles.profileCard}>

                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user.Emp?.charAt(0)?.toUpperCase()}
                        </Text>
                    </View>

                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>
                            {user.Emp}
                        </Text>

                        {!(user.UserType == "Customer") && <View style={styles.roleRow}>
                            <FontAwesome6Icon
                                name="user-shield"
                                size={11}
                                color="#4A90E2"
                            />

                            <Text style={styles.role}>
                                {user.UserType}
                            </Text>
                        </View>}

                        <Text style={styles.employeeId}>
                            {user.UserType == "Customer" ? "Customer ID" : "Employee ID"}: {user.EmpId}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            isActive
                                ? styles.activeBadge
                                : styles.inactiveBadge,
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                isActive
                                    ? styles.activeDot
                                    : styles.inactiveDot,
                            ]}
                        />

                        <Text
                            style={[
                                styles.statusText,
                                isActive
                                    ? styles.activeText
                                    : styles.inactiveText,
                            ]}
                        >
                            {isActive ? "Active" : "Inactive"}
                        </Text>
                    </View>

                </View>


                {/* COMPANY INFORMATION */}
                {!(user.UserType == "Customer") && <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        Company Information
                    </Text>

                    <View style={styles.infoCard}>

                        <InfoRow
                            icon="building"
                            label="Company"
                            value={user.CompanyName}
                        />

                        <View style={styles.divider} />

                        <InfoRow
                            icon="id-card"
                            label="Company ID"
                            value={user.Comid}
                        />

                        <View style={styles.divider} />

                        <InfoRow
                            icon="location-dot"
                            label="State"
                            value={user.StateName}
                        />

                        <View style={styles.divider} />

                        <InfoRow
                            icon="map"
                            label="State Code"
                            value={user.StateCode}
                        />

                    </View>

                </View>}


                {/* ACCOUNT INFORMATION */}
                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        Account Information
                    </Text>

                    <View style={styles.infoCard}>

                        <InfoRow
                            icon="user"
                            label={user.UserType == "Customer" ? "Customer ID" : "Employee ID"}
                            value={user.EmpId}
                        />

                        <View style={styles.divider} />

                        {!(user.UserType == "Customer") && <InfoRow
                            icon="user-shield"
                            label="Account Type"
                            value={user.UserType}
                        />}

                        <View style={styles.divider} />

                        <InfoRow
                            icon="circle-check"
                            label="Login Status"
                            value={isActive ? "Active" : "Inactive"}
                        />

                    </View>

                </View>


                {/* SECURITY */}
                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        Security
                    </Text>

                    <TouchableOpacity
                        style={styles.actionCard}
                        activeOpacity={0.75}
                        onPress={() => setPasswordModalVisible(true)}
                    >
                        <View style={styles.actionIcon}>
                            <FontAwesome6Icon
                                name="lock"
                                size={15}
                                color="#4A90E2"
                            />
                        </View>

                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>
                                Change Password
                            </Text>

                            <Text style={styles.actionSubtitle}>
                                Update your account password
                            </Text>
                        </View>

                        <FontAwesome6Icon
                            name="chevron-right"
                            size={13}
                            color="#94A3B8"
                        />
                    </TouchableOpacity>

                </View>


                {/* APP INFORMATION */}
                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        App Information
                    </Text>

                    <View style={styles.infoCard}>

                        <InfoRow
                            icon="mobile-screen"
                            label="Application"
                            value="SmartBiz"
                        />

                        <View style={styles.divider} />

                        <InfoRow
                            icon="code-branch"
                            label="Version"
                            value="1.0.0"
                        />

                    </View>

                </View>


                {/* LOGOUT */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    activeOpacity={0.8}
                    onPress={handleLogoutUser}
                >
                    <FontAwesome6Icon
                        name="right-from-bracket"
                        size={15}
                        color="#DC2626"
                    />

                    <Text style={styles.logoutText}>
                        Logout
                    </Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>
                    SmartBiz • Account Settings
                </Text>

            </ScrollView>


            <PasswordModal
                passwordModalVisible={passwordModalVisible}
                setPasswordModalVisible={setPasswordModalVisible}
            />

        </View>
    );
};


// =========================================================
// INFO ROW
// =========================================================

const InfoRow = ({ icon, label, value }) => {
    return (
        <View style={styles.infoRow}>

            <View style={styles.infoIcon}>
                <FontAwesome6Icon
                    name={icon}
                    size={13}
                    color="#4A90E2"
                />
            </View>

            <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>
                    {label}
                </Text>

                <Text style={styles.infoValue}>
                    {value || "Not available"}
                </Text>
            </View>

        </View>
    );
};


export default ProfilePage;


// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    header: {
        height: 78,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#EEF2F7",
    },

    backButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    headerTextContainer: {
        flex: 1,
    },

    headerTitle: {
        fontSize: 18,
        color: "#1E293B",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    headerSubtitle: {
        marginTop: 3,
        fontSize: 10,
        color: "#94A3B8",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },

    scrollContent: {
        padding: 16,
        paddingBottom: 30,
    },


    // =====================================================
    // PROFILE
    // =====================================================

    profileCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EEF2F7",
    },

    avatar: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: "#EAF3FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 13,
    },

    avatarText: {
        fontSize: 24,
        color: "#4A90E2",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    profileInfo: {
        flex: 1,
    },

    name: {
        fontSize: 16,
        color: "#1E293B",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    roleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },

    role: {
        marginLeft: 6,
        fontSize: 10,
        color: "#4A90E2",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    employeeId: {
        marginTop: 4,
        fontSize: 9,
        color: "#94A3B8",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },


    // =====================================================
    // STATUS
    // =====================================================

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: "flex-start",
    },

    activeBadge: {
        backgroundColor: "#ECFDF5",
    },

    inactiveBadge: {
        backgroundColor: "#FEF2F2",
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5,
    },

    activeDot: {
        backgroundColor: "#10B981",
    },

    inactiveDot: {
        backgroundColor: "#EF4444",
    },

    statusText: {
        fontSize: 8,
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    activeText: {
        color: "#059669",
    },

    inactiveText: {
        color: "#DC2626",
    },


    // =====================================================
    // SECTIONS
    // =====================================================

    section: {
        marginTop: 20,
    },

    sectionTitle: {
        fontSize: 11,
        color: "#475569",
        marginBottom: 9,
        marginLeft: 3,
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    infoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EEF2F7",
        paddingHorizontal: 13,
    },

    infoRow: {
        minHeight: 58,
        flexDirection: "row",
        alignItems: "center",
    },

    infoIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: "#EAF3FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 11,
    },

    infoTextContainer: {
        flex: 1,
    },

    infoLabel: {
        fontSize: 8,
        color: "#94A3B8",
        marginBottom: 3,
        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },

    infoValue: {
        fontSize: 11,
        color: "#1E293B",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginLeft: 45,
    },


    // =====================================================
    // ACTION
    // =====================================================

    actionCard: {
        minHeight: 70,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EEF2F7",
        paddingHorizontal: 13,
        flexDirection: "row",
        alignItems: "center",
    },

    actionIcon: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: "#EAF3FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    actionContent: {
        flex: 1,
    },

    actionTitle: {
        fontSize: 11,
        color: "#1E293B",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    actionSubtitle: {
        marginTop: 4,
        fontSize: 9,
        color: "#94A3B8",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },


    // =====================================================
    // LOGOUT
    // =====================================================

    logoutButton: {
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#FECACA",
        backgroundColor: "#FFF7F7",
        marginTop: 25,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    logoutText: {
        marginLeft: 9,
        fontSize: 11,
        color: "#DC2626",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    footerText: {
        textAlign: "center",
        marginTop: 15,
        fontSize: 8,
        color: "#CBD5E1",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },

});

