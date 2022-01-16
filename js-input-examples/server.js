const express = require('express');
const app = express();
const port = 8080;
const ipAddress = Object.values(require("os").networkInterfaces()).flat().filter(({ family, internal }) => family === "IPv4" && !internal).map(({ address }) => address)[0];

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('./index.html');
});

app.listen(port, () => {
  console.log(`simple static server listening at http://127.0.0.1:${port} & http://${ipAddress}:${port}`);
});

