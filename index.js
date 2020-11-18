"use strict";

const BbPromise = require("bluebird");
const fse = require("fs-extra");
const { repackagePythonModules } = require("./lib/repackage");

BbPromise.promisifyAll(fse);

class ServerlessPythonModule {
  get targetFuncs() {
    let inputOpt = this.serverless.processedInput.options;
    return inputOpt.function
      ? [inputOpt.functionObj]
      : Object.values(this.serverless.service.functions);
  }

  constructor(serverless) {
    this.serverless = serverless;

    const repackage = () => {
      if (!this.serverless.service.package.individually) return;
      return repackagePythonModules.bind(this)();
    };

    this.hooks = {
      "after:package:createDeploymentArtifacts": repackage,
      "after:deploy:function:packageFunction": repackage,
    };

    serverless.configSchemaHandler.defineFunctionProperties("aws", {
      type: "object",
      properties: {
        module: { type: "string" },
      },
    });
  }
}

module.exports = ServerlessPythonModule;
