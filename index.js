"use strict";

const BbPromise = require("bluebird");
const fse = require("fs-extra");
const values = require("lodash.values");
const { repackagePythonModules } = require("./lib/repackage");

BbPromise.promisifyAll(fse);

class ServerlessPythonRequirements {
  get targetFuncs() {
    let inputOpt = this.serverless.processedInput.options;
    return inputOpt.function
      ? [inputOpt.functionObj]
      : values(this.serverless.service.functions);
  }

  constructor(serverless) {
    this.serverless = serverless;

    const repackage = () => {
      return repackagePythonModules.bind(this)();
    };

    this.hooks = {
      "after:package:createDeploymentArtifacts": repackage,
      "after:deploy:function:packageFunction": repackage
    };
  }
}

module.exports = ServerlessPythonRequirements;
