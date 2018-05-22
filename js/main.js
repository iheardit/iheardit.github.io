var $btn = $("#btn-check");

function animateSuccess(text) {
    $btn.removeClass('pulse infinite');
    $btn.addClass('tada');
    changeColour("rgb(228, 92, 92)");
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

function onActionButtonClick() {
    recognizeFile(null, null)
}

function recognizeFile(blob, encoding) {
    var url = "http://ec2-52-28-15-177.eu-central-1.compute.amazonaws.com:8000/recognize_file/";
    var formData = new FormData();
    formData.append('file', blob);

    $.ajax({
        url: url,
        type: "post",
        data: formData,
        processData: false,
        contentType: false,
        success: function (r) {
            animateSuccess(r['station']['name']);
        },
        error: function (r) {
            animateFail("Please try again");
        }
    });
}

$btn.click(onActionButtonClick);