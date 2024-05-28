const Spaces = require("do-spaces").default;

module.exports = async (file, filePath, config) => {
  const spaces = new Spaces({
    endpoint: config.endpoint,
    accessKey: config.accessKey,
    secret: config.secret,
    bucket: config.bucket,
  });

  await spaces.uploadFile({
    pathname: filePath,
    privacy: "public-read",
    file,
  });
};
