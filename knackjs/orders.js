// ************************************************************************************************************************************************
// Apify dates of data checking download Added by HH on 01052019***********************************************************************************
// ************************************************************************************************************************************************
function pad(n) {return n < 10 ? "0"+n : n;}
function dateToGB(dateobj){
  return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+"/"+dateobj.getFullYear();
}
function dateTimeToGB(dateobj){
  return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+"/"+dateobj.getFullYear()+' '+dateobj.toLocaleTimeString("en-GB");
}

function dateTimeToGBWithoutSeconds(dateobj){
  return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+"/"+dateobj.getFullYear()+' '+dateobj.toLocaleTimeString("en-GB").substring(0,5);
}

var currentRefreshScene = [];
//Reloads views from viewsArray in scene with sceneId in selected interval
function recursiveSceneRefresh(sceneId,viewsArray,refreshInterval, runCount = 0){
  console.log('recursiveSceneRefresh',sceneId,runCount)
  //If request for start of refresh of same scene comes, do nothing, just exit
  if (currentRefreshScene.includes(sceneId) && runCount === 0) {console.log('refresh '+sceneId+',new refresh of same scene, exiting'); return;}
  //Adding new scene refresh to list
  currentRefreshScene.push(sceneId);
  setTimeout(function () { 
    //Check if we are still in the same scene, we are trying to refresh views, if not exit
    if ($('div[id="kn-scene_'+sceneId+'"]').length===0) {console.log('refresh '+sceneId+', another scene, stop refresh'); currentRefreshScene = currentRefreshScene.filter(el => el !== sceneId); return;} 
    //Refresh views
    for (let i = 0;i<viewsArray.length;i++){
      if($("#"+viewsArray[i]+"").is(":visible")==true) Knack.views[viewsArray[i]].model.fetch();
    }
    //Call me once again to do it after set refreshInterval
    recursiveSceneRefresh(sceneId,viewsArray,refreshInterval,runCount+1);
    }, refreshInterval);
}

// Listen for the list page view
$(document).on('knack-records-render.view_2157', function(event, view, records) {
  // Do something after the records render
  //2console.log(records.length);
  //alert('listener for records, # of records is: ' + records.length);
  //Go through all rows
  var obtCarsUrl = 'https://api.apify.com/v2/key-value-stores/QL8ARHwdiFEykNjg9/records/carsChecked';
  var obtCars = $.ajax({
    type: "GET",
    url: obtCarsUrl,
    cache: false,
    async: false
  }).responseText;
  var obtCarsJ = null;
  try {
    obtCarsJ = JSON.parse(obtCars);
  } catch (ex){
    console.log('obtCarsJ not loaded')
  }

  $('tbody tr').each(function(){ 
      //Check if the row has field for the date - it should be by all when it is updated
      try {
        if ($(this).attr('id')!==undefined){
          //let orderNumber = $(this).find('td').eq(0).text().match(new RegExp(/PCD\/VX Order: \d*/))[0].replace('PCD/VX Order: ','');
          let orderNumber = $(this).find('td').eq(0).text();
          orderNumber = orderNumber.substring(0,orderNumber.indexOf('Order Placed:'));
          orderNumber = orderNumber.substring(orderNumber.indexOf('Order: ')+7)
          console.log('orderNumber',orderNumber);
          let carImageUrl = $(this).find('td[data-field-key="field_5063"] img').attr('src');
          let franchise = '';
          if (carImageUrl){
            if (carImageUrl.includes('peugeot')) franchise = 'Peugeot';
            if (carImageUrl.includes('citroen')) franchise = 'Citroen';
            if (carImageUrl.includes('vauxhall')) franchise = 'Vauxhall';
          }
          console.log('franchise', franchise);
          if($(this).find('div[id="dodp"]').length){
              //This is fixed URL of Apify storage, where the Actors are pushing dates when records are checked, we only add Order number parsed from App webpage for given row
            var url = 'https://api.apify.com/v2/key-value-stores/MGAH5Tr9TFctDnMTD/records/cronosAllCheck_'+franchise+'?disableRedirect=true';
          //AJAX Get for the URL - response is now just the date, so we will only print it to html page
              $.ajax({url:url, success: function(data){
                let dataWithoutSec = data;
                  $(this).find('div[id="dodp"]').text(dataWithoutSec);
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  console.log("error. textStatus: %s  errorThrown: %s", textStatus, errorThrown);
              }, async:true, context:this, cache: false, timeout: 15000});
              };

          if ($(this).find('div[id="doGEFCO"]').text()!==''){
            let r = obtCarsJ.find(el => el.orderNumber === orderNumber);
            if (r){
              $(this).find('div[id="doGEFCO"]').parent().append('<b>OBT Checked:</b><br />'+dateTimeToGBWithoutSeconds(new Date(r.obtChecked)))
              console.log(orderNumber,r);
            }
          }
      }
    } catch (e){
      console.log(e);
    }
	});
    
});

//HIDE THE LOGO AND logged in user in all pages
$(document).on('knack-view-render.any', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
  submitUserLoginForm();
  //Monitor search
  /*
  if ($('div[id="'+view.key+'"] form[class="table-keyword-search"]').length>0){
    console.log('keyworsearch in this view', view.key);
    $('div[id="'+view.key+'"] form[class="table-keyword-search"] a[class="kn-button search"]').on("click", function() {
      logSearch(view);
    })
  }*/
});

function logSearch(view){
  console.log('searchFill',view.key,view.scene.key,$('div[id="'+view.key+'"] form[class="table-keyword-search"]').serialize());
  //callPostHttpRequest('https://hook.eu1.make.celonis.com/fm8xq9lecoyd61vlicbywpi6vy8jezpa',{'app':'Master App','sceneKey':view.scene.key,'viewKey':view.key,'search':$('div[id="'+view.key+'"] form[class="table-keyword-search"]').serialize()},'')
}

hashCode = function(elem) {
  var hash = 0, i, chr;
  if (elem.length === 0) return hash;
  for (i = 0; i < elem.length; i++) {
    chr   = elem.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function getTokenFromURL(url){
  try {
    if (url.indexOf('token=')!==-1){
      let tokenS = url.substring(url.indexOf('token=')+6);
      if (tokenS.indexOf('&')!==-1){
        tokenS = tokenS.substring(tokenS,tokenS.indexOf('&'));
      } 
      if (tokenS.indexOf('#')!==-1){
        tokenS = tokenS.substring(tokenS,tokenS.indexOf('#'));
      } 
      return decodeURIComponent(tokenS);
    } else { return null}
  } catch (ex){
    console.log('getTokenFromURL',ex);
    return null;
  }
}

var submitUserLoginForm = function() {
  let url = window.location.href;
  let token = getTokenFromURL(url);
  //console.log('token',token);
  if (token) token = atob(token);
  if (!token){
    if (!url.includes('stellantisandyoufleetportal') && $('[id="email"]').length>0 && $('[id="password"]').length>0){
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
    //alert('Pass'+hashCode(userName).toString());
    $('[id="password"]').val(password);
    $('input[type="submit"]').click();
};

var submitUserLoginFormOLD = function() {
  //console.log('submitUserForm');
  var url = window.location.toString();

  if ($('[id="email"]').length===0){ 
    return;
  }

  let token = getTokenFromURL(url);
  if (!token){
    if ($('[id="email"]').length>0 && $('[id="password"]').length>0){
      console.log('on page direct without login');
      setTimeout(function () { document.location = 'https://www.stellantisandyou.co.uk/digital#home/?redirectApp='+btoa(url); }, 100)
    }
    return;
  }
    if (!url.indexOf('https://www.stellantisandyou.co.uk/digital-orders?') === 0) {
        //alert("Invalid URL");
        console.log('Different URL')
        return;
    }
    console.log(token);
    token = atob(token);

    if (!token.includes('#')){
      console.log('Wrong token');
      return;
    }
    let userName2 = token.split('#')[0];
    let password = token.split('#')[1];
    
    //type userName from url, my secret password and click login
    //if auth successfully then it shows the app, otherwise login screen
    $('[id="email"]').val(userName2);
    $('[id="password"]').val(password);
    $('input[type="submit"]').click();
};

//on the login page
/*$(document).on("knack-view-render.view_2146", function (event, view) {
  submitUserLoginForm();
});*/

//MASTER/SLAVE CONNECT
//Scenes where the App is accessed from the Master App and needs to login
/*var loginSceneNames = ["scene_917","scene_989","scene_883","scene_1074","scene_1113","scene_1115","scene_1190","scene_1249","scene_1272","scene_1287","scene_1081","scene_1164","scene_1079"]; ///add scene numbers as necessary

loginSceneNames.forEach(functionName);
function functionName(selector_scene){
  $(document).on("knack-scene-render." + selector_scene, function(event, scene, data) {
    console.log(selector_scene)
    submitUserLoginForm();
  });
}*/

//this code is for checking the right user in the Customer portal, if logged in user is not the same as car connected user it redirects
checkUser = function(data) {
  if (Knack.getUserAttributes().email!==data.field_6218_raw.email && Knack.getUserAttributes().roles.includes('object_126')){
    alert('Sorry, you are not authorised to view this page. Please follow the link from your Customer Portal to view details & status of your Vehicle');
    location.href = 'https://salesjourney2.rd.knack.com/digital-deal-file-orders#dialog-order-information/new-digital-deal-file/customer-details/';
  }	
};

//this code calls the function for checking the user rights, it needs to be called in view which has the connected customer
$(document).on('knack-view-render.view_2605', function(event, view, data) {
  checkUser(data);
});

// THIS CODE ALLOWS THE HOVER TOOL TIPS FUNCTION IN THIS APP

function tooltipsTable(sceneId, viewId, tooltipFieldId, showTooltipFieldId, tooltipTitle = ''){
    $('th[class="'+tooltipFieldId+'"]').hide();
    $('td[class*="'+tooltipFieldId+'"]').hide();
    if ($('div[id="tooltipDiv_'+viewId+'_'+tooltipFieldId+'"]').length===0){
      let tooltipDiv = document.createElement('div');
      tooltipDiv.setAttribute("id", "tooltipDiv_"+viewId+'_'+tooltipFieldId);
      tooltipDiv.setAttribute("class", "tooltipDiv");
      tooltipDiv.setAttribute("style","background-color:white; background: white; position: fixed; display:none;");
  
      if ($('div[id="kn-scene_'+sceneId+'"]').length!==0){
        document.querySelector('div[id="kn-scene_'+sceneId+'"]').appendChild(tooltipDiv)
      } else {
        console.log('scene',sceneId,'not found');
        let currentScene = $('div[id*="kn-scene_"]').eq(0).attr('id');
        console.log('currentScene',currentScene);
        document.querySelector('div[id="'+currentScene+'"]').appendChild(tooltipDiv)
      }
    }
    
    $('div[id="view_'+viewId+'"]').on("mouseleave", function (e) {
      //console.log('HIDE AFTER LEAVE')
      $('div[id="tooltipDiv_'+viewId+'_'+tooltipFieldId+'"]').hide();
    });
    
    $('div[id="view_'+viewId+'"]').on("mousemove", function (e) {
        //console.log('on move');
        let partOfTable = document.elementFromPoint(e.pageX, e.pageY - document.documentElement.scrollTop);
        let tdUnderMouse = null;
        if (partOfTable){
          if (partOfTable.nodeName==='TD'){
            tdUnderMouse = partOfTable;
          } else if (partOfTable.parentElement && partOfTable.parentElement.nodeName==='TD') {
            tdUnderMouse = partOfTable.parentElement;
          }
        }
        if (tdUnderMouse && tdUnderMouse.getAttribute('data-field-key')===showTooltipFieldId){
          //console.log('tdUnderMouse right column',tdUnderMouse);
          //console.log('tdUn id',tdUnderMouse.parentElement.id);
          //console.log('HTML to show',tdUnderMouse.parentElement.querySelector('td[data-field-key="'+tooltipFieldId+'"]').innerHTML)
          $('div[id="tooltipDiv_'+viewId+'_'+tooltipFieldId+'"]').html(tooltipTitle + modifyTooltipHTML(tdUnderMouse.parentElement.querySelector('td[data-field-key="'+tooltipFieldId+'"]').innerHTML));
          $('div[id="tooltipDiv_'+viewId+'_'+tooltipFieldId+'"]').show();
          $('div[id="tooltipDiv_'+viewId+'_'+tooltipFieldId+'"]').offset({ left: e.pageX+10, top: e.pageY });
        } else {
          $('div[id="tooltipDiv_'+viewId+'_'+tooltipFieldId+'"]').hide();
        }
    });
  }
function modifyTooltipHTML(html){
  return html.replace(new RegExp('class="','g'),'data-class="');
}

//************************************* NEW VEHICLE DEAL FILE *****************************************

/* Change Keyword Search Placeholder Text for used deal files */
$(document).on('knack-scene-render.scene_917', function(event, scene) {
  $("input[name='keyword']").attr("placeholder", "Dealer Address, Reg, Stock No.")
});

//Hover Customer MAGIC Number when hover over Customer Name on Deal Files page - in conjunction with the ToolTips Functions above 
$(document).on('knack-view-render.view_2665', function (event, view, data) {
    tooltipsTable('917','2665','field_8098','field_6159');
    //scene, view, field to have hover, hover info
         $('th[class="field_8098"]').hide();
    $('td[class*="field_8098"]').hide();
});

//HANDOVER APPOINTMENT PAGE
//Restrict Available Times for Handover Appointment to 8am - 7pm

var view_names = ["view_2630"]; ///add view numbers as necessary
view_names.forEach(bindToUpdate1);
function bindToUpdate1(selector_view_name){
$(document).on('knack-view-render.' + selector_view_name, function(event, view, data) {

$(document).ready(function(){
$('.ui-timepicker-input').timepicker({
minTime: '08:00:00',     //  8:00 AM,  Change as necessary
maxTime: '19:00:00',        //  7:00 PM,  Change as necessary
step: '15'		// Dropdown Interval every 15 mins
});
});
});

}

//****************** Show Alert & Refresh Digital Deal File Page 12 seconds after Order Refresh ****************//

$(document).on('knack-record-update.view_2854', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 12000);
  alert("Please wait while we fetch the Order, Customer & P/X Details from Autoline. Click 'OK' & this page will refresh in a few moments...");
  Knack.showSpinner();
});

//****************** Show Alert & Refresh Digital Deal File Page 12 seconds after Invoice Retrieval ****************//

$(document).on('knack-record-update.view_2855', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 12000);
  alert("Please wait while we fetch the Invoice from Autoline. Click 'OK' & this page will refresh in a few moments...");
  Knack.showSpinner();
});

