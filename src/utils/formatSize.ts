/**
 * Formats a size in bytes to a human-readable string (e.g., KB, MB, GB).
 */
export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val.toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
};

/**
 * Formats a transfer speed (bytes per second) to a human-readable string.
 */
export const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond <= 0) return '0 B/s';
  return `${formatSize(bytesPerSecond)}/s`;
};
