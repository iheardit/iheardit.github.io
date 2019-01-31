const button = document.querySelector('#btn-check');
const recorder = new MicRecorder({
  bitRate: 128
});
const iconRedo = ' <i class="fas fa-redo" id="btn-icon"></i>';
const iconMic = ' <i class="fas fa-microphone" id="btn-icon"></i>';
const URL = "https://api.iheardit.io/recognize/";

button.addEventListener('click', startRecording);

function startRecording() {
  button.classList.remove('tada');
  button.classList.remove('shake');
  changeColour(button, "#fff", 200);
  recorder.start().then(() => {
    button.innerHTML = 'Listening...' + iconMic;
    button.classList.add('pulse');
    button.classList.add('infinite');
    button.removeEventListener('click', startRecording);
    setTimeout(stopRecording, 4000);
  }).catch((e) => {
    console.error(e);
  });
}

function stopRecording() {
  recorder.stop().getMp3().then(([buffer, blob]) => {
    console.log(buffer, blob);
    callAPIFile(blob);
  }).catch((e) => {
    console.error(e);
  });
}

function changeColour(element, color, time) {
  $(element).animate({
    backgroundColor: color
  }, time);
}


function callAPIFile(blob) {
  let formData = new FormData();
  formData.append('file', blob);
  $.ajax({
    url: URL,
    type: "post",
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      button.classList.remove('pulse');
      button.classList.remove('infinite');
      button.classList.add('tada');
      changeColour(button, "rgb(77, 220, 141)", 1000);
      console.log(response);
      button.innerHTML = response['station']['name'].replace("_", "") + iconRedo;
    },
    error: function (xhr, textStatus, error) {
      button.classList.remove('pulse');
      button.classList.remove('infinite');
      button.classList.add('shake');
      changeColour(button, "rgb(228, 92, 92)", 1000);
      button.innerHTML = 'Please try again' + iconRedo;
    }
  }).always(function() {
    button.addEventListener('click', startRecording);
  });
}