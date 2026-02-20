# Generatore Ri.Ba. CBI

Progetto Electron per generare il tracciato Ri.Ba. CBI (CBI-RIB-001 v6.02) a partire da un CSV.

## Avvio

```powershell
npm install
npm start
```

## CSV atteso (default)
Colonne (0-based):
- 0 nome debitore
- 1 indirizzo
- 2 CAP
- 3 comune
- 4 provincia
- 5 CF/PIVA debitore
- 6 importo (es. 432,67)
- 7 data scadenza (GG-MM-AAAA)
- 8 riferimento debito
- 9 ABI domiciliataria
- 10 CAB domiciliataria
- 11 numero ricevuta

## Note
- Il tracciato generato ? composto da record di 120 caratteri con terminazione CRLF.
- I campi non gestiti vengono valorizzati a spazi o zeri come da guida.
- L'app è predisposta per auto-update con `electron-updater` nelle build pacchettizzate.
- Per attivarlo, aggiungi una configurazione `build.publish` in `package.json` (esempio provider generic):


