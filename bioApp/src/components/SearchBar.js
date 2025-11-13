import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function SearchBar({ value, onChange }) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar productos"
        placeholderTextColor={colors.gray}
        value={value}
        onChangeText={onChange}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  input: {
    backgroundColor: colors.grayLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    color: colors.black,
  },
});