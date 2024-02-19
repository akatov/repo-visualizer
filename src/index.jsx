import { exec } from '@actions/exec'
import * as core from '@actions/core'
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fs from "fs"

import { processDir } from "./process-dir.js"
import { Tree } from "./Tree.tsx"

const main = async () => {
  core.info('[INFO] Usage https://github.com/githubocto/repo-visualizer#readme')

  const rootPath = core.getInput("root_path") || ""; // Micro and minimatch do not support paths starting with ./
  const maxDepth = core.getInput("max_depth") || 9
  const customFileColors = JSON.parse(core.getInput("file_colors") ||  '{}');
  const colorEncoding = core.getInput("color_encoding") || "type"
  const excludedPathsString = core.getInput("excluded_paths") || "node_modules,bower_components,dist,out,build,eject,.next,.netlify,.yarn,.git,.vscode,package-lock.json,yarn.lock"
  const excludedPaths = excludedPathsString.split(",").map(str => str.trim())

  // Split on semicolons instead of commas since ',' are allowed in globs, but ';' are not + are not permitted in file/folder names.
  const excludedGlobsString = core.getInput('excluded_globs') || '';
  const excludedGlobs = excludedGlobsString.split(";");

  const data = await processDir(rootPath, excludedPaths, excludedGlobs);

  const componentCodeString = ReactDOMServer.renderToStaticMarkup(
    <Tree data={data} maxDepth={+maxDepth} colorEncoding={colorEncoding} customFileColors={customFileColors}/>
  );

  const outputFile = core.getInput("output_file") || "./diagram.svg"

  core.setOutput('svg', componentCodeString)

  await fs.writeFileSync(outputFile, componentCodeString)

  console.log("All set!")
}

main().catch((e) => {
  core.setFailed(e)
})
