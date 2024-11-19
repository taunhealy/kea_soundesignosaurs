export default class AudioContextManager {
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private bufferLength: number;
  private amplitudeMultiplier: number;

  constructor(analyser: AnalyserNode, amplitudeMultiplier: number = 1.5) {
    this.analyser = analyser;
    this.amplitudeMultiplier = amplitudeMultiplier;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
  }

  getData(): Uint8Array {
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getBufferLength(): number {
    return this.bufferLength;
  }

  getAmplitude(index: number): number {
    return (this.dataArray[index] / 255) * this.amplitudeMultiplier;
  }
}
