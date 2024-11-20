// Scan App functions

  //Uploads given fileBlob to given app_id file store
  //and then calls the fillDataToKnack of master.js to fill coresponding data
  async function uploadFileOnly(app_id, fileBlob, fileName, pdfAssetField, infoElementId) {
    var url = 'https://api.rd.knack.com/v1/applications/'+app_id+'/assets/file/upload';
    var form = new FormData();
    var headers = {
      'X-Knack-Application-ID': app_id,
      'X-Knack-REST-API-Key': 'knack',
    };

    form.append('files', fileBlob, fileName);

    try {
      $('#'+infoElementId).text('File upload started.');
      $.ajax({
        //this takes care about the progress reporting on infoElementId
        xhr: function() {
          var xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener("progress", function(evt) {
              if (evt.lengthComputable) {
                  var percentComplete = (evt.loaded / evt.total) * 100;
                  //Do something with upload progress here
                  $('#'+infoElementId).text('File upload progress: ' + parseInt(percentComplete)+'%');
              }
         }, false);
         return xhr;
        },
        url: url,
        type: 'POST',
        headers: headers,
        processData: false,
        contentType: false,
        mimeType: 'multipart/form-data',
        data: form
      }).then(rData => {
        $('#'+infoElementId).text('File upload finished.');
        try {
          if (typeof rData === 'string'){ rData = JSON.parse(rData);};
          $('#'+infoElementId).text('Upload succesfull, returning to app.');
          $('#kn-loading-spinner').hide();
          
          let message = {'event':'scanDocument','status':'ok','pdfAssetField':pdfAssetField,'pdfAssetId':rData.id, 'fileName':fileName}

          //function from master.js to fill return data to Knack
          fillDataToKnack(message);
        } catch (e) {
          alert('File upload was not succesfull.')
          alert(e);
        }
      })
    } catch (ex){
      alert('File upload was not succesfull.')
      alert(ex);
    }
  }

  //Uploads given fileBlob to given app_id file store
  //and then calls the fillDataToKnack of master.js to fill coresponding data
  async function uploadFileOnlyNew(app_id, fileBlob, fileName, pdfAssetField, infoElementId, viewId) {
    var url = 'https://api.rd.knack.com/v1/applications/'+app_id+'/assets/file/upload/stream?fieldKey='+pdfAssetField+'&filename='+fileName+'&size=65033&type=application%2Fpdf';
    var form = new FormData();
    var headers = {
      'X-Knack-Application-ID': app_id,
      'X-Knack-REST-API-Key': 'renderer',
    };

    form.append('origin', JSON.stringify({"view_key":viewId,"field_key":pdfAssetField}))
    form.append('files', fileBlob, fileName);

    try {
      $('#'+infoElementId).text('File upload started.');
      $.ajax({
        //this takes care about the progress reporting on infoElementId
        xhr: function() {
          var xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener("progress", function(evt) {
              if (evt.lengthComputable) {
                  var percentComplete = (evt.loaded / evt.total) * 100;
                  //Do something with upload progress here
                  $('#'+infoElementId).text('File upload progress: ' + parseInt(percentComplete)+'%');
              }
         }, false);
         return xhr;
        },
        url: url,
        type: 'POST',
        headers: headers,
        processData: false,
        contentType: false,
        mimeType: 'multipart/form-data',
        data: form
      }).then(rData => {
        $('#'+infoElementId).text('File upload finished.');
        try {
          if (typeof rData === 'string'){ rData = JSON.parse(rData);};
          $('#'+infoElementId).text('Upload succesfull, returning to app.');
          $('#kn-loading-spinner').hide();
          
          let message = {'event':'scanDocument','status':'ok','pdfAssetField':pdfAssetField,'pdfAssetId':rData.id, 'fileName':fileName}

          //function from master.js to fill return data to Knack
          fillDataToKnack(message);
        } catch (e) {
          alert('File upload was not succesfull.')
          alert(e);
        }
      })
    } catch (ex){
      alert('File upload was not succesfull.')
      alert(ex);
    }
  }

  //************************************* OPERATING SYSTEM DETECTION *****************************************   
var OperatingSystem = {
  Android: function() {
      return navigator.userAgent.match(/Android/i);
   },

   iOS: function() {
     if(navigator.vendor.match(/google/i)) { return false;}
     else if(navigator.vendor.match(/apple/i)) {return true;}
   }
};

  //************************************* LAYOUT *****************************************
  //this function sets the layout of page based on two params, if we are in cameraView and if we are actualy taking photo