//****************** Show Alert & Refresh Digital Deal File Page 10 seconds after Re-Check for for P/X Valuation ****************//

$(document).on('knack-record-update.view_2584', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 10000);
  alert("Please wait while we search for a Completed Digital Part Exchange Appraisal. Click 'OK' & this page will refresh in a few moments...");
  Knack.showSpinner();
  
});

//****************** Show Alert & Refresh Digital Deal File Page 10 seconds after Re-Check for for P/X Valuation ****************//
$(document).on('knack-record-update.view_2574', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 10000); 
  alert("Please wait while we search for a Completed Digital Part Exchange Appraisal. Click 'OK' & this page will refresh in a few moments...");
  Knack.showSpinner();
  
});

// Disable Stock Number Field on INVOICE Retrieval if NOT Blank
//$(document).on('knack-view-render.view_2855', function(event, view) {

// if ($('#view_2855 #field_6115').val() != "") {

//      $('#view_2855 #field_6115').attr('disabled', 'disabled'); // disable Stock Number input field

//    }; // end if

//});

//****************** Refresh Handover Checklist Page if Selected to update ****************//
$(document).on('knack-record-update.view_2760', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 500);
  Knack.showSpinner();
});

//****************** Refresh Customer Satisfaction Survey Page if Selected to update ****************//
$(document).on('knack-record-update.view_2767', function(event, view, data) { 
  setTimeout(function () { location.hash = location.hash + "#"; }, 500);
  Knack.showSpinner();
});

//****************** Refresh Manufacturer Marketing Preferences Page if Selected to update ****************//
$(document).on('knack-record-update.view_5433', function(event, view, data) { 
  setTimeout(function () { location.hash = location.hash + "#"; }, 500);
  Knack.showSpinner();  
});

//****************** Refresh Profit & Loss Sheet Page once New Vehicle and Part Exchange Info Submitted for Digital P&L Dealers ****************//
$(document).on('knack-record-update.view_3836', function(event, view, data) { 
  setTimeout(function () { location.hash = location.hash + "#"; }, 2000);
  Knack.showSpinner();
});

//****************** Refresh Profit & Loss Sheet Page once Deal Info (previously confirm order on order upload page) Submitted for Digital P&L Dealers ****************//
$(document).on('knack-record-update.view_4433', function(event, view, data) { 
  setTimeout(function () { location.hash = location.hash + "#"; }, 2000);
  Knack.showSpinner(); 
});

//****************** Refresh Profit & Loss Sheet Page when Digital P&L Created Manually by Dealer ****************//
$(document).on('knack-record-create.view_3949', function(event, view, data) { 
  setTimeout(function () { location.hash = location.hash + "#"; }, 2000);
  Knack.showSpinner(); 
});

//************************** CONSOLIDATED HANDOVER PACK ***************************//

//****************** Refresh Handover Pack after Vehicle Invoice ****************//
$(document).on('knack-record-update.view_4383', function(event, view, data) {  
  setTimeout(function () { location.hash = location.hash + "#"; }, 1000);
  Knack.showSpinner(); 
});

//****************** Refresh Handover Pack after Handover Checklist (Update) ****************//
$(document).on('knack-record-update.view_4396', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 1000);
  Knack.showSpinner();
});

//****************** Refresh Handover Pack after Handover Checklist (Create) ****************//
$(document).on('knack-record-create.view_4396', function(event, view, data) { 
  setTimeout(function () { location.hash = location.hash + "#"; }, 1000);
  Knack.showSpinner(); 
});

//****************** Refresh Handover Pack after Service Schedule ****************//
$(document).on('knack-record-update.view_4399', function(event, view, data) { 
  setTimeout(function () { location.hash = location.hash + "#"; }, 1000);
  Knack.showSpinner(); 
});

//****************** Refresh Handover Pack after PCD Satisfaction Survey Updated ****************//
$(document).on('knack-record-update.view_4402', function(event, view, data) { 
  setTimeout(function () { location.hash = location.hash + "#"; }, 1000);
  Knack.showSpinner();  
});

//****************** Refresh Handover Pack after PCD Satisfaction Survey Created ****************//
$(document).on('knack-record-create.view_4402', function(event, view, data) {  
  setTimeout(function () { location.hash = location.hash + "#"; }, 1000);
  Knack.showSpinner(); 
});

//****************** Refresh Handover Pack after Vauxhall Satisfaction Survey Updated ****************//
$(document).on('knack-record-update.view_4403', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 1000);
  Knack.showSpinner();
});

//****************** Refresh Handover Pack after Vauxhall Satisfaction Survey Created ****************//
$(document).on('knack-record-create.view_4403', function(event, view, data) { 
  setTimeout(function () { location.hash = location.hash + "#"; }, 1000);
  Knack.showSpinner();  
});




// ----------  Service Plan table expand or collapse groupings ----------

// Call the function when your table renders – do this for each table you’re applying this to
$(document).on('knack-view-render.view_3668', function(event, view, data) {
    addGroupExpandCollapse(view);
})
// The function itself – only needed once
var addGroupExpandCollapse = function(view) {

    $('#' + view.key + ' .kn-table-group').css("cursor", "pointer");

    $('#' + view.key + " .kn-group-level-1 td").each(function() {
        if ($(this).text().length > 1) {
            var RowText = $(this).html();
            $(this).html('<i class="fa fa-minus-square-o"></i>&nbsp;' + RowText);
        }
    });

    // This line causes groups to be collapsed by default.
    //$('#' + view.key + ' .kn-table-group').nextUntil('.kn-table-group').toggle();

    $('#' + view.key + ' .kn-table-group').click(function() {
        $(this).nextUntil('.kn-table-group').toggle();
        if ($(this).html().indexOf('fa-minus') !== -1) {
            $(this).html($(this).html().replace('minus', 'plus'));
        } else {
            $(this).html($(this).html().replace('plus', 'minus'));
        }
    });

}

//**************************** NEW DEAL FILE SIGN ONLINE ***********************

// Code to wait following Form Submission while PIN is Checked in Integromat

$(document).on('knack-form-submit.view_3676', function(event, view, data) { 
	setTimeout(function(){ 
    	Knack.showSpinner();
    }, 0); 
	commandURL = "https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=9utqmdbom708wa58f576ibtossnlkm9k&recordid=" + data.id ;
 	$.get(commandURL, function(data, status){
      Knack.hideSpinner();
      $(".kn-message.success").html("<b>" + data + "</b>");
    });
});

//Hide Crumbtrail & Header on Sign Online Customer Pages
$(document).on('knack-scene-render.scene_1086', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
});

$(document).on('knack-scene-render.scene_1088', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
});

$(document).on('knack-scene-render.scene_1089', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
});

$(document).on('knack-scene-render.scene_1090', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
});

$(document).on('knack-scene-render.scene_1091', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
});

$(document).on('knack-scene-render.scene_1092', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
});

