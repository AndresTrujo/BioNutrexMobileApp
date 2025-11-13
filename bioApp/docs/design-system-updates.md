# Actualizaciones del sistema de diseño (Tienda y Carrito)

## Filtros interactivos
- Nuevo patrón colapsable con botón `Filtros`.
- Animación de despliegue vertical de `300ms`.
- Mantiene consistencia con `colors.navy`, pill buttons y espaciado.

## Sistema de alertas
- Tipos: `success` (verde), `warning` (amarillo), `error` (rojo), `info` (azul).
- Posición por defecto en web: `bottom-right` para evitar interferir con navegación superior.
- Soporte de acción contextual (ej. botón "Ir al login").

## Tarjetas de producto (fuera de carrusel)
- Variante `fixed` con medidas estándar: alto mínimo `400px` e imagen `220px`.
- Imagen centrada con `contentFit="cover"` y texto alineado (nombre, precio, rating).
- Sombras suaves, bordes y espaciado uniformes.

## Carrito (UX/UI)
- Cabecera con jerarquía: título y subtítulo.
- Resumen de compra destacado con fondo claro y total enfatizado.
- Botón primario: "Pagar ahora"; secundarios: "Seguir comprando" y "Vaciar carrito".
- Miniaturas de productos y controles de cantidad.
- Feedback visual en todas las acciones (toasts).

## Accesibilidad y feedback
- Todos los botones clave tienen `accessibilityLabel` y roles apropiados.
- Alertas usan `accessibilityLiveRegion` en web para anuncios no intrusivos.

## Pruebas de usabilidad (plan)
- Reclutar al menos 5 usuarios representativos.
- Tareas: usar filtros, añadir/quitar del carrito, intentar wishlist sin login, completar pago de prueba.
- Métricas: tiempo de tarea, errores, satisfacción (CSAT), SUS.
- Iterar hallazgos en sprints de diseño.

## Notas de implementación
- `ToastProvider` expone `show({ message, type, icon, actionLabel, onAction })`.
- En `ShopScreen` usar `variant="fixed"` para tarjetas.
- El colapsado de filtros usa `Animated.timing` con altura medida por `onLayout`.