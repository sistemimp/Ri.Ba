const DEFAULTS = {
  header: {
    mittenteSia: 'Q7868',
    riceventeAbi: '02008',
    dataCreazione: '',
    nomeSupporto: 'CBIRIB1710181601    ',
    campoDisp: ''
  },
  record14: {
    causale: '30000',
    segno: '-',
    abiAssuntrice: '02008',
    cabAssuntrice: '24404',
    contoAccredito: '000103630981',
    codiceAzienda: '00000',
    tipoCodice: '4',
    flagTipoDebitore: ''
  },
  record20: {
    descrCreditore: 'MEDIAPRINT S.R.L. VIA CERTOSA SNC NERETO'
  },
  record50: {
    cfCreditore: '00865490676'
  },
  record51: {
    denominazioneCreditore: 'MEDIAPRINT S.R.L.'
  },
  record70: {
    indicatoreDoc: '',
    flagEsito: '',
    flagStampa: ''
  },
  mapping: {
    nomeDebitore: 0,
    indirizzo: 1,
    cap: 2,
    comune: 3,
    provincia: 4,
    cfDebitore: 5,
    importo: 6,
    scadenza: 7,
    riferimentoDebito: 8,
    abiDomiciliataria: 9,
    cabDomiciliataria: 10,
    numeroRicevuta: 11
  }
};

function padLeft(str, len, ch) {
  const s = String(str ?? '');
  if (s.length >= len) return s.slice(-len);
  return ch.repeat(len - s.length) + s;
}

function padRight(str, len, ch) {
  const s = String(str ?? '');
  if (s.length >= len) return s.slice(0, len);
  return s + ch.repeat(len - s.length);
}

function toGGMMAA(input) {
  const s = String(input ?? '').trim();
  if (!s) return ''.padEnd(6, ' ');
  if (/^\d{6}$/.test(s)) return s;
  const m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (m) {
    const dd = m[1];
    const mm = m[2];
    const yy = m[3].slice(2);
    return dd + mm + yy;
  }
  return padRight(s.replace(/\D/g, ''), 6, ' ');
}

