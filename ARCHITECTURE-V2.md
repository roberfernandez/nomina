# Nòmina V2 — contrato y límites

Cómputo es el único motor laboral. Nòmina combina sus resultados con reglas económicas documentadas. No importa nóminas, no consulta `metro-year-*`, no ejecuta `calcDay` y no mantiene importes observados del usuario.

## Contrato de intercambio

Clave anual `metro-payroll-facts-v1-AAAA` en `computo_sync` existente. Documento `schema: metro-payroll-facts-v1`, `year`, `profile` y `months` (meses 1–12).

El perfil contiene porcentaje efectivo, turno, subturno opcional y porcentaje ESTIU. Cada mes tiene esquema `computo-economic-facts-v1`, `producer: computo-aac`, `version: 1`, periodo YYYY-MM, perfil, días y totales. Cada día lleva fecha, horario y métricas `{state: known|pending, value: number|null, unit}`.

Métricas: ordinaryHours (h), nightPayableMinutes (min), horaNonaHours (h), plusFestiuDays, specialRetributiveDays, plusConveniDays, workedHolidayDays (day). Los cuartos de Hora Nona se expresan en horas, no en un segundo contador multiplicable por cuatro.

Los totales conservan valor conocido, unidad, número de fechas conocidas/pendientes/ausentes. Un valor pendiente no se convierte en cero. Fechas con horario por confirmar mantienen pendientes las magnitudes dependientes de ese horario. Los hechos independientes pueden conservarse.

`workedHolidayDays` permanece pendiente: no se equipara al contador Plus Festiu sin acreditar todos los requisitos económicos. Los otros contadores son hechos del Cómputo actual, no una garantía de derecho económico íntegro.

No se exportan identidad, notas, causas personales, imágenes ni diagnósticos del detector. Las fechas permiten justificar las unidades sin recalcularlas.

## Actualización y sincronización

Las ediciones de calendario y el guardado de perfil regeneran el export local inmediatamente. La hidratación, cambios de periodos y disponibilidad del calendario oficial también lo regeneran. Se usan los cálculos existentes; no se modifica ninguna regla laboral. El reset anual elimina su export con el mecanismo de borrado ya existente.

El prefijo se incluye en `computo_sync`. Las escrituras del mismo export se serializan para impedir que una petición antigua llegue después de una corrección nueva. La cola sin conexión existente se conserva.

Nòmina valida sesión y aprobación y lee únicamente el export del usuario autenticado mediante la clave publishable. No lee calendarios originales ni usa una copia local como alternativa a un fallo de autorización. El dato en otro dispositivo es el último export sincronizado, cuya fecha se muestra. Un cambio que siga sin conexión no puede aparecer todavía en otro dispositivo.

## Periodos e interfaz

Diccionario consultable sin datos personales: búsqueda, fichas y filtros de nómina ordinaria, pagas extra y ajustes/atrasos. Los nombres originales se conservan. Variantes similares no son alias automáticos.

Variables: mes anterior terminado asociado a liquidación a mes vencido; mes actual acumulado hasta hoy, separado como previsión. Terminado no significa certificado completo. Las magnitudes pendientes siguen visibles. Los componentes fijos pertenecen al mes actual; no se desplazan por la regla de los variables.

Pagas extra y ajustes/atrasos tienen su propio tratamiento y permanecen pendientes sin base/devengo/periodo de origen acreditados. No se mezclan con las unidades ordinarias.

Cálculos económicos habilitados: Hora Nona con tarifa sindical 2026 de 10,35 €/h; componente mensual íntegro AAC de 133,10 € × porcentaje; polivalencia AAC de 75,14 € × porcentaje. Los dos últimos no resuelven descuentos, altas parciales o condiciones individuales pendientes. Las tarifas no se extrapolan fuera de 2026.

Pendientes: tarifa precisa de Nocturnidad Variable; conversión económica de Plus Convenio, festivos y días especiales; bases vigentes de salario, antigüedad, prima fija y plus especial; extras, primas personales y atrasos sin datos acreditados.

## Investigación y publicación

Los PDF originales y ejemplos individuales se mantienen fuera del build. `private/dictionary-v2.json` está ignorado por Git y solo el servidor local de desarrollo lo sirve; sus ejemplos están identificados como documentales. No hay importación de PDFs en ejecución. La V1 queda conservada en el tag local `respaldo/v1-publicada`; su motor no se carga en la interfaz V2.

La prueba integrada utiliza productor y sincronizador reales con transporte simulado y almacenes de dos dispositivos separados. Antes de publicar falta comprobar el recorrido real con sesión aprobada y datos sincronizados en dos dispositivos, además de revisar los pendientes documentales que se quieran habilitar. No se ha publicado esta V2.

## Validación local (04/10/2026)

Nòmina: 50/50 pruebas; Cómputo: 64/72, con los mismos 8 fallos de la base (dos entornos de pruebas sin process, cuatro aserciones antiguas de reglas y dos de metadatos/CSS). Las 9 pruebas nuevas de export/sync pasan. Ambos builds estáticos completados. La comprobación TypeScript independiente conserva errores ajenos al export: tipado de baseStatus en periodos y tipos de Cloudflare.

Consulta de solo lectura al Supabase existente: RLS activo en computo_sync; SELECT/INSERT/UPDATE/DELETE requieren usuario propietario autenticado y solicitud aprobada. No hay restricción de prefijos en las constraints; no ha sido necesario cambiar esquema ni políticas. No se han consultado ni modificado datos personales para esta comprobación. La prueba real en dos dispositivos sigue pendiente.

Interfaz comprobada en navegador local: búsqueda, ficha sin datos, mes vencido y previsión separados, filtros de extra/ajustes y vista móvil. Sin errores de consola observados. El build incluye únicamente los módulos V2 y excluye el motor/adaptador de calendarios V1.

## Archivos de esta fase

Cómputo (`desarrollo/payroll-facts-v1`):
- app/page.tsx
- app/computo-sync.ts
- tests/helpers/calendar-context.mjs
- tests/payroll-facts.test.mjs
- tests/payroll-sync.test.mjs

Nòmina (`desarrollo/nomina-v2`):
- index.html
- src/app-v2.js
- src/computo-cloud-v2.js
- src/concept-model-v2.js
- src/dictionary-v2.js
- src/economics-v2.js
- src/style.css
- public/sw.js
- scripts/build.mjs
- scripts/serve.mjs
- tests/cloud-v2.test.mjs
- tests/concept-model-v2.test.mjs
- tests/economics-v2.test.mjs
- tests/payroll-contract.integration.test.mjs
- ARCHITECTURE-V2.md

Todo permanece local, sin commit, push, merge ni despliegue de esta fase.