$(document).on('knack-scene-render.scene_1093', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
});

$(document).on('knack-scene-render.scene_1094', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
});

$(document).on('knack-scene-render.scene_1095', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
});

$(document).on('knack-scene-render.scene_1096', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
});

$(document).on('knack-scene-render.scene_1097', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
});

//DOCUMENT SCAN APP
var scanAppHTML = '';
function embedScanApp(){
  let scanApp = document.getElementById('scanApp');
  if (!scanApp){
    if (scanAppHTML===''){
      scanAppHTML = $.ajax({
          type: "GET",
          url: 'https://stellantisandyoucouk.github.io/photoTakeApp/documentPart.html',
          cache: false,
          async: false
      }).responseText;
    }
    scanApp = document.createElement('div');
    scanApp.innerHTML = scanAppHTML;
    scanApp.id = 'scanApp';
    scanApp.style="display: none;"
    document.body.appendChild(scanApp);
  } else {
    scanApp.innerHTML = scanAppHTML;
  }
  var nowS = Date.now().toString();

  if ($('#scanAppCss').length===0){
    var style = document.createElement('link');
    style.id = "scanAppCss";
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = 'https://stellantisandyoucouk.github.io/knackjs/document.css?'+nowS;
    document.getElementsByTagName( 'head' )[0].appendChild( style )
  }
  function emptyCallback() { }

  function loadScript(src, id,  callback){
    var script, scriptTag;
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = id;
    script.src = src;
    script.onload = script.onreadystatechange = function() {
      if (!this.readyState || this.readyState == 'complete' ){ callback(); }
    };
    scriptTag = document.getElementsByTagName('script')[0];
    scriptTag.parentNode.insertBefore(script, scriptTag);
  }
  if ($('#scanAppJS').length===0){
    loadScript("https://stellantisandyoucouk.github.io/knackjs/document.js?"+nowS,'scanAppJS', emptyCallback);
  }
  if ($('#jsPDF').length===0){
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.2.0/jspdf.umd.min.js','jsPDF', emptyCallback)
  }
}

function showScanApp(button){
  afterLoad(button.getAttribute('data-app_id'), button.getAttribute('data-pdfassetfield'));
  $('#scanApp').show();
  $('.kn-content').hide();
}

function hideScanApp(){
  $('#scanApp').hide();
  $('.kn-content').show();
}

function fillDataToKnack(message){
  hideScanApp();
  $('input[name="'+message.pdfAssetField+'"]').val(message.pdfAssetId);
  $('input[name="'+message.pdfAssetField+'"]').removeClass('input-error');
  $('div[id="kn-input-'+message.pdfAssetField+'"] div[class="kn-asset-current"]').html(message.fileName);
  $('#'+message.pdfAssetField+'_upload').hide();
  $('.kn-file-upload').html('File uploaded successfully.');
}

//END OF SCAN APP CODE

//THIS IS ARRAY OF scenes with document scan
var scanDocsSceneNames = ["scene_931","scene_959", "scene_952", "scene_984", "scene_957", "scene_967", "scene_972", "scene_973", "scene_979", "scene_976", "scene_981", "scene_980", 
			 "scene_1066", "scene_978", "scene_979", "scene_964", "scene_862", "scene_1464", "scene_1068"];
scanDocsSceneNames.forEach(scanDocsLinkFunction);
function scanDocsLinkFunction(selector_view){
  $(document).on("knack-scene-render." + selector_view, function(event, view, data) {
    embedScanApp();
    if ($('button[id="scanDocument"]').length>0){
      for (let i = 0;i<$('button[id="scanDocument"]').length;i++){
        $('button[id="scanDocument"]').eq(i).on("click",function(){
          showScanApp(this);
        });
      }
    }
  });
}  

// ----------  refresh Sales Manager To Do (New Deal File Admin) Table every 50 seconds but not the page itself  ----------
// ----------  refresh Sales Admin To Do (New Deal File Admin) Table every 50 seconds but not the page itself  ----------

$(document).on('knack-scene-render.scene_989', function(event, scene) {
  recursiveSceneRefresh('989',['view_3766','view_3767'],50000)
});


// NEW DEAL FILE ADMIN AND MANAGER VIEW - HIDE AND EXPAND TABLES
// CODE FOR HIDE AND EXPANDING TABLE VIEWS - DO NOT ADD VIEWS HERE - ADD THE VIEW NUMBERS BELOW

var originalHeights = [];

Knack.fn = Knack.fn || {};
Knack.fn.hideExpand = (viewKey) => {
  Knack.$(`#${viewKey} .expandBtn`).show();
  Knack.$(`#${viewKey} .kn-title`).prepend(
    '<i class="fa fa-minus toggleBtn hidden" style="color:#FFA100; margin: 5px"></i>'
  );
  Knack.$(`#${viewKey} section`).show();
  Knack.$(`#${viewKey} .kn-table-wrapper`).show();
  Knack.$(`#${viewKey} .kn-records-nav`).show();
  Knack.$(`#${viewKey} .kn-description`).show();
  Knack.$(`#${viewKey} .toggleBtn`).on("click", function () {
    let classes = Knack.$(this).attr("class").split(/\s+/);
    if (classes.indexOf("hidden") === 2) {
      //show it
      const $section = Knack.$(this).parent().parent().siblings("section");
      const $table = Knack.$(this)
        .parent()
        .parent()
        .siblings(".kn-table-wrapper");
      if ($section.length) {
        $section.show();
      } else if ($table.length) {
        const $navFilters = Knack.$(this)
          .parent()
          .parent()
          .siblings(".kn-records-nav");
        $table.show();
        $navFilters.show();
        //console.log('prevH',originalHeights.find(function(el){return el.viewKey === viewKey}).height);
        $table.height(originalHeights.find(function(el){return el.viewKey === viewKey}).height);
      }
      Knack.$(this).removeClass("hidden");
      Knack.$(this).removeClass("fa-plus");
      Knack.$(this).addClass("fa-minus");
      Knack.$(`#${viewKey} .kn-description`).show();
      

    } else {
      //hide it
      const $section = Knack.$(this).parent().parent().siblings("section");
      const $table = Knack.$(this)
        .parent()
        .parent()
        .siblings(".kn-table-wrapper");
      let isSaved = originalHeights.find(function(el){return el.viewKey === viewKey});
      if (!isSaved){
        originalHeights.push({viewKey:viewKey,height:$table.height()})
      }
      //console.log('height', originalHeights);
      if ($section.length) {
        $section.hide();
      } else if ($table.length) {
        const $navFilters = Knack.$(this)
          .parent()
          .parent()
          .siblings(".kn-records-nav");
        $table.hide();
        $navFilters.hide();
      }
      Knack.$(this).addClass("hidden");
      Knack.$(this).removeClass("fa-minus");
      Knack.$(this).addClass("fa-plus");
      Knack.$(`#${viewKey} .kn-description`).hide();
    }
  });
};

// ADD THE VIEW NUMBERS THAT YOU WOULD LIKE THE HIDE AND EXPAND FEATURE TO WORK ON
// ADMIN VIEWS
$(document).on('knack-view-render.view_3767', function(event, view, data) {
  console.log('view3767');
  Knack.fn.hideExpand("view_3767");
});

$(document).on('knack-view-render.view_4052', function(event, view, data) {
  console.log('view4052');
  Knack.fn.hideExpand("view_4052");
});

$(document).on('knack-view-render.view_2871', function(event, view, data) {
  console.log('view2871');
  Knack.fn.hideExpand("view_2871");
});

$(document).on('knack-view-render.view_2874', function(event, view, data) {
  console.log('view2874');
  Knack.fn.hideExpand("view_2874");
});

$(document).on('knack-view-render.view_2897', function(event, view, data) {
  console.log('view2897');
  Knack.fn.hideExpand("view_2897");
});

$(document).on('knack-view-render.view_2873', function(event, view, data) {
  console.log('view2873');
  Knack.fn.hideExpand("view_2873");
});

$(document).on('knack-view-render.view_3989', function(event, view, data) {
  console.log('view3989');
  Knack.fn.hideExpand("view_3989");
});

$(document).on('knack-view-render.view_4690', function(event, view, data) {
  console.log('view4690');
  Knack.fn.hideExpand("view_4690");
});

$(document).on('knack-view-render.view_4038', function(event, view, data) {
  console.log('view4038');
  Knack.fn.hideExpand("view_4038");
});

$(document).on('knack-view-render.view_3966', function(event, view, data) {
  console.log('view3966');
  Knack.fn.hideExpand("view_3966");
});

$(document).on('knack-view-render.view_3988', function(event, view, data) {
  console.log('view3988');
  Knack.fn.hideExpand("view_3988");
});

$(document).on('knack-view-render.view_3766', function(event, view, data) {
  console.log('view3766');
  Knack.fn.hideExpand("view_3766");
});

$(document).on('knack-view-render.view_4001', function(event, view, data) {
  console.log('view4001');
  Knack.fn.hideExpand("view_4001");
});

$(document).on('knack-view-render.view_4221', function(event, view, data) {
  console.log('view4221');
  Knack.fn.hideExpand("view_4221");
});

$(document).on('knack-view-render.view_4313', function(event, view, data) {
  console.log('view4313');
  Knack.fn.hideExpand("view_4313");
});

$(document).on('knack-view-render.view_4507', function(event, view, data) {
  console.log('view4507');
  Knack.fn.hideExpand("view_4507");
});

$(document).on('knack-view-render.view_4582', function(event, view, data) {
  console.log('view4582');
  Knack.fn.hideExpand("view_4582");
});

$(document).on('knack-view-render.view_4548', function(event, view, data) {
  console.log('view4548');
  Knack.fn.hideExpand("view_4548");
});

$(document).on('knack-view-render.view_5381', function(event, view, data) {
  console.log('view5381');
  Knack.fn.hideExpand("view_5381");
});


// MANAGER VIEWS
$(document).on('knack-view-render.view_3810', function(event, view, data) {
  console.log('view3810');
  Knack.fn.hideExpand("view_3810");
});

$(document).on('knack-view-render.view_4060', function(event, view, data) {
  console.log('view4060');
  Knack.fn.hideExpand("view_4060");
});

$(document).on('knack-view-render.view_4503', function(event, view, data) {
  console.log('view4503');
  Knack.fn.hideExpand("view_4503");
});

$(document).on('knack-view-render.view_4627', function(event, view, data) {
  console.log('view4627');
  Knack.fn.hideExpand("view_4627");
});

$(document).on('knack-view-render.view_3962', function(event, view, data) {
  console.log('view3962');
  Knack.fn.hideExpand("view_3962");
});

$(document).on('knack-view-render.view_3816', function(event, view, data) {
  console.log('view3816');
  Knack.fn.hideExpand("view_3816");
});

