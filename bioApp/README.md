# bioApp – E-commerce de suplementación deportiva (React Native / Expo)

Aplicación móvil desarrollada con React Native (Expo) que incluye:

- Pantalla de inicio con productos destacados, promociones y categorías.
- Tienda con listado por categorías, filtros (tipo, marca, precio) y búsqueda.
- Detalle de producto con descripción, precio y valoraciones.
- Perfil de usuario con registro/login simulado, historial de pedidos, lista de deseos y ajustes.
- Carrito y checkout con opciones de envío y cálculos de subtotal, envío e impuestos.
- Integración de pagos con Stripe (modo pruebas, con opción de habilitar Payment Sheet real si se configura backend).

## Requisitos técnicos

- React Native (Expo SDK 54, RN versión estable)
- React Navigation
- Redux Toolkit para gestión de estado
- Diseño responsive con esquema de colores azul marino (`#000080`) y blanco (`#FFFFFF`)
- Iconos con `@expo/vector-icons` y estilo deportivo
- Optimización con `FlatList` y cálculos memorizados

## Estructura del proyecto

```
src/
  components/       # SearchBar, FilterBar, ProductCard
  data/             # Productos de ejemplo y categorías
  navigation/       # AppNavigator con tabs y stack
  screens/          # Home, Shop, ProductDetail, Cart, Profile
  services/         # Stripe Payment Sheet (opcional backend)
  store/            # Redux Toolkit slices y store
  theme/            # Colores y tema
```

## Instalación

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Ejecuta en web (para previsualizar UI):

   ```bash
   npm run web
   ```

3. Ejecuta en Android (emulador o dispositivo):

   - Requisitos: Android Studio + SDK, AVD, `adb` configurado.
   - Comando:

   ```bash
   npm run android
   ```

## Sistema de visualización de imágenes (SmartImage)

Para rendimiento y compatibilidad en web/móvil se usa `expo-image`.

- Dependencias: ya incluidas `expo-image` y `react-native-web`.
- Soporta formatos comunes: JPEG, PNG, GIF (también WebP en navegadores modernos).
- Caché: `memory-disk` por defecto (en web aprovecha la caché del navegador).
- Indicador de carga: spinner superpuesto hasta que la imagen está lista.
- Manejo de errores: muestra un fallback "Imagen no disponible" si falla la descarga o el `uri` es inválido.
- Visualización adaptable: control con `contentFit` (`cover`, `contain`), `borderRadius` y estilos responsivos.

Uso básico:

```jsx
import SmartImage from './src/components/SmartImage';

<SmartImage
  uri="https://cdn.example.com/img/producto.jpg"
  alt="Producto"
  style={{ width: '100%', height: 160, borderRadius: 8 }}
  contentFit="cover"
/>
```

Grid optimizado (virtualizado):

```jsx
import SmartImageGrid from './src/components/SmartImageGrid';

const items = [
  { id: '1', uri: 'https://picsum.photos/400/300' },
  { id: '2', uri: 'https://picsum.photos/500/300' },
  // ...
];

<SmartImageGrid items={items} numColumns={3} imageHeight={120} />
```

Requisitos especiales de configuración:

- Imágenes remotas deben permitir CORS (cabecera `Access-Control-Allow-Origin`) para que la web las cargue correctamente.
- Para mejor rendimiento, usa un CDN con compresión y tamaños ajustados; evita descargar originales muy grandes.
- Define tamaños (`width`/`height`) o `aspectRatio` para prevenir saltos de layout.
- Si necesitas placeholders borrosos, puedes añadir `placeholder` (blurhash) en `SmartImage`.

## Configuración de Stripe (modo real opcional)

La app incluye `StripeProvider`. Por defecto, usa una clave pública de prueba.

1. Define tu clave pública de Stripe:

   - Crea un archivo `.env` y exporta `EXPO_PUBLIC_STRIPE_PK` (o define variable en el sistema).
   - La app lee `extra.stripePublishableKey` desde `app.config.js`.

2. Backend para Payment Sheet:

   Implementa un endpoint que cree PaymentIntent y devuelva:

   ```json
   {
     "paymentIntent": "<client secret>",
     "ephemeralKey": "<ephemeral key secret>",
     "customer": "<customer id>"
   }
   ```

   Expón `extra.paymentEndpoint` en `app.config.js` (ej. `https://tu-backend.com`).

3. Comportamiento:

   - Si `paymentEndpoint` está configurado, se abrirá el Payment Sheet.
   - Si no, se usa un flujo simulado de pago en modo pruebas y se confirma el pedido.

## Construcción de APK

Tienes dos caminos:

- Expo (recomendado): usa EAS Build
  - Instala EAS: `npm install -g eas-cli`
  - Inicia sesión: `eas login`
  - Configura el proyecto: `eas build:configure`
  - Build Android (APK/AAB): `eas build -p android --profile preview`

- Bare React Native (local):
  - Prebuild: `npx expo prebuild -p android`
  - Abre `android/` en Android Studio y genera `assembleRelease`
  - O desde CLI:
    - En Windows: `cd android && .\gradlew assembleRelease`
  - APK se ubica en `android/app/build/outputs/apk/release/app-release.apk`

## Notas de rendimiento

- Listas con `FlatList` para virtualización.
- Memorizar cálculos de filtros y totales con `useMemo`.
- Reducir re-render al usar slices específicos y props simples.

## Licencia

Uso interno para pruebas y demostración. Ajusta según tus necesidades.