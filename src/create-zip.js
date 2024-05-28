const { createGzip } = require("node:zlib");
const { pipeline } = require("node:stream");
const { promisify } = require("node:util");
const { createReadStream, createWriteStream } = require("node:fs");
const pipe = promisify(pipeline);

module.exports = async (input, output) => {
  const gzip = createGzip();
  const source = createReadStream(input);
  const destination = createWriteStream(output);
  await pipe(source, gzip, destination);

  return output;
};
