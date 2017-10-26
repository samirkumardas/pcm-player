class PCMPlayer {

    constructor() {
        this.audioStartTime = 0;
        this.samples = [];
        this.sampleRate = 8000;
        this.channels = 1;
        this.flushingTime = 200;
        this.createContext();
        this.startFlushing();
        this.flush = this.flush.bind(this);
        this.interval = setInterval(this.flush, this.flushingTime);
    }
    createContext() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 1;
        this.gainNode.connect(this.audioCtx.destination);
    }

    stopFlushing() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    feed(data) {
        let tmp = new Float32Array(this.samples.length + data.length);
        tmp.set(this.samples, 0);
        tmp.set(data, this.samples.length);
        this.samples = tmp;
    }

    flush() {
        let bufferSource = this.audioCtx.createBufferSource(),
            length = this.samples.length,
            audioBuffer = this.audioCtx.createBuffer(this.channels, length, this.sampleRate),
            audioData,
            channel,
            offset,
            i;

        for (channel = 0; channel < this.channels; channel++) {
            audioData = audioBuffer.getChannelData(channel);
            offset = channel;
            for (i = 0; i < length; i++) {
                audioData[i] = this.samples[offset];
                offset += this.channels;
            }
        }

        bufferSource.buffer = audioBuffer;
        bufferSource.connect(this.gainNode);
        bufferSource.start();
        this.samples = [];
    }
}