/**
 * Decode an audio Blob and reduce it to a normalized array of peak
 * amplitudes for waveform rendering. Runs off the main audio pipeline
 * (uses a throwaway AudioContext just for decoding).
 */
export async function extractPeaks(blob: Blob, buckets = 900): Promise<number[]> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const channel = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(channel.length / buckets) || 1;
    const peaks: number[] = new Array(buckets);
    let max = 0;

    for (let i = 0; i < buckets; i += 1) {
      const startIdx = i * blockSize;
      let sum = 0;
      for (let j = 0; j < blockSize; j += 1) {
        const v = channel[startIdx + j] || 0;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / blockSize);
      peaks[i] = rms;
      if (rms > max) max = rms;
    }

    // Normalize to 0..1
    if (max > 0) {
      for (let i = 0; i < peaks.length; i += 1) peaks[i] /= max;
    }
    return peaks;
  } finally {
    void ctx.close();
  }
}