$(document).on('knack-view-render.view_3811', function(event, view, data) {
  console.log('view3811');
  Knack.fn.hideExpand("view_3811");
});

$(document).on('knack-view-render.view_3992', function(event, view, data) {
  console.log('view3992');
  Knack.fn.hideExpand("view_3992");
});

$(document).on('knack-view-render.view_3993', function(event, view, data) {
  console.log('view3993');
  Knack.fn.hideExpand("view_3993");
});

$(document).on('knack-view-render.view_3994', function(event, view, data) {
  console.log('view3994');
  Knack.fn.hideExpand("view_3994");
});

$(document).on('knack-view-render.view_4316', function(event, view, data) {
  console.log('view4316');
  Knack.fn.hideExpand("view_4316");
});

$(document).on('knack-view-render.view_4506', function(event, view, data) {
  console.log('view4506');
  Knack.fn.hideExpand("view_4506");
});

$(document).on('knack-view-render.view_4557', function(event, view, data) {
  console.log('view4557');
  Knack.fn.hideExpand("view_4557");
});

$(document).on('knack-view-render.view_4537', function(event, view, data) {
  console.log('view4537');
  Knack.fn.hideExpand("view_4537");
});

$(document).on('knack-view-render.view_5016', function(event, view, data) {
  console.log('view5016');
  Knack.fn.hideExpand("view_5016");
});

$(document).on('knack-view-render.view_4719', function(event, view, data) {
  console.log('view4719');
  Knack.fn.hideExpand("view_4719");
});

// ADMIN VEHICLE ORDER ADMINISTRATION PAGE

$(document).on('knack-view-render.view_2391', function(event, view, data) {
  console.log('view2391');
  Knack.fn.hideExpand("view_2391");
});

$(document).on('knack-view-render.view_4326', function(event, view, data) {
  console.log('view4326');
  Knack.fn.hideExpand("view_4326");
});

$(document).on('knack-view-render.view_4542', function(event, view, data) {
  console.log('view4542');
  Knack.fn.hideExpand("view_4542");
});

$(document).on('knack-view-render.view_2394', function(event, view, data) {
  console.log('view2394');
  Knack.fn.hideExpand("view_2394");
});

$(document).on('knack-view-render.view_2395', function(event, view, data) {
  console.log('view2395');
  Knack.fn.hideExpand("view_2395");
});

$(document).on('knack-view-render.view_4534', function(event, view, data) {
  console.log('view4534');
  Knack.fn.hideExpand("view_4534");
});

$(document).on('knack-view-render.view_5112', function(event, view, data) {
  console.log('view5112');
  Knack.fn.hideExpand("view_5112");
});

// END OF HIDE AND EXPAND CODE



// NEW DEAL FILE – TRIGGER INTEGROMAT UPON CUSTOMER SURVEY FORM COMPLETION
$(document).on('knack-form-submit.view_2765', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=9lmnclxxbi47vosq94nnxdswo5p3yqxm",{"recordid":data.id,"field_6481_raw":data.field_6481_raw,"typeOfCustomerSurvey":"NEW","ConnectedDealer":data.field_6476_raw,"SalesAdvisor":data.field_6488_raw,"MaserAppDealerID":data.field_6678_raw}," NEW DEAL FILE – TRIGGER INTEGROMAT UPON CUSTOMER SURVEY FORM COMPLETION");
});

$(document).on('knack-view-render.view_3633', function(event, view, data) {
  function pad(n) {return n < 10 ? "0"+n : n;}
  function dateTimeToGB(dateobj){
    return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+"/"+dateobj.getFullYear()+' '+pad(dateobj.getHours())+':'+pad(dateobj.getMinutes());
  }
  try {
    let checkedDateSpanCitroen = document.createElement('span');
    checkedDateSpanCitroen.innerHTML = 'Loading date ...';
    checkedDateSpanCitroen.setAttribute("id", "checkedDateSpanCitroen");
    document.getElementById('view_3633').getElementsByClassName('kn-description')[0].appendChild(checkedDateSpanCitroen);
    $.ajax({url:'https://api.apify.com/v2/key-value-stores/MGAH5Tr9TFctDnMTD/records/registration_Citroen', success: function(data){
      let dateFromData = new Date(data);
      $('span[id="checkedDateSpanCitroen"]').text('Citroen: '+dateTimeToGB(dateFromData)+'  ');
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log("error. textStatus: %s  errorThrown: %s", textStatus, errorThrown);
    }, async:true, context:this, cache: false, timeout: 15000});

    let checkedDateSpanPeugeot = document.createElement('span');
    checkedDateSpanPeugeot.innerHTML = 'Loading date ...';
    checkedDateSpanPeugeot.setAttribute("id", "checkedDateSpanPeugeot");
    document.getElementById('view_3633').getElementsByClassName('kn-description')[0].appendChild(checkedDateSpanPeugeot);
    $.ajax({url:'https://api.apify.com/v2/key-value-stores/MGAH5Tr9TFctDnMTD/records/registration_Peugeot', success: function(data){
      let dateFromData = new Date(data);
      $('span[id="checkedDateSpanPeugeot"]').text('Peugeot: '+dateTimeToGB(dateFromData)+'  ');
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log("error. textStatus: %s  errorThrown: %s", textStatus, errorThrown);
    }, async:true, context:this, cache: false, timeout: 15000});

    let checkedDateSpanDS = document.createElement('span');
    checkedDateSpanDS.innerHTML = 'Loading date ...';
    checkedDateSpanDS.setAttribute("id", "checkedDateSpanDS");
    document.getElementById('view_3633').getElementsByClassName('kn-description')[0].appendChild(checkedDateSpanDS);
    $.ajax({url:'https://api.apify.com/v2/key-value-stores/MGAH5Tr9TFctDnMTD/records/registration_DS', success: function(data){
      let dateFromData = new Date(data);
      $('span[id="checkedDateSpanDS"]').text('DS: '+dateTimeToGB(dateFromData)+'  ');
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log("error. textStatus: %s  errorThrown: %s", textStatus, errorThrown);
    }, async:true, context:this, cache: false, timeout: 15000});
  } catch (ex){
    console.log('error',ex)
  }
});

//
//**Function that will trigger a javascript error in integromat
function sendErrorToIntegromat(exception, name, data){
  console.log("error", exception);
  const today = new Date();
  const date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date+' '+time;

  let commandURL = "https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=3wfpzp5a383fxm2k5avvaxpqx8q1us7n";
  let dataToSend = JSON.stringify({"Source":"Javascript error", "Function": name,
  "Payload": data, "userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "Exception": exception.message, "dateTime": dateTime});
  var rData = $.ajax({
     url: commandURL,
     type: 'POST',
     contentType: 'application/json',
     data: dataToSend,
     async: false
  }).responseText;
}

// New Deal File - Digital P&L – Triggering integromat to capture PDF of profit and loss overview to upload to knack
$(document).on('knack-form-submit.view_3855', function(event, view, data) {
    callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=4dol6uz8aoiou9zoryloi8mdbnm8qq3d",{"Record ID":data.id, "Payload": data, "Form": "NEW P&L", "Source Of Payload":"knack direct"},"New Deal File - Digital P&L – Triggering integromat to capture PDF of profit and loss overview to upload to knack");  
});

// New Deal File - Capture PDFs – **New Deal File PDF - Customer satisfaction survey signed at dealer V2 {(Deal File) Customer Satisfaction Survey} Slave App - Replaces https://zapier.com/app/editor/116188221?redirect=true
$(document).on('knack-form-submit.view_2765', function(event, view, data) { 
  if(data.field_6485_raw !== null && data.field_6485_raw !== undefined){
    callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=4dol6uz8aoiou9zoryloi8mdbnm8qq3d",{"Record ID":data.id, "Form":"Customer satisfaction survey", "Source Of Payload":"knack direct"},"New Deal File PDF - Customer satisfaction survey signed at dealer V2 {(Deal File) Customer Satisfaction Survey} Slave App");
  }
});

// New Deal File – **Instant Trigger For Integromat to GET Digital P/X Appraisal For New Digital Deal File Upon Form Submission within Deal File P/X View {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/116816484?redirect=true
$(document).on('knack-form-submit.view_2584', function(event, view, data) {
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=2njybq037hvkht23gn5h5mir6dbtgb2t",{"Knack Digital Deal File ID":data.id, "Connected Dealer":handlIndex(data.field_6048_raw, "0", "identifier"),"Dealer ID From Master App":data.field_6257_raw,"Part Exchange 1":data.field_6125_raw,
    "Part Exchange 3":data.field_6127_raw, "Part Exchange 2":data.field_6126_raw, "Source Of Payload":"knack direct"},"Instant Trigger For Integromat to GET Digital P/X Appraisal For New Digital Deal File Upon Form Submission within Deal File P/X View {(Deal File) Digital Deal File} Slave App");
  });

// New Deal File – **New Deal File - Sign Online Feature Activated {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/116816484?redirect=true
$(document).on('knack-form-submit.view_3750', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=p80lt13r94jjwfnl1bpaanh97brqg1pd",{"Record ID":data.id, "Source Of Payload":"knack direct"},"New Deal File - Sign Online Feature Activated {(Deal File) Digital Deal File} Slave App");   
   });

// New Deal File – **New deal File Zip Folder to email customers(Send directly to customer email address) {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/109007166?redirect=true
$(document).on('knack-form-submit.view_3567', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=6r85ric1omr5xwdm4luvhxe9kyx2l4ca",{"Record ID":data.id, "Source Of Payload":"knack direct"},"New deal File Zip Folder to email customers(Send directly to customer email address) {(Deal File) Digital Deal File} Slave App");    
  });