function parseCsv(text) {
  const rows = [];
  let i = 0;
  let field = '';
  let row = [];
  let inQuotes = false;

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n') {
        row.push(field);
        field = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
      } else if (c === '\r') {
        // ignore
      } else {
        field += c;
      }
    }
    i++;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function parseImporto(value) {
  const s = String(value ?? '').trim();
  if (!s) return 0;
  const norm = s.replace('.', '').replace(',', '.');
  const num = Number(norm);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

function splitSegments(text, len, count) {
  const s = String(text ?? '');
  const segments = [];
  for (let i = 0; i < count; i++) {
    segments.push(padRight(s.slice(i * len, (i + 1) * len), len, ' '));
  }
  return segments;
}

function buildRecordIB(opts) {
  const h = opts.header;
  const chars = Array(120).fill(' ');
  const set = (posStart1, value) => {
    const s = String(value ?? '');
    for (let i = 0; i < s.length; i++) {
      const idx = posStart1 - 1 + i;
      if (idx >= 0 && idx < 120) chars[idx] = s[i];
    }
  };

  set(2, 'IB');
  set(4, padRight(h.mittenteSia, 5, ' '));
  set(9, padLeft(h.riceventeAbi, 5, '0'));
  set(14, padLeft(h.dataCreazione, 6, '0'));
  set(20, padRight(h.nomeSupporto, 20, ' '));
  set(40, padRight(h.campoDisp, 6, ' '));
  set(114, 'E');

  return chars.join('');
}

function buildRecordEF(opts, count, totalImport, totalRecords) {
  const h = opts.header;
  const tipo = 'EF';
  const mitt = padRight(h.mittenteSia, 5, ' ');
  const rice = padLeft(h.riceventeAbi, 5, '0');
  const data = padLeft(h.dataCreazione, 6, '0');
  const nome = padRight(h.nomeSupporto, 20, ' ');
  const campo = padRight(h.campoDisp, 6, ' ');
  const numDisp = padLeft(String(count), 7, '0');
  const totNeg = padLeft(String(totalImport), 15, '0');
  const totPos = padLeft('0', 15, '0');
  const numRec = padLeft(String(totalRecords), 7, '0');
  const filler90_113 = ''.padEnd(24, ' ');
  const divisa = 'E';
  const filler1 = ' ';
  const filler115_120 = ''.padEnd(6, ' ');
  return (
    filler1 +
    tipo +
    mitt +
    rice +
    data +
    nome +
    campo +
    numDisp +
    totNeg +
    totPos +
    numRec +
    filler90_113 +
    divisa +
    filler115_120
  );
}

function buildRecord14(opts, row, progressivo) {
  const m = opts.mapping;
  const r14 = opts.record14;
  const tipo = '14';
  const prog = padLeft(progressivo, 7, '0');
  const filler1 = ' ';
  const filler11_22 = ''.padEnd(12, ' ');
  const dataPag = padLeft(toGGMMAA(row[m.scadenza]), 6, '0');
  const causale = padLeft(r14.causale, 5, '0');
  const importo = padLeft(String(parseImporto(row[m.importo])), 13, '0');
  const segno = r14.segno || '-';
  const abiAss = padLeft(r14.abiAssuntrice, 5, '0');
  const cabAss = padLeft(r14.cabAssuntrice, 5, '0');
  const conto = padLeft(r14.contoAccredito, 12, '0');
  const abiDom = padLeft(row[m.abiDomiciliataria], 5, '0');
  const cabDom = padLeft(row[m.cabDomiciliataria], 5, '0');
  const filler80_91 = ''.padEnd(12, ' ');
  const codAz = padRight(r14.codiceAzienda, 5, ' ');
  const tipoCod = padRight(r14.tipoCodice, 1, ' ');
  const codCli = padRight(row[m.cfDebitore], 16, ' ');
  const flagTipo = padRight(r14.flagTipoDebitore, 1, ' ');
  const filler115_119 = ''.padEnd(5, ' ');
  const divisa = 'E';

  return (
    filler1 +
    tipo +
    prog +
    filler11_22 +
    dataPag +
    causale +
    importo +
    segno +
    abiAss +
    cabAss +
    conto +
    abiDom +
    cabDom +
    filler80_91 +
    codAz +
    tipoCod +
    codCli +
    flagTipo +
    filler115_119 +
    divisa
  );
}

function buildRecord20(opts, progressivo) {
  const tipo = '20';
  const prog = padLeft(progressivo, 7, '0');
  const filler1 = ' ';
  const segments = splitSegments(opts.record20.descrCreditore, 24, 4);
  const filler107_120 = ''.padEnd(14, ' ');
  return filler1 + tipo + prog + segments.join('') + filler107_120;
}

function buildRecord30(opts, row, progressivo) {
  const tipo = '30';
  const prog = padLeft(progressivo, 7, '0');
  const filler1 = ' ';
  const m = opts.mapping;
  const segs = splitSegments(row[m.nomeDebitore], 30, 2);
  const cf = padRight(row[m.cfDebitore], 16, ' ');
  const filler87_120 = ''.padEnd(34, ' ');
  return filler1 + tipo + prog + segs.join('') + cf + filler87_120;
}

function buildRecord40(opts, row, progressivo) {
  const tipo = '40';
  const prog = padLeft(progressivo, 7, '0');
  const filler1 = ' ';
  const m = opts.mapping;
  const indirizzo = padRight(row[m.indirizzo], 30, ' ');
  const cap = padLeft(row[m.cap], 5, '0');
  const comuneProv = padRight(`${row[m.comune]} ${row[m.provincia]}`.trim(), 25, ' ');
  const banca = ''.padEnd(50, ' ');
  return filler1 + tipo + prog + indirizzo + cap + comuneProv + banca;
}

function buildRecord50(opts, row, progressivo) {
  const tipo = '50';
  const prog = padLeft(progressivo, 7, '0');
  const filler1 = ' ';
  const m = opts.mapping;
  const seg1 = padRight(row[m.riferimentoDebito], 40, ' ');
  const seg2 = ''.padEnd(40, ' ');
  const filler91_100 = ''.padEnd(10, ' ');
  const cfCred = padRight(opts.record50.cfCreditore, 16, ' ');
  const filler117_120 = ''.padEnd(4, ' ');
  return filler1 + tipo + prog + seg1 + seg2 + filler91_100 + cfCred + filler117_120;
}

function buildRecord51(opts, row, progressivo) {
  const tipo = '51';
  const prog = padLeft(progressivo, 7, '0');
  const filler1 = ' ';
  const m = opts.mapping;
  const numRic = padLeft(row[m.numeroRicevuta], 10, '0');
  const denom = padRight(opts.record51.denominazioneCreditore, 20, ' ');
  const filler41_120 = ''.padEnd(80, ' ');
  return filler1 + tipo + prog + numRic + denom + filler41_120;
}

function buildRecord70(opts, progressivo) {
  const tipo = '70';
  const prog = padLeft(progressivo, 7, '0');
  const filler1 = ' ';
  const filler11_88 = ''.padEnd(78, ' ');
  const filler89_100 = ''.padEnd(12, ' ');
  const indDoc = padRight(opts.record70.indicatoreDoc, 1, ' ');
  const flagEsito = padRight(opts.record70.flagEsito, 1, ' ');
  const flagStampa = padRight(opts.record70.flagStampa, 1, ' ');
  const filler104_120 = ''.padEnd(17, ' ');
  return (
    filler1 +
    tipo +
    prog +
    filler11_88 +
    filler89_100 +
    indDoc +
    flagEsito +
    flagStampa +
    filler104_120
  );
}

function mergeOptions(options) {
  const merged = JSON.parse(JSON.stringify(DEFAULTS));
  function assign(target, source) {
    for (const k of Object.keys(source || {})) {
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        assign(target[k], source[k]);
      } else {
        target[k] = source[k];
      }
    }
  }
  assign(merged, options || {});
  return merged;
}

function generateRiba(csvText, options) {
  const opts = mergeOptions(options);
  const rows = parseCsv(csvText).filter(r => r.length > 1);

  const lines = [];
  let total = 0;

  lines.push(buildRecordIB(opts));

  rows.forEach((row, idx) => {
    const prog = String(idx + 1);
    total += parseImporto(row[opts.mapping.importo]);

    lines.push(buildRecord14(opts, row, prog));
    lines.push(buildRecord20(opts, prog));
    lines.push(buildRecord30(opts, row, prog));
    lines.push(buildRecord40(opts, row, prog));
    lines.push(buildRecord50(opts, row, prog));
    lines.push(buildRecord51(opts, row, prog));
    lines.push(buildRecord70(opts, prog));
  });

  const totalRecords = rows.length * 7 + 2;
  lines.push(buildRecordEF(opts, rows.length, total, totalRecords));

  return lines.map(l => padRight(l, 120, ' ')).join('\r\n') + '\r\n';
}

module.exports = { generateRiba, DEFAULTS };
