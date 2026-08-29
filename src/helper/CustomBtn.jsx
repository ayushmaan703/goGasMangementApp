import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

const CustomBtn = ({
  onPress,
  title,
  icon,
  isActive,
  setActive,
  navigation,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.customButton,
        isActive && styles.activeButton,
      ]}
      onPress={() => {
        setActive(title);
        navigation && navigation.closeDrawer();
        onPress && onPress();
      }}
      activeOpacity={0.75}
    >
      {/* Left active indicator */}
      {isActive && (
        <View style={styles.activeIndicator} />
      )}

      <View style={styles.buttonContent}>

        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            isActive && styles.activeIconContainer,
          ]}
        >
          <FontAwesome6
            name={icon}
            size={12}
            color={
              isActive
                ? "#FFFFFF"
                : "#4A90E2"
            }
          />
        </View>

        {/* Title */}
        <Text
          style={[
            styles.buttonText,
            isActive && styles.activeText,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Active arrow */}
        {isActive && (
          <View style={styles.arrowContainer}>
            <FontAwesome6
              name="chevron-right"
              size={11}
              color="#4A90E2"
            />
          </View>
        )}

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({

  // ==========================================
  // BUTTON
  // ==========================================

  customButton: {
    position: "relative",
    width: "100%",
    marginVertical: 2,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "transparent",
    overflow: "hidden",
  },

  activeButton: {
    backgroundColor: "#EAF3FF",
    shadowColor: "#4A90E2",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  // ==========================================
  // ACTIVE INDICATOR
  // ==========================================

  activeIndicator: {
    position: "absolute",

    left: 0,
    top: 10,
    bottom: 10,

    width: 4,

    borderRadius: 4,

    backgroundColor: "#4A90E2",
  },

  // ==========================================
  // CONTENT
  // ==========================================

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  // ==========================================
  // ICON
  // ==========================================

  iconContainer: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#F0F6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  activeIconContainer: {
    backgroundColor: "#4A90E2",
    shadowColor: "#4A90E2",
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  // ==========================================
  // TEXT
  // ==========================================

  buttonText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    fontFamily:"Merriweather_24pt_SemiCondensed-SemiBold",
    letterSpacing: 0.3,
  },

  activeText: {
    color: "#1D5FA7",
  },

  // ==========================================
  // ARROW
  // ==========================================

  arrowContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 2,
  },
});

export default CustomBtn;