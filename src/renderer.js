function $(id) { return document.getElementById(id); }

const state = {
  csvPath: '',
  outPath: ''
};

$('pickCsv').addEventListener('click', async () => {
  const p = await window.ribaApi.pickFile([{ name: 'CSV', extensions: ['csv'] }]);
  if (p) {
    state.csvPath = p;
    $('csvPath').value = p;
  }
});

$('pickOut').addEventListener('click', async () => {
  const p = await window.ribaApi.saveFile('riba.txt');
  if (p) {
    state.outPath = p;
    $('outPath').value = p;
  }
});

$('generate').addEventListener('click', async () => {
  const csvPath = $('csvPath').value.trim();
  const outPath = $('outPath').value.trim();

  if (!csvPath || !outPath) {
    setStatus('Seleziona input e output.', true);
    return;
  }

  const options = {
    header: {
      mittenteSia: $('mittenteSia').value.trim(),
      riceventeAbi: $('riceventeAbi').value.trim(),
      dataCreazione: $('dataCreazione').value.trim(),
      nomeSupporto: $('nomeSupporto').value
    },
    record14: {
      abiAssuntrice: $('abiAssuntrice').value.trim(),
      cabAssuntrice: $('cabAssuntrice').value.trim(),
      contoAccredito: $('contoAccredito').value.trim(),
      codiceAzienda: $('codiceAzienda').value.trim()
    },
    record20: {
      descrCreditore: $('descrCreditore').value
    },
    record50: {
      cfCreditore: $('cfCreditore').value.trim()
    },
    record51: {
      denominazioneCreditore: $('denominazioneCreditore').value.trim()
    },
    record70: {
      indicatoreDoc: $('indicatoreDoc').value.trim(),
      flagEsito: $('flagEsito').value.trim(),
      flagStampa: $('flagStampa').value.trim()
    },
    mapping: {
      nomeDebitore: Number($('m_nomeDebitore').value),
      indirizzo: Number($('m_indirizzo').value),
      cap: Number($('m_cap').value),
      comune: Number($('m_comune').value),
      provincia: Number($('m_provincia').value),
      cfDebitore: Number($('m_cfDebitore').value),
      importo: Number($('m_importo').value),
      scadenza: Number($('m_scadenza').value),
      riferimentoDebito: Number($('m_riferimentoDebito').value),
      abiDomiciliataria: Number($('m_abiDomiciliataria').value),
      cabDomiciliataria: Number($('m_cabDomiciliataria').value),
      numeroRicevuta: Number($('m_numeroRicevuta').value)
    }
  };

  setStatus('Generazione in corso...');

  try {
    await window.ribaApi.generate({
      csvPath,
      outputPath: outPath,
      options
    });
    setStatus('Tracciato generato con successo.');
  } catch (err) {
    setStatus(`Errore: ${err.message}`, true);
  }
});

function setStatus(msg, isError) {
  const el = $('status');
  el.textContent = msg;
  el.style.color = isError ? '#b00020' : '#2f5d50';
}
