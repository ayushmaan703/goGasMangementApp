import React, { useState } from 'react';
import { View, Text, Button, Platform, StyleSheet, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';


const DateSelector = () => {
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const showDatepicker = () => {
        setShow(true);
    };

    return (
        <View style={styles.dateContaniner}>
            <Pressable >
                <Text style={styles.btn} onPress={showDatepicker}>Select Date</Text>
            </Pressable>
            {/* <Text>Selected Date: {moment(date).format('DD-MMM-YYYY')}</Text> */}
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChange}
                />
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    dateContaniner: {
        padding: 10,
        width: "25%",
        backgroundColor: "#e9e9e9",
        borderRadius: 15,
    },
    btn: {
        fontWeight: 'bold'
    }
})
export default DateSelector;
