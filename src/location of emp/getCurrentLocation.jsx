import React, { useEffect, useState } from 'react';
import { View, Text, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

const LocationScreen = () => {
    const [region, setRegion] = useState(null);

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                let granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getCurrentLocation();
                } else {
                    granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    );
                }
            } else {
                let granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getCurrentLocation();
                } else {
                    granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    );
                }
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                console.log('Latitude:', latitude);
                console.log('Longitude:', longitude);
                setRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.001,   // Controls vertical zoom
                    longitudeDelta: 0.001,  // Controls horizontal zoom
                });
            },
            error => {
                console.error('Error getting location:', error.message);
            },
            { enableHighAccuracy: true },
        );
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            {region ? (
                <MapView style={styles.map}
                    region={region}
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                >
                    <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="You are here" />
                </MapView>
            ) : (
                <View style={styles.loadingContainer}>
                    <Text>Fetching location...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    map: {
        flex: 1,
        color: 'black',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LocationScreen;