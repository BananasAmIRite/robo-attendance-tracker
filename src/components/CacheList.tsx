import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleProp, ViewStyle } from 'react-native';

export interface CacheListProps<T> {
    getCache: () => Promise<T[]>;
    cacheToValues: (t: T) => string[];
    labels: string[];
    style?: StyleProp<ViewStyle> | undefined;
}

export default function CacheList<T>(props: CacheListProps<T>) {
    const [cache, setCache] = useState<T[]>([]);

    useEffect(() => {
        props.getCache().then(setCache);
    });

    return (
        <ScrollView style={props.style}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <CacheListRow values={props.labels} />
                {cache.map((e, i) => (
                    <CacheListRow values={props.cacheToValues(e)} key={i} />
                ))}
            </View>
        </ScrollView>
    );
}

function CacheListRow(props: { values: string[] }) {
    return (
        <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }}>
            {props.values.map((e, i) => (
                <View style={{ flex: 1, alignSelf: 'stretch' }} key={i}>
                    <Text>{e}</Text>
                </View>
            ))}
        </View>
    );
}
