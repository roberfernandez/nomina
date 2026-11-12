export const dictionary = [
  {
    "id": "0",
    "name": "Abonos Diversos",
    "types": [
      "nomina"
    ],
    "description": "Abono de origen específico. En agosto de 2026 la nota del recibo lo vincula a una prolongación de jornada; no es una regla universal.",
    "formula": "Pendiente de documentar",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "1",
    "name": "Ajuste IRPF en paga Extra",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "2",
    "name": "Antigüedad",
    "types": [
      "nomina"
    ],
    "description": "Retribución vinculada a la antigüedad individual; no basta con conocer el porcentaje contractual. La nómina mensual normalmente no desglosa la base completa ni el porcentaje en esta línea.",
    "formula": "Importe mensual impreso. Base y porcentaje se contrastan con extras, no se reconstruyen desde un único abono.",
    "kind": "Fijo · base a acreditar",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "3",
    "name": "Antigüedad PE Diciembre",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Retribución vinculada a la antigüedad individual; no basta con conocer el porcentaje contractual. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "4",
    "name": "Antigüedad PE Junio",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Retribución vinculada a la antigüedad individual; no basta con conocer el porcentaje contractual. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "5",
    "name": "Antigüedad PE Marzo",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Retribución vinculada a la antigüedad individual; no basta con conocer el porcentaje contractual. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "6",
    "name": "Antigüedad PE Setiembre",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Retribución vinculada a la antigüedad individual; no basta con conocer el porcentaje contractual. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "7",
    "name": "Ayuda Escolar",
    "types": [
      "nomina"
    ],
    "description": "TMB imprime cantidad, precio e importe cuando dispone de ese desglose. Las unidades personales nunca se obtienen de estos ejemplos.",
    "formula": "Unidades de Cómputo × tarifa acreditada para el periodo",
    "kind": "Variable",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "8",
    "name": "Compl. variable formación",
    "types": [
      "nomina"
    ],
    "description": "Importe identificado en los recibos TMB. El origen exacto y la fórmula requieren documentación adicional.",
    "formula": "Pendiente de documentar",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "9",
    "name": "Crédito",
    "types": [
      "nomina"
    ],
    "description": "Importe identificado en los recibos TMB. El origen exacto y la fórmula requieren documentación adicional.",
    "formula": "Pendiente de documentar",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "10",
    "name": "Cto. Atención Cliente",
    "types": [
      "nomina"
    ],
    "description": "Complemento de categoría AAC. La proporcionalidad está descrita en la documentación de V1; el importe histórico no se extiende automáticamente a otros años.",
    "formula": "Pendiente de documentar",
    "kind": "Proporcional · ámbito a confirmar",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "11",
    "name": "Cuota Sindical COS",
    "types": [
      "nomina"
    ],
    "description": "Descuento por cuota sindical. Es individual; no se aplica a todos los trabajadores ni se multiplica automáticamente por el contrato.",
    "formula": "Pendiente de documentar",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "12",
    "name": "Diferencias Seg Social",
    "types": [
      "nomina"
    ],
    "description": "Regularización de cotizaciones mostrada en descuentos. El recibo no permite reconstruir por sí solo su base y motivo.",
    "formula": "Pendiente de documentar",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "13",
    "name": "Dto Antigüedad",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "14",
    "name": "Dto Antigüedad IT",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "15",
    "name": "Dto Plus Especial",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "16",
    "name": "Dto Plus Especial IT",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "17",
    "name": "Dto Prima Fija",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "18",
    "name": "Dto Prima Fija IT",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "19",
    "name": "Dto Salario Base",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "20",
    "name": "Dto Salario Base IT",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "21",
    "name": "Dto. Antig PE Dic Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "22",
    "name": "Dto. Antig PE Jun Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "23",
    "name": "Dto. Antig PE Mar Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "24",
    "name": "Dto. Antig PE Sep Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "25",
    "name": "Dto. Antigüedad Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "26",
    "name": "Dto. Atenc Client Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "27",
    "name": "Dto. Cto. Atenc. Cl. IT",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "28",
    "name": "Dto. Cto. Atención Client",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "29",
    "name": "Dto. Pl Esp PE Dic Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "30",
    "name": "Dto. Pl Esp PE Jun Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "31",
    "name": "Dto. Pl Esp PE Mar Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "32",
    "name": "Dto. Pl Esp PE Sep Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "33",
    "name": "Dto. Plus Especial Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "34",
    "name": "Dto. Plus Polival. Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "35",
    "name": "Dto. Pr Fija PE Dic Huelg",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "36",
    "name": "Dto. Pr Fija PE Jun Huelg",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "37",
    "name": "Dto. Pr Fija PE Mar Huelg",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "38",
    "name": "Dto. Pr Fija PE Sep Huelg",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "39",
    "name": "Dto. Pr. Polival. AAC",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "40",
    "name": "Dto. Pr. Polival. AAC IT",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "41",
    "name": "Dto. Prima Fija Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "42",
    "name": "Dto. S Base PE Dic Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "43",
    "name": "Dto. S Base PE Jun Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "44",
    "name": "Dto. S Base PE Mar Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "45",
    "name": "Dto. S Base PE Sep Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "46",
    "name": "Dto. Salario Base Huelga",
    "types": [
      "nomina"
    ],
    "description": "Descuento o ajuste identificado por TMB. Se conserva separado del abono del concepto.",
    "formula": "No se deduce un divisor ni una regla de descuento a partir del importe.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "47",
    "name": "Gratificación Vacaciones",
    "types": [
      "nomina"
    ],
    "description": "Importe identificado en los recibos TMB. El origen exacto y la fórmula requieren documentación adicional.",
    "formula": "Pendiente de documentar",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "48",
    "name": "Horas Cómputo TP",
    "types": [
      "nomina"
    ],
    "description": "Importe identificado en los recibos TMB. El origen exacto y la fórmula requieren documentación adicional.",
    "formula": "Pendiente de documentar",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "49",
    "name": "Nocturnidad Variable",
    "types": [
      "nomina"
    ],
    "description": "TMB imprime cantidad, precio e importe cuando dispone de ese desglose. Las unidades personales nunca se obtienen de estos ejemplos. La mayoría de multiplicaciones con el precio impreso no reproduce exactamente el abono: la causa no está acreditada (podría haber precisión no visible u otros ajustes). No se presenta ese precio como liquidación exacta.",
    "formula": "Unidades de Cómputo × tarifa acreditada para el periodo",
    "kind": "Variable",
    "metric": "nightPayableMinutes",
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "50",
    "name": "P.Festivo Oficial E",
    "types": [
      "nomina"
    ],
    "description": "TMB imprime cantidad, precio e importe cuando dispone de ese desglose. Las unidades personales nunca se obtienen de estos ejemplos.",
    "formula": "Unidades de Cómputo × tarifa acreditada para el periodo",
    "kind": "Variable",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "51",
    "name": "P.Festivo Trabajado E",
    "types": [
      "nomina"
    ],
    "description": "TMB imprime cantidad, precio e importe cuando dispone de ese desglose. Las unidades personales nunca se obtienen de estos ejemplos.",
    "formula": "Unidades de Cómputo × tarifa acreditada para el periodo",
    "kind": "Variable",
    "metric": "workedHolidayDays",
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "52",
    "name": "Plus Convenio",
    "types": [
      "nomina"
    ],
    "description": "TMB imprime cantidad, precio e importe cuando dispone de ese desglose. Las unidades personales nunca se obtienen de estos ejemplos.",
    "formula": "Unidades de Cómputo × tarifa acreditada para el periodo",
    "kind": "Variable",
    "metric": "plusConveniDays",
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "53",
    "name": "Plus Especial",
    "types": [
      "nomina"
    ],
    "description": "Complemento fijo identificado por TMB. La nómina mensual normalmente no desglosa la base completa ni el porcentaje en esta línea.",
    "formula": "Importe mensual impreso. Base y porcentaje se contrastan con extras, no se reconstruyen desde un único abono.",
    "kind": "Fijo · base a acreditar",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "54",
    "name": "Plus Especial PE Diciembr",
    "types": [
      "paga_extra"
    ],
    "description": "Complemento fijo identificado por TMB. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "55",
    "name": "Plus Especial PE Junio",
    "types": [
      "paga_extra"
    ],
    "description": "Complemento fijo identificado por TMB. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "56",
    "name": "Plus Especial PE Marzo",
    "types": [
      "paga_extra"
    ],
    "description": "Complemento fijo identificado por TMB. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "57",
    "name": "Plus Especial PE Setiembr",
    "types": [
      "paga_extra"
    ],
    "description": "Complemento fijo identificado por TMB. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "58",
    "name": "Plus Festivo Oficial",
    "types": [
      "nomina"
    ],
    "description": "Plus por trabajar en un festivo oficial. Si el turno empieza la víspera y continúa después de medianoche, las horas dentro del festivo pueden generar el derecho. En la previsión de Còmput, el mismo festivo cuenta como máximo una vez aunque se trabaje tanto la víspera como el propio festivo. No equivale al plus dominical ni al Plus día Especial.",
    "formula": "Unidades por festivo oficial elegible (no por turno) × tarifa del periodo. Referencia 2026: 90,00 € × porcentaje de contratación ÷ 100 por unidad. Umbral previsto: 4 h a jornada completa o 2 h a tiempo parcial dentro del festivo.",
    "kind": "Variable · festivo oficial",
    "metric": null,
    "limits": "Criterio de previsión de Còmput, pendiente de contrastar con más desgloses diarios oficiales. Ejemplo contrastado: el turno iniciado el 11/10/2026 y continuado hasta el 12/10 genera una unidad que SAP atribuye al 11/10; la nómina paga 77,23 € con un contrato del 85,81 %. Hay exclusiones por descanso semanal propio y compatibilidades específicas con Plus día Especial. El mes de liquidación de otros casos requiere conciliación."
  },
  {
    "id": "59",
    "name": "Plus Festivo Trabajado",
    "types": [
      "nomina"
    ],
    "description": "TMB imprime cantidad, precio e importe cuando dispone de ese desglose. Las unidades personales nunca se obtienen de estos ejemplos.",
    "formula": "Unidades de Cómputo × tarifa acreditada para el periodo",
    "kind": "Variable",
    "metric": "workedHolidayDays",
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "60",
    "name": "Plus día Especial",
    "types": [
      "nomina"
    ],
    "description": "TMB imprime cantidad, precio e importe cuando dispone de ese desglose. Las unidades personales nunca se obtienen de estos ejemplos.",
    "formula": "Unidades de Cómputo × tarifa acreditada para el periodo",
    "kind": "Variable",
    "metric": "specialRetributiveDays",
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "61",
    "name": "Pr.Polivalencia AAC",
    "types": [
      "nomina"
    ],
    "description": "Complemento de categoría AAC. La proporcionalidad está descrita en la documentación de V1; el importe histórico no se extiende automáticamente a otros años.",
    "formula": "Pendiente de documentar",
    "kind": "Proporcional · ámbito a confirmar",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "62",
    "name": "Prestación AT y EP",
    "types": [
      "nomina"
    ],
    "description": "TMB imprime cantidad, precio e importe cuando dispone de ese desglose. Las unidades personales nunca se obtienen de estos ejemplos.",
    "formula": "Unidades de Cómputo × tarifa acreditada para el periodo",
    "kind": "Variable",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "63",
    "name": "Prima Fija",
    "types": [
      "nomina"
    ],
    "description": "Componente fijo identificado por TMB. La nómina mensual normalmente no desglosa la base completa ni el porcentaje en esta línea.",
    "formula": "Importe mensual impreso. Base y porcentaje se contrastan con extras, no se reconstruyen desde un único abono.",
    "kind": "Fijo · base a acreditar",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "64",
    "name": "Prima Fija PE Diciembre",
    "types": [
      "paga_extra"
    ],
    "description": "Componente fijo identificado por TMB. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "65",
    "name": "Prima Fija PE Junio",
    "types": [
      "paga_extra"
    ],
    "description": "Componente fijo identificado por TMB. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "66",
    "name": "Prima Fija PE Marzo",
    "types": [
      "paga_extra"
    ],
    "description": "Componente fijo identificado por TMB. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "67",
    "name": "Prima Fija PE Setiembre",
    "types": [
      "paga_extra"
    ],
    "description": "Componente fijo identificado por TMB. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "68",
    "name": "Prima Fin de Año",
    "types": [
      "nomina"
    ],
    "description": "Importe identificado en los recibos TMB. El origen exacto y la fórmula requieren documentación adicional.",
    "formula": "Pendiente de documentar",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "69",
    "name": "Prima Hora Nona",
    "types": [
      "nomina"
    ],
    "description": "TMB imprime cantidad, precio e importe cuando dispone de ese desglose. Las unidades personales nunca se obtienen de estos ejemplos.",
    "formula": "Unidades de Cómputo × tarifa acreditada para el periodo",
    "kind": "Variable",
    "metric": "horaNonaHours",
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "70",
    "name": "Prima Noche de la Mercé",
    "types": [
      "nomina"
    ],
    "description": "Importe identificado en los recibos TMB. El origen exacto y la fórmula requieren documentación adicional.",
    "formula": "Pendiente de documentar",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "71",
    "name": "Prima Var. Productividad",
    "types": [
      "nomina"
    ],
    "description": "Prima anual de productividad que se abona con la nómina de octubre, habitualmente percibida en noviembre. En octubre de 2026 la base del recibo es 1.300,00 € y se aplica el porcentaje de contratación.",
    "formula": "1.300,00 € × porcentaje de contratación ÷ 100 (base documentada en 2026)",
    "kind": "Anual · proporcional",
    "metric": null,
    "limits": "El mes de abono es octubre. La base de 1.300,00 € está acreditada en el recibo de octubre de 2026; para años posteriores se muestra como previsión hasta confirmar su vigencia. No se aplica fuera de octubre ni se suma como paga extraordinaria."
  },
  {
    "id": "72",
    "name": "Primas en Vacaciones",
    "types": [
      "nomina"
    ],
    "description": "TMB imprime cantidad, precio e importe cuando dispone de ese desglose. Las unidades personales nunca se obtienen de estos ejemplos.",
    "formula": "Unidades de Cómputo × tarifa acreditada para el periodo",
    "kind": "Variable",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "73",
    "name": "Salario Base",
    "types": [
      "nomina"
    ],
    "description": "Retribución base de la categoría. La nómina mensual normalmente no desglosa la base completa ni el porcentaje en esta línea.",
    "formula": "Importe mensual impreso. Base y porcentaje se contrastan con extras, no se reconstruyen desde un único abono.",
    "kind": "Fijo · base a acreditar",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "74",
    "name": "Salario Base PE Diciembre",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Retribución base de la categoría. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "75",
    "name": "Salario Base PE Junio",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Retribución base de la categoría. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "76",
    "name": "Salario Base PE Marzo",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Retribución base de la categoría. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "77",
    "name": "Salario Base PE Setiembre",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Retribución base de la categoría. En la extra figuran cantidad porcentual, precio base y abono. Hay diferencias de céntimos en algunos recibos: la causa de esas diferencias no está acreditada.",
    "formula": "Base de la paga × porcentaje impreso ÷ 100",
    "kind": "Proporcional documentado",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "78",
    "name": "Total Retroactividad",
    "types": [
      "nomina"
    ],
    "description": "Resumen de ajustes de periodos anteriores. No es una nueva tarifa ni debe sumarse otra vez a sus líneas de detalle.",
    "formula": "Pendiente de documentar",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "79",
    "name": "Turno Noche PE Diciembre",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Componente de nocturnidad de la paga extra. Se imprime un importe sin cantidad ni precio.",
    "formula": "Los recibos no demuestran base × porcentaje. No se calcula automáticamente.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "80",
    "name": "Turno Noche PE Junio",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Componente de nocturnidad de la paga extra. Se imprime un importe sin cantidad ni precio.",
    "formula": "Los recibos no demuestran base × porcentaje. No se calcula automáticamente.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "81",
    "name": "Turno Noche PE Marzo",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Componente de nocturnidad de la paga extra. Se imprime un importe sin cantidad ni precio.",
    "formula": "Los recibos no demuestran base × porcentaje. No se calcula automáticamente.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "82",
    "name": "Turno Noche PE Septiembre",
    "types": [
      "nomina",
      "paga_extra"
    ],
    "description": "Componente de nocturnidad de la paga extra. Se imprime un importe sin cantidad ni precio.",
    "formula": "Los recibos no demuestran base × porcentaje. No se calcula automáticamente.",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  },
  {
    "id": "83",
    "name": "Uniformes y Equipos",
    "types": [
      "nomina"
    ],
    "description": "Importe identificado en los recibos TMB. El origen exacto y la fórmula requieren documentación adicional.",
    "formula": "Pendiente de documentar",
    "kind": "Pendiente",
    "metric": null,
    "limits": "Ejemplos documentales individuales, no datos actuales del usuario. La aparición en un recibo normal puede ser una retroactividad de una paga extra. No acredita una tarifa universal."
  }
];