function prepareLayout(cameraView, takingPhoto){
    if (cameraView){
        $('#cameraTakePhotoDiv').show();
        $('#scanDocGallery').hide();
        if (takingPhoto){
            $('#videoElement').show();
            $('#scanCameraVid_container').show();
            $('#scanCameraGui_controls').show();
            $("#scanCameraConfirm").attr("disabled", false);
            $("#scanCameraExit").show();
            $("#scanCameraRetake").hide();
            $("#scanCameraConfirm").hide();
            $('#scanCameraGrid').hide();
            $("#scanCameraText").hide();
            $("#scanTakePhoto").show();
            //disables zooming
            $('meta[name="viewport"]').attr('content',"width=device-width, initial-scale=1.0, target-densitydpi=160, maximum-scale=1");
        } else {
            //HIDE VIDEO & OVERLAY ELEMENT
            $('#videoElement').hide();

            //DISPLAY COMPARISION CONTENT
            $('#scanCameraGrid').show();
            $("#scanCameraText").show();

            //SHOW RETAKE AND CONFIORM BUTTON
            $("#scanCameraRetake").show();
            $("#scanCameraConfirm").show();

            //HIDE EXIT BUTTON
            $("#scanCameraExit").hide();

            // DISABLE TAKEPHOTO BUTTON
            $("#scanTakePhoto").hide();
            //enables zooming
            $('meta[name="viewport"]').attr('content',"width=device-width, initial-scale=1.0, target-densitydpi=160, maximum-scale=5, minimum-scale=1, user-scalable=yes")
        }
    } else {
        $('#scanDocGallery').show();
        $('#cameraTakePhotoDiv').hide();
        $('#scanCameraVid_container').hide();
        $('#scanCameraGrid').hide();
        $('#scanCameraGui_controls').hide();
        $('#cameraUploadOnce').removeAttr('disabled');
        $('#cameraTakePhoto').removeAttr('disabled');
        $('#cameraCancelAll').removeAttr('disabled');
        //disables zooming
        $('meta[name="viewport"]').attr('content',"width=device-width, initial-scale=1.0, target-densitydpi=160, maximum-scale=1");
    }
    $('#kn-loading-spinner').hide();
}

//prepares everything for opening the camera and taking the photo
function prepareCameraView(imgToSaveName){
  cameraView = true;
  takingPhoto = true;
  prepareLayout(cameraView, takingPhoto);

  var imageCapture;

  var img = document.querySelector("#scanCameraFrontpic");
  var video = document.querySelector('video');
  var takePhotoButton = document.querySelector('button#scanTakePhoto');
  var confirmButton = document.querySelector('#scanCameraConfirm');
  var retakeButton = document.querySelector('#scanCameraRetake');
  var exitButton = document.querySelector('#scanCameraExit');

  img.style.visibility = 'hidden';

  const constraints = {
    width: { min: 1440, max: 3984 },
    height: { min: 1080, max: 2988 },
    aspectRatio: 4/3,
    frameRate:{max: 30},
  };

  function openCamera(getUserMediaC, constraints){
    navigator.mediaDevices.getUserMedia(getUserMediaC).then(mediaStream => {
      document.querySelector('video').srcObject = mediaStream;

      const track = mediaStream.getVideoTracks()[0];

      if (constraints) track.applyConstraints(constraints);
  
      if (!OperatingSystem.iOS()) {
        imageCapture = new ImageCapture(track);
      }
  
    })
    .catch(error =>{
      if (error.toString().includes('Permission denied')){
        alert('This application needs your permission to camera. If you have accidentally Blocked the camera access you need to unblock it in your browser settings.')
      } else {
        alert('Error starting camera. Please report this error to admin.'+ error)
      }
    });
}

if (OperatingSystem.Android()) {
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      let deviceId = '';
      let countOfBackCameras = 0;
      devices.forEach(function(device) {
        if (device.label.toLowerCase().includes('back')){
            countOfBackCameras += 1;
            deviceId = device.deviceId;
        }
      });

      if (countOfBackCameras<=1){
        openCamera({video: {facingMode: {exact: "environment"}}},constraints);
      } else {
        openCamera({video: {deviceId: {exact: deviceId}}},constraints);
      }
    })
    .catch(function(err) {
      alert('error enumeration devices, contact support')
      alert(err.name + ": " + err.message);
    });
  } else {
    if (Knack.getUserAttributes().email.includes('hynek') || Knack.getUserAttributes().email.includes('david.male')){
      console.log('hynek')
      openCamera({'video':true},null);
    } else {
      openCamera({video: {facingMode: {exact: "environment"}}},constraints);
    }
  }


