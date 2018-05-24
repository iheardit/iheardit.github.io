// manually rewritten from CoffeeScript output
// (see dev-coffee branch for original source)

// navigator.getUserMedia shim
navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

// URL shim
window.URL = window.URL || window.webkitURL;

// audio context + .createScriptProcessor shim
var audioContext = new AudioContext;
if (audioContext.createScriptProcessor == null)
    audioContext.createScriptProcessor = audioContext.createJavaScriptNode;

/*
test tone (440Hz sine with 2Hz on/off beep)
-------------------------------------------
            ampMod    output
osc(sine)-----|>--------|>----->(testTone)
              ^         ^
              |(gain)   |(gain)
              |         |
lfo(square)---+        0.5
*/
var testTone = (function () {
    var osc = audioContext.createOscillator(),
        lfo = audioContext.createOscillator(),
        ampMod = audioContext.createGain(),
        output = audioContext.createGain();
    lfo.type = 'square';
    lfo.frequency.value = 2;
    osc.connect(ampMod);
    lfo.connect(ampMod.gain);
    output.gain.value = 0.5;
    ampMod.connect(output);
    osc.start();
    lfo.start();
    return output;
})();

/*
master diagram
--------------
              testToneLevel
(testTone)----------|>---------+
                               |
                               v
                            (mixer)---+--->(audioRecorder)...+
                               ^      |                      :
              microphoneLevel  |      |                      v
(microphone)--------|>---------+      +--------------->(destination)
*/
var microphone = undefined,     // obtained by user click
    microphoneLevel = audioContext.createGain(),
    mixer = audioContext.createGain();
microphoneLevel.gain.value = 100;
microphoneLevel.connect(mixer);

// audio recorder object
var audioRecorder = new WebAudioRecorder(mixer, {
    workerDir: 'js/',
    onEncoderLoading: function (recorder, encoding) {
        console.log("encoding")
    },
    onEncoderLoaded: function () {
        console.log("encoding stop")
    }
});

// obtaining microphone input
function enableMic() {
    navigator.getUserMedia({audio: true},
        function (stream) {
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(microphoneLevel);
        },
        function (error) {
            audioRecorder.onError(audioRecorder, "Could not get audio input.");
        });
}

// encoding selector + encoding options
var OGG_QUALITY = [-0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    OGG_KBPS = [45, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 500],
    MP3_BIT_RATE = [64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    ENCODING_OPTION = {
        wav: {
            label: '',
            hidden: true,
            max: 1,
            text: function (val) {
                return '';
            }
        },
        ogg: {
            label: 'Quality',
            hidden: false,
            max: OGG_QUALITY.length - 1,
            text: function (val) {
                return OGG_QUALITY[val].toFixed(1) +
                    " (~" + OGG_KBPS[val] + "kbps)";
            }
        },
        mp3: {
            label: 'Bit rate',
            hidden: false,
            max: MP3_BIT_RATE.length - 1,
            text: function (val) {
                return "" + MP3_BIT_RATE[val] + "kbps";
            }
        }
    },
    optionValue = {
        wav: null,
        ogg: 6,
        mp3: 5
    };

// encoding process selector
var encodingProcess = 'background';

// encoding progress report modal
var progressComplete = false;

function setProgress(progress) {
    var percent = (progress * 100).toFixed(1) + "%";
    console.log(percent);
    progressComplete = progress === 1;
};

function startRecording() {
    audioRecorder.setOptions({
        timeLimit: 60,
        encodeAfterRecord: encodingProcess === 'separate',
        progressInterval: 1000,
        ogg: {quality: OGG_QUALITY[optionValue.ogg]},
        mp3: {bitRate: MP3_BIT_RATE[optionValue.mp3]}
    });
    audioRecorder.startRecording();
    setProgress(0);
};

function stopRecording(finish) {
    console.log("stopping");
    audioRecorder.finishRecording();
};

// event handlers
audioRecorder.onTimeout = function (recorder) {
    stopRecording(true);
};

audioRecorder.onEncodingProgress = function (recorder, progress) {
    setProgress(progress);
};

audioRecorder.onError = function (recorder, message) {
    console.log(message)
};
