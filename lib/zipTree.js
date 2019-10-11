const BbPromise = require("bluebird");
const fse = require("fs-extra");
const path = require("path");

BbPromise.promisifyAll(fse);

/**
 * Write zip contents to a file.
 * @param {JSZip} zip the zip object
 * @param {string} targetPath path to write the zip file to.
 * @return {Promise} a promise resolving to null.
 */
function writeZip(zip, targetPath) {
  const opts = {
    platform: process.platform == "win32" ? "DOS" : "UNIX",
    compression: "DEFLATE",
    compressionOptions: {
      level: 9
    }
  };
  return new BbPromise(resolve =>
    zip
      .generateNodeStream(opts)
      .pipe(fse.createWriteStream(targetPath))
      .on("finish", resolve)
  ).then(() => null);
}

/**
 * Add a new file to a zip file from a buffer.
 * @param {JSZip} zip the zip object to add the file to.
 * @param {string} zipPath the target path in the zip.
 * @param {Promise} bufferPromise a promise providing a nodebuffer.
 * @return {Promise} a promise providing the JSZip object.
 * @param {object} fileOpts an object with the opts to save for the file in the zip.
 */
function zipFile(zip, zipPath, bufferPromise, fileOpts) {
  return bufferPromise
    .then(buffer =>
      zip.file(
        zipPath,
        buffer,
        Object.assign(
          {},
          {
            // necessary to get the same hash when zipping the same content
            date: new Date(0)
          },
          fileOpts
        )
      )
    )
    .then(() => zip);
}

module.exports = { writeZip, zipFile };