//************************************* TAKE A PICTURE AND CROP*****************************************
var sndCameraTakePhoto = document.createElement('audio');  
sndCameraTakePhoto.type = "audio/mpeg";     
sndCameraTakePhoto.src = "https://stellantisandyoucouk.github.io/imagesStore/camera-shutter-click.mp3";                 
sndCameraTakePhoto.load(); 

takePhotoButton.onclick = takePhoto;

  function takePhoto() {
    $('#kn-loading-spinner').show();
    if (OperatingSystem.iOS()) {
      var c = document.createElement('canvas');
 		  c.width = video.videoWidth;
		  c.height = video.videoHeight;
	    var ctx = c.getContext('2d');
	    ctx.drawImage(video, 0, 0);
	    ctx.canvas.toBlob((blob) => {
        img.classList.remove('hidden');
        img.style.visibility = 'visible';
	      img.src = URL.createObjectURL(blob);
	    }, 'image/jpeg', 1);
    } else /*if (OperatingSystem.Android())*/ {     
      imageCapture.takePhoto().then(function(blob) {
        img.classList.remove('hidden');
        img.style.visibility = 'visible';
        img.src = URL.createObjectURL(blob);
      }).catch(function(error) {
        console.log('takePhoto() error: ', error);
        alert('Photo taking error, please reload page.');
      });
    } /*else {
      alert('Your web browser is not supported, detection shows not Android, not Safari on Apple. Please check, if you do not have "Desktop site" on in Chrome settings. Please report your user agent: '+navigator.userAgent); 
    }*/
    
    sndCameraTakePhoto.play();

    takingPhoto = false;
    prepareLayout(cameraView, takingPhoto);
  }

  //CONFIRM BUTTON, WILL SAVE THE PHOTO TO KNACK//
  confirmButton.onclick = onclickConfirmButton;

  function onclickConfirmButton(){
    $('#kn-loading-spinner').show();

    // DISABLE SAVE BUTTON
    $("#scanCameraConfirm").attr("disabled", true);

    confirmImage();
  }

  async function confirmImage(){
    //create new image element for saved image
    var imgToSave = document.createElement('img');
    imgToSave.id = imgToSaveName;
    imgToSave.classList.add("scanPhotoGrid");
    imgToSave.onclick = removeThisImage;
    document.getElementById("cameraTakenPhotos").appendChild(imgToSave);

    photosTaken += 1;

    //resize or if needed rotate the taken image
    let outputCanvas = document.createElement("canvas");
    let outputCtx = outputCanvas.getContext("2d"); 
    if (img.naturalWidth>img.naturalHeight){
      let scale = 1190 / img.naturalWidth //for pdf size
      outputCanvas.height = img.naturalWidth * scale;
      outputCanvas.width = img.naturalHeight * scale;
      outputCtx.translate(0, img.naturalWidth * scale);
      outputCtx.rotate(-90*Math.PI/180);
      outputCtx.drawImage(img, 0, 0, img.naturalWidth * scale, img.naturalHeight * scale);
    } else {
      let scale = 1190 / img.naturalWidth //for pdf size
      outputCanvas.height = img.naturalHeight * scale;
      outputCanvas.width = img.naturalWidth * scale;
      outputCtx.drawImage(img, 0, 0, img.naturalWidth * scale, img.naturalHeight * scale);
    }
    imgToSave.src = outputCtx.canvas.toDataURL("image/jpeg", 0.8);

    //STOP TRACK WHEN USER SAVES IMAGE
    try {
      video.srcObject.getVideoTracks().forEach(track => track.stop());
    } catch (e) {}

    prepareFileView()
  }


//*************************************RETAKE BUTTON, THIS WILL DELETE THE PHOTO TAKEN*****************************************
  retakeButton.onclick = function() {
    //CLEAR TAKEN PHOTO
    img.src = '';
    if (OperatingSystem.iOS()) {
        img.style.visibility = 'hidden';
    }      

    takingPhoto = true;
    prepareLayout(cameraView, takingPhoto);
  }


 //*************************************EXIT BUTTON TAKE USER BACK TO HOME PAGE*****************************************

  exitButton.onclick = function() {
    //STOP TRACK WHEN USER EXIT THE APP
    try {
      video.srcObject.getVideoTracks().forEach(track => track.stop());
    } catch (e) {}

    prepareFileView()
  }  
}

