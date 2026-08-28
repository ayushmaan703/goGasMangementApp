import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store.js';
import AppNavigator from './AppNavigator.jsx';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { PaperProvider } from 'react-native-paper';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

function App() {
  const toastConfig = {
    // success: props => (
    //   <BaseToast
    //     {...props}
    //     style={{ borderLeftColor: 'pink' }}
    //     contentContainerStyle={{ paddingHorizontal: 15 }}
    //     text1Style={{
    //       fontSize: 15,
    //       fontWeight: '400',
    //     }}
    //   />
    // ),
    // error: props => (
    //   <ErrorToast
    //     {...props}
    //     text1Style={{
    //       fontSize: 17,
    //     }}
    //     text2Style={{
    //       fontSize: 15,
    //     }}
    //   />
    // ),



    customNotificationSuccess: ({ text1 }) => (
      <View style={notificationStyles.wrapper}>
        <LinearGradient
          colors={["#4A90E2", "#3478C5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={notificationStyles.successContainer}
        >
          <View style={notificationStyles.iconCircle}>
            <FontAwesome6
              name="check"
              size={14}
              color="#4A90E2"
            />
          </View>

          <View style={notificationStyles.textContainer}>
            <Text style={notificationStyles.title}>
              Success
            </Text>

            <Text
              style={notificationStyles.message}
              numberOfLines={2}
            >
              {text1}
            </Text>
          </View>
        </LinearGradient>
      </View>
    ),

    customNotificationError: ({ text1 }) => (
      <View style={notificationStyles.wrapper}>
        <LinearGradient
          colors={["#EF6A6A", "#D64545"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={notificationStyles.errorContainer}
        >
          <View style={notificationStyles.errorIconCircle}>
            <FontAwesome6
              name="xmark"
              size={14}
              color="#D64545"
            />
          </View>

          <View style={notificationStyles.textContainer}>
            <Text style={notificationStyles.title}>
              Error
            </Text>

            <Text
              style={notificationStyles.message}
              numberOfLines={2}
            >
              {text1}
            </Text>
          </View>
        </LinearGradient>
      </View>
    ),
  };

  return (
    // <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider>
          <AppNavigator />
          <Toast config={toastConfig} />
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
    // </SafeAreaProvider>
  );
}

export default App;
const notificationStyles = StyleSheet.create({
  wrapper: {
    width: "88%",

    alignSelf: "center",

    borderRadius: 18,

    shadowColor: "#1E293B",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    elevation: 7,
  },

  // ============================================
  // SUCCESS
  // ============================================

  successContainer: {
    minHeight: 64,

    width: "100%",

    borderRadius: 18,

    paddingHorizontal: 14,
    paddingVertical: 10,

    flexDirection: "row",
    alignItems: "center",
  },

  // ============================================
  // ERROR
  // ============================================

  errorContainer: {
    minHeight: 64,

    width: "100%",

    borderRadius: 18,

    paddingHorizontal: 14,
    paddingVertical: 10,

    flexDirection: "row",
    alignItems: "center",
  },

  // ============================================
  // SUCCESS ICON
  // ============================================

  iconCircle: {
    width: 38,
    height: 38,

    borderRadius: 13,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 11,
  },

  // ============================================
  // ERROR ICON
  // ============================================

  errorIconCircle: {
    width: 38,
    height: 38,

    borderRadius: 13,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 11,
  },

  // ============================================
  // TEXT
  // ============================================

  textContainer: {
    flex: 1,

    justifyContent: "center",
  },

  title: {
    color: "#FFFFFF",

    fontSize: 11,

    marginBottom: 2,

    fontFamily:
      "Merriweather_24pt_SemiCondensed-SemiBold",

    letterSpacing: 0.4,
  },

  message: {
    color: "#FFFFFF",

    fontSize: 10,

    lineHeight: 15,

    fontFamily:
      "Merriweather_24pt_SemiCondensed-Regular",

    letterSpacing: 0.1,
  },
});