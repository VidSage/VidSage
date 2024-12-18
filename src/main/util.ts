/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import webpackPaths from '../../.erb/configs/webpack.paths';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export async function readJSONFile(absolutePath: string): Promise<object> {
  const fileContents = await fs.readFile(absolutePath, 'utf-8');
  const data = JSON.parse(fileContents);
  return data;
}

export async function writeJSONFile(
  absolutePath: string,
  data: object,
): Promise<void> {
  const jsonString = JSON.stringify(data, null, 2);
  await fs.writeFile(absolutePath, jsonString, 'utf-8');
}

export async function injectBundleExecutablePath() {
  const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
  const ExecPath = isDebug
    ? path.join(webpackPaths.rootPath, 'dist')
    : path.join(process.resourcesPath, 'bin');
  process.env.PATH = `${ExecPath}${path.delimiter}${process.env.PATH}`;
}
