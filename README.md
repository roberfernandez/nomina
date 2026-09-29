# Nòmina · TMB Agent

Miniapp de consulta y estimación de conceptos AAC: https://roberfernandez.github.io/nomina/. Consulta independiente de los datos personales, enlazada desde TMB Agent. No modifica Cómputo AAC ni servicios externos. Sin dependencias npm ni backend.

## Abrir

Con el servidor encendido: http://127.0.0.1:5180/ (solo este ordenador).

Para arrancarlo de nuevo, abre una terminal en esta carpeta y ejecuta:

```sh
npm run build
npm start
```

La portada ofrece búsqueda y categorías sin periodo. El selector de actividad y los datos locales están en La meva nòmina.

## Recorrido de prueba

1. Abrir Conceptes, buscar «Nocturnidad» o «conveni» y consultar norma, tarifa del periodo, fórmula, particularidades, fuente y límites.
2. En Dades locals, pulsar Provar exemple fictici: genera 20 jornadas de 18:46–02:50, una jornada sin horario y descansos. No usa datos personales ni se puede guardar como perfil real.
3. Abrir Nocturnitat: muestra 161,3333 horas conocidas y una pendiente. Cada día válido contiene 290 minutos nocturnos físicos y 484 retribuibles.
4. Completar tarifa 2 y fuente «Prueba ficticia»: subtotal 322,67 €, sin doble porcentaje y sin monetizar el día pendiente. No es una tarifa real.
5. Completar perfil del periodo y confirmar mes íntegro elegible: Complement AAC 114,21 € y Polivalència 64,48 € al 85,81 %, con tarifas sindicales 2026 identificadas como tales. No certifican una nómina ni incluyen ajustes desconocidos.
6. Cambiar periodo: tarifas aportadas y confirmaciones no pasan a otro mes. En años sin tarifa acreditada no se hereda la más cercana.

## Estructura

- `src/catalogue.js`: ocho fichas editoriales, fuentes, conflictos y tarifas fechadas.
- `src/data.js`: adaptación de lectura de Cómputo, validación de importación y minimización de datos.
- `src/engine.js`: cálculo económico/granular independiente; no motor de horarios.
- `src/app.js` y `style.css`: interfaz catalana responsive, búsqueda, detalle y formularios.
- `tests/nomina.test.mjs`: escenarios sintéticos; ningún recibo o fotografía personal.
- `scripts/`: exportación estática y servidor local sin acceso exterior de datos.

## Integración real y limitación explícita

Se leen exclusivamente `metro-profile-v2` (v1 como alternativa) y `metro-year-AÑO`, en el mismo origen y navegador. Meses 1–12; situación final `days`, nunca `original` como situación efectiva. No se escribe, repara o migra ninguna clave de Cómputo. Perfil: turno y porcentaje; no nombre ni matrícula. Jornadas: fecha, situación, excepción y origen del año anterior; horario solo si está explícitamente personalizado. No se importan notas, fotografías ni credenciales.

El Cómputo publicado calcula horarios, categorías y nocturnidad en memoria; **no los persiste en esas claves ni tiene un exportador de esta instantánea**. Por tanto la V1 no puede recuperarlos automáticamente de localStorage. El adaptador aprovecha los hechos disponibles, permite completar intervalos declarados y acepta resultados diarios resueltos de la versión I-83 aprobada mediante un formato explícito. No copia horarios ni infiere categorías. La regla económica I-83 sí se aplica a intervalos declarados completos y confirmados como ordinarios, sin resolver excepciones.

Localhost no comparte almacenamiento con github.io. La integración automática queda implementada y cubierta con almacenes sintéticos, pero no probada con un perfil personal en producción. GitHub Pages comparte el origen con Cómputo; no incluye todavía transferencia de horarios resueltos. No se ha modificado Cómputo para ello.

## Instantánea de entrada

Formato propio, no exportación actualmente disponible en Cómputo. Ejemplo totalmente ficticio:

```json
{
  "schema": "nomina-facts-v1",
  "profile": { "turn": "T8", "percent": 85.81 },
  "days": [{
    "date": "2026-09-25", "status": "AGCG",
    "start": "18:46", "end": "02:50",
    "ordinaryConfirmed": true, "nonaEligible": false,
    "category": "DIVENDRES", "special": "NINGUNA"
  }]
}
```

Campos opcionales de resultados resueltos: `resolvedVersion` igual a `e5bbd59b2cfbfe2b0f68f4b93f6bc2d8f2b371d0`, `nightOverlapMinutes`, `nightPayableMinutes`, `nightReason`. Son datos declarados, no un certificado firmado. `null` conserva desconocido; nunca rellenar pendientes con cero. Se rechazan formato incompatible, fechas inválidas y duplicados. Solo se conservan campos permitidos.

## Cálculos y límites

- Nocturnidad: franja 22–06; >240 minutos paga toda la jornada ordinaria. No se vuelve a aplicar porcentaje. Excepciones pendientes prevalecen sobre la confirmación. Sin tarifa se mantienen unidades.
- Hora Nona: tramo 8a–9a, máximo una hora. Solo se monetizan cuartos exactos con ámbito declarado; residuos y otras jornadas siguen pendientes. No se usa el redondeo por exceso de Cómputo.
- AAC/polivalencia: componente mensual proporcional con tarifa fechada y confirmación de mes completo; ajustes/altas no se inventan.
- Vacaciones: días identificados y promedio individual aportado, con confirmación de liquidación; no otro porcentaje ni divisor inventado.
- Convenio/festivo/especial: normativa, candidatos y motivos; no se convierten en importes si faltan requisitos económicos. Convenio 75 % conserva la excepción. Vigilia y Día Especial se agrupan por evento.
- Los importes son estimaciones/subtotales. Redondeo a céntimos solo de presentación, sin afirmar algoritmo de nómina. No hay total neto, deducciones ni calendario universal de pago.

Las tarifas 2026 de Nona, AAC, Polivalència y Día Especial proceden de CGT Complements 2026 conservado en la investigación; se identifica expresamente su naturaleza sindical. Festiu trabajado usa las referencias anuales del XXVII. No se extrapolan tarifas históricas ni se deduce la horaria nocturna del 26 %. Las fuentes internas se enlazan y resumen; no se incluye el corpus ni documentos privados.

## Privacidad

Todo se calcula en el navegador. Sin peticiones a APIs, telemetría o Supabase. El servidor local usa `connect-src 'none'`. Solo se guarda una copia depurada al pulsar Guardar còpia local; tarifas y confirmaciones mensuales duran esta sesión. Se puede eliminar la copia sin tocar Cómputo. El almacenamiento local no es cifrado y el enlace externo de una fuente abre su web solo a petición.

## Verificación

`npm test`: 30 pruebas: las 24 iniciales del motor/adaptador más 6 de presentación e integración PWA, incluyendo límites, granularidad, proporcionalidad, vigencias, duplicados y privacidad. `npm run build`: exportación estática. La revisión en navegador incluye consulta sin datos, búsqueda, escenario sintético y tarifa aportada. La publicación usa GitHub Actions y Pages desde main.

