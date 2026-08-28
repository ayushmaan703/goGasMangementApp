import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GradientButton = ({ title, onPress, icon }) => {
    return (
        <LinearGradient
            colors={['#EE9AE5', '#7B7ED1']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
        >
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.pressable,
                    { opacity: pressed ? 0.2 : 1 }, // Smooth press effect
                ]}
            >
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text>{icon}</Text>
                    <Text style={styles.buttonText}>{title}</Text>
                </View>
            </Pressable>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        marginVertical: 5,
        marginHorizontal: 5,
        borderRadius: 25,
        overflow: 'hidden', // Ensures the press effect applies to the whole button
    },
    pressable: {
        paddingVertical: 13,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'flex-start'
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 500,
        marginLeft: 10
    },
});

export default GradientButton;
