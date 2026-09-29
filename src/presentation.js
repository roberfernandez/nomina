// Only categories with implemented, reviewed content are offered.
export const categories = [
  { id: 'fixed', name: 'Retribucions de categoria', icon: '€', text: 'Complement AAC i Polivalència', ids: ['aac', 'polivalencia'] },
  { id: 'plus', name: 'Complements', icon: '☾', text: 'Nocturnitat, conveni, festius i dies especials', ids: ['night', 'conveni', 'festiu', 'especial'] },
  { id: 'hours', name: 'Jornada', icon: '◷', text: 'Hora Nona i les seves condicions', ids: ['nona'] },
  { id: 'vacation', name: 'Vacances', icon: '☀', text: 'Primes i mitjana individual', ids: ['vacances'] },
];
export const normalize = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
export function visibleConcepts(concepts, query, group) {
  const ids = categories.find(c => c.id === group)?.ids;
  return concepts.filter(c => (!ids || ids.includes(c.id)) && normalize([c.name, c.aliases, c.what, c.source].join(' ')).includes(normalize(query)));
}
export function datedRates(concept) {
  return [...concept.rates].sort((a, b) => b.year - a.year);
}
