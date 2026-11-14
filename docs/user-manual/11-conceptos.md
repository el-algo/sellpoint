# Conceptos

Ideas que te ayudan a entender por qué SellPoint hace lo que hace.

## Quién puede hacer qué

| Tarea | Cajera | Dueña |
|---|:-:|:-:|
| Vender y cobrar | ✓ | ✓ |
| Aplicar descuento, quitar un producto o cancelar una venta | ✓ con NIP de la dueña | ✓ con su NIP |
| Fiados y abonos | ✓ | ✓ |
| Retiros y gastos | ✓ | ✓ |
| Corte de caja | ✓ | |
| Buscar precio y calculadora | ✓ | |
| Ver la lista de productos | ✓ desde el aviso | ✓ |
| Ver venta y ganancias del día | | ✓ |
| Agregar y cambiar productos, entrada de mercancía | | ✓ |
| Reportes | | ✓ |
| Administrar cajeros y cambiar el NIP de la dueña | | ✓ |

## El NIP de autorización

Algunas acciones en la venta piden el NIP de la dueña: **aplicar descuento**, **quitar** un producto y **cancelar esta venta**. Sirve para que nadie baje precios o borre ventas sin permiso. La dueña tiene que estar presente y escribir su NIP en la ventana **Autorización requerida**.

## Cómo se calcula el corte de caja

El corte cuenta todo lo que pasó **desde el último corte**:

| Concepto | Se suma o se resta |
|---|---|
| Ventas cobradas en **Efectivo** | Se suma |
| Abonos de fiados pagados en **Efectivo** | Se suma |
| **Retiros y gastos** | Se resta |
| Ventas por **Fiado** | No cuentan: no entró dinero |
| Ventas y abonos por transferencia | No cuentan: el dinero está en el banco |

El resultado es **Debe haber**. Cuentan las ventas de la cajera y de la dueña.

## Cómo se calculan las ganancias

**Ganancias de hoy** y **Me quedaron** se calculan así:

> Lo vendido − lo que costaron esos productos − gastos

Lo que costó cada producto se toma del campo **Me cuesta** en el momento de la venta. Si **Me cuesta** está en `0`, la ganancia saldrá más alta de lo real. Mantén el costo al día con [Entrada de mercancía](08-productos.md#registrar-una-entrada-de-mercancía).

Las ventas por fiado cuentan como vendidas el día de la venta, aunque todavía no te las paguen.

## Etiquetas de los productos

En la lista de **Productos**, cada producto puede tener una o dos etiquetas:

| Etiqueta | Color | Cuándo sale |
|---|---|---|
| **Agotado** | Rojo | La existencia está en 0. |
| **Poco stock** | Amarillo | Quedan igual o menos que **Avisarme cuando queden**. |
| **Caducado** | Rojo | Ya pasó la fecha de caducidad. |
| **Caduca hoy** | Amarillo | La fecha de caducidad es hoy. |
| **Caduca en N días** | Amarillo | Faltan 7 días o menos. |

Los productos agotados o con poco stock se cuentan en el aviso **productos por acabarse** del inicio.

## Piezas y kilos

Cada producto se vende por **Pieza** o por **Kilo**. Al agregar un producto a la venta, los botones **+** y **−** cambian de 1 en 1 en las piezas y de 0.25 en 0.25 en los kilos. Así puedes vender 0.25, 0.5 o 1.75 kg. En la venta, los productos por kilo muestran la cantidad con tres decimales, por ejemplo **0.750 kg**.