// New Deal File – **Trigger For Integromat Upon New Vehicle Handover Form Submission {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/73986254?redirect=true
// "Telephone No 4 ":data.field_6105_raw, THE NAME WAS DECLARED WITH A SPACE IN THE ZAPIER!
$(document).on('knack-form-submit.view_2630', function(event, view, data) {
    function handlData (valueB, stringB){
      return (typeof valueB === "undefined" || valueB === null || valueB === "" || valueB === " ") ? "" : valueB + stringB;
    }
    //function to create the address string
    function handlAddress(valueA){
        if (typeof valueA !== "undefined" && valueA !== null){
            return handlData(handlAll(valueA, "street"), ", ") + handlData(handlAll(valueA, "street2"), ", ") + handlData(handlAll(valueA, "city"), ", ") + 
                    handlData(handlAll(valueA, "state"), " ") + handlData(handlAll(valueA, "zip"), "");
        }else{
            return "";
        }
    }
    function handlArrayID(valueA, indexNumber, fieldName){
        if(valueA !== undefined && valueA !== null){
            console.log("The valueA: " + valueA);
            return valueA.length > 0? valueA[indexNumber][fieldName]:"";   
        }else{
            return "";
        }
    }
    function handlArray(valueA){
        if (Array.isArray(valueA)){
            for (var i = 0; i < valueA.length; i++) {
                if(typeof valueA[i] !== "undefined" && valueA[i] !== null){
                    return valueA[i];
                    }
                }
        }else{
            return data.field_6553_raw;
        }
    }

    function handlSRC (valueC){
      return (valueC? "<img src=" + "\"" + valueC + "\"" + " />": "");
    }

    var dateTime = "";
    if(typeof data.field_6277_raw !== undefined && typeof data.field_6277_raw !== null){
            var num = data.field_6277_raw.time;
            var hours = (num / 60);
            var rhours = Math.floor(hours);
            var minutes = (hours - rhours) * 60;
            var rminutes = Math.round(minutes);
            var time =  rhours.toString().padStart(2, '0') + ":" + rminutes.toString().padStart(2, '0');
            dateTime = data.field_6277_raw.date_formatted + " " + time;   
    }

  var createData = {"Knack Record ID From New Vehicle Deal File":data.id, "Customer Address (Autoline Showroom)":handlAddress(data.field_6100_raw), "Autoline Showroom Order Number":data.field_6109_raw,
      "Customer Name (Autoline Showroom)":data.field_6159_raw, "Telephone No 1 (Autoline Showroom)":handlAll(data.field_6101_raw, "formatted"), "Customer Name (Dialog":data.field_6070_raw, "Telephone No 4 (Autoline Showroom)":handlAll(data.field_6105_raw, "formatted"), 
      "Telephone No 3 (Autoline Showroom)":handlAll(data.field_6104_raw, "formatted"), "Telephone No 4 ":handlAll(data.field_6105_raw, "formatted"), "Customer Phone (Dialog)":data.field_6052_raw, "Vehicle Description (Autoline Showroom)":data.field_6110_raw, 
      "Vehicle Description (Dialog)":data.field_6281_raw, "Dealer ID from Master App":data.field_6257_raw, "Sales Adviser Email Linked to this order":handlAll(data.field_6280_raw, "email"), "Customer Email (Dialog)":handlAll(data.field_6102_raw, "email"),
      "Front 3/4 Image":handlSRC(data.field_6279_raw), "Telephone No 2 (Autoline Showroom)":handlAll(data.field_6103_raw, "formatted"), "Customer Address (Dialog)":data.field_6051_raw, "Customer Secondary Email address from Portal creation":data.field_6078_raw, 
      "Key Tag Number":data.field_6267_raw, "Date of customer handover":dateTime, "Customer Email (Autoline)":handlAll(data.field_6102_raw, "email"), "Handover Notes":data.field_6278_raw, "Enquiry Max or Showroom Order":handlArray(data.field_6553_raw),
      "Stock Number":data.field_6115_raw, "Handover Appointment Record ID from Master App":data.field_6628_raw, "Source Of Payload":"knack direct", "Valet Type": handlArrayID(data.field_7197_raw, "0", "identifier"), "Valet Journey": handlArrayID(data.field_7206_raw, "0", "id"),
      "SA valeter notes": data.field_7261_raw};

  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=l2go1pot2nlciknvua2ttc8t7ap187k8",createData,"New Deal File – **Trigger For Integromat Upon New Vehicle Handover Form Submission {(Deal File) Digital Deal File} Slave App");    
});


// New Deal File – **Trigger GET New Vehicle Order from Showroom or Enquiry Max Scenario V3 {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/95033758?redirect=true
$(document).on('knack-form-submit.view_2828', function(event, view, data) { 
      if(data.field_6553_raw === "Showroom Order"){
        callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=1ikhk4iopuuiwivpcpb58ulbsaey5x96",{"RecordID":data.id, "Source Of Payload":"knack direct"},"Trigger GET New Vehicle Order from Showroom or Enquiry Max Scenario V3 {(Deal File) Digital Deal File} Slave App");
      }else{
        callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=4iram11nxfdxjwcb48db3m4xcudii9nq",{"RecordID":data.id, "Source Of Payload":"knack direct"},"Trigger GET New Vehicle Order from Showroom or Enquiry Max Scenario V3 {(Deal File) Digital Deal File} Slave App");
      }
});

// New Deal File – **Trigger Integromat to GET New Vehicle Invoice From Autoline V2 {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/89782269?redirect=true
$(document).on('knack-form-submit.view_2855', function(event, view, data) { 
    var createData = {"Knack Deal File ID":data.id, "Dealer":handlIndex(data.field_6048_raw, "0", "identifier"), "New Vehicle Stockbook Number from Showroom":data.field_6115_raw, "Source Of Payload":"knack direct"};
    callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=u9qfq4gbwxek1b5m9gw8azw3cqgrtekt",createData,"Trigger Integromat to GET New Vehicle Invoice From Autoline V2 {(Deal File) Digital Deal File} Slave App");
});

// New Deal File – **Trigger Refresh New Vehicle Order from Deal File Page V2 {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/95037338?redirect=true
$(document).on('knack-form-submit.view_2854', function(event, view, data) { 
  if(data.field_6553_raw === "Showroom Order"){
    callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=1ikhk4iopuuiwivpcpb58ulbsaey5x96",{"RecordID":data.id, "Source Of Payload":"knack direct"},"Trigger Refresh New Vehicle Order from Deal File Page V2 {(Deal File) Digital Deal File} Slave App");
  }else{
    callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=4iram11nxfdxjwcb48db3m4xcudii9nq",{"RecordID":data.id, "Source Of Payload":"knack direct"},"Trigger Refresh New Vehicle Order from Deal File Page V2 {(Deal File) Digital Deal File} Slave App");
  }});


// New Deal File - Automated Comms – **New Deal File Automated Comms - Handover Appointment {{(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/102282638?redirect=true
$(document).on('knack-form-submit.view_2630', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=vay92ha2hxhc3mosembur448t05gainc",{"Record ID":data.id, "Trigger":"Handover Appointment", "Source Of Payload":"knack direct"},"New Deal File Automated Comms - Handover Appointment {{(Deal File) Digital Deal File} Slave App");
});

// New Deal File – **Instant Trigger For Integromat to GET Digital P/X Appraisal For New Digital Deal File Upon Form Submission {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/72890073?redirect=true
$(document).on('knack-form-submit.view_2574', function(event, view, data) { 
    var createData = {"Knack Digital Deal File ID":data.id, "Connected Dealer":handlIndex(data.field_6048_raw,"0", "identifier"), "Dealer ID From Master App":data.field_6257_raw, "Part Exchange 1":data.field_6125_raw,"Part Exchange 3":data.field_6127_raw, "Part Exchange 2":data.field_6126_raw, "Source Of Payload":"knack direct"};
    callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=2njybq037hvkht23gn5h5mir6dbtgb2t",createData,"Instant Trigger For Integromat to GET Digital P/X Appraisal For New Digital Deal File Upon Form Submission {(Deal File) Digital Deal File} Slave App");
});

// New Deal File - Automated Comms – **New Deal File Automated Comms - New Vehicle Checked In {(Deal File) Vehicle Check In, Documents and Status} Slave App - Replaces https://zapier.com/app/editor/101944107?redirect=true
$(document).on('knack-form-submit.view_2692', function(event, view, data) { 
  const today = new Date();
  const date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date+' '+time;
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=vay92ha2hxhc3mosembur448t05gain",{"Record ID":data.id, "Trigger":"New Vehicle Check In", "Source Of Payload":"knack direct","userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "dateTime": dateTime},"New Deal File Automated Comms - New Vehicle Checked In {(Deal File) Vehicle Check In, Documents and Status} Slave App");
});

// New Deal File - Automated Comms – **New Deal File Automated Comms - Profit & Loss Updated {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/102278316?redirect=true
$(document).on('knack-form-submit.view_2680', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=vay92ha2hxhc3mosembur448t05gainc",{"Record ID":data.id, "Trigger":"Profit & Loss Updated", "Source Of Payload":"knack direct"},"New Deal File Automated Comms - Profit & Loss Updated {(Deal File) Digital Deal File} Slave App");
});

// New Deal File - Automated Comms – **New Deal File Automated Comms - Profit & Loss Uploaded {(Deal File) Digital Deal File} Slave App- Replaces https://zapier.com/app/editor/102172889?redirect=true
$(document).on('knack-form-submit.view_2602', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=vay92ha2hxhc3mosembur448t05gainc",{"Record ID":data.id, "Trigger":"Profit & Loss Uploaded", "Source Of Payload":"knack direct"},"New Deal File Automated Comms - Profit & Loss Uploaded {(Deal File) Digital Deal File} Slave App");
});

// New Deal File - Automated Comms – **New Deal File Automated Comms - Registration Consent Doc Uploaded (AFRL) {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/102296823?redirect=true
$(document).on('knack-form-submit.view_2705', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=vay92ha2hxhc3mosembur448t05gainc",{"Record ID":data.id, "Trigger":"Registration Consent Doc", "Source Of Payload":"knack direct"},"New Deal File Automated Comms - Registration Consent Doc (AFRL) {(Deal File) Digital Deal File} Slave App");
});

// New Deal File - Automated Comms – **New Deal File Automated Comms - Registration Consent Doc UPDATED (AFRL) {(Deal File) Digital Deal File} Slave App
$(document).on('knack-form-submit.view_2706', function(event, view, data) {
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=vay92ha2hxhc3mosembur448t05gainc",{"Record ID":data.id, "Trigger":"Registration Consent Doc", "Source Of Payload":"knack direct"},"New Deal File Automated Comms - Registration Consent Doc UPDATED (AFRL) {(Deal File) Digital Deal File} Slave App");
});

// New Deal File - Automated Commsv – **New Deal File Automated Comms - Vehicle Delivered and Deal File Contents Status {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/111571812?redirect=true
$(document).on('knack-form-submit.view_3620', function(event, view, data) { 
  if(data.field_6768_raw === "Vehicle Delivered and Deal File Contents Complete"){
    callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=vay92ha2hxhc3mosembur448t05gainc",{"Record ID":data.id, "Trigger":"Vehicle Delivered and Deal File Contents Complete", "Source Of Payload":"knack direct"},"New Deal File Automated Comms - Vehicle Delivered and Deal File Contents Status {(Deal File) Digital Deal File} Slave App");
  }else if(data.field_6768_raw === "Vehicle Delivered"){
    callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=vay92ha2hxhc3mosembur448t05gainc",{"Record ID":data.id, "Trigger":"Vehicle Delivered", "Source Of Payload":"knack direct"},"New Deal File Automated Comms - Vehicle Delivered and Deal File Contents Status {(Deal File) Digital Deal File} Slave App");
  }else{
    callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=vay92ha2hxhc3mosembur448t05gainc",{"Record ID":data.id, "Trigger":"Deal File Contents Complete", "Source Of Payload":"knack direct"},"New Deal File Automated Comms - Vehicle Delivered and Deal File Contents Status {(Deal File) Digital Deal File} Slave App");
  }});

