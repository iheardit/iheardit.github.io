var $btn = $("#btn-check");

function animateSuccess(text) {
    $btn.removeClass('pulse infinite');
    $btn.addClass('tada');
    changeColour("rgb(77, 220, 141)");
    $btn.text(text);
}

function animateFail(text) {
    $btn.removeClass('pulse infinite');
    $btn.addClass('shake');
    changeColour("rgb(228, 92, 92)");
    $btn.text(text);
}

function changeColour(color) {
    $btn.animate({
        backgroundColor: color
    }, 1000);
}

audioRecorder.onComplete = function (recorder, blob) {
    console.log("complete recording");
    callRecognizeFile(blob, recorder.encoding);
};

function onActionButtonClick() {
    enableMic();
    startRecording();
    console.log("started recording");
    setTimeout(stopRecording, 5000);
    console.log("test")
}

function callRecognizeFile(blob, encoding) {
    var url = "http://ec2-18-197-175-99.eu-central-1.compute.amazonaws.com:8000/recognize_file/";
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
        },
        error: function (r) {
            animateFail("Please try again");
        }
    });
}

$btn.click(onActionButtonClick);