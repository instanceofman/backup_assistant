const AdmZip = require("adm-zip");
const fs = require("fs");
const Spaces = require("do-spaces").default;

module.exports = async (req, res) => {
  if (!req.body.hasOwnProperty("db_config"))
    return res.send({ success: false, message: "Missing db config" });

  if (!req.body.hasOwnProperty("s3_config"))
    return res.send({ success: false, message: "Missing s3 config" });

  if (!req.body.hasOwnProperty("export_dir"))
    return res.send({ success: false, message: "Missing export dir" });

  if (!req.body.hasOwnProperty("upload_path"))
    return res.send({ success: false, message: "Missing upload path" });

  const dbConfig = req.body.db_config;
  const s3Config = req.body.s3_config;
  const dbExportDir = req.body.export_dir;
  const uploadPath = req.body.upload_path;

  dbConfig.port = dbConfig.hasOwnProperty("port") ? dbConfig.port : 1433;
  dbConfig.native = dbConfig.hasOwnProperty("native") ? dbConfig.native : false;

  const sqlConfig = {
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    server: dbConfig.server,
    port: dbConfig.port,
    // pool: {
    //   max: 10,
    //   min: 0,
    //   idleTimeoutMillis: 30000,
    // },
    options: {
      encrypt: false,
      trustServerCertificate: false,
    },
  };

  var sql = dbConfig.native ? require("mssql/msnodesqlv8") : require("mssql");

  if (dbConfig.native) {
    sqlConfig.options.trustedConnection = true;
    sqlConfig.driver = "msnodesqlv8";
  }

  const spaces = new Spaces({
    endpoint: s3Config.endpoint,
    accessKey: s3Config.accessKey,
    secret: s3Config.secret,
    bucket: s3Config.bucket,
  });

  const date = new Date()
    .toISOString()
    .replaceAll("T", "_")
    .replaceAll("-", "_")
    .replaceAll(":", "_")
    .split(".")
    .shift();

  const fileName = `${dbConfig.database}_${date}.bak`;
  const zipFile = fileName + ".zip";
  const exportTo = `${dbExportDir}${fileName}`;
  const zipTo = `${dbExportDir}${zipFile}`;
  const query = `BACKUP DATABASE ${dbConfig.database} TO DISK = '${exportTo}'`;

  try {
    await sql.connect(sqlConfig);
    await sql.query(query);

    const zip = new AdmZip();

    zip.addLocalFile(exportTo);
    zip.writeZip(zipTo);

    const file = fs.readFileSync(zipTo);

    await spaces.uploadFile({
      pathname: `${uploadPath}${zipFile}`,
      privacy: "public-read",
      file,
    });

    fs.unlinkSync(exportTo);
    fs.unlinkSync(zipTo);

    res.send({ success: true, path: exportTo });
  } catch (err) {
    fs.unlinkSync(exportTo);
    fs.unlinkSync(zipTo);

    res.send({ success: false, error: err.message });
  }
};
