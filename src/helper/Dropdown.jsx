import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    TextInput,
} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

const Dropdown = ({
    icon,
    label,
    value,
    placeholder,
    open,
    setOpen,
    data = [],
    onSelect,
    displayKey,
    loading,
}) => {
    const [search, setSearch] = useState("");

    // Clear search whenever dropdown closes
    useEffect(() => {
        if (!open) {
            setSearch("");
        }
    }, [open]);

    // Filter dropdown data
    const filteredData = useMemo(() => {
        if (!search.trim()) {
            return data;
        }

        const searchText = search.toLowerCase().trim();

        return data.filter((item) => {
            const itemName = item?.[displayKey];

            return String(itemName ?? "")
                .toLowerCase()
                .includes(searchText);
        });
    }, [data, search, displayKey]);

    const handleSelect = (item) => {
        onSelect(item);
        setSearch("");
        setOpen(false);
    };

    return (
        <View style={styles.inputWrapper}>

            <Text style={styles.inputLabel}>
                {label}
            </Text>

            {/* DROPDOWN BUTTON */}
            <TouchableOpacity
                activeOpacity={0.8}
                style={[
                    styles.dropdownButton,
                    open && styles.dropdownButtonActive,
                ]}
                onPress={() => setOpen(!open)}
            >
                <View style={styles.inputIcon}>
                    <FontAwesome6
                        name={icon}
                        size={14}
                        color="#4A90E2"
                    />
                </View>

                <Text
                    style={[
                        styles.dropdownText,
                        !value && styles.placeholderText,
                    ]}
                    numberOfLines={1}
                >
                    {value || placeholder}
                </Text>

                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color="#4A90E2"
                    />
                ) : (
                    <FontAwesome6
                        name={open ? "chevron-up" : "chevron-down"}
                        size={11}
                        color="#64748B"
                    />
                )}
            </TouchableOpacity>

            {/* DROPDOWN */}
            {open && (
                <View style={styles.dropdownList}>

                    {/* SEARCH */}
                    <View style={styles.searchContainer}>

                        <FontAwesome6
                            name="magnifying-glass"
                            size={12}
                            color="#94A3B8"
                        />

                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search..."
                            placeholderTextColor="#A8B2C1"
                            style={styles.searchInput}
                            autoCorrect={false}
                            autoCapitalize="none"
                        />

                        {search.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearch("")}
                                hitSlop={{
                                    top: 10,
                                    bottom: 10,
                                    left: 10,
                                    right: 10,
                                }}
                            >
                                <FontAwesome6
                                    name="circle-xmark"
                                    size={13}
                                    color="#94A3B8"
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* OPTIONS */}
                    <ScrollView
                        style={styles.dropdownScroll}
                        contentContainerStyle={styles.dropdownContent}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={true}
                        persistentScrollbar={true}
                        bounces={false}
                    >
                        {filteredData.length === 0 ? (
                            <View style={styles.emptyDropdown}>

                                <FontAwesome6
                                    name="circle-info"
                                    size={16}
                                    color="#94A3B8"
                                />

                                <Text style={styles.emptyText}>
                                    {search
                                        ? "No matching options"
                                        : "No options available"}
                                </Text>

                            </View>
                        ) : (
                            filteredData.map((item, index) => {

                                const itemName = item?.[displayKey];

                                const isSelected =
                                    value === itemName;

                                return (
                                    <TouchableOpacity
                                        key={`${item?.Id || item?.GSTCode || index}`}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.dropdownItem,
                                            isSelected &&
                                            styles.selectedDropdownItem,
                                        ]}
                                        onPress={() =>
                                            handleSelect(item)
                                        }
                                    >

                                        <Text
                                            style={[
                                                styles.dropdownItemText,
                                                isSelected &&
                                                styles.selectedDropdownItemText,
                                            ]}
                                            numberOfLines={2}
                                        >
                                            {itemName}
                                        </Text>

                                        {isSelected && (
                                            <FontAwesome6
                                                name="check"
                                                size={12}
                                                color="#4A90E2"
                                            />
                                        )}

                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </ScrollView>

                </View>
            )}

        </View>
    );
};

export default Dropdown;

const styles = StyleSheet.create({

    inputWrapper: {
        marginBottom: 14,
    },

    inputLabel: {
        fontSize: 10,
        color: "#475569",
        marginBottom: 6,
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    dropdownButton: {
        minHeight: 51,
        borderRadius: 14,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E6EBF2",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 9,
    },

    dropdownButtonActive: {
        borderColor: "#4A90E2",
        backgroundColor: "#F7FBFF",
    },

    dropdownText: {
        flex: 1,
        fontSize: 11,
        color: "#1E293B",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
        marginRight: 8,
    },

    placeholderText: {
        color: "#A8B2C1",
        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
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

    dropdownList: {
        marginTop: 5,
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "#E5EAF0",
        overflow: "hidden",

        shadowColor: "#1E293B",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 5,
        },

        elevation: 5,
    },

    /* SEARCH */

    searchContainer: {
        height: 42,
        margin: 8,
        paddingHorizontal: 11,

        flexDirection: "row",
        alignItems: "center",

        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E6EBF2",

        backgroundColor: "#F8FAFC",
    },

    searchInput: {
        flex: 1,

        marginLeft: 8,

        paddingVertical: 0,

        fontSize: 10,

        color: "#1E293B",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },

    /* SCROLL */

    dropdownScroll: {
        maxHeight: 220,
    },

    dropdownContent: {
        paddingBottom: 2,
    },

    /* ITEMS */

    dropdownItem: {
        minHeight: 48,

        paddingHorizontal: 14,

        flexDirection: "row",
        alignItems: "center",

        justifyContent: "space-between",

        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },

    selectedDropdownItem: {
        backgroundColor: "#EAF3FF",
    },

    dropdownItemText: {
        flex: 1,

        fontSize: 10,

        color: "#475569",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",

        marginRight: 8,
    },

    selectedDropdownItemText: {
        color: "#3478C5",

        fontFamily:
            "Merriweather_24pt_SemiCondensed-SemiBold",
    },

    emptyDropdown: {
        minHeight: 80,

        justifyContent: "center",
        alignItems: "center",
    },

    emptyText: {
        fontSize: 9,

        color: "#94A3B8",

        marginTop: 6,

        fontFamily:
            "Merriweather_24pt_SemiCondensed-Regular",
    },
});