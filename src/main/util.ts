/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import fs from 'fs/promises';

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
