const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
const server = http.createServer(app);
const timeout = require("connect-timeout");
const validate = require("./validate");
const mssqlHandler = require("./mssql");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(timeout("900s"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/backup/mssql", (req, res) => {
  try {
    const result = mssqlHandler(
      validate(req.body)
        .requires("db_config")
        .requires("s3_config")
        .requires("export_dir")
        .requires("upload_path")
        .get()
    );

    res.send(result);
  } catch (e) {
    res.send({ success: false, error: e.message });
  }
});

server.listen(8083, () => {
  console.log("listening on *:8083");
});
