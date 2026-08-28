import PushNotification from 'react-native-push-notification';
export const sendNotification = () => {
    PushNotification.localNotification({
        channelId: 'default-channel',
        title: 'Hello!',
        message: 'This is a test notification!',
    });
};
