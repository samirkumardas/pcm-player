import {equal} from 'assert';
import Ogg from '../src/utils/ogg.js';
var channel = 1,
    decoder = new Ogg(channel),
    audioCtx = new (window.AudioContext || window.webkitAudioContext)(),
    sampleRate = audioCtx.sampleRate;
    

describe('Ogg tests -- ', function() {
      it('sample rate should be same system sample rate', function() {
         equal(decoder.getSampleRate(), sampleRate);
      });

      it('magic Signature of ID header should be Opus Head', function() {
         var idHeader = decoder.getIDHeader();
         var dv = new DataView(idHeader.buffer);
         equal(dv.getUint32(0, true), 1937076303);
         equal(dv.getUint32(4, true), 1684104520);
      });

      it('magic Signature of comment header should be Opus Tags', function() {
         var commonHeader = decoder.getCommentHeader();
         var dv = new DataView(commonHeader.buffer);
         equal(dv.getUint32(0, true), 1937076303);
         equal(dv.getUint32(4, true), 1936154964);
      });

      it('page header should be started with OggS', function() {
         var segmentData = new Uint8Array(20);
         var page = decoder.getPage(segmentData, 4);
         var dv = new DataView(page.buffer);
         equal(dv.getUint32(0, true), 1399285583);
      });
});