const BbPromise = require("bluebird");
const fse = require("fs-extra");
const get = require("lodash.get");
const set = require("lodash.set");
const path = require("path");
const JSZip = require("jszip");
const { writeZip, zipFile } = require("./zipTree");

BbPromise.promisifyAll(fse);

function moveModuleUp(source, target, module) {
  const targetZip = new JSZip();

  return fse
    .readFileAsync(source)
    .then(buffer => JSZip.loadAsync(buffer))
    .then(sourceZip => sourceZip.filter(file => file.startsWith(module + "/")))
    .map(srcZipObj =>
      zipFile(
        targetZip,
        srcZipObj.name.replace(module + "/", ""),
        srcZipObj.async("nodebuffer")
      )
    )
    .then(() => writeZip(targetZip, target));
}

/*
 * Transform '{service}-{stage}-{artifact}' into {name}
 */
function guessArtifactName(func) {
  const funcNameParts = func.name.split("-");
  return ".serverless/" + funcNameParts[funcNameParts.length - 1] + ".zip";
}

function repackagePythonModules() {
  if (!this.serverless.service.package.individually) {
    return BbPromise.resolve();
  }

  this.serverless.cli.log(
    "Repackaging python functions as top-level modules..."
  );

  return BbPromise.resolve(this.targetFuncs)
    .filter(func =>
      (func.runtime || this.serverless.service.provider.runtime).match(
        /^python.*/
      )
    )
    .map(func => {
      if (!get(func, "module")) {
        set(func, ["module"], ".");
      }
      return func;
    })
    .map(func => {
      if (func.module !== ".") {
        const artifact = func.package
          ? func.package.artifact
          : guessArtifactName(func);
        return moveModuleUp(artifact, artifact, func.module).then(() => func);
      } else {
        return func;
      }
    });
}

module.exports = { repackagePythonModules };
