// Economic meaning is explicit; similar payroll labels are not aliases.
const proportional = base => ({status:'documented',formula:'base-times-contract',base,source:'CGT · Complements salarials 2026; fitxes I-97_1 / I-107_2',from:'2026-01',to:'2026-12',scopeConfirmed:true});
const notes = {
 'Nocturnidad Variable':'Cómputo entrega minutos abonables, no solo minutos de reloj. Nòmina no repite la regla de las cuatro horas ni aplica otra vez el porcentaje contractual. La tarifa horaria vigente y su precisión siguen pendientes.',
 'Prima Hora Nona':'Cómputo resuelve las unidades en horas, incluidas las fracciones de cuarto de hora. Nòmina se limita a multiplicarlas; no reconstruye horarios ni impone un segundo redondeo.',
 'Plus Convenio':'El contador de Cómputo no acredita por sí solo puntualidad, reducciones o equivalencia diaria de todos los contratos. Se muestra como hecho laboral; su conversión económica sigue pendiente.',
 'Plus Festivo Trabajado':'Es distinto del festivo oficial y del Día Especial. Cómputo no exporta todavía unidades retributivas específicas resueltas para este concepto; el contador Plus Festiu no se toma automáticamente como equivalente.',
 'P.Festivo Trabajado E':'Se conserva esta denominación separada. No se equipara al Plus Festivo Trabajado ni se asignan unidades por semejanza del nombre.',
 'Plus Festivo Oficial':'No equivale al domingo trabajado, al código operativo DIUMENGE ni al Día Especial. Faltan unidades específicas resueltas por Cómputo.',
 'P.Festivo Oficial E':'Variante literal independiente. No se deduce su fórmula ni su unidad a partir de Plus Festivo Oficial.',
 'Plus día Especial':'Se muestran las fechas especiales trabajadas que ya cuenta Cómputo. Ese contador no acredita automáticamente todos los requisitos retributivos, franjas ni incompatibilidades del plus. El importe queda pendiente hasta validar esa correspondencia.',
 'Prima Noche de la Mercé':'No equivale a Non Stop ni al Plus día Especial. No se transforma automáticamente un servicio nocturno en este plus.',
 'Horas Cómputo TP':'No equivale a todas las horas ordinarias trabajadas. Sin una magnitud liquidable específica exportada por Cómputo, su cálculo permanece pendiente.',
 'Cto. Atención Cliente':'Componente mensual íntegro AAC: base documentada × porcentaje resuelto por Cómputo. No determina descuentos por ausencias, altas parciales u otros ajustes. No se aplica a las pagas extra.',
 'Pr.Polivalencia AAC':'Prima mensual independiente del complemento de atención al cliente. La previsión del componente íntegro usa el porcentaje de Cómputo; los ajustes y condiciones individuales no acreditados siguen pendientes.'
};
export function conceptModel(c) {
 const adjustment=/^(Dto[ .]|Ajuste|Diferencias|Total Retroactividad)/.test(c.name);
 const extra=/\bPE\b|paga Extra/.test(c.name);
 const lane=adjustment?'adjustment':extra?'extra':'normal';
 const metric=c.name==='P.Festivo Trabajado E'?null:c.metric;
 const rule=c.name==='Prima Hora Nona'?{status:'documented',metric:'horaNonaHours',unit:'h',rate:10.35,source:'CGT · Complements salarials 2026',from:'2026-01',to:'2026-12',scopeConfirmed:true}:
 c.name==='Cto. Atención Cliente'?proportional(133.10):c.name==='Pr.Polivalencia AAC'?proportional(75.14):null;
 const descriptions={
  'Nocturnidad Variable':'Retribuye el trabajo nocturno del personal al que corresponde esta modalidad. Las horas físicamente nocturnas y las horas abonables pueden diferir; Cómputo entrega el resultado laboral ya resuelto.',
  'Prima Hora Nona':'Prima por las unidades elegibles que Cómputo determina a partir de la jornada. Es un concepto distinto de las horas ordinarias y de las horas extraordinarias.',
  'Plus Convenio':'Plus vinculado a presencia y puntualidad, con situaciones y proporcionalidades específicas. Su contador laboral no equivale siempre a días íntegros abonables.',
  'Plus día Especial':'Retribución específica ligada al servicio en las franjas de días especiales del convenio. Se distingue del domingo trabajado y del servicio Non Stop.'
 };
 return {...c,description:descriptions[c.name]||c.description,metric,lane,rule,note:notes[c.name]||null};
}
export const laneLabels={normal:'Nómina ordinaria',extra:'Pagas extra',adjustment:'Ajustes y atrasos'};
