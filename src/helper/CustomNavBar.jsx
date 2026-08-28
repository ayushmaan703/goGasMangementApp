import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';

const CustomNavBar = ({ navName, subtitle }) => {
    const navigation = useNavigation();
    const drawerNavigation = navigation.getParent();
    return (
        <View style={styles.header}>

            <View style={styles.headerTop}>
                <TouchableOpacity
                    style={styles.menuButton}
                    activeOpacity={0.8}
                    onPress={() => drawerNavigation?.openDrawer()}>
                    <FontAwesome6
                        name="bars"
                        size={18}
                        color="#1E293B"
                    />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>
                        Go Gas
                    </Text>

                    <Text style={styles.headerSubtitle}>
                        Customer Management
                    </Text>
                </View>

                <View style={styles.headerIcon}>
                    <MaterialIcons name="propane-tank" size={17} color="#4A90E2" />
                </View>

            </View>

            <View style={styles.greetingContainer}>

                <View>
                    <Text style={styles.greetingTitle}>
                        {navName}
                    </Text>
                    {subtitle && (
                        <Text style={styles.greetingSmall}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

        </View>
    )
}


const styles = StyleSheet.create({

    header: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 18,
        paddingBottom: 12,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        shadowColor: "#1E293B",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        paddingTop: 35,
        elevation: 5,
    },

    headerTop: {
        flexDirection: "row",
        alignItems: "center",
    },

    menuButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#F0F6FF",
        justifyContent: "center",
        alignItems: "center",
    },

    headerTitleContainer: {
        flex: 1,
        marginLeft: 12,
    },

    headerTitle: {
        fontSize: 20,
        color: "#1E293B",
        fontFamily:"Merriweather_24pt_SemiCondensed-SemiBold",
        letterSpacing: 0.5,
    },

    headerSubtitle: {
        marginTop: 2,
        fontSize: 9,
        color: "#94A3B8",
        fontFamily:  "Merriweather_24pt_SemiCondensed-Light",
        letterSpacing: 0.3,
    },

    headerIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "#EAF3FF",
        justifyContent: "center",
        alignItems: "center",
    },

    greetingContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },

    greetingSmall: {
        fontSize: 10,
        color: "#94A3B8",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        marginBottom: 3,
    },

    greetingTitle: {
        fontSize: 25,
        color: "#1E293B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    totalMiniCard: {
        minWidth: 65,

        paddingHorizontal: 10,
        paddingVertical: 8,

        borderRadius: 14,

        backgroundColor: "#F0F6FF",

        alignItems: "center",
    },

    totalMiniNumber: {
        fontSize: 17,
        color: "#4A90E2",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    totalMiniLabel: {
        fontSize: 8,
        color: "#7C8DA5",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Light",

        marginTop: 1,
    },

})
export default CustomNavBar