import { StyleSheet } from 'react-native';

export const MainStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    darkenedContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
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
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
});
