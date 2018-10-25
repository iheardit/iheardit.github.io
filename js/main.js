var $btn = $("#btn-check");
var btnRedo = ' <i class="fas fa-redo" id="btn-icon"></i>';
var btnMic = ' <i class="fas fa-microphone" id="btn-icon"></i>';

function animateSuccess(text) {
    $btn.removeClass('pulse infinite');
    $btn.addClass('tada');
    changeColour("rgb(77, 220, 141)", 1000);
    $btn.text(text);
    $btn.append(btnRedo)
}

function animateFail(text) {
    $btn.removeClass('pulse infinite');
    $btn.addClass('shake');
    changeColour("rgb(228, 92, 92)", 1000);
    $btn.text(text);
    $btn.append(btnRedo)
}

function changeColour(color, time) {
    $btn.animate({
        backgroundColor: color
    }, time);
}

audioRecorder.onComplete = function (recorder, blob) {
    console.log("complete recording");
    callRecognizeFile(blob, recorder.encoding);
};

function onActionButtonClick() {
    enableMic();
    startRecording();
    console.log("started recording");
    changeColour("#fff", 200);

    $btn.removeClass("shake");
    $btn.removeClass("tada");
    $btn.addClass("pulse");
    $btn.addClass("infinite");
    $btn.text("Listening...");
    $btn.append(btnMic);

    setTimeout(stopRecording, 5000);
}

function callRecognizeFile(blob, encoding) {
    var url = "http://ec2-3-120-190-175.eu-central-1.compute.amazonaws.com/recognize/";
    var formData = new FormData();
    formData.append('file', blob);
    console.log("calling api");
    $.ajax({
        url: url,
        type: "post",
        data: formData,
        processData: false,
        contentType: false,
        success: function (r) {
            animateSuccess(r['station']['name'].replace("_", ""));
            console.log(r)
        },
        error: function (r) {
            animateFail("Please try again");
        }
    });
}

$btn.click(onActionButtonClick);
