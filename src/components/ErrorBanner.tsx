import { useEffect, useReducer, useRef } from 'react';
import { View, Text, DimensionValue, StyleProp, ViewStyle, Animated } from 'react-native';
import { transform } from 'typescript';

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
