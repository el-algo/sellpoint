# Mapa del producto (notas de trabajo, no se publican)

**Producto:** SellPoint 1.0, punto de venta móvil (Expo/React Native) para "Abarrotes Doña Mari". Datos locales en SQLite, sin internet.

**Roles:** `admin` (se muestra "Dueña") y `cashier` (se muestra "Cajera"). Usuarios iniciales: Mari (admin, NIP 1234) y Lupita (cajera, NIP 0000).

## Pantallas

| Ruta | Título | Rol | Qué hace |
|---|---|---|---|
| / | SellPoint | todos | Elegir usuario + NIP de 4 dígitos (se verifica solo) |
| /cashier | Hola, {nombre} | cajera | Fiados, Calculadora, Corte de caja, Buscar precio, Retiros y gastos, Nueva venta |
| /admin | Hola, admin {nombre} | dueña | Venta/Ganancias de hoy, Fiados, Entrada de mercancía, Reportes, Productos, Retiros y gastos, Administrar cajeros |
| /sale | Venta #0001 | cajera | Lista, buscar, deshacer (4 s), descuento y cancelar con NIP admin, Cobrar |
| /search | Búsqueda | cajera | Buscar por nombre o código de barras, cantidad −/+, Añadir |
| /checkout | Cobrar $X | cajera | Efectivo (Recibí, 50/100/200/500, Cambio), Fiado (Nombre del deudor, máx 60), Transfer. |
| /receipt | Recibo | cajera | Venta registrada, Compartir, Regresar al inicio |
| /credit | Fiados | ambos | Total por cobrar, lista, Abono ≤ saldo, Registrar abono |
| /expenses | Retiros y gastos | ambos | Desde el último corte, Concepto (máx 60), Monto, Registrar |
| /cash-count | Corte de caja | cajera | Ventas en efectivo + Abonos − Retiros = Debe haber; ¿Cuánto contaste?; Cerrar turno (cierra sesión) |
| /calculator | Calculadora | cajera | |
| /price-lookup | Buscar precio | cajera | Recientes / Resultados de búsqueda |
| /inventory | Productos | dueña (y cajera desde la alerta) | Lista con etiquetas, + Agregar producto |
| /product | Nuevo/Editar producto | dueña | Campos y validaciones; eliminar bloqueado si hay ventas/entradas |
| /goods-receipt(-item) | Entrada de mercancía / Agregar producto | dueña | Suma existencia y actualiza costo |
| /reports | Reportes | dueña | Hoy/Semana/Mes, Vendí, Me costó, Gastos, Me quedaron, top 3 |
| /users, /cashier-registered | Cajeros / Registro exitoso | dueña | Alta, edición, baja de cajeros |

## Preguntas abiertas (VERIFY)

1. La dueña no tiene **Nueva venta** ni **Corte de caja** en su inicio. ¿Es a propósito?
2. La alerta "N productos por acabarse" lleva a la cajera a **Productos**, donde puede editar y eliminar productos.
3. El NIP de la dueña no se puede cambiar desde la app.
4. Al tocar un producto en la lista de la venta no pasa nada (no hay forma de quitar uno solo, salvo Deshacer).
5. El botón −/+ de cantidad sube de 1 en 1 también en productos por kilo.
6. El corte de caja cuenta todos los abonos como efectivo.