// New Deal File - Automated Comms – **New Deal File Automated Comms - Vehicle Invoice Retrieved {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/102299451?redirect=true
$(document).on('knack-form-submit.view_2855', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=vay92ha2hxhc3mosembur448t05gainc",{"Record ID":data.id, "Trigger":"Vehicle Invoice", "Source Of Payload":"knack direct"},"New Deal File Automated Comms - Vehicle Invoice Retrieved {(Deal File) Digital Deal File} Slave App");
});

// New Deal File - Capture PDFs – **New Deal File PDF - Customer satisfaction survey signed online by Customer {(Deal File) Customer Satisfaction Survey} Slave App - Replaces https://zapier.com/app/editor/116187423?redirect=true
$(document).on('knack-form-submit.view_3702', function(event, view, data) {
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=ue6mctvmfbukksn2battr5cqtgnx135v",{"Record ID":data.id, "Form":"Customer satisfaction survey", "Source Of Payload":"knack direct"},"New Deal File PDF - Customer satisfaction survey signed online by Customer {(Deal File) Customer Satisfaction Survey} Slave App"); 
});

// New Deal File - Capture PDFs – **New Deal File PDF - Merge PRE Sale Pack and Customer Signature {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/116785534?redirect=true
$(document).on('knack-form-submit.view_3685', function(event, view, data) {
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=6aee4yo8i2g1chdo9hphjnaw4n42ldor",{"Record ID":data.id, "Form":"Pre Sale Pack", "Source Of Payload":"knack direct"},"New Deal File PDF - Merge PRE Sale Pack and Customer Signature {(Deal File) Digital Deal File} Slave App");
});

// New Deal File - Capture PDFs – **New Deal File PDF - New Vehicle handover checklist signed at Dealer OR to be signed remotely {(Deal File) New Vehicle Handover Checklist} Slave App - Replaces https://zapier.com/app/editor/100712090?redirect=true
$(document).on('knack-form-submit.view_2757', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=ue6mctvmfbukksn2battr5cqtgnx135v",{"Record ID":data.id, "Form":"New vehicle handover checklist", "Source Of Payload":"knack direct"},"New Deal File PDF - New Vehicle handover checklist signed at Dealer OR to be signed remotely {(Deal File) New Vehicle Handover Checklist} Slave App");
});

// New Deal File - Enquiry Max TRIGGER INTEGROMAT to get insurance documents from Handover Checklist
$(document).on('knack-form-submit.view_2757', function(event, view, data) { 
	callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=6362il4kj9nelrnl4itsohyhumqs1hce",{"Record ID":data.id,"Form":"Handover checklist","Source Of Payload": "knack direct"},"Used Deal File - Capture PDFs TRIGGER INTEGROMAT UPON – *Used Deal File PDF - Handover Checklist signed at Dealer OR to be signed remotely {(Deal File)");  
});

// New Deal File - Enquiry Max TRIGGER INTEGROMAT to get insurance documents from Handover Pack (single sign)
$(document).on('knack-form-submit.view_4396', function(event, view, data) { 
	callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=6362il4kj9nelrnl4itsohyhumqs1hce",{"Record ID":data.id,"Form":"Handover checklist","Source Of Payload": "knack direct"},"Used Deal File - Capture PDFs TRIGGER INTEGROMAT UPON – *Used Deal File PDF - Handover Checklist signed at Dealer OR to be signed remotely {(Deal File)");  
});

// New Deal File - Capture PDFs – **New Deal File PDF - New Vehicle handover checklist signed online by Customer {(Deal File) New Vehicle Handover Checklist} Slave App - Replaces https://zapier.com/app/editor/116189095?redirect=true
$(document).on('knack-form-submit.view_3693', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=ue6mctvmfbukksn2battr5cqtgnx135v",{"Record ID":data.id, "Form":"New vehicle handover checklist", "Source Of Payload":"knack direct"},"New Deal File PDF - New Vehicle handover checklist signed online by Customer {(Deal File) New Vehicle Handover Checklist} Slave App");
});

// New Deal File - Capture PDFs – **New Deal File PDF - Part Ex Purchase Invoice signed at dealer or to be signed remotely {(Deal File) Customer Part Exchange Invoice} Slave App - Replaces https://zapier.com/app/editor/100725890?redirect=true
$(document).on('knack-form-submit.view_2822', function(event, view, data) {
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=ue6mctvmfbukksn2battr5cqtgnx135v",{"Record ID":data.id, "Form":"Part exchange purchase invoice", "Source Of Payload":"knack direct"},"New Deal File PDF - Part Ex Purchase Invoice signed at dealer or to be signed remotely {(Deal File) Customer Part Exchange Invoice} Slave App");
});

// New Deal File - Capture PDFs – **New Deal File PDF - Part Ex Purchase Invoice signed online by Customer {(Deal File) Customer Part Exchange Invoice} Slave App - Replaces https://zapier.com/app/editor/116189304?redirect=true
$(document).on('knack-form-submit.view_3683', function(event, view, data) {
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=ue6mctvmfbukksn2battr5cqtgnx135v",{"Record ID":data.id, "Form":"Part exchange purchase invoice", "Source Of Payload":"knack direct"},"New Deal File - Capture PDFs – **New Deal File PDF - Part Ex Purchase Invoice signed online by Customer {(Deal File) Customer Part Exchange Invoice} Slave App");
});

// New Deal File - Capture PDFs – **New Deal File PDF - Service Schedule signed at dealer or to be signed remotely {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/100698595?redirect=true
$(document).on('knack-form-submit.view_2778', function(event, view, data) {
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=ue6mctvmfbukksn2battr5cqtgnx135v",{"Record ID":data.id, "Form":"Service schedule", "Source Of Payload":"knack direct"},"New Deal File - Capture PDFs – **New Deal File PDF - Service Schedule signed at dealer or to be signed remotely {(Deal File) Digital Deal File} Slave App");
});

// New Deal File - Capture PDFs – **New Deal File PDF - Service Schedule signed online by Customer {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/116190873?redirect=true
$(document).on('knack-form-submit.view_3690', function(event, view, data) {
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=ue6mctvmfbukksn2battr5cqtgnx135v",{"Record ID":data.id, "Form":"Service schedule", "Source Of Payload":"knack direct"},"New Deal File PDF - Service Schedule signed online by Customer {(Deal File) Digital Deal File} Slave App");
});

// New Deal File - Capture PDFs – **New Deal File PDF - Vehicle Invoice signed at dealer or to be signed remotely {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/100708580?redirect=true
/*$(document).on('knack-form-submit.view_2674', function(event, view, data) {
callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=4dol6uz8aoiou9zoryloi8mdbnm8qq3d",{"Record ID":data.id, "Form":"Vehicle invoice", "Source Of Payload":"knack direct"},"New Deal File PDF - Vehicle Invoice signed at dealer or to be signed remotely {(Deal File) Digital Deal File} Slave App");
});*/

$(document).on('knack-form-submit.view_2674', function(event, view, data) {
  callPostHttpRequest("https://davidmale--server.apify.actor/makeWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=4dol6uz8aoiou9zoryloi8mdbnm8qq3d",{"Record ID": data.id,"Form": "Vehicle invoice","Source Of Payload": "knack direct"},"New Deal File PDF - Vehicle Invoice signed at dealer or to be signed remotely {(Deal File) Digital Deal File} Slave App");
});

// New Deal File - **New Deal File PDF - Vehicle Invoice signed online by Customer {(Deal File) Digital Deal File} Slave App - Replaces https://zapier.com/app/editor/116194118?redirect=true
$(document).on('knack-form-submit.view_3680', function(event, view, data) {
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=ue6mctvmfbukksn2battr5cqtgnx135v",{"Record ID":data.id, "Form":"Vehicle invoice", "Source Of Payload":"knack direct"},"New Deal File PDF - Vehicle Invoice signed online by Customer {(Deal File) Digital Deal File} Slave App");
});

//**New Deal File PDF - Merge POST Sale Pack and Customer Signature {(Deal File) Digital Deal File} Slave App https://zapier.com/app/editor/116785934?redirect=true
$(document).on('knack-form-submit.view_3696', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=6aee4yo8i2g1chdo9hphjnaw4n42ldor",{"Record ID":data.id, "Form":"Post Sale Pack", "Source Of Payload":"knack direct"},"New Deal File PDF - Merge POST Sale Pack and Customer Signature {(Deal File) Digital Deal File} Slave App");
});

//**Instant Trigger For Integromat to GET Digital P/X Appraisal For New Digital Deal File Upon Form Submission within Deal File P/X View {(Deal File) Digital Deal File} Slave App https://zapier.com/app/editor/73106017?redirect=true
$(document).on('knack-form-submit.view_2584', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=o8f4wtbtada9lh4bzgj34o3qc0dpa3d",{"Knack Digital Deal File ID":data.id, "Connected Dealer":handlAll(data.field_6048_raw,"0", "identifier"), "Dealer ID From Master App":data.field_6257_raw, "Part Exchange 1":data.field_6125_raw, "Part Exchange 3":data.field_6127_raw, "Part Exchange 2":data.field_6126_raw, "Source Of Payload":"knack direct"},"Instant Trigger For Integromat to GET Digital P/X Appraisal For New Digital Deal File Upon Form Submission within Deal File P/X View {(Deal File) Digital Deal File} Slave App");
});

// New Deal File - NEW P& AND New Car Approved P&L for New Car DOC
$(document).on('knack-form-submit.view_3927', function(event, view, data) {
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=ue6mctvmfbukksn2battr5cqtgnx135v",{"Record ID":data.id, "Payload": data, "Form": "NEW P&L"},"New Deal File - NEW P& AND New Car Approved P&L for New Car DOC");
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=3e3g6ao4wr3kcgmoejfrgtmeiohlg8rj",{"Record ID":data.id , "Form":"New Car Digital P&L"},"New Deal File - NEW P& AND New Car Approved P&L for New Car DOC");
});

// **New Deal File PDF - Customer Satisfaction Survey VX signed at dealer V2 {(Deal File) Customer Satisfaction Survey} Slave App - Replaces https://zapier.com/app/editor/116188221?redirect=true
$(document).on('knack-form-submit.view_3968', function(event, view, data) { 
  if(data.field_6485_raw !== null && data.field_6485_raw !== undefined){
    callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=ue6mctvmfbukksn2battr5cqtgnx135v",{"Record ID":data.id, "Form":"Customer satisfaction survey", "Source Of Payload":"knack direct"},"New Deal File PDF - Customer satisfaction survey signed at dealer V2 {(Deal File) Customer Satisfaction Survey} Slave App");
  }
});

