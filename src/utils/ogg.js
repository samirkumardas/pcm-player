import Event from './event.js';
import { appendByteArray } from './utils.js';
export default class Ogg extends Event {
    constructor(channel) {
        super('ogg');
        this.channel = channel;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.queue = [];
        this.flushLimit = 20; /* the larger flush limit, the lesser clicking noise */
        this.init();
    }

    getSampleRate() {
        return this.audioCtx.sampleRate;
    }

    init() {
        let header,
            page;

        this.oggHeader = new Uint8Array();
        this.pageIndex = 0;
        this.serial = Math.ceil(Math.random() * Math.pow(2,32));
        this.initChecksumTable();

        /* ID Header */
        header = this.getIDHeader();
        page = this.getPage(header, 2);  // headerType of ID header is 2 i.e beginning of stream
        this.oggHeader = appendByteArray(this.oggHeader, page);

        /* comment Header */
        header = this.getCommentHeader();
        page = this.getPage(header, 0);  // headerType of comment header is 0
        this.oggHeader = appendByteArray(this.oggHeader, page);
    }

    getIDHeader() {
        let data = new Uint8Array(19),
            dv = new DataView(data.buffer);
        dv.setUint32( 0, 1937076303, true ); // Magic Signature 'Opus'
        dv.setUint32( 4, 1684104520, true ); // Magic Signature 'Head'
        dv.setUint8( 8, 1, true ); // Version
        dv.setUint8( 9, this.channel, true ); // Channel count
        dv.setUint16( 10, 0, true ); // pre-skip, don't need to skip any value
        dv.setUint32( 12, 8000, true ); // original sample rate, any valid sample e.g 8000
        dv.setUint16( 16, 0, true ); // output gain
        dv.setUint8( 18, 0, true ); // channel map 0 = one stream: mono or stereo
        return data;
    }

    getCommentHeader() {
        let data = new Uint8Array(20),
            dv = new DataView(data.buffer);
        dv.setUint32( 0, 1937076303, true ); // Magic Signature 'Opus'
        dv.setUint32( 4, 1936154964, true ); // Magic Signature 'Tags'
        dv.setUint32( 8, 4, true ); // Vendor Length
        dv.setUint32( 12, 1633837924, true ); // Vendor name 'abcd'
        dv.setUint32( 16, 0, true ); // User Comment List Length
        return data;
    }


    getPage(segmentData, headerType) {

        /* ref: https://tools.ietf.org/id/draft-ietf-codec-oggopus-00.html */
        let segmentTable = new Uint8Array(1); /* segment table stores segment length map. always providing one single segment */
        let page = new Uint8Array(27 + segmentTable.byteLength + segmentData.byteLength);
        let pageDV = new DataView(page.buffer);
        segmentTable[0] = segmentData.length;


        pageDV.setUint32( 0, 1399285583, true); // page headers starts with 'OggS'
        pageDV.setUint8( 4, 0, true ); // Version
        pageDV.setUint8( 5, headerType, true ); // 1 = continuation, 2 = beginning of stream, 4 = end of stream
        pageDV.setUint32( 6, -1, true ); // granuale position -1 i.e single packet per page. storing into bytes.
        pageDV.setUint32( 10, -1, true );
        pageDV.setUint32( 14, this.serial, true ); // Bitstream serial number
        pageDV.setUint32( 18, this.pageIndex++, true ); // Page sequence number
        pageDV.setUint8( 26, 1, true ); // Number of segments in page, giving always 1 segment

        page.set( segmentTable, 27 ); // Segment Table inserting at 27th position since page header length is 27
        page.set( segmentData, 28 ); // inserting at 28th since Segment Table(1) + header length(27)
        pageDV.setUint32( 22, this.getChecksum( page ), true ); // Checksum - generating for page data and inserting at 22th position into 32 bits

        return page;
    }

    getOGG() {
        let oggData = this.oggHeader,
            packet,
            segmentData,
            headerType;

        while (this.queue.length) {
            packet = this.queue.shift();
            headerType = this.queue.length == 0 ? 4 : 0; // for last packet, header type should be end of stream
            segmentData = this.getPage(packet, headerType);
            oggData = appendByteArray(oggData, segmentData);
        }

        this.pageIndex = 2; /* reseting pageIndex to 2 so we can re-use same header */
        return oggData;
    }

    getChecksum(data) {
        let checksum = 0;
        for ( var i = 0; i < data.length; i++ ) {
            checksum = (checksum << 8) ^ this.checksumTable[ ((checksum>>>24) & 0xff) ^ data[i] ];
        }
        return checksum >>> 0;
    }

    initChecksumTable () {
        this.checksumTable = [];
        for ( var i = 0; i < 256; i++ ) {
            var r = i << 24;
            for ( var j = 0; j < 8; j++ ) {
                r = ((r & 0x80000000) != 0) ? ((r << 1) ^ 0x04c11db7) : (r << 1);
            }
            this.checksumTable[i] = (r & 0xffffffff);
        }
    }

    decode(packet) {
        this.queue.push(packet);
        if (this.queue.length >= this.flushLimit) {
            this.process();
        }
    }

    process() {
        let ogg = this.getOGG();
        this.audioCtx.decodeAudioData(ogg.buffer, (audioBuffer) => {
            let pcmFloat;
            if (this.channel == 1) {
                pcmFloat = audioBuffer.getChannelData(0);
            } else {
                pcmFloat = this.getMergedPCMData(audioBuffer);
            }
            this.dispatch('data', pcmFloat); 
        });
    }

    getMergedPCMData(audioBuffer) {
        let audioData,
            result = [],
            length,
            pcmFloat,
            offset = 0,
            i=0,
            j=0;

        for(i=0; i<this.channel; i++) {
            audioData = audioBuffer.getChannelData(i);
            result.push(audioData);
        }

        length = result[0].length;
        pcmFloat = new Float32Array(this.channel * length);
        i = 0;
        while(length > i) {
            for(j=0; j<this.channel; j++) {
                pcmFloat[offset++] = result[j][i];
            }
            i++; 
        }
        return pcmFloat;
    }
    
    destroy() {
        this.oggHeader = null;
        this.audioCtx = null;
        this.checksumTable = null;
        this.offAll();
    }
}
