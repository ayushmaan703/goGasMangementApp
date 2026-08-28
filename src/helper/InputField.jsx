import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
} from "react-native";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";

const InputField = ({
    icon,
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    multiline = false,
    disabled = false,
    ...props
}) => {
    return (
        <View style={styles.inputWrapper}>

            <Text style={styles.inputLabel}>
                {label}
            </Text>

            <View
                style={[styles.inputContainer, multiline && styles.multilineContainer,]} >
                <View style={styles.inputIcon}>
                    <FontAwesome6Icon name={icon} size={14} color="#4A90E2" />
                </View>

                <TextInput
                    {...props}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#A8B2C1"
                    keyboardType={keyboardType}
                    multiline={multiline}
                    textAlignVertical={multiline ? "top" : "center"}
                    style={[styles.input, multiline && styles.multilineInput,]}
                    editable={!disabled}
                />
            </View>

        </View>
    );
};

export default InputField;

const styles = StyleSheet.create({
    // =========================================================
    // INPUT
    // =========================================================

    inputWrapper: {
        marginVertical: 8,
    },

    inputLabel: {
        fontSize: 8,

        color: "#64748B",

        marginBottom: 6,

        marginLeft: 2,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    inputContainer: {
        minHeight: 51,

        borderRadius: 14,

        backgroundColor: "#F8FAFC",

        borderWidth: 1,
        borderColor: "#E6EBF2",

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 9,
    },

    multilineContainer: {
        minHeight: 90,

        alignItems: "flex-start",

        paddingTop: 9,
    },

    inputIcon: {
        width: 34,
        height: 34,

        borderRadius: 10,

        backgroundColor: "#EAF3FF",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 9,
    },

    input: {
        flex: 1,

        color: "#1E293B",

        fontSize: 11,

        paddingVertical: 0,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },

    multilineInput: {
        minHeight: 70,

        paddingTop: 5,
    },

    // =========================================================
    // READ ONLY
    // =========================================================

    disabledInput: {
        backgroundColor: "#F1F5F9",
        borderColor: "#E2E8F0",
    },

    readOnlyText: {
        flex: 1,

        fontSize: 11,

        color: "#64748B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },
})