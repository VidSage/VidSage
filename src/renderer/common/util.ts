/* eslint-disable import/prefer-default-export */
export function getTimeStamp(sec: number): string {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}:${seconds}`;
}
