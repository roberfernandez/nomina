import test from 'node:test';
import assert from 'node:assert/strict';
import {dictionary} from '../src/dictionary-v2.js';
import {conceptModel} from '../src/concept-model-v2.js';
import {estimateProportional,parseComputoFacts} from '../src/economics-v2.js';
const get=name=>conceptModel(dictionary.find(c=>c.name===name));
test('related variable concepts never inherit another entitlement or tariff',()=>{
 for(const name of ['Plus Festivo Oficial','P.Festivo Oficial E','P.Festivo Trabajado E','Prima Noche de la Mercé','Horas Cómputo TP']) {assert.equal(get(name).metric,null);assert.equal(get(name).rule,null);}
 assert.equal(get('Plus Festivo Trabajado').metric,'workedHolidayDays');
 assert.equal(get('Plus día Especial').metric,'specialRetributiveDays');
 assert.equal(get('Plus Convenio').metric,'plusConveniDays');
 for(const name of ['Plus día Especial','Plus Convenio','Nocturnidad Variable'])assert.equal(get(name).rule,null);
});
test('extra, adjustments and ordinary components have independent presentation',()=>{
 assert.equal(get('Salario Base PE Marzo').lane,'extra');
 assert.equal(get('Total Retroactividad').lane,'adjustment');
 assert.equal(get('Dto. S Base PE Mar Huelga').lane,'adjustment');
 assert.equal(get('Salario Base').lane,'normal');
});
test('documented monthly components use every resolved percentage, not one personal contract',()=>{
 for(const percent of [75,78.14,78.91,85,85.81,100]){
  assert.equal(estimateProportional({percent},get('Cto. Atención Cliente').rule,'2026-10').expected,133.10*percent/100);
  assert.equal(estimateProportional({percent},get('Pr.Polivalencia AAC').rule,'2026-10').expected,75.14*percent/100);
 }
 assert.equal(estimateProportional({percent:100},get('Cto. Atención Cliente').rule,'2027-01').expected,null);
});
test('unknown contract versions fail closed',()=>{
 assert.throws(()=>parseComputoFacts({schema:'computo-economic-facts-v1',producer:'computo-aac',version:'2',period:'2026-10',days:[]}));
});
