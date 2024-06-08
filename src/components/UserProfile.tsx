import { View, StyleSheet, Text, Button, StyleProp, ViewStyle } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { MainStyles } from '../styles/styles';

export interface UserProfileProps {
    name: string;
    id: string;
    scanTime: string;
    attendanceStatus: 'ABSENT' | 'PRESENT';
    action: 'SCAN_IN' | 'SCAN_OUT';
    profileStyle?: StyleProp<ViewStyle>;
}

export default function UserProfile(props: UserProfileProps) {
    return (
        <View
            style={{
                ...MainStyles.container,
                backgroundColor: 'white',
                // @ts-expect-error
                ...props.profileStyle,
                // padding: '10%',
                width: '100%',
                height: '100%',
            }}
        >
            <AntDesign name='checkcircle' size={128} color='green' style={{ alignSelf: 'center' }} />
            <View style={{ marginHorizontal: '1%', marginVertical: '5%' }}>
                <Text style={MainStyles.title}>{props.action == 'SCAN_IN' ? 'Welcome,' : 'Bye!'}</Text>
                <Text style={MainStyles.subtitle}>{props.name}</Text>
            </View>
            <Text style={MainStyles.subsubtitle}>
                You've been marked {props.attendanceStatus == 'ABSENT' ? 'Absent' : 'Present'}
            </Text>

            <Text style={{ ...MainStyles.text, textAlign: 'center', marginVertical: '2.5%' }}>
                Student ID: {props.id}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...MainStyles.text, color: 'black' }}>Scanned in at {props.scanTime}</Text>
            </View>
        </View>
    );
}