// New Deal File - Capture PDFs – **New Deal File PDF - Customer satisfaction survey VX signed at dealer V2 {(Deal File) Customer Satisfaction Survey} Slave App - Replaces https://zapier.com/app/editor/116188221?redirect=true
$(document).on('knack-form-submit.view_3968', function(event, view, data) { 
  if(data.field_6485_raw !== null && data.field_6485_raw !== undefined){
    callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=lnunp83lom13c9swu0vgabmurbjxj5x6",{"recordid":data.id,"field_6481_raw":data.field_6481_raw,"typeOfCustomerSurvey":"NEW","ConnectedDealer":data.field_6476_raw,"SalesAdvisor":data.field_6488_raw,"MaserAppDealerID":data.field_6678_raw},"New Deal File PDF - Customer satisfaction survey signed at dealer V2 {(Deal File) Customer Satisfaction Survey} Slave App");
  }});

//**New Deal Files -Additional Product Certificates Uploaded Submit Certificates
$(document).on('knack-form-submit.view_2745', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=wbis2xdxwspei1lilnkle6db1tvbuh5r",{"Record ID":data.id , "Form":"New Deal Files -Additional Product Certificates Uploaded Submit Certificates"},"New Deal Files -Additional Product Certificates Uploaded Submit Certificates");
});

//**New Deal Files -Additional Product Certificates Uploaded View Certificates
$(document).on('knack-form-submit.view_2746', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=wbis2xdxwspei1lilnkle6db1tvbuh5r",{"Record ID":data.id , "Form":"New Deal Files -Additional Product Certificates Uploaded View Certificates"},"New Deal Files -Additional Product Certificates Uploaded View Certificates");
});

//**New Deal File - Admin Processing Credit Request - GET Credit Note Number from VSB
$(document).on('knack-form-submit.view_4314', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=xu1jig54toecb6zdlvffvktb2xcogpbe",{"Record ID":data.id},"New Deal File - Admin Processing Credit Request - GET Credit Note Number from VSB");
});

// ****************** CUSTOMER HANDOVER PACK TRIGGERS ********************
//**New Deal File - Customer Signed Consolidated Handover Pack - Update Documents and Trigger PDF Capture
$(document).on('knack-form-submit.view_4406', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=3ih7yd1o9ajo23arn5v72zar3nd5m22p",{"Record ID":data.id},"New Deal File - Customer Signed Consolidated Handover Pack - Update Documents and Trigger PDF Capture");
});

// NEW DEAL FILE CUSTOMER SATISFACTION SURVEY PCD – TRIGGER INTEGROMAT UPON CUSTOMER SURVEY FORM COMPLETION FROM CUSTOMER HANDOVER PACK
$(document).on('knack-form-submit.view_4402', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=lnunp83lom13c9swu0vgabmurbjxj5x6",{"recordid":data.id,"field_6481_raw":data.field_6481_raw,"typeOfCustomerSurvey":"NEW","ConnectedDealer":data.field_6476_raw,"SalesAdvisor":data.field_6488_raw,"MaserAppDealerID":data.field_6678_raw},"NEW DEAL FILE CUSTOMER SATISFACTION SURVEY PCD – TRIGGER INTEGROMAT UPON CUSTOMER SURVEY FORM COMPLETION FROM CUSTOMER HANDOVER PACK");
});

// NEW DEAL FILE CUSTOMER SATISFACTION SURVEY VAUXHALL – TRIGGER INTEGROMAT UPON CUSTOMER SURVEY FORM COMPLETION FROM CUSTOMER HANDOVER PACK
$(document).on('knack-form-submit.view_4403', function(event, view, data) { 
  if(data.field_6485_raw !== null && data.field_6485_raw !== undefined){
    callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=lnunp83lom13c9swu0vgabmurbjxj5x6",{"recordid":data.id,"field_6481_raw":data.field_6481_raw,"typeOfCustomerSurvey":"NEW","ConnectedDealer":data.field_6476_raw,"SalesAdvisor":data.field_6488_raw,"MaserAppDealerID":data.field_6678_raw},"NEW DEAL FILE CUSTOMER SATISFACTION SURVEY VAUXHALL – TRIGGER INTEGROMAT UPON CUSTOMER SURVEY FORM COMPLETION FROM CUSTOMER HANDOVER PACK");
}});

// FLEET PROJECT
// ATTACH BROKER TO ORDER - TRIGGER INTEGROMAT TO ATTACH BROKER ACCOUNT

$(document).on('knack-form-submit.view_4460', function(event, view, data) { 
  callPostHttpRequest("https://davidmale--server.apify.actor/integromatWebhook?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw&webhook=6qso0xkjtnf1kdy37qs7t8fdsvjgkr3q",{"recordid":data.id,"Connected Broker":data.field_7792_raw},"ATTACH BROKER TO ORDER - TRIGGER INTEGROMAT TO ATTACH BROKER ACCOUNT");
});

