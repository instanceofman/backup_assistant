const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
const server = http.createServer(app);
const timeout = require("connect-timeout");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(timeout("20s"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/backup/mssql", require("./mssql"));

server.listen(8083, () => {
  console.log("listening on *:8083");
});
