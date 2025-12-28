function readCookie(name) {
  var nameEQ = encodeURIComponent(name) + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ')
          c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0)
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

$(document).on('knack-view-render.any', function (event, view, data) {
    $('[class="kn-container"]').hide();
    $('[class="kn-info kn-container"]').hide();

    submitUserLoginForm();
});

function getTokenFromURL(url){
  if (url.indexOf('token=')!==-1){
    let tokenS = url.substring(url.indexOf('token=')+6);
    if (tokenS.indexOf('&')!==-1){
      tokenS = tokenS.substring(tokenS,tokenS.indexOf('&'));
    } 
    return decodeURIComponent(tokenS);
  } else { return null}
}

var submitUserLoginForm = function() {
  console.log('submitUserLoginForm');
  const url = window.location.href;
  let token = getTokenFromURL(url);
  if (token) token = atob(token);
  if (!token){
    if (!url.includes('#new-hire-form-completion') && $('[id="email"]').length>0 && $('[id="password"]').length>0){
      console.log('on page direct without login');
      setTimeout(function () { document.location = 'https://www.stellantisandyou.co.uk/digital#home/?redirectApp='+btoa(url); }, 100)
    }
    return;
  }
  if (!token.includes('#')){
    console.log('Wrong token');
    return;
  }
  let userName2 = token.split('#')[0];
  let password = token.split('#')[1];

  let masterUserEmail = readCookie('SYmasterAppUserEmail');

  if ((Knack.session.user && userName2!==Knack.session.user.values.email.email) || (masterUserEmail && Knack.session.user && masterUserEmail!==Knack.session.user.values.email.email)){
    console.log('different user');
    setTimeout(function () { $('a[class="kn-log-out"]').eq(0).click(); setTimeout(function () { document.location = url; }, 1000);}, 1000);
  }

  if ($('[id="email"]').length===0){
    return;
  }
    
    //type userName from url, my secret password and click login
    //if auth successfully then it shows the app, otherwise login screen
    $('[id="email"]').val(userName2);
    $('[id="password"]').val(password);
    $('input[type="submit"]').click();
};






/* Auto refresh code for table (refresh with data) */


var refreshList = [];

  function refreshWithData(viewID, notifTitle, notifText, field, data = null){
    if (Knack.views["view_"+viewID]){
      if (data===null){
        if (refreshList.find(el => el === viewID)){
          console.log('already registered');
          return;
        }
        refreshList.push(viewID);
        data = {'value':Knack.views["view_"+viewID].model.data.models[0].attributes[field]};
      } else {
        if (data.value<Knack.views["view_"+viewID].model.data.models[0].attributes[field]){
          console.log('change up');
        }
      }
      data.value = Knack.views["view_"+viewID].model.data.models[0].attributes[field];
    }
    if ((new Date()).getHours()<7 || (new Date()).getHours()>20) return;
    setTimeout(function () { if($("#view_"+viewID).is(":visible")==true){viewFetchWithData(viewID, notifTitle, notifText, field, data);} }, 60000);
   }

 function viewFetchWithData(viewID, notifTitle, notifText, field, data = null){
    Knack.views["view_"+viewID].model.fetch();
    setTimeout(function () { refreshWithData(viewID, notifTitle, notifText, field, data); }, 500);
   }

// Starter View Page (excel spreadsheet field)
$(document).on('knack-scene-render.scene_2397', function(event, scene) {
  refreshWithData('7626', 'Title', 'Text', 'field_10381');
});



