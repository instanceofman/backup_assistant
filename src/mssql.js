const fs = require("fs");
const createZip = require("./create-zip");
const upload = require("./upload");
const exportDb = require("./export");

module.exports = async ({ database, drive, exportTo, uploadTo }) => {
  let result = {};
  let backupFile = null;
  let zipFile = null;

  try {
    const output = await exportDb(exportTo, database);
    backupFile = output.backupFile;

    const fileName = output.backupFile;
    const zipFileName = fileName + ".zip";
    zipFile = output.backupFile + ".zip";

    await createZip(backupFile, zipFile);

    const uploadFile = `${uploadTo}${zipFileName}`;
    await upload(fs.readFileSync(zipFile), uploadFile, drive);

    result = { success: true, file: uploadFile };
  } catch (error) {
    console.log('Process', error);
    result = { success: false, error };
  }

  try {
    fs.unlinkSync(backupFile);
    fs.unlinkSync(zipFile);
  } catch (e) {
    console.log('Cleanup', e);
  }

  return result;
};
