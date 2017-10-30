import { appendByteArray } from './utils/utils.js';
import Ogg from './utils/ogg.js';
import OpusWorker from './utils/opus-worker.js';
export class OpusToPCM {

    constructor(options) {
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
    }

    getSampleRate() {
        return this.decoder.getSampleRate();
    }

    decode(packet) {
        if (!this.decoder) {
            throw ('opps! no decoder is found to decode');
        }
        return this.decoder.decode(packet);
    }

    destroy() {
        this.decoder.destroy();
    }
}
