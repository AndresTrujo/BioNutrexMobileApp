import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme/colors';

/**
 * SmartImage
 * - Soporta formatos comunes (JPEG, PNG, GIF) via expo-image
 * - Caché: memory-disk por defecto
 * - Indicador de carga mientras descarga
 * - Manejo de errores con vista de fallback
 * - Opciones adaptables: contentFit, borderRadius, estilos responsivos
 */
export default function SmartImage({
  uri,
  alt = 'Imagen',
  style,
  contentFit = 'cover',
  borderRadius = 8,
  cachePolicy = 'memory-disk',
  showSpinner = true,
  transition = 200,
  onLoad,
  onError,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = (e) => {
    setLoading(false);
    onLoad?.(e);
  };
  const handleError = (e) => {
    setLoading(false);
    setError(true);
    onError?.(e);
  };

  if (!uri || error) {
    return (
      <View style={[styles.fallback, style, { borderRadius }]}> 
        <Text style={styles.fallbackText}>Imagen no disponible</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style, { borderRadius }]}> 
      <Image
        source={{ uri }}
        accessibilityLabel={alt}
        contentFit={contentFit}
        cachePolicy={cachePolicy}
        transition={transition}
        onLoad={handleLoad}
        onError={handleError}
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
      />
      {showSpinner && loading && (
        <View style={[styles.loaderWrap, { borderRadius }]}> 
          <ActivityIndicator color={colors.navy} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.grayLight,
    overflow: 'hidden',
  },
  loaderWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  fallback: {
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  fallbackText: { color: colors.gray },
});