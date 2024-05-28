module.exports = async (exportTo, options) => {
  const date = new Date()
    .toISOString()
    .replaceAll("T", "_")
    .replaceAll("-", "_")
    .replaceAll(":", "_")
    .split(".")
    .shift();

  const fileName = `${options.database}_${date}.bak`;
  const backupFile = `${exportTo}${fileName}`;
  const query = `BACKUP DATABASE ${options.database} TO DISK = '${backupFile}'`;
  const sql = options.native ? require("mssql/msnodesqlv8") : require("mssql");

  options.port = options.hasOwnProperty("port") ? options.port : 1433;
  options.native = options.hasOwnProperty("native") ? options.native : false;

  const sqlConfig = {
    user: options.username,
    password: options.password,
    database: options.database,
    server: options.server,
    port: options.port,
    connectionTimeout: 360000,
    requestTimeout: 360000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 360000,
    },
    options: {
      encrypt: false,
      trustServerCertificate: false,
      connectionTimeout: 360000,
    },
  };

  if (options.native) {
    sqlConfig.options.trustedConnection = true;
    sqlConfig.driver = "msnodesqlv8";
  }

  await sql.connect(sqlConfig);
  await sql.query(query);

  return {
    backupFile,
    fileName
  };
};
