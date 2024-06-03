import { View, StyleSheet, Text, Button, StyleProp, ViewStyle } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export interface UserProfileProps {
    name: string;
    id: string;
    dailyInTime: string;
    dailyOutTime: string;
    attendanceStatus: 'ABSENT' | 'PRESENT';
    action: 'SCAN_IN' | 'SCAN_OUT';
    profileStyle?: StyleProp<ViewStyle>;
}

export default function UserProfile(props: UserProfileProps) {
    return (
        <View
            style={{
                ...styles.container,
                backgroundColor: 'white',
                // @ts-expect-error
                ...props.profileStyle,
            }}
        >
            <AntDesign name='checkcircle' size={128} color='green' style={{ alignSelf: 'center' }} />
            <View style={{ marginHorizontal: '1%', marginVertical: '5%' }}>
                <Text style={styles.title}>{props.action == 'SCAN_IN' ? 'Welcome,' : 'Bye!'}</Text>
                <Text style={styles.subtitle}>{props.name}</Text>
            </View>
            <Text style={styles.subsubtitle}>
                You've been marked {props.attendanceStatus == 'ABSENT' ? 'Absent' : 'Present'}
            </Text>

            <Text style={{ ...styles.text, textAlign: 'center', marginVertical: '2.5%' }}>Student ID: {props.id}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...styles.text }}>Time in: {props.dailyInTime}</Text>
                <Text style={{ ...styles.text }}>Time out: {props.dailyOutTime}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: '10%',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    text: {
        fontSize: 16,
        color: 'black',
    },
    title: {
        fontSize: 56,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    subsubtitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
});
