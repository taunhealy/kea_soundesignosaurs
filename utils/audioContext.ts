class AudioContextManager {
  private static instance: AudioContextManager;
  private audioContext?: AudioContext;
  private sourceNodes: Map<HTMLAudioElement, MediaElementAudioSourceNode>;
  private analyserNodes: Map<HTMLAudioElement, AnalyserNode>;

  private constructor() {
    this.sourceNodes = new Map();
    this.analyserNodes = new Map();
  }

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setupAudioNode(audioElement: HTMLAudioElement): AnalyserNode {
    console.log("Setting up audio node");
    const context = this.getContext();

    // Set CORS attributes on audio element
    audioElement.crossOrigin = "anonymous";

    // Resume audio context if it's suspended
    if (context.state === "suspended") {
      console.log("Resuming audio context");
      context.resume();
    }

    // Get or create source node
    let source = this.sourceNodes.get(audioElement);
    if (!source) {
      console.log("Creating new source node");
      source = context.createMediaElementSource(audioElement);
      this.sourceNodes.set(audioElement, source);
    }

    // Get or create analyser node
    let analyser = this.analyserNodes.get(audioElement);
    if (!analyser) {
      console.log("Creating new analyser node");
      analyser = context.createAnalyser();
      analyser.fftSize = 256;
      this.analyserNodes.set(audioElement, analyser);
    }

    // Connect nodes: source -> analyser -> destination
    console.log("Connecting audio nodes");
    source.connect(analyser);
    analyser.connect(context.destination);

    return analyser;
  }

  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = undefined;
      this.sourceNodes.clear();
      this.analyserNodes.clear();
    }
  }
}

export const audioContextManager = AudioContextManager.getInstance();
