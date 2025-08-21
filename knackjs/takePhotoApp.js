// Camera app share functions
//************************************* SAVE THE PICTURE YOU'VE JUST TAKEN WITH THE CAMERA TO KNACK*****************************************

  //this function just parses recordId from URL //maybe needs to be altered acording the use
  function getRecordIdFromHref(ur) {
    var ur = ur.substr(0, ur.length - 1);
    return ur.substr(ur.lastIndexOf('/') + 1)
  }

  //Uploads given fileBlob to given app_id file store
  //and then calls the fillDataToKnack of master.js to fill coresponding data
  async function uploadImageOnlyPhotoApp(app_id, fileBlob, fileName, infoElementId, fieldName, myCallback, nextAction, recordId=null) {
    //alert('uploadFileOnlyPhotoApp')
    var url = 'https://api.rd.knack.com/v1/applications/'+app_id+'/assets/image/upload';
    fileName = fileName.toLowerCase();
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
          //alert(rData.id)
          myCallback(fieldName, rData.id,fileName, nextAction, recordId)
          return rData.id;
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

  async function uploadFileOnlyPhotoApp(app_id, fileBlob, fileName, infoElementId, fieldName, myCallback) {
    //alert('uploadFileOnlyPhotoApp')
    var url = 'https://api.rd.knack.com/v1/applications/'+app_id+'/assets/file/upload';
    var form = new FormData();
    var headers = {
      'X-Knack-Application-ID': app_id,
      'X-Knack-REST-API-Key': 'knack',
    };

    fileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

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
          //alert(rData.id)
          myCallback(fieldName, rData.id,fileName)
          return rData.id;
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

  async function uploadImage(token, updatingRecordId , app_id, imgUrl, imageObject, infoText) {
    var url = `https://api.rd.knack.com/v1/applications/${app_id}/assets/image/upload`;

    var form = new FormData();

    var headers = {
      'X-Knack-Application-ID': app_id,
      'X-Knack-REST-API-Key': `knack`,
    };

    fetch(imgUrl)
      .then(function(response) {
        return response.blob();
      })
      .then(function(blob) {
        form.append('files', blob, "fileimage.jpg");

       $.ajax({
        url: url,
        type: 'POST',
        headers: headers,
        processData: false,
        contentType: false,
        mimeType: 'multipart/form-data',
        data: form,
        async: false
      }).then(function(rData){
        try {
          var rDataP = JSON.parse(rData);
          if (rDataP.id) {
            var imageId = rDataP.id;
    
            $('#'+infoText).text('Image uploaded, saving data to Knack');
            var resp2 = saveImageLinkToKnack(imageObject.field, imageId, app_id, token, updatingRecordId, imageObject.scene)
            if (resp2.status !== 'ok') {
              alert('IMAGE NOT SAVED.');
            } else {
              $('#'+infoText).text('Take photos now');
              $('#'+imageObject.name).attr('data-cameraImageUploaded', 'YES');
              alert('IMAGE SAVED');
              return {
                'status': 'ok'
              };
            }
          }
          return {
            'status': 'fail'
          };
        } catch (e) {
          return {
            'status': 'fail'
          };
        }
      })

      });

  }

  function getTokenFromApify(tokenName) {
    var token = $.ajax({
      url: 'https://api.apify.com/v2/key-value-stores/2qbFRKmJ2qME8tYAD/records/'+tokenName+'_token_open?disableRedirect=true',
      type: `GET`,
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
      type: `PUT`,
      headers: headersForSecureView,
      contentType: 'application/json',
      data: dataF,
      async: false
    }).responseText;

    try {
      var rData2P = JSON.parse(rData2);
      if (rData2P.record) {
        return {
          'status': 'ok'
        }
      }
    } catch (e) {
      return {
        'status': 'fail'
      };

    }
  }

  //************************************* OPERATING SYSTEM DETECTION *****************************************   
var OperatingSystem = {
  Android: function() {
      return navigator.userAgent.match(/Android/i);
   },

   iOS: function() {
 if(navigator.vendor.match(/google/i)) {
   return false;
         //browserName = 'chrome/blink';
     }
     else if(navigator.vendor.match(/apple/i)) {
   return true;
         //browserName = 'safari/webkit';
     }
      //return navigator.userAgent.match(/iPhone|iPad|iPod/i);
   }
};

let interval = 0;
const effect = $('#cameraOverlayCanvasPA');

var go = () => {
  if (!effect){
    setTimeout(function(){ $(go)},1000);
    return;
  }
  effect.show();
  if(!interval) { // if `interval` is equal to 0     
   interval = setInterval(function () {
      effect.fadeIn(1500, function () {
        effect.fadeOut(1500);
      });
    }, 3000);
}
}

var stop = () => {
  effect.hide();
  if(interval) {
    clearInterval(interval);
    interval = 0; 
  }
}

function prepareCameraView(imgToSaveName){
// ***************************************************************************************************************************
// ****************************************CAMERA APP WITH PICTURE OVERLAY******************************************************
// *****************************************************************************************************************************
  var imageCapture;

  var img = document.querySelector("#cameraFrontpic");
  var imgCompare = document.querySelector("#cameraFrontpicCompare");
  var video = document.querySelector('video');
  var takePhotoButton = document.querySelector('button#takePhoto');
  var confirmButton = document.querySelector('#cameraConfirm');
  var retakeButton = document.querySelector('#cameraRetake');
  var exitButton = document.querySelector('#cameraExit');
  var rotateButton = document.querySelector('#cameraRotate');
  var grid = document.querySelector('#cameraGrid');
  var line = document.getElementById('cameraLine');
  var circle = document.getElementById('cameraSpiritCircle');
  var modal = document.querySelector('#cameraModal');
  var acceptButton = document.querySelector('#cameraAccept');

  img.style.visibility = 'hidden';


//************************************* GO INTO FULLSCREEN (ONLY ANDRIOD DEVICE WORK) *****************************************

     if (document.documentElement.requestFullscreen) {
       document.documentElement.requestFullscreen();
     } else if (document.documentElement.mozRequestFullScreen) {
       document.documentElement.mozRequestFullScreen();
     } else if (document.documentElement.webkitRequestFullscreen) {
       document.documentElement.webkitRequestFullscreen();
     } else if (document.documentElement.msRequestFullscreen) {
       document.documentElement.msRequestFullscreen();
     }

//************************************* OPEN THE CAMERA BY ASKING USER PERMISSION(APPLE DEVICE) AND APPLY VIDEO STREAM SETTINGS*****************************************

const constraints = {
  width: { min: 1440, ideal: 1280, max: 3984 },
  height: { min: 1080, ideal: 720, max: 2988 },
  aspectRatio: 4/3,
  frameRate:{max: 30}
};

const appleConstraints = {
  width: { min: 1440, ideal: 1280, max: 3984 },
  height: { min: 1080, ideal: 720, max: 2988 }
};

function openCamera(getUserMediaC, constraints, torch = false){
  console.log(constraints);
    navigator.mediaDevices.getUserMedia(getUserMediaC).then(mediaStream => {
      document.querySelector('video').srcObject = mediaStream;
  
      const track = mediaStream.getVideoTracks()[0];
  
      if (torch){
        track.applyConstraints({
          advanced: [{torch: true}]
        });
      } else {
        track.applyConstraints(constraints);
      }
  
      if (!OperatingSystem.iOS()) {
        imageCapture = new ImageCapture(track);
      }

      if (OperatingSystem.iOS()) {
        //try to do blank screen test
        setTimeout(function (){
          testBlackScreen();
        }, 2000);
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

function testBlackScreen(){
  let video = document.querySelector('video');
  let cT = document.createElement('canvas');
  cT.width = video.videoWidth;
  cT.height = video.videoHeight;
  let ctxT = cT.getContext('2d');
  ctxT.drawImage(video, 0, 0);

  let isOnlyBlack = isCtxOnlyBlack(ctxT,video.videoWidth,video.videoHeight);
  if (isOnlyBlack){
    callPostHttpRequest('https://hook.eu1.make.celonis.com/37g55xn4vrvtxxp5uqbvswdb7wrdj3sg',{'userEmail':Knack.getUserAttributes().email,'appName':navigator.appName,'appVersion':navigator.appVersion})
    alert('If you have allowed access to the camera but are still seeing a black screen, please switch your phone off and on and try again.')
  }
}

function isCtxOnlyBlack(ctxT, width, height){
for (let i = 1;i<5;i++){
    let p1 = ctxT.getImageData(i*width/7, i*height/7, 1, 1);
    for (let j = 0;j<3;j++){
      if (p1.data[j]>10) return false
    }
  }
  return true;
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
      openCamera({video: {facingMode: {exact: "environment"}}},constraints,appSettings.torch);
    } else {
      openCamera({video: {deviceId: {exact: deviceId}}},constraints,appSettings.torch);
    }
  })
  .catch(function(err) {
    alert('error enumeration devices, contact support')
    alert(err.name + ": " + err.message);
  });
} else {
  openCamera({video: {facingMode: {ideal: "environment"}}},appleConstraints,appSettings.torch);
}


//**************************** APPLY PICTURE OVERLAY WHICH IS DRAWN ONTO THE CANVAS. WITH THE OVERLAY EFFECT*****************************************

/*function drawPhotoRect(){
  ctxBox.beginPath();
  ctxBox.lineWidth = "6";
  ctxBox.strokeStyle = "red";
  ctxBox.rect(0, 0, 768, 576);
  ctxBox.stroke();
}
const canvasBox = document.getElementById('cameraBoxCanvas');  
const ctxBox = canvasBox.getContext('2d');
video.onresize = drawPhotoRect;
canvasBox.onresize = drawPhotoRect;
drawPhotoRect();
*/

let canvas = null;
let ctx = null;
let image = null;
if (appSettings.imageOverlay){
  canvas = document.getElementById('cameraOverlayCanvasPA');  
  ctx = canvas.getContext('2d');
 
  image = new Image('naturalWidth', 'naturalHeight');
  image.onload = drawImageActualSize;
  image.src = appSettings.imageOverlay;
} else {
  $("#cameraOverlayCanvasPA").hide();
}

if (appSettings.compareImage){
  $('#cameraCompare').attr("src",appSettings.compareImage);
}

//this image gets the captured photo and when it is loaded it resizes iteslf and saves the image to shown image
var imageBeforeResize = document.createElement('img');
imageBeforeResize.onload = () => {
  /*if (takePhotoImageWidth/takePhotoImageHeight!==imageBeforeResize.width/imageBeforeResize.height){
    //alert(takePhotoImageWidth);
    //alert(takePhotoImageHeight)
    //alert(imageBeforeResize.width);
    //alert(imageBeforeResize.height)
    imageBeforeResize.width = imageBeforeResize.height*(takePhotoImageWidth/takePhotoImageHeight);
  }*/
  let imageRatio = imageBeforeResize.width/imageBeforeResize.height;

  const elem = document.createElement('canvas');
  
  const widthRatio = (appSettings.resizeImageMaxWidth?imageBeforeResize.width/appSettings.resizeImageMaxWidth:1);
  const heightRatio = (appSettings.resizeImageMaxHeight?imageBeforeResize.height/appSettings.resizeImageMaxHeight:1);
  const maxRatio = (widthRatio>heightRatio?(widthRatio>1?widthRatio:1):(heightRatio>1?heightRatio:1));
  console.log('maxRatio',maxRatio);

  elem.width = imageBeforeResize.width/maxRatio; //(appSettings.resizeImageMaxWidth?(imageRatio>=1?appSettings.resizeImageMaxWidth:(appSettings.resizeImageHeight/imageBeforeResize.height)*imageBeforeResize.width): imageBeforeResize.width);
  elem.height = imageBeforeResize.height/maxRatio; //(appSettings.resizeImageMaxHeight?(imageRatio>=1?((appSettings.resizeImageMaxWidth/imageBeforeResize.width)*imageBeforeResize.height):appSettings.resizeImageMaxHeight): imageBeforeResize.height);
  const ctx = elem.getContext('2d');
  //check if the resolution of the image is 4:3
 //ONE STEP RESIZE
 if (Knack.getUserAttributes().email.includes('hynek')){
  let str = 'takePhotoImageWidth:'+takePhotoImageWidth+',takePhotoImageHeight:'+takePhotoImageHeight+',imageBeforeResize.width:'+imageBeforeResize.width+',imageBeforeResize.height:'+imageBeforeResize.height+',elem.width:'+elem.width+',elem.height:'+elem.height;
  //alert(str);
}
    ctx.drawImage(imageBeforeResize,0,0,imageBeforeResize.width,imageBeforeResize.height,0,0,elem.width,elem.height);//, imageBeforeResize.width * (1-percentOfPicture)/2, imageBeforeResize.height * (1-percentOfPicture)/2, imageBeforeResize.width * percentOfPicture,imageBeforeResize.height * percentOfPicture, 0, 0, 768, 576);
    //ctx.drawImage(imageBeforeResize,0,0,elem.width,elem.height);//, imageBeforeResize.width * (1-percentOfPicture)/2, imageBeforeResize.height * (1-percentOfPicture)/2, imageBeforeResize.width * percentOfPicture,imageBeforeResize.height * percentOfPicture, 0, 0, 768, 576);
  
   //save the resized image to the shown img
   ctx.canvas.toBlob((blob) => {
      img.src = URL.createObjectURL(blob);
      img.style.visibility = 'visible';
      imgCompare.src = img.src;
  }, 'image/jpeg', 1);

}

 function drawImageActualSize() {
   canvas.width = this.naturalWidth;
   canvas.height = this.naturalHeight;
   ctx.drawImage(this, 0, 0);
 }

 circle.style.display = 'none';
//**************************** SPIRIT LEVEL *****************************************
var canTakePhoto = false;
 function handleOrientation(event) {
  permissionForOrientationGranted = true
  var absolute = event.absolute;
  var alpha    = event.alpha;
  var beta     = event.beta;
  var gamma    = event.gamma;
  console.log('ho',beta, alpha, gamma);

  if (beta===null && gamma===null) return;

  if (isLandscape && beta && takingPhoto) $("#cameraLine").show();
  if (isLandscape && gamma && takingPhoto) circle.style.display = 'inline';
  //$('#dev').text(gamma)

  function getGammaDev(gamma){
    //if (gamma<=-85) return 0;
    //if (gamma>85) return 0;
    if (gamma<0) return 90+gamma;
    if (gamma>0) return -(90-gamma);
  }
  circle.style.top = 'calc(50% - '+(40+getGammaDev(gamma))+'px)';
  
  if(beta <=1 && beta >= -1)
  {
    line.style.backgroundColor = 'green';
  }
  else
  {
    line.style.backgroundColor = 'red';
  }
  if(beta <=1 && beta >= -1 && getGammaDev(gamma) < 10){
    $("#takePhoto").removeAttr('disabled');
    //$('#dev').text('enabl5x'+canTakePhoto);
    if (!OperatingSystem.iOS() && !canTakePhoto && takingPhoto) window.navigator.vibrate(50);
    canTakePhoto = true;
  } else {
    $("#takePhoto").attr("disabled", true);
    //$('#dev').text('disabl5x'+canTakePhoto);
    if (!OperatingSystem.iOS() && canTakePhoto && takingPhoto) window.navigator.vibrate(50);
    canTakePhoto = false;
  }
  line.style.transform = 'rotate(' + (-beta).toString() + 'deg)';
  permissionForOrientation = 'none'
}

var permissionForOrientation = 'none';
var permissionForOrientationGranted = false;
   // when page loads checks if the device requires user to to enable motion sensors, If they do then display the dialog
if ( window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === 'function' ){
  permissionForOrientation = 'need';
  /*
    console.log("permision needed");
    $('#cameraModal').show(); // show dialog asking user to enable motion sensor
    //$("#takePhoto").attr("disabled", true);//De-activate takephoto button until user agnet agreed
   $("#takePhoto").hide();

  acceptButton.onclick = function(){
  DeviceOrientationEvent.requestPermission()
.then(response => {
  if (response == 'granted') {
    window.addEventListener("deviceorientation", handleOrientation, true);
    $('#cameraModal').hide();
    //$("#takePhoto").removeAttr('disabled');
	  $("#takePhoto").show();
  }
})
.catch(console.error)
  }
  */
 window.addEventListener("deviceorientation", handleOrientation, true);
} else {
  // non iOS 13+
  window.addEventListener("deviceorientation", handleOrientation, true);
}

if (/*appSettings.spiritLine && */!permissionForOrientationGranted){
  setTimeout(function() {
    if (permissionForOrientation==='need'){
      $('#cameraModal').show(); // show dialog asking user to enable motion sensor
      //$("#takePhoto").attr("disabled", true);//De-activate takephoto button until user agnet agreed
     $("#takePhoto").hide();
  
    acceptButton.onclick = function(){
    DeviceOrientationEvent.requestPermission()
  .then(response => {
    if (response == 'granted') {
      window.addEventListener("deviceorientation", handleOrientation, true);
      $('#cameraModal').hide();
      //$("#takePhoto").removeAttr('disabled');
      $("#takePhoto").show();
      permissionForOrientationGranted = true;
    }
  })
  .catch(console.error)
    }
    }
  }, 4000);
}

//************************************* TAKE A PICTURE AND CROP*****************************************
//var sndCameraTakePhoto = new Audio("https://www.soundjay.com/mechanical/camera-shutter-click-01.wav");
var sndCameraTakePhoto = document.createElement('audio');  
sndCameraTakePhoto.type = "audio/mpeg";     
sndCameraTakePhoto.src = "https://stellantisandyoucouk.github.io/imagesStore/camera-shutter-click.mp3";                 
sndCameraTakePhoto.load(); 

takePhotoButton.onclick = takePhoto;

var takePhotoImageWidth = null;
var takePhotoImageHeight = null;

  function takePhoto() {
    sndCameraTakePhoto.play();
    //sndCameraTakePhoto.currentTime=0;
    let srcSet = false;

    if (OperatingSystem.iOS()) {
      var c = document.createElement('canvas');
      c.width = video.videoWidth;
      c.height = video.videoHeight;
      takePhotoImageWidth = video.videoWidth;
      takePhotoImageHeight = video.videoHeight;
      //imageBeforeResize.width = video.videoWidth;
      //imageBeforeResize.height = video.videoHeight;
      var ctx = c.getContext('2d');
      ctx.drawImage(video, 0, 0);
      ctx.canvas.toBlob((blob) => {
        img.style.visibility = 'visible';
        img.src = URL.createObjectURL(blob);
        imageBeforeResize.src = img.src; //c.toDataURL('image/webp');
        imgCompare.src = img.src;
      }, 'image/jpeg', 1);
    } else /*if (OperatingSystem.Android()) */{
      imageCapture.takePhoto().then(function(blob) {
        //console.log('Photo taken:', blob);
        //so I use the blob to the shown image but also for the imageBeforeResize, which when is loaded updates the shown image with smaller image
        //theoretically the blob can be given only to the imageBeforeResize, and it should then update them shown image but this approach shows the image sooner ...
        img.classList.remove('hidden');
        img.src = URL.createObjectURL(blob);
        takePhotoImageWidth = video.videoWidth;
        takePhotoImageHeight = video.videoHeight;
        //imageBeforeResize.width = video.videoWidth;
        //imageBeforeResize.height = video.videoHeight;
        imageBeforeResize.src = img.src; 
        imgCompare.src = img.src;
        srcSet = true;
      }).catch(function(error) {
        console.log('takePhoto() error: ', error);
      });
    } 

    //HIDE EXIT BUTTON
    $("#cameraExit").hide();
    setLayout(false);

    switch (appSettings.actionAfterPhoto){
      case 'none':
        $("#cameraFrontpic").show();
        setTimeout(function (){
          //alert(srcSet);
          //alert($('#cameraFrontpic').attr('src'));
          if ($('#cameraFrontpic').attr('src') && $('#cameraFrontpic').attr('src').substr(0,5)==='blob:'){
            afterConfirmPhoto();
          } else {
            setTimeout(function (){
                afterConfirmPhoto();
            }, 2000);
          }
        }, 1000);
        break;
      case 'readable':
        //SHOW RETAKLE AND CONFIORM BUTTON
        $("#cameraRetake").show();
        $("#cameraConfirm").show();
        $("#cameraConfirm").removeAttr("disabled");

        //DISPLAY COMPARISION CONTENT
        $('#cameraGrid').show();
        $("#cameraText").show();

        if (appSettings.actionAfterPhotoReadableText){
          $('a[id="cameraText"]').text(appSettings.actionAfterPhotoReadableText);
        }
        break;
      case 'compare':
        //SHOW RETAKLE AND CONFIORM BUTTON
        $("#cameraRetake").show();
        $("#cameraConfirm").show();
        $("#cameraConfirm").removeAttr("disabled");

        //DISPLAY COMPARISION CONTENT
        $('#cameraGridCompare').show();
        $("#cameraText").show();
        
        if (appSettings.actionAfterPhotoReadableText){
          $('a[id="cameraText"]').text(appSettings.actionAfterPhotoReadableText);
        }

        break;
    }
  }


  //CONFIRM BUTTON, WILL SAVE THE PHOTO TO KNACK//
  confirmButton.onclick = function() {
    // DISABLE SAVE BUTTON
    $("#cameraConfirm").attr("disabled", true);
    afterConfirmPhoto();
  };


//*************************************RETAKE BUTTON, THIS WILL DELETE THE PHOTO TAKEN*****************************************

  retakeButton.onclick = function() {
    //CLEAR TAKEN PHOTO
    img.src = '';
    if (OperatingSystem.iOS()) {
      // on iOS devices it should hide the img tag when user agent clicks retake.
      img.style.visibility = 'hidden';
    }      
    setLayout(true);
  }


 //*************************************EXIT BUTTON TAKE USER BACK TO HOME PAGE*****************************************

  exitButton.onclick = function() {
    hidePhotoAppI();
  }  
}

function afterConfirmPhoto(){
  var finalImgUrl = $('#cameraFrontpic').attr('src');
  switch (appSettings.uploadMethod){
    case 'make':
      var form = new FormData();
      form.append('Record Id',getRecordIdFromHref(location.href))
      fetch(finalImgUrl)
      .then(function(response) {
        return response.blob();
      })
      .then(function(blob) {
        form.append('files', blob, "fileimage.jpg");

        var rData = $.ajax({
          url: appSettings.uploadWebhook,
          type: 'POST',
          processData: false,
          contentType: false,
          mimeType: 'multipart/form-data',
          data: form,
          async: false
        }).responseText;

        try {
          //alert(rData)
          console.log(rData);
        } catch (e) {
          alert('uploadFail_2:'+e.toString());
          alert(rData);
          //return {'status': 'fail'};
        }
      });
      break;
    case 'field':
      $('input[name="'+appSettings.uploadField+'"]').attr('imageToSaveUrl',finalImgUrl);
      $('div[id="kn-input-'+appSettings.uploadField+'"]>div[class="kn-file-upload"]').html('<img src="'+finalImgUrl+'" style="max-width:200px;max-height:200px;"></img>')
      $('div[id="kn-input-'+appSettings.uploadField+'"] div[class="image--remove"]').remove();
      break;
    case 'knack':
      setTimeout(function(){
        fetch(finalImgUrl)
        .then(function(response) {
          return response.blob();
        })
        .then(function(blob) {
          uploadImageOnlyPhotoApp(appSettings.app_id,blob,'photoImg.jpg','infoText',appSettings.uploadField,imageAfterKnackUpload);
        });
      }, 100);
  }

  if (appSettings.leavePhotoAppOpen){
    var img = document.querySelector("#cameraFrontpic");
    //CLEAR TAKEN PHOTO
    img.src = '';
    if (OperatingSystem.iOS()) {
      // on iOS devices it should hide the img tag when user agent clicks retake.
      img.style.visibility = 'hidden';
    }      
    setLayout(true);
  } else {
    hidePhotoAppI();
  }
}

function imageAfterKnackUpload(fieldName, imageId,fileName){
  $('input[name="'+fieldName+'"]').val(imageId);
  $('input[name="'+fieldName+'"]').removeAttr('disabled');
  $('div[id="kn-input-'+fieldName+'"]>div>div[class="image--remove"]').remove()
  $('div[id="kn-input-'+$('input[name="'+fieldName+'"]').attr('name')+'"] div[class="kn-asset-current"]').html(fileName);
  if ($('div[id="kn-input-'+$('input[name="'+fieldName+'"]').attr('name')+'"] div[class="kn-asset-current"]').length===0){
    $('div[id="kn-input-'+fieldName+'"]').append('<div class="kn-asset-current">'+fileName+'</div>');
  }
  $('#'+$('input[name="'+fieldName+'"]').attr('name')+'_upload').hide();
  $('div[id="kn-input-'+$('input[name="'+fieldName+'"]').attr('name')+' .kn-file-upload').html('Image uploaded successfully.');
  if (appSettings.callbackAfterImageUploadKnack){
    try {
      (new Function('return '+appSettings.callbackAfterImageUploadKnack)(fieldName,imageId,fileName))(fieldName,imageId,fileName);
    } catch (ex){
      console.log('callbackAfterImageUploadKnack',ex)
    }
  }
}

function setLayoutInPortrait(takingPhotoI){
  //$("#cameraLine").hide();
  //$("#cameraSpiritCircle").hide();
  console.log('setLayoutInPortrait')
  if (!appSettings.allowPortrait){
    $("#takePhoto").hide();
    $("#cameraRotate").show();
    if (appSettings.imageOverlay){ $("#cameraOverlayCanvasPA").hide()};
  } else {
    if (takingPhotoI) $("#takePhoto").show();
    $("#cameraRotate").hide();
    if (appSettings.imageOverlay){ $("#cameraOverlayCanvasPA").show()};
    if (appSettings.imageOverlayEffect){
      $(go);
    }
  }
}

function setLayoutInLandscape(takingPhotoI){
//$("#cameraLine").show();
console.log('setLayoutInLandscape',appSettings.allowLandscape)
if (!appSettings.allowLandscape){
  $("#takePhoto").hide();
  $("#cameraRotate").show();
  if (appSettings.imageOverlay){ $("#cameraOverlayCanvasPA").hide()};
 } else {
  if (takingPhotoI) $("#takePhoto").show();
  $("#cameraRotate").hide();
  if (appSettings.imageOverlay){ $("#cameraOverlayCanvasPA").show()};
  if (appSettings.imageOverlayEffect){
    $(go);
  }
 }
}

function setLayout(takingPhotoI){
  takingPhoto = takingPhotoI;
  if (takingPhoto){
    //DISPLAY COMPARISION CONTENT
    $('#cameraGrid').hide();
    $('#cameraGridCompare').hide();
    $("#cameraText").hide();

    $('#cameraVid_container').show();
    $('#cameraGui_controls').show();
    $("#cameraExit").show();

    if (appSettings.imageOverlay && appSettings.imageOverlayOpacity){
      $('#cameraOverlayCanvasPA').css({ opacity: appSettings.imageOverlayOpacity })
    }

    //**************************** DETECT SCREEN ORIENTATION WHEN THE APP IS LOADED AND DETECT WHEN USER CHANGES SCREEN ORIENTATION*****************************************
    //DETECT WHICH ORIENTATION THE USEER IS IN
    let isLandscape = false;
    if(window.innerHeight > window.innerWidth){
      setLayoutInPortrait(takingPhotoI);
       isLandscape = false;
       //$(stop);
    }
    if(window.innerWidth > window.innerHeight){
      setLayoutInLandscape(takingPhotoI);
      isLandscape = true;
    }

    //IF THE USER CHANGES SCREEN ORIENTATION

    $(window).on("orientationchange",function(){
      if(window.orientation == 0 || window.orientation == 180){ //Portrait
        setLayoutInPortrait(takingPhoto)
        isLandscape = false;

      }
      else if(window.orientation == 90 || window.orientation == 270) // Landscape
      {
        setLayoutInLandscape(takingPhoto);
        isLandscape = true;
      }
    });

    //SHOW CAMERA AND CANVAS ELEMENT WHEN THE USER CLICKS RETAKE
    $('video').show();
    if (appSettings.imageOverlayEffect){
      $(go);
    }

    // HIDE RETAKE AND CONFIRM BUTTON
    $("#cameraRetake").hide();
    $("#cameraConfirm").hide();

    // SHOW EXIT BUTTON
    $("#cameraExit").show();

    // SHOW LEVEL LINE
    //$("#cameraLine").show();

    // ACTIVATE TAKEPHOTO BUTTON
	  //$("#takePhoto").show(); 
  } else {
    //HIDE VIDEO & OVERLAY ELEMENT
    $('video').hide();
    $("#cameraOverlayCanvasPA").hide()

    if (appSettings.imageOverlayEffect){
      $(stop);
    }
    //HIDE LEVEL LINE
    //$("#cameraLine").hide();
    //$("#cameraSpiritCircle").hide();

    // DISABLE TAKEPHOTO BUTTON
    $("#takePhoto").hide();
  }
  $('#kn-loading-spinner').hide();
}

var takingPhoto = false;

var appSettings = {
  spiritLine : false,
  imageOverlay: null,
  imageOverlayEffect : false,
  imageOverlayOpacity : null,
  allowLandscape : true,
  allowPortrait : true,
  actionAfterPhoto : 'none', // none, readable, compare,
  uploadMethod : 'make', //knack, make, field
  uploadWebhook : 'https://hook.eu1.make.celonis.com/ouosl7cqftin4d5xk4ybco0q96t5bwk2',
  resizeImageHeight : null,
  resizeImageWidth : null,
  app_id : null,
  callbackAfterImageUploadKnack : null
}
var returnData = {};
function takePhotoAppStart(app_id, appSettingsI=null){
  console.log('takePhotoAppStart')
  let appSettingsDefault = {
    spiritLine : false,
    imageOverlay: null,
    imageOverlayEffect : false,
    imageOverlayOpacity : null,
    allowLandscape : true,
    allowPortrait : true,
    actionAfterPhoto : 'readable', // none, readable, compare,
    actionAfterPhotoReadableText : 'Is the photo OK?',
    uploadMethod : null, //knack, make, field
    uploadField : null
  }
  if (!appSettingsI){
    appSettings.imageOverlay = 'https://stellantisandyoucouk.github.io/imagesStore/licenceOverlay2.png';
    //appSettings.imageOverlayEffect = true;
    appSettings.imageOverlayOpacity = 0.5;
    appSettings.allowLandscape = false;
    appSettings.actionAfterPhoto = 'readable';
    returnData.app_id = app_id;
  } else {
    appSettings = Object.assign(appSettingsDefault,appSettingsI);
  }
  
  showPhotoAppI();
  prepareCameraView('cameraImg1');
  setLayout(true);
}

function showPhotoAppI(){
  $('#photoApp').show();
  $('.kn-content').hide();
}

function hidePhotoAppI(){
  try {
    var video = document.querySelector('video');
    //STOP TRACK WHEN USER EXIT THE APP
    video.srcObject.getVideoTracks().forEach(track => track.stop());

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
  } catch (ex){}

  $('#photoApp').hide();
  $('.kn-content').show();
}
