const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

// Alle statischen Dateien aus dem Root-Verzeichnis ausliefern
// → index.html, css/main.css, js/*.js, assets/*
app.use(express.static(path.join(__dirname)));

// Fallback: alle unbekannten Routen → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`UNNAMED Pictures läuft auf Port ${PORT}`);
});
