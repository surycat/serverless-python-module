# Serverless python module

This serverless plugin simply reduce python functions' folder tree into a top-level module depending on the `module` parameter of each function.

This is based on the same mechanism built by [`serverless-python-requirements`](https://github.com/UnitedIncome/serverless-python-requirements).

## Install

sls plugin install -n serverless-python-module

## Usage

```
functions:
  myFunction:
    handler: function.handler
    module: some/deep/folder
```
