import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

const ModuleHeader = ({
    title,
    subtitle,
    buttonText,
    buttonIcon = "plus",
    onPress,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>
                    {title}
                </Text>

                <Text style={styles.subtitle}>
                    {subtitle}
                </Text>
            </View>

            <TouchableOpacity
                activeOpacity={0.85}
                style={styles.button}
                onPress={onPress}
            >
                <FontAwesome6
                    name={buttonIcon}
                    size={11}
                    color="#FFFFFF"
                />

                <Text style={styles.buttonText}>
                    {buttonText}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingTop: 4,
        paddingBottom: 8,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    textContainer: {
        flex: 1,
        marginRight: 12,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#172033",
    },

    subtitle: {
        marginTop: 3,
        fontSize: 10,
        color: "#8A94A6",
    },

    button: {
        minHeight: 38,
        paddingHorizontal: 13,

        borderRadius: 11,

        backgroundColor: "#4A90E2",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        elevation: 3,

        shadowColor: "#4A90E2",
        shadowOpacity: 0.18,
        shadowRadius: 7,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    buttonText: {
        marginLeft: 7,

        fontSize: 11,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});

export default ModuleHeader;