var cameraView = false;
var takingPhoto = false;
var photosTaken = 0;

//this function is on click on each of taken images
function removeThisImage(){
  var imageToRemove = this;
  document.getElementById("modalText").textContent = "Delete image?";
  document.getElementById("modalYes").onclick = function() {
    imageToRemove.remove();
    document.getElementById("modalDialog").style.display = "none";
  }
  document.getElementById("modalDialog").style.display = "block"
}

//shows the file view layout of app
function prepareFileView(){
  cameraView = false;
  prepareLayout(cameraView, takingPhoto);
  if ($('img[id*="cameraImg"]').length === 0) {$('#cameraUploadDiv').hide()} else {$('#cameraUploadDiv').show()}

  $('#kn-loading-spinner').hide();
}

//basic preparation of the app when it is called first time
function prepareFileViewOnce(){
  try { 
  photosTaken = 0;
  if ($('img[id*="cameraImg"]').length > 0){
    for (let i = $('img[id*="cameraImg"]').length-1;i>=0;i--){
      $('img[id*="cameraImg"]').eq(i).remove();
    }
  }

  $('#infoText').text('');
  $('#cameraUploadFileName').attr('value','ScannedDocument.pdf');

    let cameraTakePhoto = document.getElementById('cameraTakePhoto');
    cameraTakePhoto.onclick = function() {
        prepareCameraView('cameraImg'+(photosTaken+1));
    }

    let cancelAll = document.getElementById('cameraCancelAll');
    cancelAll.onclick = function(){
      hideScanApp();
    }

    function cameraUpload(){
      $('#kn-loading-spinner').show();
      $('#cameraUploadOnce').attr("disabled", true);
      $('#cameraTakePhoto').attr("disabled", true);
      $('#cameraCancelAll').attr("disabled", true);
      $('#infoText').text('File conversion and upload started.');
      $('#infoDialog').show();
      createPDF('infoText');
    }

    document.getElementById('cameraUploadOnce').onclick = cameraUpload;

    document.getElementById("modalClose").onclick = function() {
      document.getElementById("modalDialog").style.display = "none";
    }
    document.getElementById("modalCancel").onclick = function() {
      document.getElementById("modalDialog").style.display = "none";
    }
  } catch (e){ alert(e);}
}

function right(str, chr){
	return str.slice(str.length-chr,str.length);
}

//the output function, which takes all the taken images and converts them to PDF and calls the upload function
async function createPDF(infoText){
  try {
    var pdfName = $('#cameraUploadFileName').attr('value');
    if (pdfName===''){pdfName='ScannedDocument.pdf'};
    if (right(pdfName,4).toLowerCase()!=='.pdf'){pdfName = pdfName+'.pdf'}

    $('#'+infoText).text('PDF creationg started.');
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF("p", "mm", "a4", true);

    var pdfWidth = doc.internal.pageSize.getWidth();
    var pdfHeight = doc.internal.pageSize.getHeight();

    let isFirstPage = true;
    for (let i = 1; i <= photosTaken; i++) { 
      if ($('#cameraImg'+i).length!==0){
        if (!isFirstPage) { doc.addPage("a4","portrait"); } else { isFirstPage=false }
        doc.addImage($('#cameraImg'+i).attr('src'), 'JPEG', 0, 0, pdfWidth, pdfHeight,undefined,'SLOW');
      }
    }
  } catch (e){
    alert(e)
  }
  try {
    var blobPDF = doc.output('blob');

    $('#'+infoText).text('PDF created, starting upload.');

    if (Knack.getUserAttributes().email.includes('hynek') || Knack.getUserAttributes().email.includes('david.male')){
      uploadFileOnlyNew(returnData.app_id, blobPDF,pdfName, returnData.pdfAssetField, infoText,'view_2706');
    } else {
      uploadFileOnly(returnData.app_id, blobPDF,pdfName, returnData.pdfAssetField, infoText);
    }
    
  } catch(e){
    alert(e);
  }
}

var returnData = {};
function afterLoad(app_id, pdfAssetField){
  returnData.app_id = app_id;
  returnData.pdfAssetField = pdfAssetField;
  prepareFileViewOnce();
  prepareFileView();
}

