package com.googlesheetsquery;

import java.util.List;

public class ArrayUtils {
    public static <T> T getOrElse(List<T> arr, int index, T replacement) {
        try {
            return arr.get(index);
        } catch (IndexOutOfBoundsException err) {
            return replacement;
        }
    }
}
