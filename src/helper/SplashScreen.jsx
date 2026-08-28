import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Animated,
} from 'react-native';

const SplashScreen = () => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        transform: [{ scale: scaleAnim }],
                    },
                ]}>
                <Image source={require('../data/logo-CCalxPd4.jpg')} style={styles.logo} />
                {/* <ActivityIndicator size="large" color="#d26e5b" style={styles.loader} /> */}
                {/* <Text style={styles.text}>Name</Text> */}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        backgroundColor: "#fff"
    },
    loader: {
        marginTop: 20,
    },
    text: {
        marginTop: 10,
        fontSize: 30,
        color: '#fff',
    },
});

export default SplashScreen;
