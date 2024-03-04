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
  
  //************************************* GO INTO FULLSCREEN (ONLY ANDRIOD DEVICE WORK) *****************************************
  function goToFullscreen(){
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
  }
  
  function exitFullscreen(){
  //EXIT FULL SCREEN MODE
  if (document.exitFullscreen) {
   document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
   document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
   document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
   document.msExitFullscreen();
  }
  }
  
  //Camera app code
  
  // Camera app share functions
  //************************************* SAVE THE PICTURE YOU'VE JUST TAKEN WITH THE CAMERA TO KNACK*****************************************
  
    //this function just parses recordId from URL //maybe needs to be altered acording the use
    function getRecordIdFromHref(ur) {
      var ur = ur.substr(0, ur.length - 1);
      return ur.substr(ur.lastIndexOf('/') + 1)
    }
  
    async function uploadImage(app_id, imgUrl) {
      var url = 'https://api.rd.knack.com/v1/applications/'+app_id+'/assets/image/upload';
      var headers = {
        'X-Knack-Application-ID': app_id,
        'X-Knack-REST-API-Key': 'knack',
      };
      var form = new FormData();
  
      return fetch(imgUrl)
        .then(function(response) {
          return response.blob();
        })
        .then(function(blob) {
          form.append('files', blob, "fileimage.jpg");
  
          var rData = $.ajax({
            url: url,
            type: 'POST',
            headers: headers,
            processData: false,
            contentType: false,
            mimeType: 'multipart/form-data',
            data: form,
            async: false
          }).responseText;
  
          try {
            var rDataP = JSON.parse(rData);
            if (rDataP.id) {
              return {'status': 'ok', 'id': rDataP.id}
            }
            alert('uploadFail_1:'+rData);
            alert(imgUrl);
            return {'status': 'fail'};
          } catch (e) {
            alert('uploadFail_2:'+e.toString());
            alert(rData);
            return {'status': 'fail'};
          }
        });
    }
  
    //Uploads given fileBlob to given app_id file store
    //and then calls the fillDataToKnack of master.js to fill coresponding data
    async function uploadFileOnly(app_id, fileBlob, fileName, infoElementId, fieldName, statusFieldName, recordId) {
      var url = 'https://api.rd.knack.com/v1/applications/'+app_id+'/assets/file/upload';
      var form = new FormData();
      var headers = {
        'X-Knack-Application-ID': app_id,
        'X-Knack-REST-API-Key': 'knack',
      };
  
      form.append('files', fileBlob, fileName);
  
      try {
        $('#'+infoElementId).text('Video upload started.');
        uploadVideoUploadStatusInKnack({'event':'videoUploadStatus', 'fieldName':statusFieldName,'value':'Video upload started.' }, recordId);
        $.ajax({
          //this takes care about the progress reporting on infoElementId
          xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = (evt.loaded / evt.total) * 100;
                    //Do something with upload progress here
                    $('#'+infoElementId).text('Video upload progress: ' + parseInt(percentComplete)+'%');
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
            $('#'+infoElementId).text('Upload succesfull ...');
            $('#kn-loading-spinner').hide();
            console.log(rData);
  
            let message = {'event':'videoUploadedSuccesfully','fieldName':fieldName,'assetId':rData.id, 'fileName':fileName};
  
            uploadVideoUploadStatusInKnack(message, recordId);
            uploadVideoUploadStatusInKnack({'event':'videoUploadStatus', 'fieldName':statusFieldName,'value':'Video saved.' }, recordId);
  
          } catch (e) {
            uploadVideoUploadStatusInKnack({'event':'videoUploadStatus', 'fieldName':statusFieldName,'value':'Video upload failed.' }, recordId);
            alert('File upload was not succesfull.')
            alert(e);
          }
        })
      } catch (ex){
        uploadVideoUploadStatusInKnack({'event':'videoUploadStatus', 'fieldName':statusFieldName,'value':'Video upload failed.' }, recordId);
        alert('File upload was not succesfull.')
        alert(ex);
      }
    }
  
    function getTokenFromApify() {
      var token = $.ajax({
        url: 'https://api.apify.com/v2/key-value-stores/2qbFRKmJ2qME8tYAD/records/apitele_token_open?disableRedirect=true',
        type: 'GET',
        async: false
      }).responseText;
      if (!token) return '';
      token = token.replace('"', '').replace('"', '');
      return token;
    }
  
    function saveImageLinkToKnack(fieldName, imageId, app_id, token, updatingRecordId, knackSceneView) {
      var dataF = '{"' + fieldName + '": "' + imageId + '"}'
      var headersForSecureView = {
        'X-Knack-Application-ID': app_id,
        'Authorization': token
      };
  
      var rData2 = $.ajax({
        url: 'https://api.rd.knack.com/v1/pages/' + knackSceneView + '/records/' + updatingRecordId,
        type: 'PUT',
        headers: headersForSecureView,
        contentType: 'application/json',
        data: dataF,
        async: false
      }).responseText;
  
      try {
        var rData2P = JSON.parse(rData2);
        if (rData2P.record) {
          return {'status': 'ok'}
        }
      } catch (e) {
        alert(rData2)
        return {'status': 'fail'};
      }
    }
  
    function saveDataToKnack(fieldName, fieldValue, app_id, token, updatingRecordId, knackSceneView) {
      var dataF = '{"' + fieldName + '": "' + fieldValue + '"}'
      var headersForSecureView = {
        'X-Knack-Application-ID': app_id,
        'Authorization': token
      };
  
      var rData2 = $.ajax({
        url: 'https://api.rd.knack.com/v1/pages/' + knackSceneView + '/records/' + updatingRecordId,
        type: 'PUT',
        headers: headersForSecureView,
        contentType: 'application/json',
        data: dataF,
        async: false
      }).responseText;
  
      try {
        var rData2P = JSON.parse(rData2);
        if (rData2P.record) {
          return {'status': 'ok'}
        }
      } catch (e) {
        alert(rData2)
        return {'status': 'fail'};
      }
    }
  
  function IsInHomeScreen(){
    if (OperatingSystem.iOS()){
      if (window.navigator.standalone){
        return true;
      } else {
        return false;
      }
    } 
    if (OperatingSystem.Android()) {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
      } else {
        return false;
      }
    }
    return null;
  }
  
  $(document).on('knack-scene-render.scene_435', function(event, scene) {
    let iH = IsInHomeScreen();
    if (iH || iH===null){
      $('div[class="kn-view"]:contains("MUST add Robins")').hide()
      $('div[id="view_5185"]').hide()
    }
   });
  
  function prepareCameraView(backUrl,app_id,imageFieldOnKnack,imageViewOnKnack){
  // ***************************************************************************************************************************
  // ****************************************CAMERA APP WITH PICTURE OVERLAY******************************************************
  // *****************************************************************************************************************************
    var go = () => {
      effect.show();
      /*
        if(interval===0) { // if interval is equal to 0     
          interval = setInterval(function () {
              effect.fadeIn(1500, function () {
                effect.fadeOut(1500);
              });
            }, 3000);
        }
        
      }*/
    }
  
    var stop = () => {
      effect.hide();
      if(interval) {
        clearInterval(interval);
        interval = 0; 
      }
    }
  
    //Hide the spirit line in the begining
    $('#cameraLine').hide();
  
    var imageCapture;
  
    var img = document.getElementById('cameraFrontpic');
    var video = document.querySelector('video');
    var takePhotoButton = document.querySelector('button#takePhoto');
    var confirmButton = document.querySelector('#cameraConfirm');
    var retakeButton = document.querySelector('#cameraRetake');
    var exitButton = document.querySelector('#cameraExit');
    var calibrateButton = document.querySelector('#cameraCalibrate');
    var line = document.getElementById('cameraLine');
    var acceptButton = document.querySelector('#cameraAccept');
  
    goToFullscreen();
  
    //************************************* OPEN THE CAMERA BY ASKING USER PERMISSION(APPLE DEVICE) AND APPLY VIDEO STREAM SETTINGS*****************************************
    const constraints = {
      width: { min: 1440, ideal: 1280, max: 3984 },
      height: { min: 1080, ideal: 720, max: 2988 },
      aspectRatio: 4/3,
      frameRate:{max: 30}
      };
  
    function openCamera(getUserMediaC, constraints){
        navigator.mediaDevices.getUserMedia(getUserMediaC).then(mediaStream => {
          document.querySelector('video').srcObject = mediaStream;
      
          const track = mediaStream.getVideoTracks()[0];
      
          track.applyConstraints(constraints);
      
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
      openCamera({video: {facingMode: {exact: "environment"}}},constraints);
    }
    
    //**************************** APPLY PICTURE OVERLAY WHICH IS DRAWN ONTO THE CANVAS. WITH THE OVERLAY EFFECT*****************************************
  
    const canvas = document.getElementById('cameraOverlayCanvas');  
    const ctx = canvas.getContext('2d');
    var interval = 0;
    const effect = $('#cameraOverlayCanvas');
  
    const image = new Image('naturalWidth', 'naturalHeight');
    image.onload = drawImageActualSize;
  
     //this image gets the captured photo and when it is loaded it resizes iteslf and saves the image to shown image
    var imageBeforeResize = document.createElement('img');
  
    //************************************* LAYOUT *****************************************
    //HIDE RETAKE AND CONFIRM BUTTONS
    $("#cameraRetake").hide();
    $("#cameraConfirm").hide();
    //HIDE THE COMPARISION PICTURE AND TEXT
    $("#cameraCompare").hide();
    $("#cameraText").hide();
  
  //**************************** DETECT SCREEN ORIENTATION WHEN THE APP IS LOADED AND DETECT WHEN USER CHANGES SCREEN ORIENTATION*****************************************
    var isLandscape = false;
    var portraitStill = true;
    //DETECT WHICH ORIENTATION THE USEER IS IN
    if(window.innerHeight > window.innerWidth){ // if portrait
         $("#cameraLine").hide();
         $("#cameraCalibrate").hide();
         $("#takePhoto").hide();
         $("#cameraRotate").show();
         $(stop);
         isLandscape = false;
    }
  
    if(window.innerWidth > window.innerHeight){ // if landscape
      $("#cameraCalibrate").hide();
        $("#takePhoto").show();
        $("#cameraRotate").hide();
        $(go);
        isLandscape = true;
        portraitStill = false;
    }
  
    window.addEventListener("deviceorientation", handleOrientation, true);
  
    var permissionForOrientation = 'none';
    // when page loads checks if the device requires user to to enable motion sensors, If they do then display the dialog
    // but here it just gives to the property permissionForOrientation the info about need, the dialog is shown after 1 second if no orientation events are coming
    if ( window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === 'function' ){
      permissionForOrientation = 'need';
        console.log("permision needed");
        //This function after 1 second checks if the events are coming or not
        setTimeout(function() {
          if (permissionForOrientation==='need'){
            $('#cameraModal').show(); // show dialog asking user to enable motion sensor
            //De-activate takephoto button until user agnet agreed
            $("#takePhoto").hide();
  
            acceptButton.onclick = function(){
              DeviceOrientationEvent.requestPermission()
              .then(response => {
                if (response == 'granted') {
                  window.addEventListener("deviceorientation", handleOrientation, true);
                  $('#cameraModal').hide();
                  //$("#takePhoto").removeAttr('disabled');
                  if (isLandscape) $("#takePhoto").show();
                }
              })
              .catch(console.error)
            }
          }
        }, 1000);
    }
  
    //PROPERTY AND EVENTS FOR ONLINE/OFFLINE DETECTION
    var isOnline = true;
    window.addEventListener('online', () => isOnline = true);
    window.addEventListener('offline', () => isOnline = false);
  
  imageBeforeResize.onload = () => {
     const elem = document.createElement('canvas');
     elem.width = 768;
     elem.height = 576;
     const ctx = elem.getContext('2d');
    //check if the resolution of the image is 4:3
  
    if ((imageBeforeResize.width/imageBeforeResize.height)===(4/3)){
      var percentOfPicture = 0.6;
      var left = imageBeforeResize.width * ((1-percentOfPicture)/2);
      var top = imageBeforeResize.height * ((1-percentOfPicture)/2);
      if (OperatingSystem.iOS()){
        if (!window.navigator.standalone){
          //top = 0;
          //alert('Safari with top')
        } else {
          //alert('Safari without top');
        }
      }
      ctx.drawImage(imageBeforeResize, left, top , imageBeforeResize.width * percentOfPicture,imageBeforeResize.height * percentOfPicture, 0, 0, 768, 576);
    } else {
      //alert('another resolution');
      var percentOfPicture69 = 0.7;
      //if not, compute what you need to crop, now it expects the width/heigth more than 4/3, so it crops just width
      var sx = ((imageBeforeResize.width-((4/3)*imageBeforeResize.height))/imageBeforeResize.width) * imageBeforeResize.width / 2;
      var sw = imageBeforeResize.width - (((imageBeforeResize.width-((4/3)*imageBeforeResize.height))/imageBeforeResize.width) * imageBeforeResize.width);
      ctx.drawImage(imageBeforeResize, sx + sw * (1-percentOfPicture69)/2, imageBeforeResize.height * (1-percentOfPicture69)/2, sw * percentOfPicture69, imageBeforeResize.height * percentOfPicture69, 0, 0, 768, 576);
    }
     //save the resized image to the shown img
     ctx.canvas.toBlob((blob) => {
        img.src = URL.createObjectURL(blob);
    }, 'image/jpeg', 1);
    Knack.hideSpinner();
  }
  
   function drawImageActualSize() {
     canvas.width = this.naturalWidth;
     canvas.height = this.naturalHeight;
     ctx.drawImage(this, 0, 0);
   }
  
  var isInCalibrationMode = false;
  var lastBeta = null;
  var calibrationValue = getCookie('rdSpiritCalibration');
  //**************************** SPIRIT LEVEL *****************************************
   var lineVisible = true;
   var canTakePhoto = false;
   function handleOrientation(event) {
    $("#cameraLine").hide();
  }
  
    //IF THE USER CHANGES SCREEN ORIENTATION
  
  $(window).on("orientationchange",function(){
    if(window.orientation == 0 || window.orientation == 180){ // Portrait
      $(stop);
      $("#cameraCalibrate").hide();
      $("#cameraLine").hide();
      $("#takePhoto").hide();
      $("#cameraRotate").show();
      isLandscape = false;
    }
    else if(window.orientation == 90 || window.orientation == 270){ // Landscape
      $("#cameraCalibrate").hide();
      $("#cameraRotate").hide();
      if (!isInCalibrationMode){
        $("#takePhoto").show();
      }
      $(go);
      isLandscape = true;
      portraitStill = false;
    }
  });
  
  //This function checks if user is still in Portrait mode
  setTimeout(function() {
    if (portraitStill){
      if (OperatingSystem.iOS()) {
        alert('Your Device is still in Portrait mode. Please check that “Screen Orientation Lock” is NOT enabled on your device, and then rotate it to enter Landscape mode and take a photo…')
      } else {
        alert('Your Device is still in Portrait mode. Please check that the device is NOT Locked in Portrait mode, and then rotate it to enter Landscape mode and take a photo…')
      }
    }
  }, 10000);
  
  var sndCameraTakePhoto = document.createElement('audio');  
  sndCameraTakePhoto.type = "audio/mpeg";     
  sndCameraTakePhoto.src = "https://robinsandday.github.io/imagesStore/camera-shutter-click.mp3";                 
  sndCameraTakePhoto.load(); 
  //************************************* TAKE A PICTURE AND CROP*****************************************
  
  takePhotoButton.onclick = function () {
  
      Knack.showSpinner();
      sndCameraTakePhoto.play();
  
      //HIDE VIDEO & OVERLAY ELEMENT
      $('video').hide();
      $(stop);
  
      //DISPLAY COMPARISION CONTENT
      $("#cameraCompare").hide();
      $("#cameraText").show();
  
     //SHOW RETAKLE AND CONFIORM BUTTON
      $("#cameraRetake").show();
      $("#cameraConfirm").show();
  
      //HIDE EXIT BUTTON
      $("#cameraExit").hide();
  
      //HIDE LEVEL LINE
      $("#cameraLine").hide();
      lineVisible = false;
      $("#cameraCalibrate").hide();
  
      // DISABLE TAKEPHOTO BUTTON
      $("#takePhoto").hide();
  
      if (OperatingSystem.iOS()) {
        var c = document.createElement('canvas');
         c.width = video.videoWidth;
        c.height = video.videoHeight;
        var ctx = c.getContext('2d');
        ctx.drawImage(video, 0, 0);
        ctx.canvas.toBlob((blob) => {
          img.style.visibility = 'visible';
          img.src = URL.createObjectURL(blob);
          imageBeforeResize.src = img.src; //c.toDataURL('image/webp');
        }, 'image/jpeg', 1);
      } else /*if (OperatingSystem.Android()) */{
        imageCapture.takePhoto().then(function(blob) {
          //console.log('Photo taken:', blob);
          //so I use the blob to the shown image but also for the imageBeforeResize, which when is loaded updates the shown image with smaller image
          //theoretically the blob can be given only to the imageBeforeResize, and it should then update them shown image but this approach shows the image sooner ...
          img.classList.remove('hidden');
          img.src = URL.createObjectURL(blob);
          imageBeforeResize.src = img.src; 
        }).catch(function(error) {
          console.log('takePhoto() error: ', error);
        });
      } /*else {
        alert('Your web browser is not supported, detection shows not Android, not Safari on Apple. Please check, if you do not have "Desktop site" on in Chrome settings. Please report your user agent: '+navigator.userAgent); 
      }*/
    }
  
    //CONFIRM BUTTON, WILL SAVE THE PHOTO TO KNACK//
    confirmButton.onclick = function() {
      if (!isOnline){
        alert('You are offline, please go online before confirming the photo.');
        return;
      }
  
      Knack.showSpinner();
  
      // DISABLE SAVE BUTTON
      $("#cameraConfirm").attr("disabled", true);
      $("#cameraConfirm").hide();
      $("#cameraRetake").hide();
  
      //STOP TRACK WHEN USER SAVES IMAGE
      video.srcObject.getVideoTracks().forEach(track => track.stop());
  
      var imgUrl = $('#cameraFrontpic').attr('src');
  
      setTimeout(function(){
        uploadImage(app_id, imgUrl)
        .then(function(resp) {
          if (!resp || resp.status !== 'ok') {
            alert('Upload of image failed.');
            return;
          }
          var imageId = resp.id;
          var token = getTokenFromApify();
          if (token === '') {
            alert('Authorizing problem.');
            return;
          }
          var updatingRecordId = getRecordIdFromHref(location.href);
          var resp2 = saveImageLinkToKnack(imageFieldOnKnack, imageId, app_id, token, updatingRecordId, imageViewOnKnack)
          if (resp2.status !== 'ok') {
            alert('IMAGE NOT SAVED.');
          } 
  
          //EXIT FULL SCREEN MODE
          exitFullscreen();
  
          Knack.hideSpinner();
  
          setTimeout(function() {
            window.location = backUrl;
          }, 100);
  
        });
      }, 100);
  
    };
  
  
  //*************************************RETAKE BUTTON, THIS WILL DELETE THE PHOTO TAKEN*****************************************
    retakeButton.onclick = function() {
      if (OperatingSystem.iOS()) {
        // on iOS devices it should hide the img tag when user agent clicks retake.
        img.style.visibility = 'hidden';
      }
      //CLEAR TAKEN PHOTO
      img.src = '';
  
      // SHOW LEVEL LINE
      lineVisible = true;
      $("#cameraCalibrate").hide();
  
      //SHOW CAMERA AND CANVAS ELEMENT WHEN THE USER CLICKS RETAKE
      $('video').show();
      $("#cameraCompare").hide();
      $("#cameraText").hide();
      $(go);
  
      // HIDE RETAKE AND CONFIRM BUTTON
      $("#cameraRetake").hide();
      $("#cameraConfirm").hide();
  
      // SHOW EXIT BUTTON
      $("#cameraExit").show();
  
      // ACTIVATE TAKEPHOTO BUTTON
        $("#takePhoto").show();
    }
  
   //*************************************EXIT BUTTON TAKE USER BACK TO HOME PAGE*****************************************
    exitButton.onclick = function() {
  
      if (isInCalibrationMode){
        isInCalibrationMode = false;
        $("#takePhoto").show();
        $(go);
        alert('Calibration canceled.')
        return;
      }
  
      //REDIRECT USER BACK TO HOME PAGE
      setTimeout(function() {
        window.location = backUrl;
      }, 100);
  
      //EXIT FULL SCREEN MODE
      exitFullscreen();
  
      //STOP TRACK WHEN USER EXIT THE APP
      video.srcObject.getVideoTracks().forEach(track => track.stop());
    }  
  
    //*************************************CALIBRATE BUTTON ASKS AND THEN OPEN CALIBRATION*****************************************
    calibrateButton.onclick = function() {
      if (isInCalibrationMode){
        setCookie('rdSpiritCalibration', lastBeta,365);
        calibrationValue = lastBeta;
        isInCalibrationMode = false;
        $("#takePhoto").show();
        $(go);
        alert('Calibration finished.');
      } else {
        if (confirm('Please confirm that you wish to enter calibration mode to set the spirit level.')) {
          console.log('Let go for calibration.');
          isInCalibrationMode = true;
          if (Knack.getUserAttributes().email.includes('hynek') || Knack.getUserAttributes().email.includes('david.male') || Knack.getUserAttributes().email.includes('conor.power')){
            var infoText = document.createElement('span');
            infoText.setAttribute("id", "infoText");
            document.getElementById('cameraGui_controls').appendChild(infoText);
          }
          $("#takePhoto").hide();
          $(stop);
          alert('Place device upright in landscape mode on level surface and click calibration button.');
        } else {
          $(go);
          goToFullscreen();
          console.log('Calibration canceled.');
        }
      }
    }  
  }
  
  function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }
  
  //end of shared camera app code

  $(document).on('knack-view-render.view_13', function(event, view, data) {
    $('[class="kn-view kn-back-link"]').hide();
    $('[id="kn-app-header"]').hide();
    $('[class="kn-info-bar"]').hide();
	prepareCameraView(location.origin+"/silny#nov-tele/nove-tele-foto/"+getRecordIdFromHref(location.href)+"/","63cab2b7e3debb0736a74047",'field_9','scene_21/views/view_25');
});