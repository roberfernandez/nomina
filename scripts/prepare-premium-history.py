"""Create a private, minimal history from complete extracted ordinary receipts.

Usage: python prepare-premium-history.py EXTRACTED_ROOT OUTPUT_JSON [FIRST_YEAR]
No identifiers, bank details, net pay, vacation average or target amount are copied.
"""
import json
import re
import sys
import unicodedata
from decimal import Decimal
from pathlib import Path

IDS = ['penositat', 'festiu-oficial', 'festiu-treballat', 'horari-partit', 'suplencies', 'nocturnitat']

def category(name):
    s = ''.join(c for c in unicodedata.normalize('NFD', name.lower()) if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^a-z0-9]+', ' ', s).strip()
    if 'penosidad' in s or 'penositat' in s: return 'penositat'
    if 'festivo oficial' in s or 'festivo especial' in s: return 'festiu-oficial'
    if 'festivo trabajado' in s: return 'festiu-treballat'
    if 'horario partido' in s: return 'horari-partit'
    if 'suplencias' in s or 'suplencies' in s: return 'suplencies'
    if s == 'nocturnidad variable': return 'nocturnitat'
    return None

def prepare(root, first_year):
    months = []
    for path in sorted(root.glob('*/*_Nomina.json')):
        if not re.fullmatch(r'\d{4}-\d{2}_Nomina', path.stem) or int(path.stem[:4]) < first_year: continue
        raw = json.loads(path.read_text(encoding='utf-8-sig'))
        period = path.stem[:7]
        if raw.get('periodo') != period or raw.get('tipo') != 'nomina' or not isinstance(raw.get('conceptos'), list) or not raw['conceptos']:
            raise ValueError(f'Receipt extraction incompatible: {path.name}')
        amounts = {key: Decimal(0) for key in IDS}
        adjustments = {key: Decimal(0) for key in ['03', '06', '09', '12']}
        for row in raw['conceptos']:
            key = category(row['nombre'])
            if key:
                amounts[key] += Decimal(str(row.get('abono') or 0)) - Decimal(str(row.get('descuento') or 0))
            if row['nombre'].startswith('Turno Noche PE '):
                quarter = {'Marzo': '03', 'Junio': '06', 'Septiembre': '09', 'Diciembre': '12'}.get(row['nombre'].removeprefix('Turno Noche PE '))
                if not quarter:
                    raise ValueError(f'Unknown extra night adjustment: {path.name}')
                adjustments[quarter] += Decimal(str(row.get('abono') or 0)) - Decimal(str(row.get('descuento') or 0))
        months.append({'period': period, 'complete': True, 'source': path.stem.replace('_Nomina', ' · nòmina completa'),
                       'amounts': {key: float(value.quantize(Decimal('.01'))) for key, value in amounts.items()},
                       'extraNightAdjustments': {key: float(value.quantize(Decimal('.01'))) for key, value in adjustments.items()}})
    return {'schema': 'nomina-premium-history-v1', 'months': months}

if __name__ == '__main__':
    result = prepare(Path(sys.argv[1]), int(sys.argv[3]) if len(sys.argv) > 3 else 2024)
    Path(sys.argv[2]).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Historial privado preparado: {len(result["months"])} meses.')
