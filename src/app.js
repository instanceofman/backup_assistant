const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/backup/mssql", require('./mssql'));

server.listen(80, () => {
  console.log("listening on *:80");
});
