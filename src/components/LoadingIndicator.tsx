import { ActivityIndicator } from 'react-native';

export default function LoadingIndicator(props: { size?: number }) {
    return <ActivityIndicator size={props.size ?? 20} />; // here for future customization + standardization
}
