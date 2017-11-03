import { appendByteArray } from './utils/utils.js';
import Event from './utils/event.js';
import Ogg from './utils/ogg.js';
import OpusWorker from './utils/opus-worker.js';
export class OpusToPCM extends Event {

    constructor(options) {
        super('decoder');
        window.MediaSource = window.MediaSource || window.WebKitMediaSource;
        let nativeSupport = !!(window.MediaSource && window.MediaSource.isTypeSupported('audio/webm; codecs=opus'));
        let defaults = {
            channels: 1,
            fallback: true
        };
        options = Object.assign({}, defaults, options);

        if (nativeSupport) {
            this.decoder = new Ogg(options.channels); 
        } else if(options.fallback) {
            this.decoder = new OpusWorker(options.channels);
        } else {
            this.decoder = null;
        }

        if (this.decoder) {
            this.decoder.on('data', this.onData.bind(this));
        }
    }

    getSampleRate() {
        return this.decoder.getSampleRate();
    }

    onData(data) {
        this.dispatch('decode', data);
    }

    decode(packet) {
        if (!this.decoder) {
            throw ('opps! no decoder is found to decode');
        }
        this.decoder.decode(packet);
    }

    destroy() {
        this.decoder.destroy();
        this.offAll();
    }
}
