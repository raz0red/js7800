import * as Sound from "../prosystem/Sound.js"
import * as Events from "../events.js"

var SOUNDBUFSIZE = 8192 << 1;
var DEFAULT_SAMPLE_RATE = 31440; // match default rate to NTSC
// The emulator is paced by its own timer, the sound card by its clock: any
// difference lets the queue grow until it holds the whole ring (~0.5s late,
// then garbled when the head laps the tail). Cap the queued samples.
var NODE_SIZE = 2048;
var MAX_QUEUED = NODE_SIZE * 3;
var TRIM_TO = NODE_SIZE * 2;

/** The audio context */
var audioCtx = null;
/** The audio node */
var audioNode = null;

var mixbuffer = new Array(SOUNDBUFSIZE);
var mixhead = 0;
var mixtail = 0;
var lastSample = 0;

function storeSound(sample, ym, length) {
  for (var i = 0; i < length; i++) {

    mixbuffer[mixhead++] = ym ? (((sample[i]/255) + (ym[i]/128)) / 2) : (sample[i]/255);
    if (mixhead == SOUNDBUFSIZE)
      mixhead = 0;
  }
  var queued = (mixhead - mixtail + SOUNDBUFSIZE) % SOUNDBUFSIZE;
  if (queued > MAX_QUEUED) {
    mixtail = (mixhead - TRIM_TO + SOUNDBUFSIZE) % SOUNDBUFSIZE;
  }
}

function init() {
  Sound.SetStoreSoundCallback(storeSound);
  if (audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    audioCtx.close();
    audioCtx=null;
    audioNode=null;
  }

  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    console.log('init audio');
    var sampleRate = DEFAULT_SAMPLE_RATE;
    audioCtx = window.AudioContext ?
      new window.AudioContext({ sampleRate: sampleRate }) :
      new window.webkitAudioContext();      
    if (audioCtx.sampleRate) {
      sampleRate = audioCtx.sampleRate;
    }
    Sound.SetSampleRate(sampleRate);
    audioNode = audioCtx.createScriptProcessor(NODE_SIZE, 0, 1);
    audioNode.onaudioprocess = function (e) {
      var dst = e.outputBuffer.getChannelData(0);
      var done = 0;
      var len = dst.length;
      while ((mixtail != mixhead) && (done < len)) {
        dst[done++] = mixbuffer[mixtail++];
        if (mixtail == SOUNDBUFSIZE)
          mixtail = 0;
      }
      // Underrun: hold the last level (silence is not 0: a drop to 0 pops)
      var last = done > 0 ? dst[done - 1] : lastSample;
      while (done < len) {
        dst[done++] = last;
      }
      lastSample = dst[len - 1];
    }
    audioNode.connect(audioCtx.destination);
    var resumeFunc =    
      function () { if (audioCtx.state !== 'running') audioCtx.resume(); }
    var docElement = document.documentElement;
    docElement.addEventListener("keydown", resumeFunc);
    docElement.addEventListener("click", resumeFunc);
    docElement.addEventListener("drop", resumeFunc);
    docElement.addEventListener("dragdrop", resumeFunc);
    window.addEventListener("gamepadconnected", resumeFunc);
  }
}

function audio_reinit(rate)
{
  DEFAULT_SAMPLE_RATE = rate;
  init();
}

Events.addListener(new Events.Listener("init", init));

export { 
  audio_reinit as reinit
}

