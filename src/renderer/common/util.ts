/* eslint-disable import/prefer-default-export */
export function getTimeStamp(sec: number): string {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}:${seconds}`;
}

export function getFileNameWithoutExtension(filePath: string): string {
  // Split the path by either forward slash or backslash
  const parts = filePath.split(/[\\/]/);
  // Get the last part, which should be the filename with extension
  const fileNameWithExt = parts[parts.length - 1];
  // Remove the extension from the filename
  const fileName = fileNameWithExt.replace(/\.[^/.]+$/, '');
  return fileName;
}