function createCookie(name, value, days) {
  var expires;

  if (days) {
      var date = new Date();
      date.setDate(date.getDate() + days); 
      date.setHours(0);
      expires = "; expires=" + date.toGMTString();
  } else {
      expires = "";
  }
  document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

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
function eraseCookie(name) {
  createCookie(name, "", -1);
}

function getVersionFromApify(){
  try {
    var token = $.ajax({
      url: 'https://api.apify.com/v2/key-value-stores/60ues2gA9nwF71pzK/records/KNACKVERSION?disableRedirect=true',
      type: 'GET',
      async: false,
      timeout: 1000
    }).responseText;

    if (!token) return '';

    token = token.replace('"', '').replace('"', '');
    return token;
  } catch (ex){
    console.log(ex);
    return '';
  }
}

var dateTimeOfFirstRun = null;

$(document).on('knack-scene-render.any', function(event, scene) {
   //**************************************************************************************************************
//****** Hynek's Code to check version on user Browser with what is stored in Apify. If version is different, 
//Browser will refresh and add new version to Cookies. Added 01/12/2020 ******************************************

  	//version check on Apify
  	var versionTimeCheck = readCookie('RDDigitalOrdersVersionTime');
  	var versionC = readCookie('RDDigitalOrdersVersion');
  	console.log('versionC',versionC);
    if (!versionC){
      	console.log('set cookie');
      	createCookie('RDDigitalOrdersVersion',appVersionID,365);
    }
    
   	if (!versionTimeCheck || (Date.now()-versionTimeCheck)>600000){ 
      createCookie('RDDigitalOrdersVersionTime',Date.now(),365);
      console.log('check version');
      var appVersionID = getVersionFromApify();
      if (versionC && versionC!==appVersionID && appVersionID!==''){
          console.log('not same');
          createCookie('RDDigitalOrdersVersion',appVersionID,365);
          window.location.reload(false);
      }
    }
    
  //version check every day
  if (!dateTimeOfFirstRun){
    dateTimeOfFirstRun = new Date();
  }
  console.log('dateTimeOfFirstRun',dateTimeOfFirstRun);
  let today = new Date();
  let isToday = (today.toDateString() == dateTimeOfFirstRun.toDateString());
  if (!isToday){
    dateTimeOfFirstRun = new Date();
    window.location.reload(false);
  }

  if (Knack.session && Knack.session.user) createCookie('RDDigitalOrdersBearer',Knack.session.user.token,1);

    //check for master links
    for (let o = 0;o<$('a[href*="https://www.stellantisandyou.co.uk/digital#"]').length;o++){
      $('a[href*="https://www.stellantisandyou.co.uk/digital#"]').eq(0).attr('target','_parent');
    }

  //version check every day
  /*var versionRefreshTime = readCookie('RDDigitalOrdersVersionRefreshTime');
  if (!versionRefreshTime){
    createCookie('RDDigitalOrdersVersionRefreshTime',Date.now(),1);
  } else {
    var todayS = new Date(Date.now());
    todayS = todayS.toDateString();
    var versionRefreshTimeS = new Date(parseInt(versionRefreshTime));
    versionRefreshTimeS = versionRefreshTimeS.toDateString();
    if (todayS!==versionRefreshTimeS){
      console.log('first day');
      createCookie('RDDigitalOrdersVersionRefreshTime',Date.now(),1);
      window.location.reload(false);
    }
  }*/
});

// function to create the weeb hooks for knack
function callPostHttpRequest(url, payloadObject, callName){
  try{
    let commandURL = url ;
    let dataToSend = JSON.stringify(deleteEmpty(payloadObject)) ;
    var rData = $.ajax({
      url: commandURL,
      type: 'POST',
      contentType: 'application/json',
      data: dataToSend,
      async: false
    }).responseText;
    return rData;
  } catch(exception) {
    console.log('callPostHttpRequest',exception);
    sendErrorToIntegromat(exception, callName, payloadObject);
  }
}

//ultility functions for webhooks data

//function to prevent error when indexing an undefined object
const handlAll = (valueA, fieldName) => (valueA? valueA[fieldName]:null)

//function to handel data if img src is undefined
const handlSRC  = valueC => (valueC? "<img src=" + "\"" + valueC + "\"" + " />": null)

//function to handle indexing and searching for a key in a undefined object
const handlIndex = (valueA, indexA, fieldName) => (valueA? valueA[indexA][fieldName]:"")

//function to iterate through object and delete empty keys
const deleteEmpty = (objectA) => {
  Object.entries(objectA).forEach(([key, value]) => {
    if(!value || value === ""){
      delete objectA[key];
    }     
});
return objectA
}

function showHideMoreServiceVisits(){
  let newV = (document.querySelector('.more').style.display==="none"?"":"none");
  document.querySelectorAll('.more').forEach(function(el) {
     el.style.display = newV;
  });
  if (newV==='none'){
    document.getElementById("showHideMoreServiceVisits").innerText = "Show more";
  } else {
    document.getElementById("showHideMoreServiceVisits").innerText = "Hide more";
  }
}

let shownTooltipId = null;
function serviceVisitsTooltips(viewId = '324', fieldId = '325'){
  //console.log('serviceVisitsTooltips');
  $('div[id*="tooltip"]').each(function(){
    $(this).attr("style","background: white; position: fixed; display:none;");
  });
  $('div[id="view_'+viewId+'"]').on("mouseleave", function (e) {
    //console.log('HIDE AFTER LEAVE')
    $('div[id="tooltip_'+shownTooltipId+'"]').hide();
  });

  //console.log('table',$('table[id="serviceVisitsTable"]'));
  //$('table[id="serviceVisitsTable"]').on("mousemove", function (e) {
  $('div[id="view_'+viewId+'"]').on("mousemove", function (e) {
      //console.log('on move');
      let partOfTable = document.elementFromPoint(e.pageX, e.pageY - document.documentElement.scrollTop);
      let trUnderMouse = null;
      if (partOfTable){
        if (partOfTable.nodeName==='TD'){
          trUnderMouse = partOfTable.parentElement;
        }
        if (partOfTable.nodeName==='TR'){
          trUnderMouse = partOfTable;
        }
      }
      if (trUnderMouse && trUnderMouse.id){
        $('div[id="tooltip_'+trUnderMouse.id+'"]').show();
        //$('div[id="tooltip_'+trUnderMouse.id+'"]').offset({ left: e.pageX+10, top: e.pageY });
        $('div[id="tooltip_'+trUnderMouse.id+'"]').offset({ left: document.getElementById('serviceVisitsTable').getBoundingClientRect().left-250, top: 50 + document.documentElement.scrollTop });
        if (shownTooltipId !== trUnderMouse.id && shownTooltipId !== null){
            $('div[id="tooltip_'+shownTooltipId+'"]').hide();
        }
        shownTooltipId = trUnderMouse.id;
      }
  });
  setTimeout(function(){
    $('div[class="field_'+fieldId+'"]').show();
  }, 100);
}

// ----------  refresh Fleet Bulk CRONOS Orders to Tag in Customer First table every 60 seconds but not the page itself  ----------

$(document).on('knack-scene-render.scene_1313', function(event, scene) {
  recursiveSceneRefresh('1313',['view_4594'],60000)
});


// Hide File Name on Demo/Courtesy Page (show View instead)

$(document).on('knack-records-render.view_5207', function (event, scene, records) {
    $("#view_5207").find("td.field_8646").each(function () {
        if ($(this).text().trim() !== "") {
            $(this).find("a").text("");
            $(this).find("a").append("<i style=\"vertical-align: baseline !important;\" class=\"fa fa-file\"></i>&nbsp;View");
        }
    });
});


//this function just parses recordId from URL //maybe needs to be altered acording the use
function getRecordIdFromHref(ur) {
  var ur = ur.substr(0, ur.length - 1);
  return ur.substr(ur.lastIndexOf('/') + 1)
}

function triggerEssorRefresh(){
  console.log('triggerEssorRefresh');
  console.log(getRecordIdFromHref(location.href));
  callPostHttpRequest("https://hook.eu1.make.celonis.com/5746d46oj2qwo8kvasmun6belsnktikd",{"recordId":getRecordIdFromHref(location.href)},"Trigger Essor Data Refresh From Knack");  
  $('a[href*="triggerEssorRefresh"]').attr('disabled','disabled');
  $('a[href*="triggerEssorRefresh"]').parent().append('The Essor details will be rechecked in next few minutes.');
}

      $(document).on('knack-view-render.view_5115', function(event, view, data) {
  
        // console.log("form view")

        $("#view_5115 button.kn-button.is-primary").on("click", function() {

          // console.log("form submitted")

          const selectedOption = $('input[name="view_5115-field_8561"]:checked').val();
          const postcodeInput = $('#zip');
          const street1Input = $('#street');
          const street2Input = $('#street2');
          const cityInput = $('#city');
          const stateInput = $('#state');


          // console.log(`postcodeInput: ${postcodeInput.val().trim()}`)
          // console.log(`street1Input: ${street1Input.val().trim()}`)
          // console.log(`street2Input: ${street2Input.val().trim()}`)
          // console.log(`cityInput: ${cityInput.val().trim()}`)
          // console.log(`stateInput: ${stateInput.val().trim()}`)


          if (selectedOption === 'Services Required' || selectedOption === undefined) {
            console.log("Skipping validation.");
            postcodeInput.removeClass('input-error'); // optional cleanup
            return true;
          }



        if (!postcodeInput.val().trim()) {
            event.preventDefault(); // Stop form submission
            alert('Please fill out Postcode'); // Show an alert
            postcodeInput.addClass('input-error'); // Add error styling
            postcodeInput.focus(); // Focus on the empty field
            return false; // Explicitly stop submission
          } else {
            postcodeInput.removeClass('input-error');
        // Remove error styling if filled
          };




        if (!street1Input.val().trim()) {
                event.preventDefault(); // Stop form submission
                alert('Please fill out Address Line 1'); // Show an alert
                street1Input.addClass('input-error'); // Add error styling
                street1Input.focus(); // Focus on the empty field
                return false; // Explicitly stop submission
              } else {
            street1Input.removeClass('input-error');
            // Remove error styling if filled
              };


            if (!street2Input.val().trim()) {
                event.preventDefault(); // Stop form submission
                alert('Please fill out Address Line 2'); // Show an alert
                street2Input.addClass('input-error'); // Add error styling
                street2Input.focus(); // Focus on the empty field
                return false; // Explicitly stop submission
              } else {

            street2Input.removeClass('input-error');
            // Remove error styling if filled
              };


            if (!cityInput.val().trim()) {
                event.preventDefault(); // Stop form submission
                alert('Please fill out City'); // Show an alert
                cityInput.addClass('input-error'); // Add error styling
                cityInput.focus(); // Focus on the empty field
                return false; // Explicitly stop submission
              } else {
            cityInput.removeClass('input-error');
            // Remove error styling if filled
              }

            if (!stateInput.val().trim()) {
                event.preventDefault(); // Stop form submission
                alert('Please fill out County'); // Show an alert
                stateInput.addClass('input-error'); // Add error styling
                stateInput.focus(); // Focus on the empty field
                return false; // Explicitly stop submission
              } else {
            stateInput.removeClass('input-error');   // Remove error styling if filled
              }


        });
        });

    
// Jason
  $(document).on('knack-view-render.view_4789', function(event, view, data) {
          
                  // console.log("view 4789")
            $("#view_4789 button.kn-button.is-primary").on("click", function() {

              // console.log("form submitted")
  
              const postcodeInput = $('#zip');
              const street1Input = $('#street');
              const street2Input = $('#street2');
              const cityInput = $('#city');
              const stateInput = $('#state');
        
        
            // console.log(`postcodeInput: ${postcodeInput.val().trim()}`)
            //   console.log(`street1Input: ${street1Input.val().trim()}`)
            //   console.log(`street2Input: ${street2Input.val().trim()}`)
            //   console.log(`cityInput: ${cityInput.val().trim()}`)
            //   console.log(`stateInput: ${stateInput.val().trim()}`)
        
        
        if (!postcodeInput.val().trim()) {
                event.preventDefault(); // Stop form submission
                alert('Please fill out Postcode'); // Show an alert
                postcodeInput.addClass('input-error'); // Add error styling
                postcodeInput.focus(); // Focus on the empty field
                return false; // Explicitly stop submission
              } else {
                postcodeInput.removeClass('input-error');
            // Remove error styling if filled
              };

            if (!street1Input.val().trim()) {
                    event.preventDefault(); // Stop form submission
                    alert('Please fill out Address Line 1'); // Show an alert
                    street1Input.addClass('input-error'); // Add error styling
                    street1Input.focus(); // Focus on the empty field
                    return false; // Explicitly stop submission
                  } else {
                street1Input.removeClass('input-error');
                // Remove error styling if filled
                  };


                if (!street2Input.val().trim()) {
                    event.preventDefault(); // Stop form submission
                    alert('Please fill out Address Line 2'); // Show an alert
                    street2Input.addClass('input-error'); // Add error styling
                    street2Input.focus(); // Focus on the empty field
                    return false; // Explicitly stop submission
                  } else {

                street2Input.removeClass('input-error');
                // Remove error styling if filled
                  };


                if (!cityInput.val().trim()) {
                    event.preventDefault(); // Stop form submission
                    alert('Please fill out City'); // Show an alert
                    cityInput.addClass('input-error'); // Add error styling
                    cityInput.focus(); // Focus on the empty field
                    return false; // Explicitly stop submission
                  } else {
                cityInput.removeClass('input-error');
                // Remove error styling if filled
                  }

                if (!stateInput.val().trim()) {
                    event.preventDefault(); // Stop form submission
                    alert('Please fill out County'); // Show an alert
                    stateInput.addClass('input-error'); // Add error styling
                    stateInput.focus(); // Focus on the empty field
                    return false; // Explicitly stop submission
                  } else {
                stateInput.removeClass('input-error');   // Remove error styling if filled
                  }

            })
        });
        

          $(document).on('knack-view-render.view_4924', function(event, view, data) {
  
              // console.log("view 4924")
            $("#view_4924 button.kn-button.is-primary").on("click", function() {

              // console.log("form submitted")
  
          const postcodeInput = $('#zip');
          const street1Input = $('#street');
          const street2Input = $('#street2');
          const cityInput = $('#city');
          const stateInput = $('#state');
    
    
        //  console.log(`postcodeInput: ${postcodeInput.val().trim()}`)
        //   console.log(`street1Input: ${street1Input.val().trim()}`)
        //   console.log(`street2Input: ${street2Input.val().trim()}`)
        //   console.log(`cityInput: ${cityInput.val().trim()}`)
        //   console.log(`stateInput: ${stateInput.val().trim()}`)
    
    
    if (!postcodeInput.val().trim()) {
            event.preventDefault(); // Stop form submission
            alert('Please fill out Postcode'); // Show an alert
            postcodeInput.addClass('input-error'); // Add error styling
            postcodeInput.focus(); // Focus on the empty field
            return false; // Explicitly stop submission
          } else {
            postcodeInput.removeClass('input-error');
        // Remove error styling if filled
          };

        if (!street1Input.val().trim()) {
                event.preventDefault(); // Stop form submission
                alert('Please fill out Address Line 1'); // Show an alert
                street1Input.addClass('input-error'); // Add error styling
                street1Input.focus(); // Focus on the empty field
                return false; // Explicitly stop submission
              } else {
            street1Input.removeClass('input-error');
            // Remove error styling if filled
              };


            if (!street2Input.val().trim()) {
                event.preventDefault(); // Stop form submission
                alert('Please fill out Address Line 2'); // Show an alert
                street2Input.addClass('input-error'); // Add error styling
                street2Input.focus(); // Focus on the empty field
                return false; // Explicitly stop submission
              } else {

            street2Input.removeClass('input-error');
            // Remove error styling if filled
              };


            if (!cityInput.val().trim()) {
                event.preventDefault(); // Stop form submission
                alert('Please fill out City'); // Show an alert
                cityInput.addClass('input-error'); // Add error styling
                cityInput.focus(); // Focus on the empty field
                return false; // Explicitly stop submission
              } else {
            cityInput.removeClass('input-error');
            // Remove error styling if filled
              }

            if (!stateInput.val().trim()) {
                event.preventDefault(); // Stop form submission
                alert('Please fill out County'); // Show an alert
                stateInput.addClass('input-error'); // Add error styling
                stateInput.focus(); // Focus on the empty field
                return false; // Explicitly stop submission
              } else {
            stateInput.removeClass('input-error');   // Remove error styling if filled
              }

            })
        });
