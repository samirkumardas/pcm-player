function PCMPlayer() {

    this.samples = new Float32Array();
    this.flushingTime = 200;

    this.setConfig = function(sampleRate, channels) {
        this.sampleRate = sampleRate;
        this.channels = channels;
    };
    
    this.createContext = function() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 1;
        this.gainNode.connect(this.audioCtx.destination);
        this.startTime = this.audioCtx.currentTime;
    };

    this.stopFlushing = function() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    };

    this.feed = function(data) {
        let tmp = new Float32Array(this.samples.length + data.length);
        tmp.set(this.samples, 0);
        tmp.set(data, this.samples.length);
        this.samples = tmp;
    };

    this.flush = function() {
        if (!this.channels || !this.sampleRate || !this.samples.length) return;
        let bufferSource = this.audioCtx.createBufferSource(),
            length = this.samples.length,
            audioBuffer = this.audioCtx.createBuffer(this.channels, length, this.sampleRate),
            audioData,
            channel,
            offset,
            i,
            decrement = 50;

        for (channel = 0; channel < this.channels; channel++) {
            audioData = audioBuffer.getChannelData(channel);
            offset = channel;
            for (i = 0; i < length; i++) {
                audioData[i] = this.samples[offset];
                /* fadein */
                if (i < 50) {
                    audioData[i] =  (audioData[i] * i) / 50;
                }
                /* fadeout*/
                if (i >= (length - 51)) {
                    audioData[i] =  (audioData[i] * decrement--) / 50;
                }
                offset += this.channels;
            }
        }
        
        if (this.startTime < this.audioCtx.currentTime) {
            this.startTime = this.audioCtx.currentTime;
        }
        bufferSource.buffer = audioBuffer;
        bufferSource.connect(this.gainNode);
        bufferSource.start(this.startTime);
        this.startTime += audioBuffer.duration;
        this.samples = new Float32Array();
    };

    /* initiate start flushing */
    this.flush = this.flush.bind(this);
    this.createContext();
    this.interval = setInterval(this.flush, this.flushingTime);
}