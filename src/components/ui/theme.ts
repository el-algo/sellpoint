// Estilos compartidos para que todas las superficies se vean iguales:
// fondo blanco y borde gris, sin sombra.
const surface = {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#E2E8F0',
} as const;

// Contenedores: listas, tarjetas y paneles.
export const card = { ...surface, borderRadius: 14 } as const;

// Controles: campos, botones secundarios, chips y selectores.
export const control = { ...surface, borderRadius: 12 } as const;
