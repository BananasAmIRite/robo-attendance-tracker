import { View, Text, DimensionValue, StyleProp, ViewStyle } from 'react-native';

export interface ErrorBannerProps {
    minHeight?: DimensionValue;
    message: string;
    show: boolean;
    bannerStyle?: StyleProp<ViewStyle>;
}

export default function ErrorBanner(props: ErrorBannerProps) {
    return props.show ? (
        <View
            style={{
                width: '100%',
                minHeight: props.minHeight ?? '5%',
                height: 'auto',
                backgroundColor: 'red',
                justifyContent: 'center',
                // @ts-expect-error
                ...props.bannerStyle,
            }}
        >
            <Text style={{ color: 'white', alignSelf: 'center', fontSize: 16 }}>{props.message}</Text>
        </View>
    ) : (
        <></>
    );
}
