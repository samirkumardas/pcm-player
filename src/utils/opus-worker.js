export default class OpusWorker {
    constructor(channels) {
        this.worker = new Worker('libopus/opus.min.js');
        this.resolver = null;
        this.worker.addEventListener('message', this.onMessage.bind(this));
        this.worker.postMessage({
            type: 'init',
            config: {
                rate:24000,
                channels:channels
            }
        });
    }

    getSampleRate() {
        return 24000;
    }

    decode(packet) {
        let workerData = {
            type: 'decode',
            buffer: packet
        };
        this.worker.postMessage(workerData);
        return new Promise((resolve) => {
            this.resolver = resolve;
        });
    }

    onMessage(event) {
        let data = event.data;
        if (this.resolver) {
            this.resolver(data.buffer);
        }
    }
    destroy() {
        this.worker = null;
    }
}
