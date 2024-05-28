const fs = require("fs");
const createZip = require("./create-zip");
const upload = require("./upload");
const exportDb = require("./export");

module.exports = async ({ database, drive, exportTo, uploadTo }) => {
  let result = {};
  let backupFile = null;
  let zipFile = null;

  try {
    backupFile = await exportDb(exportTo, database);
    zipFile = await createZip(backupFile, backupFile + ".zip");

    const uploadFile = `${uploadTo}${zipFile}`;
    await upload(fs.readFileSync(zipFile), uploadFile, drive);

    result = { success: true, file: uploadFile };
  } catch (error) {
    result = { success: false, error };
  }

  try {
    fs.unlinkSync(backupFile);
    fs.unlinkSync(zipFile);
  } catch (e) {}

  return result;
};
