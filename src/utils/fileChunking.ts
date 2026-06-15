export const CHUNK_SIZE = 64 * 1024; // 64KB chunks

/**
 * Calculates the total number of chunks required for a given file size.
 */
export const getNumberOfChunks = (fileSize: number): number => {
  return Math.ceil(fileSize / CHUNK_SIZE);
};

/**
 * Slices a specific chunk of a File and returns it as an ArrayBuffer.
 */
export const getFileChunk = async (file: File, chunkIndex: number): Promise<ArrayBuffer> => {
  const start = chunkIndex * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, file.size);
  const blob = file.slice(start, end);
  return await blob.arrayBuffer();
};

/**
 * Reassembles an array of binary chunks into a single Blob.
 */
export const assembleFile = (chunks: ArrayBuffer[], type: string): Blob => {
  return new Blob(chunks, { type });
};
