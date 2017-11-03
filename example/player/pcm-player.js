function PCMPlayer() {

    this.samples = [];
    this.flushingTime = 200;
    this.createContext();
    this.startFlushing();
    this.flush = this.flush.bind(this);
    this.interval = setInterval(this.flush, this.flushingTime);

    this.setConfig = function(sampleRate, channels) {
        this.sampleRate = sampleRate;
        this.channels = channels;
    }
    
    this.createContext = function() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 1;
        this.gainNode.connect(this.audioCtx.destination);
    };

    this.stopFlushing = function() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    this.feed = function(data) {
        let tmp = new Float32Array(this.samples.length + data.length);
        tmp.set(this.samples, 0);
        tmp.set(data, this.samples.length);
        this.samples = tmp;
    }

    this.flush = function() {
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