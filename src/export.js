module.exports = async (exportDir, dbConfig) => {
  const date = new Date()
    .toISOString()
    .replaceAll("T", "_")
    .replaceAll("-", "_")
    .replaceAll(":", "_")
    .split(".")
    .shift();

  const fileName = `${dbConfig.database}_${date}.bak`;
  const exportTo = `${exportDir}${fileName}`;
  const query = `BACKUP DATABASE ${dbConfig.database} TO DISK = '${exportTo}'`;
  const sql = dbConfig.native ? require("mssql/msnodesqlv8") : require("mssql");

  dbConfig.port = dbConfig.hasOwnProperty("port") ? dbConfig.port : 1433;
  dbConfig.native = dbConfig.hasOwnProperty("native") ? dbConfig.native : false;

  const sqlConfig = {
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    server: dbConfig.server,
    port: dbConfig.port,
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

  if (dbConfig.native) {
    sqlConfig.options.trustedConnection = true;
    sqlConfig.driver = "msnodesqlv8";
  }

  await sql.connect(sqlConfig);
  await sql.query(query);

  return exportTo;
};
