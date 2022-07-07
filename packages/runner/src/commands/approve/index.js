/* eslint-disable global-require, import/no-dynamic-require */

const fs = require('fs-extra');
const path = require('path');
const { die } = require('../../console');
const parseOptions = require('./parse-options');
const getConfig = require('../../config');

const isPNG = (file) => file.substr(-4) === '.png';

function approve(args) {
  const config = getConfig();
  const { outputDir, differenceDir, referenceDir, diffOnly } = parseOptions(
    args,
    config
  );

  let files = fs.readdirSync(outputDir).filter(isPNG);

  if (diffOnly) {
    // If diff only is active, just copy over the files that were changed
    const changedFiles = fs.readdirSync(differenceDir).filter(isPNG);
    files = files.filter((file) => changedFiles.includes(file));
  }

  if (!files.length) {
    die(
      'No images found to approve',
      'Run update command to generate reference files instead'
    );
  }

  if (!diffOnly) {
    // If diff only is active, the reference directory should not be emptied.
    // Instead only the files that changed will be overwritten.
    fs.emptyDirSync(referenceDir);
    fs.ensureDirSync(referenceDir);
  }

  files.forEach((file) =>
    fs.moveSync(path.join(outputDir, file), path.join(referenceDir, file), {
      overwrite: true,
    })
  );
}

module.exports = approve;