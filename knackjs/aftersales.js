//ultility functions for webhooks data

//function to prevent error when indexing an undefined object
const handlAll = (valueA, fieldName) => (valueA? valueA[fieldName]:null)

//function to iterate through object and delete empty keys
const deleteEmpty = (objectA) => {
  Object.entries(objectA).forEach(([key, value]) => {
    if(!value || value === ""){
      delete objectA[key];
    }     
});
return objectA
}

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
    if ($('[id="email"]').length>0 && $('[id="password"]').length>0){
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

// function to create the weeb hooks for knack
function callPostHttpRequest(url, payloadObject, callName, retry = 0){
  try{
    let commandURL = url ;
    let dataToSend = JSON.stringify(deleteEmpty(payloadObject)) ;
    var rData = $.ajax({
      url: commandURL,
      type: 'POST',
      contentType: 'application/json',
      data: dataToSend,
      async: false,
      error: function(XMLHttpRequest, textStatus, errorThrown){
        throw errorThrown;
      }
    }).responseText;
    return rData;
  } catch(exception) {
    if (retry < 3){
      setTimeout(function () {
         callPostHttpRequest(url, payloadObject, callName, retry+1)
      }, 2500);
    }
    console.log('callPostHttpRequest',exception);
    sendErrorToIntegromat(exception, callName, payloadObject, retry);
  }
}

// function to create the weeb hooks for knack
function callGetHttpRequest(url){
  try{
    var rData = $.ajax({
      url: url,
      type: 'GET',
      async: false
    }).responseText;
    return rData;
  } catch(exception) {
    return null;
  }
}

/*
  Checks data acording to refreshData structure and updates views
  This is structure describing the page, consisting of different views, updated with different background processes
  Each record in refreshData represents one background update process
  Field mainField is knack fields on first view of views array and this field is used for checking if the background process finished it run and updated the record, so the update process needs ALWAYS give some value to this field!
  Function updates all views in views property of record, if field mainField is blank, till there is some value in mainField 
  !mainField needs to be on first View in array!
  runAfter is function, which is run after the data are loaded to the view
  This is just example
  let refreshData = [
          //mainField needs to be on first View in array
          {
              mainField : 'field_4',
              views:['75','78']   
          },{
              mainField : 'field_74',
              views:['76'],
              runAfter : functionName
          }
        ]
*/
function sceneRefresh(refreshData, startTime = null, runCounter = 1, stats = null){
    console.log('sceneRefresh');
    try {
      if (!startTime){
        startTime = new Date();
        stats = {startTime:startTime, log:[]}
        console.log('startTime', startTime);
      } else {
        console.log('elapsed',new Date() - startTime);
      }
      let recheck = false;
      for (one of refreshData){
          console.log(one);
          console.log('main field val',Knack.views['view_'+one.views[0]].model.attributes[one.mainField])
          if (Knack.views['view_'+one.views[0]].model.attributes[one.mainField]===''){
              let mainReloaded = false; 
              for (oneView of one.views){
                  mainReloaded = refreshView(oneView, mainReloaded);
              }
              console.log('main field val2',Knack.views['view_'+one.views[0]].model.attributes[one.mainField])
              if (Knack.views['view_'+one.views[0]].model.attributes[one.mainField]===''){
                  recheck = true;
                  if (runCounter===1){
                    console.log('fillLoading');
                    for (oneView of one.views){
                      fillLoading(oneView);
                    }
                  }
              } else {
                if (one.runAfter && !one.runAfterDone){
                  setTimeout(one.runAfter,100);
                  one.runAfterDone = true;
                }
              }
          } else {
            if (one.runAfter && !one.runAfterDone){
              setTimeout(one.runAfter,100);
              one.runAfterDone = true;
            }
            
            let statsLogFound = stats.log.find(function(el){return el.one === one.name});
            if (!statsLogFound) {
              stats.log.push({one:one.name,finishTime:new Date(),duration : (new Date() - stats.startTime)/1000});
            }
          }
      }
      if (recheck && (new Date() - startTime)<120000){
          console.log('needs recheck')
          setTimeout(function(){
              sceneRefresh(refreshData, startTime, runCounter + 1, stats);
          }, (runCounter<3?1500:2500));
      } else if ((new Date() - startTime)>120000){
        console.log('ending refresh without all done');
        for (one of refreshData){
          if (!one.runAfterDone){
            for (oneView of one.views){
              refreshView(oneView, true, true);
            }
          }
        }
      } else {
        if (runCounter!==1){
          console.log('everything checked, reload views just for sure');
          stats.finishTime = new Date();
          stats.duration = (stats.finishTime - stats.startTime)/1000;
          console.log('stats', stats);
          //saveStats(stats);
          for (one of refreshData){
            if (!one.runAfterDone){
              for (oneView of one.views){
                refreshView(oneView, true, true);
              }
            }
          }
        }
      }
    } catch (e){
      console.log('sceneRefresh fail', refreshData, e)
    }
}

//This function refreshes view acording viewId, what is just view number!
//Can be called from scene render, view render
function refreshView(viewID, reload = false, clearLoading = false){
    try {
      if (Knack.views['view_'+viewID]===undefined) return false;
      var currModel = JSON.stringify(Knack.views['view_'+viewID].model.attributes);
      const a = {}
      a.success = function () {
        if ((currModel !== JSON.stringify(Knack.views['view_'+viewID].model.attributes)) || reload){
          setTimeout(function(){
            Knack.views['view_'+viewID].render();
            if (clearLoading) {stopLoading(oneView);} //else {fillLoading(viewID);}
          }, 50);
          return true;
        } else {
          return false;
        }
      };
      //reload data from database
      Knack.views['view_'+viewID].model.fetch(a);
    } catch (e){
      console.log('error refreshing view', viewID, e)
    }
}

function formatDateGB(date){
  return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
}
function formatDateGBShort(date){
  return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear().toString().substr(2,2);
}
function formatDateGBShortNotYear(date){
  return date.getDate()+'/'+(date.getMonth()+1);
}

function fillLoading(viewID){
  $('div[class*="view_'+viewID+'"] div[class*="field_"]>div[class="kn-detail-body"]').each(function(){
    if ($(this).text().trim()===''){
      $(this).html('<img src="https://stellantisandyoucouk.github.io/imagesStore/loading.gif"> Loading...')
    }
  });
}

function stopLoading(viewID){
  $('div[class*="view_'+viewID+'"] div[class*="field_"]>div[class="kn-detail-body"]').each(function(){
    if ($(this).text().trim().includes('Loading...')){
      $(this).html('');
    }
  });
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
      if($("#"+viewsArray[i]+"").is(":visible")==true){
        Knack.views[viewsArray[i]].model.fetch();
        setTimeout(function(){
            Knack.views[viewsArray[i]].render();
        }, 50);
      }
    }
    //Call me once again to do it after set refreshInterval
    recursiveSceneRefresh(sceneId,viewsArray,refreshInterval,runCount+1);
    }, refreshInterval);
}

function generateTyres(){
  try {
    console.log('GenerateTyres');
    let tyresJSON = JSON.parse(Knack.views['view_374'].model.attributes['field_250']);
    tyresJSON = tyresJSON.filter(function(el){
      return el['a:StockPolicy'][0] === 'ACTIVE' && el['a:Winter'][0] === 'N'
    })
    console.log('tyresJSON.length filtered',tyresJSON.length);
    tyresJSON = tyresJSON.sort(function(a,b){
      return (a['a:TotalFittedRetailPriceIncVAT'][0] > b['a:TotalFittedRetailPriceIncVAT'][0]?1:(a['a:TotalFittedRetailPriceIncVAT'][0] < b['a:TotalFittedRetailPriceIncVAT'][0]?-1:0));
    })
    let outputTables = [{name:'Budget'},{name:'Medium'},{name:'Premium'}];
    let recordsPerTableWhole = Math.floor(tyresJSON.length/outputTables.length);
    let remainderOfRecords = tyresJSON.length % outputTables.length;
    for (let i = 0;i<outputTables.length;i++){
      outputTables[i].count = recordsPerTableWhole;
      if (remainderOfRecords>0) {
        outputTables[i].count += 1;
        remainderOfRecords = remainderOfRecords - 1;
      }
    }
	  
    let jsonPosition = 0;
    for (let i = 0;i<outputTables.length;i++){
      outputTables[i].text = '<table><tr><th>Manufacturer type</th><th>Price</th></tr>';
      for (let j = jsonPosition;j<jsonPosition + (outputTables[i].count<5?outputTables[i].count:5);j++){
        outputTables[i].text += '<tr title="Available: '+tyresJSON[j]['a:AvailableQuantity'][0]+'; SOR: '+tyresJSON[j]['a:SORQuantity'][0]+'; Delivery date: '+formatDateGB(new Date(tyresJSON[j]['a:DeliveryDate'][0]))+'"><td bgcolor="'+tyreRowColor(tyresJSON[j]['a:AvailableQuantity'][0],tyresJSON[j]['a:SORQuantity'][0])+'">'+tyresJSON[j]['a:ManufacturerName'][0]+' '+tyresJSON[j]['a:StockDesc'][0]+'</td><td>£'+tyresJSON[j]['a:TotalFittedRetailPriceIncVAT'][0]+'</td></tr>';
      }
      jsonPosition += outputTables[i].count;
      outputTables[i].text += '</table>';
    }
    let output = '<table><tr>';
    for (let i =0;i<outputTables.length;i++){
      output += '<td>' + outputTables[i].name + '<br />'+outputTables[i].text+'</td>';
    }
    output += '</tr></table>';

    $('div[class*="field_250"]').html(output);
    $('div[class*="field_250"]').show();
  } catch (e){
    console.log('Error Generating tires',e);
  }
}

function generateTyres1(){
  try {
    console.log('GenerateTyres1');
    let tyresJSON = JSON.parse(Knack.views['view_1477'].model.attributes['field_250']);
    tyresJSON = tyresJSON.filter(function(el){
      return el['a:StockPolicy'][0] === 'ACTIVE' && el['a:Winter'][0] === 'N'
    })
    console.log('tyresJSON.length filtered',tyresJSON.length);
    tyresJSON = tyresJSON.sort(function(a,b){
      return (a['a:TotalFittedRetailPriceIncVAT'][0] > b['a:TotalFittedRetailPriceIncVAT'][0]?1:(a['a:TotalFittedRetailPriceIncVAT'][0] < b['a:TotalFittedRetailPriceIncVAT'][0]?-1:0));
    })
    let outputTables = [{name:'Budget'},{name:'Medium'},{name:'Premium'}];
    let recordsPerTableWhole = Math.floor(tyresJSON.length/outputTables.length);
    let remainderOfRecords = tyresJSON.length % outputTables.length;
    for (let i = 0;i<outputTables.length;i++){
      outputTables[i].count = recordsPerTableWhole;
      if (remainderOfRecords>0) {
        outputTables[i].count += 1;
        remainderOfRecords = remainderOfRecords - 1;
      }
    }	  
	  
    let jsonPosition = 0;
    for (let i = 0;i<outputTables.length;i++){
      outputTables[i].text = '<table><tr><th>Manufacturer type</th><th>Price</th></tr>';
      for (let j = jsonPosition;j<jsonPosition + (outputTables[i].count<5?outputTables[i].count:5);j++){
        outputTables[i].text += '<tr title="Available: '+tyresJSON[j]['a:AvailableQuantity'][0]+'; SOR: '+tyresJSON[j]['a:SORQuantity'][0]+'; Delivery date: '+formatDateGB(new Date(tyresJSON[j]['a:DeliveryDate'][0]))+'"><td bgcolor="'+tyreRowColor(tyresJSON[j]['a:AvailableQuantity'][0],tyresJSON[j]['a:SORQuantity'][0])+'">'+tyresJSON[j]['a:ManufacturerName'][0]+' '+tyresJSON[j]['a:StockDesc'][0]+'</td><td>£'+tyresJSON[j]['a:TotalFittedRetailPriceIncVAT'][0]+'</td></tr>';
      }
      jsonPosition += outputTables[i].count;
      outputTables[i].text += '</table>';
    }
    let output = '<table><tr>';
    for (let i =0;i<outputTables.length;i++){
      output += '<td>' + outputTables[i].name + '<br />'+outputTables[i].text+'</td>';
    }
    output += '</tr></table>';

    $('div[class*="field_250"]').html(output);
    $('div[class*="field_250"]').show();
  } catch (e){
    console.log('Error Generating tyres',e);
  }
}

function tyreRowColor(stockCount, SORCount){
  if (SORCount>=4){
    return '#00ff00';
  } else if (stockCount>=4){
    return '#56ff56';
  } else if (stockCount>0){
    return '#ffff00';
  } else {
    return '#ff0000';
  }
}

function createServiceScheduleClick(){
  var serviceScheduleLabel = document.getElementsByClassName('field_72')[0];

  serviceScheduleLabel.style.cursor = 'pointer';
  serviceScheduleLabel.onclick = function() {
    let servS = document.getElementById("serviceSchedule");
    if (servS.style.display === "none" || servS.style.display === ""){
      servS.style.display = "inline";
    } else {
      servS.style.display = "none";
    }
  };
}

function formatScene24(){
  //Hide service tooltips field
  $('div[class="field_325"]').hide();
}

let shownTooltipId = null;
function serviceVisitsTooltips(viewId = '324', fieldId = '325', tooltipPlace = 'asBefore'){
  console.log('serviceVisitsTooltips',tooltipPlace);
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
        //const body = document.querySelector("body");
        //body.offsetWidth
        let tooltipLeft = document.getElementById('serviceVisitsTable').getBoundingClientRect().left-250;
        let tooltipTop = document.documentElement.scrollTop + 50;
        if (tooltipLeft<50) tooltipLeft = 50;
        if (tooltipPlace==='rightBottomOnMouse'){
          tooltipLeft = e.pageX - $('div[id="tooltip_'+trUnderMouse.id+'"]').width();
          console.log('tooltipLeft',tooltipLeft);
          if (tooltipLeft<10) tooltipLeft = 10;
          tooltipTop = e.pageY - $('div[id="tooltip_'+trUnderMouse.id+'"]').height();
          console.log('tooltipTop',tooltipTop);
          if (tooltipTop<document.documentElement.scrollTop + 10) tooltipTop = document.documentElement.scrollTop + 10;
        }
        //console.log('tooltipWidth',$('div[id="tooltip_'+trUnderMouse.id+'"]').width());
        $('div[id="tooltip_'+trUnderMouse.id+'"]').offset({ left: tooltipLeft, top: tooltipTop});
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

$(document).on("knack-scene-render.scene_105", function(event, scene, data) {
  setTimeout(function(){
    refreshScene24();
  }, 100);
  //document.querySelector('div[id="view_326"]').scrollIntoView(true)
});

function refreshScene24(){
  let refreshData = [
    {
      name : 'Autoline - Owner',
      mainField : 'field_278', //Autoline - type of bussines - first Autoline save
      views:['377','326','344','3273','3495','3501','3496']
    },{
      name : 'Autoline - Vehicle summary',
      mainField : 'field_318', //Autoline - vehicle summary - second Autoline save
      views:['325','375','324','327','3274','3275','3502','3499','3497'],
    },{
      name : 'EMAC Service plan',
      mainField : 'field_312', //EMAC - service plan Summary = Service plan
      views:['376','3503']
    },{
      name : 'Tyres',
      mainField : 'field_247', //Tyres - Front = Stapletons
      views:['330','3509'],
      //runAfter : generateTyres
    },{
      name : 'VHC',
      mainField : 'field_302', //VHC - exists = VHC
      views:['328','3280','3511']
    },{
      name : 'Autoline - email valid',
      mainField : 'field_316', //Autoline - is email valid - last Autoline save
      views:['379','3498']   
    },{
      name : 'Autoline - service visits',
      mainField : 'field_325', //Autoline - service visits tooltips
      views:['380','3279','3279','3500'],
      runAfter : serviceVisitsTooltips
    },{	    
      name : 'Recalls',
      mainField : 'field_70', //Recalls and service shedule check Completed
      views:['329','332','3276','3277','3507','3508']
    }
  ]
  sceneRefresh(refreshData);
}

$(document).on("knack-scene-render.scene_118", function(event, scene, data) {
  let refreshData = [
    {
        mainField : 'field_72', //Service Schedule
        views:['369']
    }
  ]
  sceneRefresh(refreshData);
});

  $(document).on("knack-scene-render.scene_1102", function(event, scene, data) {
  let refreshData = [
    {
        mainField : 'field_72', //Service Schedule
        views:['3514']
    }
  ]
  sceneRefresh(refreshData);
});


$(document).on("knack-scene-render.scene_508", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_250', //Tyres
          views:['1477'],
          runAfter : generateTyres1 
      }
    ]
    sceneRefresh(refreshData);
});

$(document).on("knack-scene-render.scene_119", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_250', //Tyres
          views:['374'],
          runAfter : generateTyres 
      }
    ]
    sceneRefresh(refreshData);
  //generateTyres();
});

//pre-visit jobcard tyres to reload stapleton view after populated
$(document).on("knack-scene-render.scene_1103", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_250', //Tyres
          views:['3518'],
          runAfter : generateTyres2 
      }
    ]
    sceneRefresh(refreshData);
});


  var recordId = '';
  $(document).on('knack-form-submit.view_71', function(event, view, data) { 
    let commandURL = "https://hook.eu1.make.celonis.com/r5pe7r3fvhmkq8x0q9lb8pq3kbive16p" ;
    let dataToSend = Object.assign({"source":"NEWRECORD"}, data); 
    recordId = data.id;
    console.log(dataToSend);
    var rData = $.ajax({
      url: commandURL,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(dataToSend),
      async: false
    }).responseText;
    console.log(rData);
  });

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

  $(document).on('knack-view-render.view_324', function (event, view, data) {
    if (document.getElementById("showHideMoreServiceVisits")){
      document.getElementById("showHideMoreServiceVisits").onclick = showHideMoreServiceVisits;
      showHideMoreServiceVisits();
    }
  });

  $(document).on('knack-view-render.view_140', function (event, view, data) {
    let button0 = document.createElement('button');
    button0.innerHTML = 'In Stock at All Hubs';
    button0.setAttribute("class", "kn-button");
    button0.onclick = function(){
      let token = getTokenFromURL(document.location.href);
      document.location = "https://www.stellantisandyou.co.uk/aftersales#powersupply-orders/?token="+token+"&view_139_page=1&view_139_sort=field_334|desc&view_139_filters=%7B%22match%22%3A%22and%22%2C%22rules%22%3A%5B%7B%22field%22%3A%22field_342%22%2C%22operator%22%3A%22higher%20than%22%2C%22value%22%3A%220%22%2C%22field_name%22%3A%22Total%20Available%20Quantity%22%7D%5D%7D"
      return false;
    };
    document.getElementById('view_140').appendChild(button0)
    let button1 = document.createElement('button');
    button1.innerHTML = 'With BON Raised';
    button1.setAttribute("class", "kn-button");
    button1.onclick = function(){
      let token = getTokenFromURL(document.location.href);
      document.location = "https://www.stellantisandyou.co.uk/aftersales#powersupply-orders/?token="+token+"&view_139_page=1&view_139_sort=field_334|desc&view_139_filters=%7B%22match%22%3A%22and%22%2C%22rules%22%3A%5B%7B%22field%22%3A%22field_336%22%2C%22operator%22%3A%22is%20not%20blank%22%2C%22field_name%22%3A%22Power%20Supply%20Notfication%22%7D%5D%7D"
      return false;
    };
    document.getElementById('view_140').appendChild(button1)
    let button2 = document.createElement('button');
    button2.innerHTML = 'In Stock at Own Hub';
    button2.setAttribute("class", "kn-button");
    button2.onclick = function(){
      let token = getTokenFromURL(document.location.href);
      document.location = "https://www.stellantisandyou.co.uk/aftersales#powersupply-orders/?token="+token+"&view_139_page=1&view_139_sort=field_334|desc&view_139_filters=%7B%22match%22%3A%22and%22%2C%22rules%22%3A%5B%7B%22field%22%3A%22field_345%22%2C%22operator%22%3A%22is%22%2C%22value%22%3A%22Yes%22%2C%22field_name%22%3A%22Has%20Hub%20In%20Stock%22%7D%5D%7D"
      return false;
    };
    document.getElementById('view_140').appendChild(button2)
    let button3 = document.createElement('button');
    button3.innerHTML = 'BO’s with Actions';
    button3.setAttribute("class", "kn-button");
    button3.onclick = function(){
      let token = getTokenFromURL(document.location.href);
      document.location = "https://www.stellantisandyou.co.uk/aftersales#powersupply-orders/?token="+token+"&view_139_page=1&view_139_sort=field_334|desc&view_139_filters=%7B%22match%22%3A%22and%22%2C%22rules%22%3A%5B%7B%22field%22%3A%22field_344%22%2C%22operator%22%3A%22is%20not%22%2C%22value%22%3A%22None%22%2C%22field_name%22%3A%22Order%20Processing%20Status%22%7D%5D%7D"
      return false;
    };
    document.getElementById('view_140').appendChild(button3)
    let button4 = document.createElement('button');
    button4.innerHTML = 'In Stock at Own Hub, with BON Raised';
    button4.setAttribute("class", "kn-button");
    button4.onclick = function(){
      let token = getTokenFromURL(document.location.href);
      document.location = "https://www.stellantisandyou.co.uk/aftersales#powersupply-orders/?token="+token+"&view_139_page=1&view_139_sort=field_334|desc&view_139_filters=%7B%22match%22%3A%22and%22%2C%22rules%22%3A%5B%7B%22field%22%3A%22field_336%22%2C%22operator%22%3A%22is%20not%20blank%22%2C%22field_name%22%3A%22Power%20Supply%20Notfication%22%7D%2C%7B%22field%22%3A%22field_345%22%2C%22operator%22%3A%22is%22%2C%22value%22%3A%22Yes%22%2C%22field_name%22%3A%22Has%20Hub%20In%20Stock%22%7D%5D%7D"
      return false;
    };
    document.getElementById('view_140').appendChild(button4)
    let button5 = document.createElement('button');
    button5.innerHTML = 'In Stock at All Hubs, with BON Raised';
    button5.setAttribute("class", "kn-button");
    button5.onclick = function(){
      let token = getTokenFromURL(document.location.href);
      document.location = "https://www.stellantisandyou.co.uk/aftersales#powersupply-orders/?token="+token+"&view_139_page=1&view_139_sort=field_334|desc&view_139_filters=%7B%22match%22%3A%22and%22%2C%22rules%22%3A%5B%7B%22field%22%3A%22field_342%22%2C%22operator%22%3A%22higher%20than%22%2C%22value%22%3A%220%22%2C%22field_name%22%3A%22Total%20Available%20Quantity%22%7D%2C%7B%22match%22%3A%22and%22%2C%22field%22%3A%22field_336%22%2C%22operator%22%3A%22is%20not%20blank%22%2C%22field_name%22%3A%22Power%20Supply%20Notfication%22%7D%5D%7D"
      return false;
    };
    document.getElementById('view_140').appendChild(button5)
    let button6 = document.createElement('button');
    button6.innerHTML = 'In Stock at All Hubs with BON Raised excluding +++';
    button6.setAttribute("class", "kn-button");
    button6.onclick = function(){
      let token = getTokenFromURL(document.location.href);
      document.location = "https://www.stellantisandyou.co.uk/aftersales#powersupply-orders/?token="+token+"&view_139_page=1&view_139_sort=field_334|desc&view_139_filters=%7B%22match%22%3A%22and%22%2C%22rules%22%3A%5B%7B%22field%22%3A%22field_342%22%2C%22operator%22%3A%22higher%20than%22%2C%22value%22%3A%220%22%2C%22field_name%22%3A%22Total%20Available%20Quantity%22%7D%2C%7B%22match%22%3A%22and%22%2C%22field%22%3A%22field_336%22%2C%22operator%22%3A%22is%20not%20blank%22%2C%22field_name%22%3A%22Power%20Supply%20Notfication%22%7D%2C%7B%22match%22%3A%22and%22%2C%22field%22%3A%22field_354%22%2C%22operator%22%3A%22is%20not%22%2C%22value%22%3A%22%2B%2B%2B%22%2C%22field_name%22%3A%22Power%20Supply%20Reliability%22%7D%5D%7D"
      return false;
    };
    document.getElementById('view_140').appendChild(button6)
  });

  //General function, needs to be copied to other apps JS files if needed
  function getFieldForRowID(view, field, id){
    try {
      if (Knack.views[view] && Knack.views[view].model){
        let record = Knack.views[view].model.data.models.find(function(el){
          return el.id === id
        })
        if (record){
          return record.attributes[field];
        }
      }
    } catch (ex) { console.log('getFieldForRowID',ex)}
  }

  //Parts Power Supply - scene 32 - Power Supply Orders view
  $(document).on('knack-view-render.view_139', function (event, view, data) {
    $('td[class="field_334"]').each(function(){$(this).text($(this).text().trim().substr(0,6)+$(this).text().trim().substr(8,2));});

    //This part is for tooltip of another field above field in list
    //This part of code hides field_330 from the list and then adds it as mouse over to field 380
    //It needs function "getFieldForRowID", also the field_330 NEEDS to be included in the list
    //start
    $('th[class="field_330"]').hide();
    $('td[class*="field_330"]').hide();
    $('div[id="view_139"] table>tbody>tr').each(function(){
      $(this).find('td[data-field-key="field_380"]').attr('data-tooltip',getFieldForRowID('view_139','field_330',$(this).attr('id')));
      $(this).find('td[data-field-key="field_380"]').addClass('tooltip-right');
    });
    //end

    //This part is for column headers
    //Column headers
    $('th[class="field_380"]').attr('title','This is the location of the Parts Warehouse');
    $('th[class="field_381"]').attr('data-tooltip','Quantity and part number on backorder');
    $('th[class="field_381"]').addClass('tooltip-bottom')
  });

  $(document).on('knack-scene-render.scene_38', function(event, scene) {
    refresh('151', 'TITLE', 'TEXT $field_351');
   });

  //PART OF THE CODE FOR NOTIFICATION AND REFRESH OF LIST
  // START
  // Usage - to the scene where there is the view with list add this code 
  // refresh('151', 'TITLE', 'TEXT $field_351');
  // 151 is the view number, and in text you can use any fields in the view with $
  var refreshList = [];

  function refreshWithData(viewID, notifTitle, notifText, field, data = null){
    //console.log('refreshWithData', viewID, 'data',data,'field',field,Knack.views["view_"+viewID].model.data.models[0].attributes);
    //askNotifications();
    if (Knack.views["view_"+viewID]){
      if (data===null){
        if (refreshList.find(el => el === viewID)){
          console.log('already registered');
          return;
        }
        refreshList.push(viewID);
        data = {'value':Knack.views["view_"+viewID].model.data.models[0].attributes[field]};
      } else {
        //console.log(Knack.views["view_"+viewID].model.data);
        if (data.value<Knack.views["view_"+viewID].model.data.models[0].attributes[field]){
          console.log('change up');
          // showNotification('Virtual reception','','New Aftersales Virtual Reception Message')
        }
      }
      data.value = Knack.views["view_"+viewID].model.data.models[0].attributes[field];
    }
    setTimeout(function () { if($("#view_"+viewID).is(":visible")==true){viewFetchWithData(viewID, notifTitle, notifText, field, data);} }, 6000);
   }

  function refresh(viewID, notifTitle, notifText, data = null){
    console.log('refresh', viewID);
    askNotifications();
    if (Knack.views["view_"+viewID]){
      if (data===null){
        if (refreshList.find(el => el === viewID)){
          console.log('already registered');
          return;
        }
        refreshList.push(viewID);
        data = {};
      } else {
        console.log(Knack.views["view_"+viewID].model.data.total_records);
        if (data.total_records!== Knack.views["view_"+viewID].model.data.total_records){
          console.log('NEW RECORD');
          let newRec = Knack.views["view_"+viewID].model.data.models.filter(function(el){
            return data.records.filter(function(el2){
              return el2 === el.id;
            }).length===0
          })
          console.log('newRec', newRec)
          if (newRec.length>0){
            for (newRecOne of newRec){
              // showNotification(notifTitle,'',fillTextFromData(notifText, newRecOne.attributes))
            }
          } else {
            // showNotification(notifTitle,'','Detail not on current list page')
          }
        }
      }
      data.total_records = Knack.views["view_"+viewID].model.data.total_records;
      data.records = Knack.views["view_"+viewID].model.data.models.map(function(el){ return el.id});
    }
    setTimeout(function () { if($("#view_"+viewID).is(":visible")==true){viewFetch(viewID, notifTitle, notifText, data);} }, 15000);
   }

  function viewFetchWithData(viewID, notifTitle, notifText, field, data = null){
    Knack.views["view_"+viewID].model.fetch();
    setTimeout(function () { refreshWithData(viewID, notifTitle, notifText, field, data); }, 500);
   }

   function viewFetch(viewID, notifTitle, notifText, data = null){
    Knack.views["view_"+viewID].model.fetch();
    setTimeout(function () { refresh(viewID, notifTitle, notifText, data); }, 500);
   }

   function fillTextFromData(pattern, data){
      if (!pattern.includes('$')) return pattern;
      for (let varP in data) {
        pattern = pattern.replace('$'+varP,data[varP]);
      }
      return pattern;
   }

   function showNotification(title, icon = '', body){   
    var notification = new Notification(title, {
      icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
      body: body,
      requireInteraction: true
     });
     notification.onclick = function() {
      notification.close();
     };
   }

   function askNotifications(){
    if (Notification.permission !== 'granted') Notification.requestPermission();
    if (Notification.permission === 'denied') alert('NOTIFICATION DENIED, enable notification for this site, chrome://settings/content/siteDetails?site=https%3A%2F%2Fwww.robinsandday.co.uk%2F');
    console.log(Notification.permission);
   }

   //END OF CODE FOR NOTIFICATION AND REFRESH OF LIST

//trigger Maxoptra webhook v2

$(document).on('knack-form-submit.view_225', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/4l70u7asr9kcqgi7wah99l9wjiejkiv0",{"Record ID":data.id},'Scenario DESCRIPTION what for the error webhook')
});

//trigger get tyres and prices from customer job card stapletons v4 trigger (service box)
$(document).on('knack-form-submit.view_1474', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/sci2jeh10s6dmwyul5sbced6lsaifj9b",{"Record ID":data.id, "REG":data.field_31, "POS":data.field_443, "Dealer":data.field_411, "VIN": data.field_73}, "Trigger get tyres and prices from customer job card")
});

  //trigger get tyres and prices from pre-visit jobcard Triggers Stapleton lookup (V4)
$(document).on('knack-form-submit.view_3515', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/sci2jeh10s6dmwyul5sbced6lsaifj9b",{"Record ID":data.id, "REG":data.field_31, "POS":data.field_443, "Dealer":data.field_411}, "Trigger get tyres and prices from customer job card")
});

//trigger get tyres and prices from customer job card
$(document).on('knack-form-submit.view_1474', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/f3xcida5tqk6fybgpkga8p9gn7ek6e7o",{"Record ID":data.id, "REG":data.field_31, "POS":data.field_443, "Dealer":data.field_411}, "Trigger get tyres and prices from customer job card")
});

  //trigger get tyres and prices from pre-visit jobcard
$(document).on('knack-form-submit.view_3515', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/f3xcida5tqk6fybgpkga8p9gn7ek6e7o",{"Record ID":data.id, "REG":data.field_31, "POS":data.field_443, "Dealer":data.field_411}, "Trigger get tyres and prices from customer job card")
});
  
//refresh tyre on modal pop up 
$(document).on("knack-scene-render.scene_508", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_247', //Tyres Front
          views:['1475']
      }
    ]
    sceneRefresh(refreshData);
  });


//refresh tyre on modal pop up NEW TYRE V2 FIELD (FROM SERVICEBOX)
$(document).on("knack-scene-render.scene_508", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_2983', //Tyres Front
          views:['1475']
      }
    ]
    sceneRefresh(refreshData);
  });

//trigger get tyres and prices for a selected dealer from modal view
$(document).on('knack-form-submit.view_1484', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/osrisywv6fufmcdbf7ih8bc1yfrlvpq8",{"Record ID":data.id, "Selected Dealer":data.field_411}, "Trigger get selected dealer tyres")
});

//refresh dealer selected tyres on Modal pop up

$(document).on("knack-scene-render.scene_508", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_575', //Dealer tyres
          views:['1475']
      }
    ]
    sceneRefresh(refreshData);
  });

//auto reload Clear tyres in customer & vehicle look up /precalls
$(document).on('knack-record-update.view_1484', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 100);
  Knack.showSpinner();
});

//auto reload Clear tyres in customer & vehicle look up /precalls
$(document).on('knack-record-update.view_243', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 100);
  Knack.showSpinner();
});

function sendErrorToIntegromat(exception, name, data = null, retry = 0){
  console.log("error", exception);
  const today = new Date();
  const date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date+' '+time;

  let commandURL = "https://hook.eu1.make.celonis.com/3wfpzp5a383fxm2k5avvaxpqx8q1us7n";
  let dataToSend = JSON.stringify({"Source":"Javascript error", "Function": name,
  "Payload": data, "userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "Exception": exception.message, "dateTime": dateTime, "retry":retry});
  var rData = $.ajax({
     url: commandURL,
     type: 'POST',
     contentType: 'application/json',
     data: dataToSend,
     async: false
  }).responseText;
}

// POLICY APPROVAL //

//Policy Approval - Sales Manager Form Submitted 
$(document).on('knack-form-submit.view_4602', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/uc8ukh74we81hhvauoboeuoc3hf8cfpo", {"Record ID":data.id, "Source": "Sales Manager Approval Form"},"Policy Approval Form Submitted");  
});

//Policy Approval - General Manager Form Submitted 
$(document).on('knack-form-submit.view_4530', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/uc8ukh74we81hhvauoboeuoc3hf8cfpo", {"Record ID":data.id, "Source": "General Manager Approval Form"},"Policy Approval Form Submitted");  
});

//Policy Approval - Service Manager Form Submitted 
$(document).on('knack-form-submit.view_4954', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/uc8ukh74we81hhvauoboeuoc3hf8cfpo", {"Record ID":data.id, "Source": "Service Manager Approval Form"},"Policy Approval Form Submitted");  
});


//**Trigger Text To Customer To Complete Exit Survey At Workshop "Check Out"
$(document).on('knack-form-submit.view_318', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/jblvluz2ckc63ecbqsfy7n8g55rvxsik",{"Record ID":data.id}, "Trigger Text To Customer To Complete Exit Survey At Workshop \"Check Out\"")
});

//**Trigger Aftersales - Follow Up call - Text. 
$(document).on('knack-form-submit.view_646', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e9aw38ym9uuyiqj69x814p9qp94uqjiz",{"Record ID":data.id}, "Aftersales - Follow Up Call Email")
});

//**Trigger Aftersales - Exit Survey Email From Insecure (Customer Phone)
$(document).on('knack-form-submit.view_310', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/746jqc0a8o5t3fr6j65sn0wfa6w25kir",{"Record ID":data.id}, "Aftersales - Exit Survey Email from Insecure (customer phone)")
});

// ----------  refresh customer account applications table every 60 seconds but not the page itself  ----------
// ----------  efresh customer account applications report every 60 seconds but not the page itself  ----------
$(document).on('knack-scene-render.scene_111', function(event, scene) {
 recursiveSceneRefresh('111',['view_359','view_634'],100000)
});

//trigger Tarot API
$(document).on('knack-form-submit.view_1106', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/auyd5lsbizh311g5uzi5pat3ir7bra3w",{"Record ID":data.id}, "trigger Tarot API")
});

//Trigger tarot v2 (Second column)
$(document).on('knack-form-submit.view_1298', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/a45crmnl4nnfws8iww60ro6teti10t7g",{"Record ID":data.id}, "trigger tarot v2 (Second column)")
  //callPostHttpRequest("https://hook.eu1.make.celonis.com/a45crmnl4nnfws8iww60ro6teti10t7g",{"Record ID":data.id}, "trigger tarot v2 (Second column)")
});

//trigger aftersales - wip management notes to update
$(document).on('knack-form-submit.view_654', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/a1ixxw9k9su6uv7ikvlwslklhg2mmkcw",{"Record ID":data.id, "Manager's Notes":data.field_1015_raw, "userName": Knack.getUserAttributes().name, "NOM_WIP_REG":data.field_2190_raw, "Nom_wip":data.field_558_raw}, "trigger aftersales - wip management notes to update")
});  

//trigger aftersales - admin to uploadcase/warranty evidence and update notes
$(document).on('knack-form-submit.view_3471', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/sopmgf4kiapu7epd6dsulrawendsamtd",{"Record ID":data.id, "Manager's Notes":data.field_1015_raw, "userName": Knack.getUserAttributes().name, "NOM_WIP_REG":data.field_2190_raw, "Nom_wip":data.field_558_raw}, "trigger aftersales - admin to uploadcase/warranty evidence and update notes")
}); 

//trigger aftersales - admin to uploadcase/warranty evidence and update notes
$(document).on('knack-form-submit.view_3472', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/sopmgf4kiapu7epd6dsulrawendsamtd",{"Record ID":data.id, "Manager's Notes":data.field_1015_raw, "userName": Knack.getUserAttributes().name, "NOM_WIP_REG":data.field_2190_raw, "Nom_wip":data.field_558_raw}, "trigger aftersales - admin to uploadcase/warranty evidence and update notes")
});  
      
//trigger aftersales update notes triggered from C/D Driver where customer signs work 
$(document).on('knack-form-submit.view_3221', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/a1ixxw9k9su6uv7ikvlwslklhg2mmkcw",{"Record ID":data.id, "Manager's Notes":data.field_1015_raw, "userName": Knack.getUserAttributes().name, "NOM_WIP_REG":data.field_2190_raw, "Nom_wip":data.field_558_raw}, "trigger aftersales update notes triggered from C/D Driver where customer signs work ")
});  

// ----------  refresh status of tarot upload ----------
$(document).on('knack-scene-render.scene_224', function(event, scene) {
  recursiveSceneRefresh('224',['view_638'],30000);
});


// Refresh Tyre Stock Audit Table
$(document).on('knack-scene-render.scene_1478', function(event, scene) {
  recursiveSceneRefresh('1478',['view_4925'],30000);
});



// Trigger Customer Incident Form
$(document).on('knack-form-submit.view_781', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/fbuumn73d29ycs7o5ell2c4kflbnkhfb", {"Record ID":data.id},"Send Pre Visit Digital Customer Incident Form V2")
});
$(document).on('knack-form-submit.view_3544', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/fbuumn73d29ycs7o5ell2c4kflbnkhfb", {"Record ID":data.id},"Send Pre Visit Digital Customer Incident Form V2")
});
$(document).on('knack-form-submit.view_1394', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e681sgmbzwk1hgugd3ph4kr34addh61o", {"Record ID":data.id,"Origin":data.field_1815},"Pre Visit Digital Customer Incident Form DEV")
});

var view_4828_refreshDateTime =  new Date();
//trigger aftersales - Update Internal Job Status with Details
$(document).on('knack-form-submit.view_4828', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/n7dnr5i4ygbv36ih7ycjkmrlv1t0udd7",{"Record ID":data.id, "Internal Status":data.field_3781_raw, "userName": Knack.getUserAttributes().name}, "trigger aftersales - Update Internal Status with details")

  if ((new Date()-view_4828_refreshDateTime)>60*60*1000){
    view_4828_refreshDateTime = new Date()
    console.log('doRefresh view_4828');
    setTimeout(function () { document.location.reload();}, 500);
  }
});  

//change the text color based on the input value
$(document).on('knack-view-render.view_375', function(event, view, data) {
  $("#view_375 .kn-details-group.column-2.columns .kn-detail-body span span").each(function() {
	      //green color style
        const greenStyle = {
          color: "#228B22",
          textShadow: "0 0 7px #fff,  0 0 10px #fff, 0 0 21px #fff, 0 0 42px #0fa, 0 0 82px #0fa, 0 0 92px #0fa, 0 0 102px #0fa, 0 0 151px #0fa"
        }
        //red color style
        const redStyle = {
          color: "#cc0000",
          textShadow: "0 0 7px #fff,  0 0 10px #fff, 0 0 21px #fff, 0 0 42px #ffcccc, 0 0 82px #ffcccc, 0 0 92px #ffcccc, 0 0 102px #ffcccc, 0 0 151px #ffcccc"
        }
    //choose color style based on input
    let textColor = ($(this).text().trim() === "No") ? redStyle : greenStyle;
	  //apply the css changes
    $(this).css(textColor);
    
    })
});

	//change the text color based on the input value (PRE-VISIT JOBCARD)
$(document).on('knack-view-render.view_3502', function(event, view, data) {
  $("#view_3502 .kn-details-group.column-2.columns .kn-detail-body span span").each(function() {
	      //green color style
        const greenStyle = {
          color: "#228B22",
          textShadow: "0 0 7px #fff,  0 0 10px #fff, 0 0 21px #fff, 0 0 42px #0fa, 0 0 82px #0fa, 0 0 92px #0fa, 0 0 102px #0fa, 0 0 151px #0fa"
        }
        //red color style
        const redStyle = {
          color: "#cc0000",
          textShadow: "0 0 7px #fff,  0 0 10px #fff, 0 0 21px #fff, 0 0 42px #ffcccc, 0 0 82px #ffcccc, 0 0 92px #ffcccc, 0 0 102px #ffcccc, 0 0 151px #ffcccc"
        }
    //choose color style based on input
    let textColor = ($(this).text().trim() === "No") ? redStyle : greenStyle;
	  //apply the css changes
    $(this).css(textColor);
  })
});

//Submit form for Vehicle Check-in
$(document).on('knack-form-submit.view_736', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/jcvomnieu3i0k2a5bkce88csho75et9s", {"Record ID":data.id, "Summary Of Work That Has Been Booked In": data.field_1116_raw,
 "Date / Time Collection Time agreed With Customer At Check in":handlAll(data.field_1117_raw, "date"), "Parking Bay That Customer Vehicle Is Currently Parked In":data.field_1118_raw,
 "Alternative Mobile Phone Number To Use whilst vehicle is with us Instead Of Stored Contact numbers": handlAll(data.field_1119_raw, "formatted"), "Would Customer Like Us To Make This New Number The Default For Future Communication": data.field_1120_raw,
  "Customer Signature At Check in":data.field_1122_raw, "Labour Summary":data.field_432_raw, "Customer & Advisor Job Card Notes":data.field_446_raw, "Autoline - customer email":data.field_277_raw,
  "Use Autoline - Customer Phone 1":data.field_782_raw, "Use Autoline - Customer Phone 2":data.field_783_raw, "Use Autoline - Customer Phone 3":data.field_784_raw, "Use Autoline - Customer Phone 3":data.field_785_raw},"Submit form for Vehicle Check-in")
});

  //Wip Management hide values from view
$(document).on('knack-view-render.view_596', function (event, view, data) {
    //This part is for column headers
    //Column header
    $('th[class="field_1108"]').attr('title','F = First Clocked Date L = Last Clocked Date');
    $('th[class="field_982"]').attr('data-tooltip','Medkit = CCDIAG Truck = CCRECOV');
    $('th[class="field_982"]').addClass('tooltip-bottom')
    $('th[class="field_1022"]').attr('title','Time Allowed For jobs NOT Completed');
	   $('th[class="field_1021"]').attr('title','Time Taken For Jobs NOT completed');
	  $('th[class="field_1111"]').attr('title','No of Days Since Checked In');

  /*  if ($('div[class="kn-table kn-view view_596"]')){
      let rows = $('div[class="kn-table kn-view view_596"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/a61ljkqf5jw5d643274gixjtqdx5hgo8", {"recordId":cell, "Scenario":"vehicle customer look up" },"Aftersales- update individual LIVE WIPS 'touched today' and UPDATE Parts & Labour v4");
          };
        };
        if (currentRow.id!==''){
          currentRow.children[0].onclick = createClickHandler(currentRow);
        }
      }
    }*/

    //move icons
    if ($('div[class="kn-table kn-view view_596"]')){
      let rows = $('div[class="kn-table kn-view view_596"] table>tbody>tr[id]');
      for (i = 0; i < rows.length; i++) {
        $('div[id="view_596"] table>tbody>tr[id]').eq(i).find('span[class="col-9"]>a').appendTo($('div[id="view_596"] table>tbody>tr[id]').eq(i).find('span[class="col-9"]').parent())
        $('div[id="view_596"] table>tbody>tr[id]').eq(i).find('span[class="col-7"]>a').appendTo($('div[id="view_596"] table>tbody>tr[id]').eq(i).find('span[class="col-7"]').parent())
      }
    }
  });
//hide vin from last clocked vs invoice table
$(document).on('knack-view-render.view_244', function (event, view, data) {
	  $('th[class="field_622"]').hide();
    $('td[class*="field_622"]').hide();
});

//Wip Management - Customer No Show 
$(document).on('knack-view-render.view_973', function (event, view, data) {

	  //hide VIN from table
	  $('th[class="field_73"]').hide();
    $('td[class*="field_73"]').hide();
	  //hide reg
	  $('th[class="field_31"]').hide();
    $('td[class*="field_31"]').hide();
	  //hide wip num
	  $('th[class="field_441"]').hide();
    $('td[class*="field_441"]').hide();
	  //hide account num
	  $('th[class="field_756"]').hide();
    $('td[class*="field_756"]').hide();	  
});

// Refresh Virtual Reception table on Pre Visit Page  
$(document).on('knack-scene-render.scene_91', function(event, scene) {
  refreshWithData('1188', 'TITLE', 'TEXT $field_351', 'field_1518');
});

// CODE Required to set a Modal Pop Up to Max Width
// Job Card V2 View
$(document).on("knack-scene-render.scene_762", function(event, scene) {
  $(this).find('.kn-modal').addClass('Modal_for_' + Knack.router.current_scene_key)
});

// Send Message View
$(document).on("knack-scene-render.scene_420", function(event, scene) {
  $(this).find('.kn-modal').addClass('Modal_for_' + Knack.router.current_scene_key)
});

// Commence Courtesy Car Agreement Page
$(document).on("knack-scene-render.scene_779", function(event, scene) {
  $(this).find('.kn-modal').addClass('Modal_for_' + Knack.router.current_scene_key)
});

// Complete Courtesy Car Agreement Page
$(document).on("knack-scene-render.scene_963", function(event, scene) {
  $(this).find('.kn-modal').addClass('Modal_for_' + Knack.router.current_scene_key)
});

// Post Visit Follow Up Call Page
$(document).on("knack-scene-render.scene_231", function(event, scene) {
  $(this).find('.kn-modal').addClass('Modal_for_' + Knack.router.current_scene_key)
});

// Activity Snapshot Message Reporting Drilldown Page (Dealer)
$(document).on("knack-scene-render.scene_1187", function(event, scene) {
  $(this).find('.kn-modal').addClass('Modal_for_' + Knack.router.current_scene_key)
});

// Activity Snapshot Message Reporting Drilldown Page (Group)
$(document).on("knack-scene-render.scene_1193", function(event, scene) {
  $(this).find('.kn-modal').addClass('Modal_for_' + Knack.router.current_scene_key)
});

//  Pop-up to display FOCUS Data
$(document).on("knack-scene-render.scene_1280", function(event, scene) {
  $(this).find('.kn-modal').addClass('Modal_for_' + Knack.router.current_scene_key)
});

//  Pop-up to display Parts PO Upload
$(document).on("knack-scene-render.scene_1325", function(event, scene) {
  $(this).find('.kn-modal').addClass('Modal_for_' + Knack.router.current_scene_key)
});

//Recall Recheck Spinner on Vehicle Checkin and to expand the modal pop up so it is wider
$(document).on("knack-scene-render.scene_769", function(event, scene) {
    $(this).find('.kn-modal').addClass('Modal_for_' + Knack.router.current_scene_key)
	//line above is related to the modal pop up - please look at aftersales css Lines 3062-3065 or copy the below and adjust scene as necessary
/*.Modal_for_scene_769 {
    width: 90%;
    height: 90vh;
}*/
    callPostHttpRequest("https://hook.eu1.make.celonis.com/a5dm1fsf5mjyar2wjno8qjb2grjuj1nf", {"Record ID":scene.scene_id},"Webhook from scene 769");
    
    let refreshData = [
      {
          mainField : 'field_1189', //recall-recheck - field must be empty for refresh to occur
          views:['3116']
      }
    ]
    sceneRefresh(refreshData);
  });


// AFTERSALERS CHECK IN PROCESS
// --- Aftersales vehicle check-in ---
$(document).on('knack-view-render.view_735', function(event, view) {
  //get the vin value from the table
 //const vinNumber = $(".col-2").text().trim()
 //send a http request with the vin an record id
/*
 const triggerRecord = (event2) => {
  console.log('webhook call',event2.view.app_id,vinNumber)
   callPostHttpRequest("https://hook.eu1.make.celonis.com/a5dm1fsf5mjyar2wjno8qjb2grjuj1nf", {"VIN": vinNumber },"Aftersales- will triger during vehicle check-in");
 }
 //add an event listner to the arrow table element
 $(".fa-wrench").on("click", triggerRecord);
*/
 if ($('div[class="kn-view kn-table view_735"]')){
  let rows = $('div[class="kn-view kn-table view_735"] table tr');
  for (i = 1; i < rows.length; i++) {
    let currentRow = rows[i];
    const createClickHandler = function(row) {
      return function() {
        var cell = row.id;
        let vin = row.querySelector('.col-2').innerText;
        console.log('rowId',cell, 'vin',vin);
        callPostHttpRequest("https://hook.eu1.make.celonis.com/a5dm1fsf5mjyar2wjno8qjb2grjuj1nf", {"Record ID":cell, "VIN": vin},"Aftersales- will triger during vehicle check-in");
      };
    };
    currentRow.children[6].onclick = createClickHandler(currentRow);
  }
}
});

//******* Live Character Count on Aftersales Vehicle Check In for WIP Notes Tab *******
$(document).on("knack-view-render.view_736", function(event, view, data) {
  $( document ).ready(function() {
    $(".kn-form.kn-view.view_736 form #field_1766")
    .after( "<p class='typed-chars'>0 out of 120 Characters</p>" );

    $(".kn-form.kn-view.view_736 form #field_1766").on('input',function(e){
      var $input = $(this);
      $input.siblings('.typed-chars').text($input.val().length + " out of 120 Characters");
    });
  });
});

// Refresh the Vehicle Check In Status Table       
$(document).on('knack-scene-render.scene_94', function(event, scene) {
  recursiveSceneRefresh('94',['view_1337'],10000);
});

// ----------  Refresh Aftersales Customer Exit Survey Results table every 60 seconds but not the page itself  ---------- //
$(document).on('knack-scene-render.scene_148', function(event, scene) {
  recursiveSceneRefresh('148',['view_423'],10000);
});

// Exit Survey E-mails webhook to trigger – 
$(document).on('knack-form-submit.view_307', function(event, view, data) { 
    let createData = {"Record ID":data.id};
    callPostHttpRequest("https://hook.eu1.make.celonis.com/l033812xruob5c383h0qlfz59oebzwak",deleteEmpty(createData),"Aftersales - Exit Survey Email from Tablet");    
});

// ------------ Refresh Aftersales Wip Management Table every 20 mins but not the page itself -----------------------//
$(document).on('knack-scene-render.scene_152', function(event, scene) {
  recursiveSceneRefresh('152',['view_596'],1200000);
});

// Refresh the Parts Hubs Pre Pick List         
$(document).on('knack-scene-render.scene_340', function(event, scene) {
 recursiveSceneRefresh('340',['view_947'],300000);
});

//Trigger failed Quality check (QC) emails to workshop controller/ manager
$(document).on('knack-form-submit.view_1628', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/4j0xi2h5k9xu0h1cq1yznekvwgbqk0p6", {"Record ID":data.id},"Failed Quality Check (QC)")
});

//Trigger failed Quality check (QC) emails to workshop controller/ manager
$(document).on('knack-form-submit.view_1182', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/4j0xi2h5k9xu0h1cq1yznekvwgbqk0p6", {"Record ID":data.id},"Failed Quality Check (QC)")
});

//Trigger failed Quality check (QC) emails to workshop controller/ manager
$(document).on('knack-form-submit.view_1260', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/4j0xi2h5k9xu0h1cq1yznekvwgbqk0p6", {"Record ID":data.id},"Failed Quality Check (QC)")
});

//Trigger failed Quality check (QC) emails to workshop controller/ manager
$(document).on('knack-form-submit.view_1261', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/4j0xi2h5k9xu0h1cq1yznekvwgbqk0p6", {"Record ID":data.id},"Failed Quality Check (QC)")
});

//Trigger failed Quality check (QC) emails to workshop controller/ manager within TECH VIEW
$(document).on('knack-form-submit.view_2725', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/4j0xi2h5k9xu0h1cq1yznekvwgbqk0p6", {"Record ID":data.id},"Failed Quality Check (QC)")
});

// Trigger Update To VR (Virtual Reception) Status
$(document).on('knack-form-submit.view_1177', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/eg038ofutim5lilwakogd64bdpcl63hp", {"Record ID":data.id},"Aftersales VR Update")
});

// Trigger When VR (Virtual Reception) Message Manually Added From Aftersales App
$(document).on('knack-form-submit.view_1180', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/n61si6zv6na4hav63cyl7gvkvh78n73z", {"Record ID":data.id},"Aftersales VR New Message")
});

//Refresh Virtual Reception table on Vehicle lookup page         
$(document).on('knack-scene-render.scene_20', function(event, scene) {
  refreshWithData('1168', 'TITLE', 'TEXT $field_351', 'field_1518');
});

$(document).on('knack-view-render.view_1168', function(event, view) {
  if (Notification.permission !== 'granted') {
    const para = document.createElement("p");
    para.classList.add('label');
    para.classList.add('kn-label');
    para.style = 'color:red;';
    para.setAttribute("id", "enableDesktopNotif");
    para.innerHTML = "To enable Desktop Pop-Up Notifications when new VR Messages appear, please go to your Account Settings and click “Allow” Notifications";

    const element = document.querySelector("div[id='view_1168']");
    element.appendChild(para);
  }
});

//Refresh Outstanding Messages on ALL Job's on site page
$(document).on('knack-scene-render.scene_753', function(event, scene) {
  refreshWithData('2744', 'TITLE', 'TEXT $field_351', 'field_1518');
 });

//Refresh Virtual Reception on Job's on site (workshop controller)    
$(document).on('knack-scene-render.scene_761', function(event, scene) {
  refreshWithData('2403', 'TITLE', 'TEXT $field_351', 'field_1518');
});

$(document).on('knack-view-render.view_2403', function(event, view) {
  if (Notification.permission !== 'granted') {
    const para = document.createElement("p");
    para.classList.add('label');
    para.classList.add('kn-label');
    para.style = 'color:red;';
    para.setAttribute("id", "enableDesktopNotif");
    para.innerHTML = "To enable Desktop Pop-Up Notifications when new VR Messages appear, please go to your Account Settings and click “Allow” Notifications";

    const element = document.querySelector("div[id='view_2403']");
    element.appendChild(para);
  }
});

// Refresh Virtual Reception table on Vehicle Checkout Page        
$(document).on('knack-scene-render.scene_95', function(event, scene) {
  refreshWithData('1189', 'TITLE', 'TEXT $field_351', 'field_1518');
});

// Refresh Virtual Reception table on Post Visit Page         
$(document).on('knack-scene-render.scene_90', function(event, scene) {
  refreshWithData('1190', 'TITLE', 'TEXT $field_351', 'field_1518');
});

// Refresh Virtual Reception table on All Jobs For Prague Demo        
$(document).on('knack-scene-render.scene_415', function(event, scene) {
  refreshWithData('1190', 'TITLE', 'TEXT $field_351', 'field_1518');
});

// Refresh Main Table on Contact Centre Feedback Page every 5 mins
$(document).on('knack-scene-render.scene_526',function(event, scene) {
 recursiveSceneRefresh('526',['view_1528'],300000)
});

//hide record id from vehicle look up table 
$(document).on('knack-view-render.view_1223', function (event, view, data) {
	$('th[class="field_1601"]').hide();
  $('td[class*="field_1601"]').hide();
});

// --- Aftersales Virtual reception update job card ---
$(document).on('knack-view-render.view_1169', function(event, view) {
	//hide record id
	  $('th[class="field_1601"]').hide();
    $('td[class*="field_1601"]').hide();
	
  //get the vin value from the table
  /* const vinNumber = $(".col-8").text().trim()
 
     if ($('div[class="kn-view kn-table view_1169"]')){
      let rows = $('div[class="kn-view kn-table view_1169"] table tr');
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/a61ljkqf5jw5d643274gixjtqdx5hgo8", {"Record ID":cell, "VIN": vinNumber, "Scenario":"vehicle customer look up" },"Aftersales- update individual LIVE WIPS 'touched today' and UPDATE Parts & Labour v4");
          };
        };
        currentRow.children[5].onclick = createClickHandler(currentRow);
      }
    }
    */
	});
 
//WIP Refresh Spinner upon search
$(document).on("knack-scene-render.scene_105", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_987', //Autoline WIP Details
          views:['1175']
      }
    ]
    sceneRefresh(refreshData);
  });

//refresh MOT Details in VR piece
$(document).on("knack-scene-render.scene_105", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_1646', //Autoline WIP Details
          views:['1175']
      }
    ]
    sceneRefresh(refreshData);
  });

//manually trigger hub to hub swap
$(document).on('knack-view-render.view_1248', function(event, view) {
	//get the vin value from the table
  const vinNumber = $(".col-2").text().trim()
  //send a http request with the vin an record id

  const triggerRecord2 = (event2) => {
   callPostHttpRequest("https://hook.eu1.make.celonis.com/311tdiov4qlsg7g84pvialsggdawolta", {"Record ID":event2.view.app_id, "VIN": vinNumber },"Parts - Hub to hub v2");
 }
 //add an event listner to the arrow table element
 $(".fa-exchange").on("click", triggerRecord2)
});

// ------------ Refresh Hub to Hub transfer every 2 mins but not the page itself -----------------------//
$(document).on('knack-scene-render.scene_439', function(event, scene) {
  recursiveSceneRefresh('439',['view_1248'],120000);
});

// ------------ Refresh WIP Reporting status but not the page itself -----------------------//
$(document).on('knack-scene-render.scene_152', function(event, scene) {
  recursiveSceneRefresh('152',['view_1285'],120000);
});

$(document).on('knack-view-render.view_1297', function (event, view, data) {
  $('div[class*="field_1687"]>div[class="kn-detail-body"]>span').hide();
  var sound      = document.createElement('audio');
  sound.id       = 'audio-player';
  sound.controls = 'controls';
  sound.src      = $('div[class*="field_1687"]>div[class="kn-detail-body"]>span').text();
  document.querySelector('div[class*="field_1687"]').appendChild(sound);
})

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

$(document).on('knack-view-render.any', function (event, view, data) {
  submitUserLoginForm();
});

$(document).on('knack-scene-render.any', function(event, scene) {
  $('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();

  //**************************************************************************************************************
  //****** Hynek's Code to check version on user Browser with what is stored in Apify. If version is different, 
  //Browser will refresh and add new version to Cookies. Added 01/12/2020 ******************************************

  	//version check on Apify
  	var versionTimeCheck = readCookie('RDDigitalAftersalesVersionTime');
  	var versionC = readCookie('RDDigitalAftersalesVersion');
  	//console.log('versionC',versionC);
    if (!versionC){
      	console.log('set cookie');
      	createCookie('RDDigitalAftersalesVersion',appVersionID,365);
    }
    
   if (!versionTimeCheck || (Date.now()-versionTimeCheck)>600000){ 
      createCookie('RDDigitalAftersalesVersionTime',Date.now(),365);
      console.log('check version');
      var appVersionID = getVersionFromApify();
      if (versionC && versionC!==appVersionID && appVersionID!==''){
          console.log('not same');
          createCookie('RDDigitalAftersalesVersion',appVersionID,365);
          window.location.reload(false);
      }
    }
  
    //version check every day
  if (!dateTimeOfFirstRun){
    dateTimeOfFirstRun = new Date();
  }
  //console.log('dateTimeOfFirstRun',dateTimeOfFirstRun);
  let today = new Date();
  let isToday = (today.toDateString() == dateTimeOfFirstRun.toDateString());
  if (!isToday){
    console.log('dateTimeOfFirstRun',dateTimeOfFirstRun)
    dateTimeOfFirstRun = new Date();
    window.location.reload(false);
  }

  //check for master links
  for (let o = 0;o<$('a[href*="https://www.stellantisandyou.co.uk/digital"]').length;o++){
    $('a[href*="https://www.stellantisandyou.co.uk/digital"]').eq(0).attr('target','_parent');
  }

  //version check every day
  /*
  var versionRefreshTime = readCookie('RDDigitalAftersalesVersionRefreshTime');
  if (!versionRefreshTime){
    createCookie('RDDigitalAftersalesVersionRefreshTime',Date.now(),1);
  } else {
    var todayS = new Date(Date.now());
    todayS = todayS.toDateString();
    var versionRefreshTimeS = new Date(parseInt(versionRefreshTime));
    versionRefreshTimeS = versionRefreshTimeS.toDateString();
    if (todayS!==versionRefreshTimeS){
      console.log('first day');
      createCookie('RDDigitalAftersalesVersionRefreshTime',Date.now(),1);
      window.location.reload(false);
    }
  }*/

  //  ---------Auto Capitalise Regestration input-------------
  $('input#field_31').keyup(function() {
    this.value = this.value.toUpperCase().replace(new RegExp(' ','g'),'').replace(new RegExp('	','g'),''); 
});
});

//HIDE DATA FROM TYRE LOOK UP 
$(document).on('knack-view-render.view_1474', function (event, view, data) {
  //hide REG from table
	$('#kn-input-field_31').hide();
  $('#kn-input-field_31').hide();
	//hide pos from table
  $('#kn-input-field_443').hide();
  $('#kn-input-field_443').hide();
	//hide connected dealer
	$('#kn-input-field_411').hide();
  $('#kn-input-field_411').hide();
	//hide Vin
	$('#kn-input-field_73').hide();
  $('#kn-input-field_73').hide();
});

//HIDE DATA FROM TYRE LOOK UP  within previsit jobcard
$(document).on('knack-view-render.view_3515', function (event, view, data) {
	  //hide REG from table
	  $('#kn-input-field_31').hide();
    $('#kn-input-field_31').hide();
	  //hide pos from table
    $('#kn-input-field_443').hide();
    $('#kn-input-field_443').hide();
	  //hide connected dealer
	  $('#kn-input-field_411').hide();
    $('#kn-input-field_411').hide();
    //hide Vin
	  $('#kn-input-field_73').hide();
    $('#kn-input-field_73').hide();
});

$(document).on("knack-scene-render.scene_508", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_575', //Autoline Tyre Stock For Dealer
          views:['1475']
      }
    ]
    sceneRefresh(refreshData);
  });

//Wip Management tigger for vehicle on site
$(document).on('knack-view-render.view_1512', function (event, view, data) {
    //This part is for column headers
    //Column header
    $('th[class="field_1108"]').attr('title','F = First Clocked Date L = Last Clocked Date');
    $('th[class="field_982"]').attr('data-tooltip','Medkit = CCDIAG Truck = CCRECOV');
    $('th[class="field_982"]').addClass('tooltip-bottom')
    $('th[class="field_1022"]').attr('title','Time Allowed For jobs NOT Completed');
	  $('th[class="field_1021"]').attr('title','Time Taken For Jobs NOT completed');
	  $('th[class="field_1111"]').attr('title','No of Days Since Checked In');

    if ($('div[class="kn-table kn-view view_1512"]')){
      $('td[class="field_441"]').hide()
      $('th[class="field_441"]').hide()
      $('td[class="field_443"]').hide()
      $('th[class="field_443"]').hide()

      let rows = $('div[class="kn-table kn-view view_1512"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
       /* const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/a61ljkqf5jw5d643274gixjtqdx5hgo8", {"recordId":cell, "Scenario":"vehicle customer look up" },"Aftersales- update individual LIVE WIPS 'touched today' and UPDATE Parts & Labour v4");
          };
        };*/
        const createClickHandler2 = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":cell,"Source": "View_1512 - Wip Management Trigger for vehicle onsite", "WIP":row.querySelector('td[data-field-key="field_441"]').innerText.trim(),"POS":row.querySelector('td[data-field-key="field_443"]').innerText.trim()});
          };
        };
        if (currentRow.id!==''){
        //  currentRow.children[4].onclick = createClickHandler(currentRow);
          currentRow.children[3].onclick = createClickHandler2(currentRow);
        }
      }
    }

    //move icons
    if ($('div[class="kn-table kn-view view_1512"]')){
      let rows = $('div[class="kn-table kn-view view_1512"] table>tbody>tr[id]');
      for (i = 0; i < rows.length; i++) {
        $('div[id="view_1512"] table>tbody>tr[id]').eq(i).find('span[class="col-9"]>a').appendTo($('div[id="view_1512"] table>tbody>tr[id]').eq(i).find('span[class="col-9"]').parent())
        $('div[id="view_1512"] table>tbody>tr[id]').eq(i).find('span[class="col-7"]>a').appendTo($('div[id="view_1512"] table>tbody>tr[id]').eq(i).find('span[class="col-7"]').parent())
      }
    }
  });


//Wip Management trigger from vehicle off site
$(document).on('knack-view-render.view_1506', function (event, view, data) {
    //This part is for column headers
    //Column header
    $('th[class="field_1108"]').attr('title','F = First Clocked Date L = Last Clocked Date');
    $('th[class="field_982"]').attr('data-tooltip','Medkit = CCDIAG Truck = CCRECOV');
    $('th[class="field_982"]').addClass('tooltip-bottom')
    $('th[class="field_1022"]').attr('title','Time Allowed For jobs NOT Completed');
	  $('th[class="field_1021"]').attr('title','Time Taken For Jobs NOT completed');
	  $('th[class="field_1111"]').attr('title','No of Days Since Checked In');
/*    if ($('div[class="kn-table kn-view view_1506"]')){
      let rows = $('div[class="kn-table kn-view view_1506"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/a61ljkqf5jw5d643274gixjtqdx5hgo8", {"recordId":cell, "Scenario":"vehicle customer look up" },"Aftersales- update individual LIVE WIPS 'touched today' and UPDATE Parts & Labour v4");
          };
        };
        if (currentRow.id!==''){
          currentRow.children[4].onclick = createClickHandler(currentRow);
        }
      }
    }*/

    //move icons
    if ($('div[class="kn-table kn-view view_1506"]')){
      let rows = $('div[class="kn-table kn-view view_1506"] table>tbody>tr[id]');
      for (i = 0; i < rows.length; i++) {
        $('div[id="view_1506"] table>tbody>tr[id]').eq(i).find('span[class="col-9"]>a').appendTo($('div[id="view_1506"] table>tbody>tr[id]').eq(i).find('span[class="col-9"]').parent())
        $('div[id="view_1506"] table>tbody>tr[id]').eq(i).find('span[class="col-7"]>a').appendTo($('div[id="view_1506"] table>tbody>tr[id]').eq(i).find('span[class="col-7"]').parent())
      }
    }
});

// Send Outbound Virtual Reception Text Message
$(document).on('knack-form-submit.view_1530', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/0b8ieu2989jnwrdjsvb8r77l499o4cyd", {"Record ID":data.id},"Send Outbound Text Message")
});

$(document).on('knack-form-submit.view_1120', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/0b8ieu2989jnwrdjsvb8r77l499o4cyd", {"Customer Incident Form Record ID":data.id, "Outbound Message":data.field_2682, "Origin": "View_1120 - Customer Incident Form"},"Send Outbound Message From Customer Incident Form")
});

// trigger to Send Data When Vehicle Is Checked Out From Customer Satisfaction check
$(document).on('knack-form-submit.view_307', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":data.field_2223, "WIP":data.field_719, "DemoTransactionNumber":data.field_2476, "POS":data.field_720, "Source": "View_307 - Satisfaction check(tablet)"},"Aftersales - customer satisfaction exit survey to trigger bot autoline check out")
});

// trigger to Send Data When Vehicle Is Checked Out From Customer Satisfaction check (sms)
$(document).on('knack-form-submit.view_318', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":data.field_1601, "DemoTransactionNumber":data.field_1332, "WIP":data.field_441, "POS":data.field_443, "Source": "View_318 - Satisfaction check (SMS)"},"Aftersales - customer satisfaction exit survey to trigger bot autoline check out")
});

//hover field for Digital Adoption QC elements
$(document).on('knack-view-render.view_888', function (event, view, data) {
    //This part is for tooltip of another field above field in list
    //This part of code hides field_330 from the list and then adds it as mouse over to field 380
    //It needs function "getFieldForRowID", also the field_330 NEEDS to be included in the list
    //start
    $('th[class="field_1566"]').hide();
    $('td[class*="field_1566"]').hide();
    $('th[class="field_2150"]').hide();
    $('td[class*="field_2150"]').hide(); 
    $('th[class="field_2154"]').hide();
    $('td[class*="field_2154"]').hide(); 	
	  
    $('div[id="view_888"] table>tbody>tr').each(function(){
      $(this).find('td[data-field-key="field_2050"]').attr('data-tooltip',getFieldForRowID('view_888','field_1566',$(this).attr('id')));
      $(this).find('td[data-field-key="field_2050"]').addClass('tooltip-top');
	    
      $(this).find('td[data-field-key="field_2149"]').attr('data-tooltip',getFieldForRowID('view_888','field_2150',$(this).attr('id')));
      $(this).find('td[data-field-key="field_2149"]').addClass('tooltip-left');
	    
      $(this).find('td[data-field-key="field_2155"]').attr('data-tooltip',getFieldForRowID('view_888','field_2154',$(this).attr('id')));
      $(this).find('td[data-field-key="field_2155"]').addClass('tooltip-top');	    
	    
    });
    //end

    //This part is for column headers
    //Column headers
    $('th[class="field_2050"]').attr('title','QC vs Predicted');
    $('th[class="field_2155"]').attr('title','QC Vs Invoiced Internal & Warranty Jobs')
    $('th[class="field_2149"]').attr('title','Failed Vs Total Completed')
}); 

//hover field for Digital Adoption QC (region) elements
$(document).on('knack-view-render.view_890', function (event, view, data) {
    //This part is for tooltip of another field above field in list
    //This part of code hides field_330 from the list and then adds it as mouse over to field 380
    //It needs function "getFieldForRowID", also the field_330 NEEDS to be included in the list
    //start
    $('th[class="field_1552"]').hide();
    $('td[class*="field_1552"]').hide();
    $('th[class="field_2145"]').hide();
    $('td[class*="field_2145"]').hide(); 
    $('th[class="field_2156"]').hide();
    $('td[class*="field_2156"]').hide(); 	
	  
    $('div[id="view_890"] table>tbody>tr').each(function(){
      $(this).find('td[data-field-key="field_2051"]').attr('data-tooltip',getFieldForRowID('view_890','field_1552',$(this).attr('id')));
      $(this).find('td[data-field-key="field_2051"]').addClass('tooltip-top');
	    
      $(this).find('td[data-field-key="field_2146"]').attr('data-tooltip',getFieldForRowID('view_890','field_2145',$(this).attr('id')));
      $(this).find('td[data-field-key="field_2146"]').addClass('tooltip-top');
	    
      $(this).find('td[data-field-key="field_2157"]').attr('data-tooltip',getFieldForRowID('view_890','field_2156',$(this).attr('id')));
      $(this).find('td[data-field-key="field_2157"]').addClass('tooltip-top');	    
	    
    });
    //end

    //This part is for column headers
    //Column headers
    $('th[class="field_2051"]').attr('title','QC vs Predicted');
    $('th[class="field_2157"]').attr('title','QC Vs Invoiced Internal & Warranty Jobs')
    $('th[class="field_2146"]').attr('title','Failed Vs Total Completed')
   // $('th[class="field_381"]').addClass('tooltip-bottom')
}); 

//hover field for Digital Adoption QC Dealer Element
  $(document).on('knack-view-render.view_924', function (event, view, data) {
    //This part is for tooltip of another field above field in list
    //This part of code hides field_330 from the list and then adds it as mouse over to field 380
    //It needs function "getFieldForRowID", also the field_330 NEEDS to be included in the list
    //start
    $('th[class="field_1580"]').hide();
    $('td[class*="field_1580"]').hide();
    $('th[class="field_2137"]').hide();
    $('td[class*="field_2137"]').hide(); 
    $('th[class="field_2162"]').hide();
    $('td[class*="field_2162"]').hide(); 	
	  
    $('div[id="view_924"] table>tbody>tr').each(function(){
      $(this).find('td[data-field-key="field_2141"]').attr('data-tooltip',getFieldForRowID('view_924','field_1580',$(this).attr('id')));
      $(this).find('td[data-field-key="field_2141"]').addClass('tooltip-top');
	    
      $(this).find('td[data-field-key="field_2138"]').attr('data-tooltip',getFieldForRowID('view_924','field_2137',$(this).attr('id')));
      $(this).find('td[data-field-key="field_2138"]').addClass('tooltip-top');
	    
      $(this).find('td[data-field-key="field_2163"]').attr('data-tooltip',getFieldForRowID('view_924','field_2162',$(this).attr('id')));
      $(this).find('td[data-field-key="field_2163"]').addClass('tooltip-top');	    
	    
    });
    //end

    //This part is for column headers
    //Column headers
    $('th[class="field_2141"]').attr('title','QC vs Predicted');
    $('th[class="field_2163"]').attr('title','QC Vs Invoiced Internal & Warranty Jobs')
    $('th[class="field_2138"]').attr('title','Failed Vs Total Completed')
   // $('th[class="field_381"]').addClass('tooltip-bottom')
  }); 

//hover field for Service On-site Workshop control view
$(document).on('knack-view-render.view_1880', function (event, view, data) {
    //This part is for tooltip of another field above field in list
    //This part of code hides field_330 from the list and then adds it as mouse over to field 380
    //It needs function "getFieldForRowID", also the field_330 NEEDS to be included in the list
    tooltipsTable('540','1880','field_318','field_763');
    tooltipsTable('540','1880','field_1537','field_899');
}); 

$(document).on('knack-view-render.view_1888', function (event, view, data) {
    tooltipsTable('540','1888','field_318','field_763');
    tooltipsTable('540','1888','field_1537','field_899');
	  $('th[class="field_318"]').hide();
    $('td[class*="field_318"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
}); 

$(document).on('knack-view-render.view_1559', function (event, view, data) {
  tooltipsTable('540','1559','field_318','field_899');
  tooltipsTable('540','1559','field_1537','field_1022');
  tooltipsTable('540','1559','field_1532','field_915');
	$('th[class="field_318"]').hide();
  $('td[class*="field_318"]').hide();
  $('th[class="field_1532"]').hide();
  $('td[class*="field_1532"]').hide(); 
}); 

$(document).on('knack-view-render.view_1558', function (event, view, data) {
  tooltipsTable('540','1558','field_318','field_763');
  tooltipsTable('540','1558','field_1537','field_899');
  tooltipsTable('540','1558','field_1532','field_1021');
	$('th[class="field_318"]').hide();
  $('td[class*="field_318"]').hide();
  $('th[class="field_1532"]').hide();
  $('td[class*="field_1532"]').hide(); 
}); 

$(document).on('knack-view-render.view_1902', function (event, view, data) {
  tooltipsTable('540','1902','field_318','field_899');
  tooltipsTable('540','1902','field_1537','field_915');
	$('th[class="field_318"]').hide();
  $('td[class*="field_318"]').hide();
  $('th[class="field_1537"]').hide();
  $('td[class*="field_1537"]').hide(); 
}); 

$(document).on('knack-view-render.view_1560', function (event, view, data) {
    tooltipsTable('540','1560','field_318','field_899');
    tooltipsTable('540','1560','field_1537','field_915');
	  $('th[class="field_318"]').hide();
    $('td[class*="field_318"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
}); 

$(document).on('knack-view-render.view_1898', function (event, view, data) {
    tooltipsTable('540','1898','field_318','field_763');
    tooltipsTable('540','1898','field_1537','field_1658');
	  $('th[class="field_318"]').hide();
    $('td[class*="field_318"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
    $('th[class="field_2210"]').hide();
    $('td[class*="field_2210"]').hide(); 
}); 

//new clocked in workshop control v2 today table
$(document).on('knack-view-render.view_1904', function (event, view, data) {
    tooltipsTable('642','1904','field_1537','field_2212');
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
}); 

//new clocked in before today not clocked workshop control v2
$(document).on('knack-view-render.view_1905', function (event, view, data) {
    tooltipsTable('642','1905','field_1537','field_2212');
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
}); 

//New Currently clocked table workshop control v2
$(document).on('knack-view-render.view_1906', function (event, view, data) {
  tooltipsTable('642','1906','field_1537','field_2212');
  tooltipsTable('642','1906','field_1532','field_2213');
  tooltipsTable('642','1906','field_915','field_987');
	$('th[class="field_318"]').hide();
  $('td[class*="field_318"]').hide();
  $('th[class="field_1532"]').hide();
  $('td[class*="field_1532"]').hide(); 
	$('th[class="field_915"]').hide();
  $('td[class*="field_915"]').hide(); 
}); 

//new Onsite Parts Ave, Await Labour workshop control v2
$(document).on('knack-view-render.view_1907', function (event, view, data) {
  tooltipsTable('642','1907','field_1537','field_2212');
  tooltipsTable('642','1907','field_915','field_987');
  tooltipsTable('642','1907','field_1532','field_2213');
	$('th[class="field_318"]').hide();
  $('td[class*="field_318"]').hide();
  $('th[class="field_1532"]').hide();
  $('td[class*="field_1532"]').hide(); 
	$('td[class*="field_441"]').hide();
  $('th[class="field_441"]').hide();
  $('td[class*="field_443"]').hide();
  $('th[class="field_443"]').hide();
  $('th[class="field_915"]').hide();
  $('td[class*="field_915"]').hide(); 
}); 

//New awaiting authority workshop control v2
$(document).on('knack-view-render.view_1908', function (event, view, data) {
    tooltipsTable('642','1908','field_1537','field_2212');
    tooltipsTable('642','1908','field_915','field_987');
    tooltipsTable('642','1908','field_1532','field_2213');
	  $('th[class="field_318"]').hide();
    $('td[class*="field_318"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
	  $('th[class="field_915"]').hide();
    $('td[class*="field_915"]').hide(); 
}); 

//NEW On-site parts Not ave workshop control v2
$(document).on('knack-view-render.view_1909', function (event, view, data) {
    tooltipsTable('642','1909','field_1537','field_2212');
    tooltipsTable('642','1909','field_1532','field_2213');
	  tooltipsTable('642','1909','field_915','field_987');
	  $('th[class="field_318"]').hide();
    $('td[class*="field_318"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
	  $('th[class="field_915"]').hide();
    $('td[class*="field_915"]').hide(); 
		$('td[class*="field_441"]').hide();
    $('th[class="field_441"]').hide();
    $('td[class*="field_443"]').hide();
    $('th[class="field_443"]').hide();
}); 

//workshop control v3 Checked in today not clocked table
$(document).on('knack-view-render.view_1925', function (event, view, data) {
    tooltipsTable('650','1925','field_1537','field_2212');
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
}); 

//workshop control v3 Checked in before today not clocked table
$(document).on('knack-view-render.view_1929', function (event, view, data) {
    tooltipsTable('652','1929','field_1537','field_2212');
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
}); 

//workshop control v2 Currently clocked table 
$(document).on('knack-view-render.view_1930', function (event, view, data) {
    tooltipsTable('653','1930','field_1537','field_2212');
    tooltipsTable('653','1930','field_1532','field_2213');
    tooltipsTable('653','1930','field_915','field_987');
	  $('th[class="field_318"]').hide();
    $('td[class*="field_318"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
	  $('th[class="field_915"]').hide();
    $('td[class*="field_915"]').hide(); 
}); 

//workshop control v3 Onsite Parts Ave, Await Labour 
$(document).on('knack-view-render.view_2189', function (event, view, data) {
  tooltipsTable('654','2189','field_1537','field_2212');
  tooltipsTable('654','2189','field_915','field_987');
  tooltipsTable('654','2189','field_1532','field_2213');
	$('th[class="field_318"]').hide();
  $('td[class*="field_318"]').hide();
  $('th[class="field_1532"]').hide();
  $('td[class*="field_1532"]').hide(); 
	$('td[class*="field_441"]').hide();
  $('th[class="field_441"]').hide();
  $('td[class*="field_443"]').hide();
  $('th[class="field_443"]').hide();
  $('th[class="field_915"]').hide();
  $('td[class*="field_915"]').hide(); 
}); 

//Check out from Workshop controller v3 view "Onsite Parts Ave, Await Labour"
$(document).on('knack-view-render.view_2189', function (event, view, data) {
  if ($('div[class="kn-table kn-view view_2189"]')){
      $('td[class*="field_441"]').hide()
      $('th[class="field_441"]').hide()
      $('td[class*="field_443"]').hide()
      $('th[class="field_443"]').hide()

      let rows = $('div[class="kn-table kn-view view_2189"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":cell, "Source": "View_2189 - triggered from workshop controller v2 view (onsite parts ave, awaiting labour)", "WIP":row.querySelector('td[data-field-key="field_441"]').innerText.trim(),"POS":row.querySelector('td[data-field-key="field_443"]').innerText.trim()});
          };
        };
        if (currentRow.id!==''){
          currentRow.children[0].onclick = createClickHandler(currentRow);
        }
      }
  }
});

//On-site parts Not ave workshop control v3
  $(document).on('knack-view-render.view_2191', function (event, view, data) {
    tooltipsTable('715','2191','field_1537','field_2212');
    tooltipsTable('715','2191','field_1532','field_2213');
	  tooltipsTable('715','2191','field_915','field_987');
	  $('th[class="field_318"]').hide();
    $('td[class*="field_318"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
	  $('th[class="field_915"]').hide();
    $('td[class*="field_915"]').hide(); 
		$('td[class*="field_441"]').hide();
    $('th[class="field_441"]').hide();
    $('td[class*="field_443"]').hide();
    $('th[class="field_443"]').hide();
}); 

//Check out from Workshop controller v3 view Onsite Parts Not Ave
$(document).on('knack-view-render.view_2191', function (event, view, data) {
    if ($('div[class="kn-table kn-view view_2191"]')){
      $('td[class*="field_441"]').hide()
      $('th[class="field_441"]').hide()
      $('td[class*="field_443"]').hide()
      $('th[class="field_443"]').hide()

      let rows = $('div[class="kn-table kn-view view_2191"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":cell, "Source": "View_2191 - triggered from workshop controller view v3 (onsite parts not ave)", "WIP":row.querySelector('td[data-field-key="field_441"]').innerText.trim(),"POS":row.querySelector('td[data-field-key="field_443"]').innerText.trim()});
          };
        };
        if (currentRow.id!==''){
          currentRow.children[0].onclick = createClickHandler(currentRow);
        }
      }
    }
});

//New awaiting authority workshop control v3
$(document).on('knack-view-render.view_2193', function (event, view, data) {
    tooltipsTable('716','2193','field_1537','field_2212');
    tooltipsTable('716','2193','field_915','field_987');
    tooltipsTable('716','2193','field_1532','field_2213');
	  $('th[class="field_318"]').hide();
    $('td[class*="field_318"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
	  $('th[class="field_915"]').hide();
    $('td[class*="field_915"]').hide(); 
}); 

function getTextFromHTML(s) {
    if (!s) return '';
    let span = document.createElement('span');
    s = s.replace(new RegExp('<br />','g'),'\n').replace(new RegExp('</td>','g'),'</td>\t').replace(new RegExp('</tr>','g'),'</tr>\n').replace(new RegExp('  +','g'),' ');
    span.innerHTML = s;
    return span.textContent || span.innerText;
};

let shownTooltipIdT = null;
function tooltipsTable(sceneId, viewId, tooltipFieldId, showTooltipFieldId, tooltipTitle = '', placeToShow='right'){
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
          $('div[id="tooltipDiv_'+viewId+'_'+tooltipFieldId+'"]').html(tooltipTitle + modifyTooltipHTML(tdUnderMouse.parentElement.querySelector('td[data-field-key="'+tooltipFieldId+'"]').innerHTML));
          $('div[id="tooltipDiv_'+viewId+'_'+tooltipFieldId+'"]').show();
          $('div[id="tooltipDiv_'+viewId+'_'+tooltipFieldId+'"]').offset({ left: e.pageX-(placeToShow==='left'?200:30), top: e.pageY+10 });
        } else {
          $('div[id="tooltipDiv_'+viewId+'_'+tooltipFieldId+'"]').hide();
        }
    });
  }

function modifyTooltipHTML(html){
  return html.replace(new RegExp('class="','g'),'data-class="');
}

//trigger Create Service Wash From Manager's Note
$(document).on('knack-form-submit.view_1899', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/4w3cn2lcxhem6tp9l7dfbtc9r1sc8h6g", {"RecordID from Jobcard":data.id, "Service Comments":data.field_982, "userName": Knack.getUserAttributes().name,"Manual Request":"Yes"},"Aftersales - trigger service wash from Manager's Note");
});

// --- manual delete service wash from Workshop controller view
$(document).on('knack-view-render.view_1898', function(event, view) {
  //get the vin value from the table
  const valRecID = $(".col-7").text().trim()
  //send a http request with the vin an record id
  // trigger a webhook from a action link - Aftersales - update live individual wip from Reg & Status Lookup for Vehicles Onsite
    if ($('div[class="kn-table kn-view view_1898"]')){
      let rows = $('div[class="kn-table kn-view view_1898"] table tr');
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/5ub561ycpj21n6eelqa4rwmfb1r0d9r5", {"recordId":cell, "ValetRecordID": valRecID, "Scenario":"Manually Delete Service Wash" },"Manually delete Service Wash");
          };
        };
        currentRow.children[0].onclick = createClickHandler(currentRow);
      }
    }
});

//Check out from Workshop controller view "Onsite Parts Ave, Await Labour"
$(document).on('knack-view-render.view_1558', function (event, view, data) {
    if ($('div[class="kn-table kn-view view_1558"]')){
      $('td[class*="field_441"]').hide()
      $('th[class="field_441"]').hide()
      $('td[class*="field_443"]').hide()
      $('th[class="field_443"]').hide()
      let rows = $('div[class="kn-table kn-view view_1558"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":cell, "Source": "View_1558 - triggered from workshop controller view (onsite parts ave, awaiting labour)", "WIP":row.querySelector('td[data-field-key="field_441"]').innerText.trim(),"POS":row.querySelector('td[data-field-key="field_443"]').innerText.trim()});
          };
        };
        if (currentRow.id!==''){
          currentRow.children[0].onclick = createClickHandler(currentRow);
        }
      }
    }
});

//Check out from Workshop controller view Onsite Parts Not Ave
$(document).on('knack-view-render.view_1560', function (event, view, data) {
    if ($('div[class="kn-table kn-view view_1560"]')){
      $('td[class*="field_441"]').hide()
      $('th[class="field_441"]').hide()
      $('td[class*="field_443"]').hide()
      $('th[class="field_443"]').hide()
      let rows = $('div[class="kn-table kn-view view_1560"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":cell, "Source": "View_1560 - triggered from workshop controller view (onsite parts not ave)", "WIP":row.querySelector('td[data-field-key="field_441"]').innerText.trim(),"POS":row.querySelector('td[data-field-key="field_443"]').innerText.trim()});
          };
        };
        if (currentRow.id!==''){
          currentRow.children[0].onclick = createClickHandler(currentRow);
        }
      }
    }
});

//Check out from Workshop controller v2 view "Onsite Parts Ave, Await Labour"
$(document).on('knack-view-render.view_1907', function (event, view, data) {
    if ($('div[class="kn-table kn-view view_1907"]')){
      $('td[class*="field_441"]').hide()
      $('th[class="field_441"]').hide()
      $('td[class*="field_443"]').hide()
      $('th[class="field_443"]').hide()

      let rows = $('div[class="kn-table kn-view view_1907"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":cell, "Source": "View_1907 - triggered from workshop controller v2 view (onsite parts ave, awaiting labour)", "WIP":row.querySelector('td[data-field-key="field_441"]').innerText.trim(),"POS":row.querySelector('td[data-field-key="field_443"]').innerText.trim()});
          };
        };
        if (currentRow.id!==''){
          currentRow.children[0].onclick = createClickHandler(currentRow);
        }
      }
    }
});

//Check out from Workshop controller v2 view Onsite Parts Not Ave
$(document).on('knack-view-render.view_1909', function (event, view, data) {
    if ($('div[class="kn-table kn-view view_1909"]')){
      $('td[class*="field_441"]').hide()
      $('th[class="field_441"]').hide()
      $('td[class*="field_443"]').hide()
      $('th[class="field_443"]').hide()
      let rows = $('div[class="kn-table kn-view view_1909"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":cell, "Source": "View_1909 - triggered from workshop controller view v2 (onsite parts not ave)", "WIP":row.querySelector('td[data-field-key="field_441"]').innerText.trim(),"POS":row.querySelector('td[data-field-key="field_443"]').innerText.trim()});
          };
        };
        if (currentRow.id!==''){
          currentRow.children[0].onclick = createClickHandler(currentRow);
        }
      }
    }
});

//refresh scene for currently clocked on Workshop controller v2
$(document).on('knack-view-render.view_1906', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 300000);
  Knack.showSpinner();
});

//trigger Create Manual Service Wash from Valeter's "add service wash"
$(document).on('knack-view-render.view_1916', function(event, view) {
  //get the vin value from the table
 const UID = $(".col-4").text().trim()
 // console.log('Webhook applied5');
 // trigger a webhook from a action link - Aftersales - update live individual wip from Reg & Status Lookup for Vehicles Onsite
    if ($('div[class="kn-view kn-table view_1916"]')){
      let rows = $('div[class="kn-view kn-table view_1916"] table tr');
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/4w3cn2lcxhem6tp9l7dfbtc9r1sc8h6g", {"RecordID from Jobcard": cell, "Manual Request":"Yes" },"Trigger manual Service wash");
          };
        };
        currentRow.children[3].onclick = createClickHandler(currentRow);
      }
    }
});

//Workshop Controller all in one table (onsite jobs)
$(document).on('knack-view-render.view_2246', function (event, view, data) {
  let defineButtons = [{linkText:'All',filters:[]},{linkText:'TODAY\'s Jobs',filters:[{"field_name":"CA Today's Jobs that Still Has Labour And/OR Parts still To Complete","field":"field_2279","value":true,"operator":"is"}]},{linkText:'Comp. TODAY',filters:[{"field_name":"Date/Time Workshop marked as job completed for today","field":"field_2719","value":true,"operator":"is not blank"}]},{linkText:'Time Agreed TODAY',filters:[{"field_name":"Agreed Collection Time with Customer","field":"field_1117","value":true,"operator":"is today"}]},{linkText:'Checked In TODAY',filters:[{"field_name":"Date Vehicle Checked In Onsite (From Autoline)","field":"field_763","value":true,"operator":"is today"}]},{linkText:'Write up TODAY',filters:[{"field_name":"Date/Time Technician Write up completed","field":"field_2722","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is today"}]},{linkText:'Ready to Invoice',filters:[{"field_name":"ready to invoice","field":"field_1717","value":"Parts + Labour","operator":"contains"}]},{linkText:'Clocked On Now',filters:[{"field":"field_1537","value":"Working on Currently","operator":"contains"}]},{linkText:'Never Clocked',filters:[{"field":"field_787","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is blank"}]},{linkText:'Parts Avail',filters:[{"field":"field_985","value":"Working On Currently","operator":"is blank"}]},{linkText:'Parts Unavail',filters:[{"field":"field_985","value":"Working On Currently","operator":"is not blank"}]},{linkText:'Wait. Auth (VHC)',filters:[{"field":"field_2297","value":"CPL","operator":"is"}]},{linkText:'No CA\'s Linked',filters:[{"field":"field_1121","value":"","operator":"is blank"}]},{linkText:'Outstanding Messages',filters:[{"field":"field_2578","value":"","operator":"is not blank"}]},{linkText:'i0001',filters:[{"field":"field_756","value":"i0001","operator":"is"}]},{linkText:'i0002',filters:[{"field":"field_756","value":"i0002","operator":"is"}]},{linkText:'Await\' Wash',filters:[{"field":"field_2201","value":"Added to Service Wash List","operator":"is"}]},{linkText:'Wash Comp',filters:[{"field":"field_2201","value":"Service Wash Complete","operator":"is"}]}]
  renderSYSearchButtons('2246',defineButtons);

  let addFilters = document.querySelector('a[class="kn-add-filter kn-button is-small"]');
  console.log('addFilters',addFilters)
  if (addFilters){
    let addedAlowedFilters = ['field_1121']
    addFilters.onclick = function(){
      setTimeout(function () { 
        console.log('remove from filter')
        for (let i = 0;i<$('div[id="kn-filters-form"] select[name="field"] option').length;i++){
          console.log(i);
          let filterField = $('div[id="kn-filters-form"] select[name="field"] option').eq(i).attr('value');
          let allowFilterField = addedAlowedFilters.find(el => el===filterField);// || defineButtons.find(el => el.filters.find(el2 => el2.field === filterField));
          if (!allowFilterField){
            $('div[id="kn-filters-form"] select[name="field"] option').eq(i).hide();
          }
        }
      }, 200);
    }
  }

  tooltipsTable('761','2246','field_1532','field_2586');
	tooltipsTable('761','2246','field_1537','field_2213');
	tooltipsTable('761','2246','field_2298','field_2272');
	$('th[class="field_2240"]').hide();
  $('td[class*="field_2240"]').hide();
  $('th[class="field_1537"]').hide();
  $('td[class*="field_1537"]').hide(); 
	$('th[class="field_1532"]').hide();
  $('td[class*="field_1532"]').hide(); 
}); 

//completed by not invoiced jobs - all jobs view
$(document).on('knack-view-render.view_3168', function (event, view, data) {
  let defineButtons = [{linkText:'All',filters:[]},{linkText:'TODAY\'s Jobs',filters:[{"field_name":"CA Today's Jobs that Still Has Labour And/OR Parts still To Complete","field":"field_2279","value":true,"operator":"is"}]},{linkText:'Checked In TODAY',filters:[{"field_name":"Date Vehicle Checked In Onsite (From Autoline)","field":"field_763","value":true,"operator":"is today"}]},{linkText:'Write up TODAY',filters:[{"field_name":"Date/Time Technician Write up completed","field":"field_2722","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is today"}]},{linkText:'Carry Over\'s',filters:[{"field_name":"Date Vehicle Checked In Onsite (From Autoline)","field":"field_763","value":"","operator":"is before today"}]},{linkText:'Currently Clocked',filters:[{"field":"field_1537","value":"Working on Currently","operator":"contains"}]},{linkText:'Never Clocked',filters:[{"field":"field_787","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is blank"}]},{linkText:'Parts Avail',filters:[{"field":"field_985","value":"Working On Currently","operator":"is blank"}]},{linkText:'Parts Unavail',filters:[{"field":"field_985","value":"Working On Currently","operator":"is not blank"}]},{linkText:'Wait. Auth (VHC)',filters:[{"field":"field_2297","value":"CPL","operator":"is"}]},{linkText:'No CA\'s Linked',filters:[{"field":"field_1121","value":"","operator":"is blank"}]},{linkText:'Outstanding Messages',filters:[{"field":"field_2578","value":"","operator":"is not blank"}]},{linkText:'i0001',filters:[{"field":"field_756","value":"i0001","operator":"is"}]},{linkText:'i0002',filters:[{"field":"field_756","value":"i0002","operator":"is"}]}]
  renderSYSearchButtons('3168',defineButtons);

  let addFilters = document.querySelector('a[class="kn-add-filter kn-button is-small"]');
  console.log('addFilters',addFilters)
  if (addFilters){
    let addedAlowedFilters = ['field_1121']
    addFilters.onclick = function(){
      setTimeout(function () { 
        console.log('remove from filter')
        for (let i = 0;i<$('div[id="kn-filters-form"] select[name="field"] option').length;i++){
          console.log(i);
          let filterField = $('div[id="kn-filters-form"] select[name="field"] option').eq(i).attr('value');
          let allowFilterField = addedAlowedFilters.find(el => el===filterField);// || defineButtons.find(el => el.filters.find(el2 => el2.field === filterField));
          if (!allowFilterField){
            $('div[id="kn-filters-form"] select[name="field"] option').eq(i).hide();
          }
        }
      }, 200);
    }
  }


  tooltipsTable('1017','3168','field_1532','field_2586');
	tooltipsTable('1017','3168','field_1537','field_2213');
	tooltipsTable('1017','3168','field_2298','field_2272');
	  $('th[class="field_2240"]').hide();
    $('td[class*="field_2240"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
	  $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
}); 

$(document).on('knack-scene-render.scene_1017', function(event, scene) {
  recursiveSceneRefresh('1017',['view_3168'],300000);
});

//trigger Create Service Wash From Job card v2
$(document).on('knack-form-submit.view_2362', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/4w3cn2lcxhem6tp9l7dfbtc9r1sc8h6g", {"RecordID from Jobcard":data.id, "Service Comments":data.field_982, "UID":data.field_2190, "userName": Knack.getUserAttributes().name},"Aftersales - Create service wash from Job card v2");
});

//trigger aftersales - wip management notes to update + is vehicle on site
$(document).on('knack-form-submit.view_2361', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/a1ixxw9k9su6uv7ikvlwslklhg2mmkcw", {"Record ID":data.id, "Manager's Notes":data.field_1015_raw, "userName": Knack.getUserAttributes().name, "NOM_WIP_REG":data.field_978_raw, "Nom_wip":data.field_558_raw},"trigger aftersales - wip management notes to update + is vehicle on site");
});

//Wip reporting "on-site" page hover for operator details 
$(document).on('knack-view-render.view_1512', function (event, view, data) {
  tooltipsTable('509','1512','field_2240','field_2220');
	$('th[class="field_2240"]').hide();
  $('td[class*="field_2240"]').hide();
}); 

//Wip reporting "off-site" page hover for operator details 
$(document).on('knack-view-render.view_1506', function (event, view, data) {
  tooltipsTable('510','1506','field_2240','field_2220');
	$('th[class="field_2240"]').hide();
  $('td[class*="field_2240"]').hide();
}); 

//Wip reporting "All jobs" hover for operator
$(document).on('knack-view-render.view_596', function (event, view, data) {
  tooltipsTable('152','596','field_2240','field_2220');
	$('th[class="field_2240"]').hide();
  $('td[class*="field_2240"]').hide();
}); 

//******* Live Character Count on Aftersales Vehicle Check In for WIP Notes Tab JOB CARD V2 *******
$(document).on("knack-view-render.view_2351", function(event, view, data) {
  $( document ).ready(function() {
    $(".kn-form.kn-view.view_2351 form #field_1766")
    .after( "<p class='typed-chars'>0 out of 120 Characters</p>" );
    $(".kn-form.kn-view.view_2351 form #field_1766").on('input',function(e){
      var $input = $(this);
      $input.siblings('.typed-chars').text($input.val().length + " out of 120 Characters");
    });
  });
});

//******* Live Character Count on Aftersales Vehicle Check In for add a line of Investigation to the WIP *******
$(document).on("knack-view-render.view_2351", function(event, view, data) {
  $( document ).ready(function() {
    $(".kn-form.kn-view.view_2351 form #field_2338")
    .after( "<p class='typed-chars1'>0 out of 400 Characters</p>" );
    $(".kn-form.kn-view.view_2351 form #field_2338").on('input',function(e){
      var $input = $(this);
      $input.siblings('.typed-chars1').text($input.val().length + " out of 400 Characters");
    });
  });
});

//**Trigger Text To Customer To Complete Exit Survey At job card v2
$(document).on('knack-form-submit.view_2365', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/jblvluz2ckc63ecbqsfy7n8g55rvxsik", {"Record ID":data.id},"Trigger Text To Customer To Complete Exit Survey At Workshop \"Check Out\"");
});

// trigger to Send Data When Vehicle Is Checked Out From Customer Satisfaction check (sms) jobcard v2
$(document).on('knack-form-submit.view_2365', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":data.field_1601, "WIP":data.field_441, "DemoTransactionNumber":data.field_1332, "POS":data.field_443, "Date Courtesy Car Agreement Completed":data.field_2482, "Source": "View_2365 - Satisfaction check (SMS)"},"Aftersales - customer satisfaction exit survey to trigger bot autoline check out")
});

//check out job card v2 no survey
$(document).on('knack-form-submit.view_2367', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":data.field_1601,"DemoTransactionNumber":data.field_1332, "WIP":data.field_441, "POS":data.field_443, "Date Courtesy Car Agreement Completed":data.field_2482, "Source": "View_2367 - Satisfaction check job card v2 no survey"},"Aftersales - customer satisfaction exit survey to trigger bot autoline check out")
});

//Job card v2 Check out via tablet hide wip, pos
$(document).on('knack-view-render.view_2364', function (event, view, data) {
	  $('th[class="field_720"]').hide();
    $('td[class*="field_720"]').hide();
	  $('th[class="field_719"]').hide();
    $('td[class*="field_719"]').hide();
	  $('th[class="field_2547"]').hide();
    $('td[class*="field_2547"]').hide();
    $('th[class="field_1601"]').hide();
    $('td[class*="field_1601"]').hide();
	  $("#kn-input-field_2547").hide();
}); 

//Job card v2 Check out no survey hide wip, pos
$(document).on('knack-view-render.view_2367', function (event, view, data) {
	$('th[class="field_441"]').hide();
  $('td[class*="field_441"]').hide();
	$('th[class="field_1332"]').hide();
  $('td[class*="field_1332"]').hide();
	$("#kn-input-field_443").hide();
	$("#kn-input-field_2482").hide();
	$("#kn-input-field_1601").hide();
}); 

//Job card v2 Check out via sms
$(document).on('knack-view-render.view_2365', function (event, view, data) {
	$("#kn-input-field_1332").hide();
	$("#kn-input-field_769").hide();
}); 

//Job card v2 Check out MARK TO FOLLOW UP, pos
$(document).on('knack-view-render.view_2881', function (event, view, data) {
	$("#kn-input-field_720").hide();
	$("#kn-input-field_719").hide();
	$("#kn-input-field_2547").hide();
}); 

// ------------ Refresh ONSITE jobs in ONE Table (workshop/CA view)-----------------------//
$(document).on('knack-scene-render.scene_761', function(event, scene) {
  recursiveSceneRefresh('761',['view_2246'],120000);
});

//Workshop Controller all Jobs in one table (OFF-site Jobs)
$(document).on('knack-view-render.view_2478', function (event, view, data) {
  tooltipsTable('755','2478','field_1532','field_2586');
	tooltipsTable('755','2478','field_1537','field_2213');
	tooltipsTable('755','2478','field_2298','field_2272');
	$('th[class="field_2240"]').hide();
  $('td[class*="field_2240"]').hide();
  $('th[class="field_1537"]').hide();
  $('td[class*="field_1537"]').hide(); 
	$('th[class="field_1532"]').hide();
  $('td[class*="field_1532"]').hide(); 
}); 

// ------------ Refresh Off-site jobs in ONE Table (workshop/CA view)-----------------------//
$(document).on('knack-scene-render.scene_755', function(event, scene) {
  recursiveSceneRefresh('755',['view_2478','view_2722'],30000);
});

$(document).on('knack-view-render.view_3008', function (event, view, data) {
  embedPhotoApp();
  $('div[id="view_3008"] img').on("click",function(){
    showPhotoApp(this);
  });
}); 

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

function emptyCallback() { }

var photoAppHTML = '';
function embedPhotoApp(){
  var nowS = Date.now().toString();
  let photoApp = document.getElementById('photoApp');
  if (!photoApp){
    if (photoAppHTML===''){
      photoAppHTML = $.ajax({
          type: "GET",
          url: 'https://stellantisandyoucouk.github.io/photoTakeApp/takePhotoPart.html?'+nowS,
          cache: false,
          async: false
      }).responseText;
    }
    photoApp = document.createElement('div');
    photoApp.innerHTML = photoAppHTML;
    photoApp.id = 'photoApp';
    photoApp.style="display: none;"
    document.body.appendChild(photoApp);
  } else {
    photoApp.innerHTML = photoAppHTML;
  }

  if ($('#photoAppCss').length===0){
    var style = document.createElement('link');
    style.id = "photoAppCss";
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = 'https://stellantisandyoucouk.github.io/knackjs/takePhotoApp.css?'+nowS;
    document.getElementsByTagName( 'head' )[0].appendChild( style )
  }

  if ($('#photoAppJS').length===0){
    loadScript("https://stellantisandyoucouk.github.io/knackjs/takePhotoApp.js?"+nowS,'photoAppJS', emptyCallback);
  }

  preload(["https://stellantisandyoucouk.github.io/imagesStore/camera-4-48.png","https://stellantisandyoucouk.github.io/imagesStore/icons8-exit-26%20(1).png"])
}

var images = [];
function preload(input) {
  for (var i = 0; i < input.length; i++) {
      images[i] = new Image();
      images[i].src = input[i];
  }
}

function showPhotoApp(appSettings){
  console.log('showPhotoApp',appSettings)
  takePhotoAppStart('aftersales',appSettings);
}

// all in one table (all jobs)
$(document).on('knack-view-render.view_2686', function (event, view, data) {
 	tooltipsTable('753','2686','field_1537','field_2213');
	tooltipsTable('753','2686','field_2298','field_2272');
	tooltipsTable('753','2686','field_1532','field_2586');
	$('th[class="field_2240"]').hide();
  $('td[class*="field_2240"]').hide();
  $('th[class="field_1537"]').hide();
  $('td[class*="field_1537"]').hide(); 
	$('th[class="field_1532"]').hide();
  $('td[class*="field_1532"]').hide(); 
	$('th[class="field_978"]').hide();
  $('td[class*="field_978"]').hide();
});

$(document).on('knack-scene-render.scene_753', function(event, scene) {
  recursiveSceneRefresh('753',['view_2686'],120000);
});

//Workshop Controller all in one table (Off-site jobs)
$(document).on('knack-view-render.view_2722', function (event, view, data) {
  let defineButtons = [{linkText:'All',filters:[]},{linkText:'TODAY\'s Jobs',filters:[{"field_name":"CA Today's Jobs that Still Has Labour And/OR Parts still To Complete","field":"field_2279","value":true,"operator":"is"}]},{linkText:'Checked In TODAY',filters:[{"field_name":"Date Vehicle Checked In Onsite (From Autoline)","field":"field_763","value":true,"operator":"is today"}]},{linkText:'Write up TODAY',filters:[{"field_name":"Date/Time Technician Write up completed","field":"field_2722","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is today"}]},{linkText:'Ready to Invoice',filters:[{"field_name":"ready to invoice","field":"field_1717","value":"Parts + Labour","operator":"contains"}]},{linkText:'Currently Clocked',filters:[{"field":"field_1537","value":"Working on Currently","operator":"contains"}]},{linkText:'Never Clocked',filters:[{"field":"field_787","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is blank"}]},{linkText:'Parts Avail',filters:[{"field":"field_985","value":"Working On Currently","operator":"is blank"}]},{linkText:'Parts Unavail',filters:[{"field":"field_985","value":"Working On Currently","operator":"is not blank"}]},{linkText:'Wait. Auth (VHC)',filters:[{"field":"field_2297","value":"CPL","operator":"is"}]},{linkText:'No CA\'s Linked',filters:[{"field":"field_1121","value":"","operator":"is blank"}]},{linkText:'Outstanding Messages',filters:[{"field":"field_2578","value":"","operator":"is not blank"}]},{linkText:'i0001',filters:[{"field":"field_756","value":"i0001","operator":"is"}]},{linkText:'i0002',filters:[{"field":"field_756","value":"i0002","operator":"is"}]},{linkText:'C/D Collected',filters:[{"field":"field_2785","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is not blank"}]}]
  renderSYSearchButtons('2722',defineButtons);

  let addFilters = document.querySelector('a[class="kn-add-filter kn-button is-small"]');
  console.log('addFilters',addFilters)
  if (addFilters){
    let addedAlowedFilters = ['field_1121']
    addFilters.onclick = function(){
      setTimeout(function () { 
        console.log('remove from filter')
        for (let i = 0;i<$('div[id="kn-filters-form"] select[name="field"] option').length;i++){
          console.log(i);
          let filterField = $('div[id="kn-filters-form"] select[name="field"] option').eq(i).attr('value');
          let allowFilterField = addedAlowedFilters.find(el => el===filterField);// || defineButtons.find(el => el.filters.find(el2 => el2.field === filterField));
          if (!allowFilterField){
            $('div[id="kn-filters-form"] select[name="field"] option').eq(i).hide();
          }
        }
      }, 200);
    }
  }

  tooltipsTable('755','2722','field_1532','field_2586');
	tooltipsTable('755','2722','field_1537','field_2213');
	tooltipsTable('755','2722','field_2298','field_2272');
	  $('th[class="field_2240"]').hide();
    $('td[class*="field_2240"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
	  $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
}); 

//Workshop Controller all in one table (MY jobs)
$(document).on('knack-view-render.view_2892', function (event, view, data) {
  let defineButtons = [{linkText:'All',filters:[]},{linkText:'TODAY\'s Jobs',filters:[{"field_name":"CA Today's Jobs that Still Has Labour And/OR Parts still To Complete","field":"field_2279","value":true,"operator":"is"}]},{linkText:'Comp. TODAY',filters:[{"field_name":"Date/Time Workshop marked as job completed for today","field":"field_2719","value":true,"operator":"is not blank"}]},{linkText:'Time Agreed TODAY',filters:[{"field_name":"Agreed Collection Time with Customer","field":"field_1117","value":true,"operator":"is today"}]},{linkText:'Checked In TODAY',filters:[{"field_name":"Date Vehicle Checked In Onsite (From Autoline)","field":"field_763","value":true,"operator":"is today"}]},{linkText:'Write up TODAY',filters:[{"field_name":"Date/Time Technician Write up completed","field":"field_2722","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is today"}]},{linkText:'Ready to Invoice',filters:[{"field_name":"ready to invoice","field":"field_1717","value":"Parts + Labour","operator":"contains"}]},{linkText:'NOT Checked Out',filters:[{"field":"field_1658","value":"","operator":"is blank"}]},{linkText:'Currently Clocked',filters:[{"field":"field_1537","value":"Working on Currently","operator":"contains"}]},{linkText:'Never Clocked',filters:[{"field":"field_787","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is blank"}]},{linkText:'Parts Avail',filters:[{"field":"field_985","value":"Working On Currently","operator":"is blank"}]},{linkText:'Parts Unavail',filters:[{"field":"field_985","value":"Working On Currently","operator":"is not blank"}]},{linkText:'Wait. Auth (VHC)',filters:[{"field":"field_2297","value":"CPL","operator":"is"}]},{linkText:'Outstanding Messages',filters:[{"field":"field_2578","value":"","operator":"is not blank"}]},{linkText:'i0001',filters:[{"field":"field_756","value":"i0001","operator":"is"}]},{linkText:'i0002',filters:[{"field":"field_756","value":"i0002","operator":"is"}]},{linkText:'Await\' Wash',filters:[{"field":"field_2201","value":"Added to Service Wash List","operator":"is"}]},{linkText:'Wash Comp',filters:[{"field":"field_2201","value":"Service Wash Complete","operator":"is"}]},{linkText:'C/D Collected',filters:[{"field":"field_2785","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is not blank"}]}]
  renderSYSearchButtons('2892',defineButtons);

  let addFilters = document.querySelector('a[class="kn-add-filter kn-button is-small"]');
  console.log('addFilters',addFilters)
  if (addFilters){
    let addedAlowedFilters = ['field_1121']
    addFilters.onclick = function(){
      setTimeout(function () { 
        console.log('remove from filter')
        for (let i = 0;i<$('div[id="kn-filters-form"] select[name="field"] option').length;i++){
          console.log(i);
          let filterField = $('div[id="kn-filters-form"] select[name="field"] option').eq(i).attr('value');
          let allowFilterField = addedAlowedFilters.find(el => el===filterField);// || defineButtons.find(el => el.filters.find(el2 => el2.field === filterField));
          if (!allowFilterField){
            $('div[id="kn-filters-form"] select[name="field"] option').eq(i).hide();
          }
        }
      }, 200);
    }
  }

  tooltipsTable('934','2892','field_1532','field_2586');
	tooltipsTable('934','2892','field_1537','field_2213');
	tooltipsTable('934','2892','field_2298','field_2272');
	  $('th[class="field_2240"]').hide();
    $('td[class*="field_2240"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
	  $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
}); 

$(document).on('knack-scene-render.scene_934', function(event, scene) {
  recursiveSceneRefresh('934',['view_2892'],120000);
});

// Trigger Licence Link - Customer Manually Enters Driving Licence
$(document).on('knack-form-submit.view_2510', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/ouosl7cqftin4d5xk4ybco0q96t5bwk2", {"Record ID":data.id,"Courtesy Car Agreement Record ID":data.field_2318_raw,"Date Of Birth":data.field_2325,"Driving Licence Number":data.field_2316},"Customer and Driver Same Person + Manually Entering Driving Licence Details")
});
$(document).on('knack-form-submit.view_2940', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/ouosl7cqftin4d5xk4ybco0q96t5bwk2", {"Record ID":data.id,"Forename":data.field_2461,"Surname":data.field_2462,"Date Of Birth":data.field_2325,"First Line Of Address":data.field_2312,"Postcode":data.field_2314,"Email Address":data.field_2315_raw,"Driving Licence Number":data.field_2316},"Customer and Driver NOT Same Person + Manually Entering Driving Licence Details")
});

//trigger bot for exit survey (job card v2 - Check out via tablet)
$(document).on('knack-form-submit.view_2364', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":data.field_2223, "WIP":data.field_719, "DemoTransactionNumber":data.field_2476, "POS":data.field_720, "Date Courtesy Car Agreement Completed":data.field_2547, "Source": "View_2364 - Satisfaction check(tablet)", "Aftersales Account RecordId": data.field_1661_raw[0].id},"Aftersales - customer satisfaction exit survey to trigger bot autoline check out")
});

//trigger bot for exit survey (job card v2 - Check out via tablet (mark for follow up)
$(document).on('knack-form-submit.view_2881', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":data.field_2223, "WIP":data.field_719, "DemoTransactionNumber":data.field_2476, "POS":data.field_720, "Date Courtesy Car Agreement Completed":data.field_2547, "Source": "View_2881 - Satisfaction check(tablet)",  "Aftersales Account RecordId": data.field_1661_raw[0].id},"Aftersales - customer satisfaction exit survey to trigger bot autoline check out")
});

//****************** Upon Courtesy Car Agreement Completion - Reload Scene to Display Check Out buttons ****************//
$(document).on('knack-record-update.view_2979', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 1000);
  Knack.showSpinner();
});

//****************** Courtesy Car Agreement Created Manually - Reload Scene to Commence Agreement ****************//
$(document).on('knack-record-update.view_3054', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 1000);
  Knack.showSpinner();
});

// Code to wait following Form Submission while Licence Is Being Checked in Make - Licence Link - Customer View
$(document).on('knack-form-submit.view_2999', function(event, view, data) { 
	setTimeout(function(){ Knack.showSpinner();}, 0); 
	const commandURL = "https://hook.eu1.make.celonis.com/ouosl7cqftin4d5xk4ybco0q96t5bwk2?recordid=" + data.id ;
  $.get(commandURL, function(data, status){
    Knack.hideSpinner();
    $(".kn-message.success").html("<b>" + data + "</b>");
  });
});

// Code to wait following Form Submission while Licence Is Being Checked in Make - Customer View
$(document).on('knack-form-submit.view_4353', function(event, view, data) { 
  setTimeout(function(){ Knack.showSpinner(); }, 0); 
  const commandURL = "https://hook.eu1.make.celonis.com/e5oxog44l3ple4fk40kyo99dyua24pxb?recordid=" + data.id ;
  $.get(commandURL, function(data, status){
    Knack.hideSpinner();
    $(".kn-message.success").html("<b>" + data + "</b>");
  });
});

// Code to wait following Form Submission while Licence Is Being Checked in Make - Customer Advisor View

$(document).on('knack-form-submit.view_4356', function(event, view, data) { 
  setTimeout(function(){ Knack.showSpinner(); }, 0); 
  const commandURL = "https://hook.eu1.make.celonis.com/e5oxog44l3ple4fk40kyo99dyua24pxb?recordid=" + data.id ;
  $.get(commandURL, function(data, status){
    Knack.hideSpinner();
    $(".kn-message.success").html("<b>" + data + "</b>");
  });
});

$(document).on('knack-form-submit.view_4637', function(event, view, data) { 
  setTimeout(function(){ Knack.showSpinner(); }, 0); 
	const commandURL = "https://hook.eu1.make.celonis.com/e5oxog44l3ple4fk40kyo99dyua24pxb?recordid=" + data.id ;
	$.get(commandURL, function(data, status){
    Knack.hideSpinner();
    $(".kn-message.success").html("<b>" + data + "</b>");
  });
});

// Code to wait following Form Submission while Licence Is Being Checked in Make - Customer Submits Image of Licence

$(document).on('knack-form-submit.view_3047', function(event, view, data) { 
  setTimeout(function(){ Knack.showSpinner(); }, 0); 
	const commandURL = "https://hook.eu1.make.celonis.com/ouosl7cqftin4d5xk4ybco0q96t5bwk2?recordid=" + data.id ;
	$.get(commandURL, function(data, status){
    Knack.hideSpinner();
    $(".kn-message.success").html("<b>" + data + "</b>");
  });
});

//Commence courtesy car agreement to trigger part 2 of Digital check in
$(document).on('knack-form-submit.view_3592', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/1v52b45xmqgp25kqsocwmoab3cu88ikf",{"RecordID":data.id, "source": "Courtesy Inspection Page"}, "Aftersales - Create service wash from Job card v2")
});

 //Commence courtesy car agreement to trigger part 2 of Digital check in from inspection page
$(document).on('knack-form-submit.view_2353', function(event, view, data) { 
  callPostHttpRequest( "https://hook.eu1.make.celonis.com/ursfgeixws3xf5cl2j9d1bozxizq7air",{"RecordID":data.id, "from":"Original Courtesy commence"}, "Commence courtesy car agreement to trigger checin in from inspection page")
});

// ----------  refresh Enquiry Max Table every 5 seconds but not the page itself  ----------
$(document).on('knack-scene-render.scene_778', function(event, scene) {
  recursiveSceneRefresh('778',['view_2352'],5000);
});

/* Sticky Headers on Warranty admin table - this code locks the Table Header - CSS code is needed ref: line 3174*/
$(document).on("knack-view-render.view_3014", function (event, view, data) {
  var v = document.getElementById("view_3014");
  var w = v.getElementsByClassName("kn-table-wrapper")[0];
  var t = v.getElementsByTagName("table")[0];
  $(w).attr('id', 'view_wrap_3014');
  $(t).attr('id', 'view_table_3014');
  document.getElementById("view_wrap_3014").addEventListener("scroll", function(){
    var translate = "translate(0,"+this.scrollTop+"px)";
    var myElements = this.querySelectorAll("th");
    for (var i = 0; i < myElements.length; i++) {
      myElements[i].style.transform=translate;
    }
  });
});

//hover for service details for tech view jobcard
$(document).on('knack-view-render.view_3147', function (event, view, data) {
  if (document.getElementById("showHideMoreServiceVisits")){
    document.getElementById("showHideMoreServiceVisits").onclick = showHideMoreServiceVisits;
    showHideMoreServiceVisits();
  }
  $('div[class="field_325"]').hide();
  serviceVisitsTooltips('3147','325','rightBottomOnMouse');
});

//technician to unlink from jobcard and send to valet
$(document).on('knack-form-submit.view_3088', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/go73sbo0qfmia3ky1vs7wz2nh8e82wwa",{"RecordID":data.id, "UID":data.field_2190, "Service Wash Required?":data.field_2703}, "Technician to remove from list and send to service wash") 
});

$(document).on('knack-view-render.view_3841', function (event, view, data) {
  embedPhotoApp();
  let appSettings2718 = {
    spiritLine : false,
    imageOverlay: 'https://stellantisandyoucouk.github.io/imagesStore/car-background-v2.png',
    imageOverlayEffect : true,
    imageOverlayOpacity : null,
    allowLandscape : true,
    allowPortrait : false,
    actionAfterPhoto : 'compare', // none, readable, compare,
    actionAfterPhotoReadableText : 'Does the photo match the template?',
    uploadMethod : 'field', //knack, make, field
    uploadField : 'field_2718',
    resizeImageMaxHeight : 1000,
    resizeImageMaxWidth : 1000,
    app_id : '6040dd9a301633001bca5b4e'
  }
  createPhotoButton(appSettings2718,'2718');

  createOfflineFormSubmit('3841','6040dd9a301633001bca5b4e',motabReturnsImageUpload,getRecordIdFromHref(location.href))
});

function motabReturnsImageUpload(fieldName, fileId, filename, recordId){
  console.log('motabReturnsImageUpload', fieldName);
  if (fieldName === 'field_2718'){
    let dataToSend = {
      recordId:(recordId?recordId:getRecordIdFromHref(location.href)),
      imageUrl : 'https://s3.eu-central-1.amazonaws.com/kn-custom-rd/assets/6040dd9a301633001bca5b4e/'+fileId+'/original/photoimg.jpg',
      successMakeWebhook : 'https://hook.eu1.make.celonis.com/kln78kilvne9gknkl8mcupp6v3imktxq',
      failMakeWebhook : 'https://hook.eu1.make.celonis.com/3but1lwjptm6gqi3a0m7uulceuhx8znt'
    }
    $.ajax({
      url: 'https://davidmale--server.apify.actor/photoCheckMotability?token=apify_api_RZdYZJQn0qv7TjdZEYQ5vkZ3XmQxch0BU7p2',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(dataToSend),
      async: true
    })
  }
}

//C/D Check-in form motability photo
$(document).on('knack-view-render.view_3221', function (event, view, data) {
  embedPhotoApp();
  let appSettings2718 = {
    spiritLine : false,
    imageOverlay: 'https://stellantisandyoucouk.github.io/imagesStore/car-background-v2.png',
    imageOverlayEffect : true,
    imageOverlayOpacity : null,
    allowLandscape : true,
    allowPortrait : false,
    actionAfterPhoto : 'compare', // none, readable, compare,
    actionAfterPhotoReadableText : 'Does the photo match the template?',
    uploadMethod : 'field', //knack, make, field
    uploadField : 'field_2718',
    resizeImageMaxHeight : 1000,
    resizeImageMaxWidth : 1000,
    app_id : '6040dd9a301633001bca5b4e'
  }
  createPhotoButton(appSettings2718,'2718');
  let appSettings1914 = {uploadMethod : 'field', uploadField : 'field_1914',app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings1914,'1914');
  let appSettings2477 = {uploadMethod : 'field', uploadField : 'field_2477', app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2477,'2477');
  let appSettings2478 = {uploadMethod : 'field', uploadField : 'field_2478', app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2478,'2478');
  let appSettings2479 = {uploadMethod : 'field', uploadField : 'field_2479', app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2479,'2479');

  makeFileUploadOffline('field_2332');

  createOfflineFormSubmit('3221','6040dd9a301633001bca5b4e',motabReturnsImageUpload,getRecordIdFromHref(location.href));
});

//inspection page
$(document).on('knack-view-render.view_3566', function (event, view, data) {
  embedPhotoApp();
  let appSettings2718 = {
    spiritLine : false,
    imageOverlay: 'https://stellantisandyoucouk.github.io/imagesStore/car-background-v2.png',
    imageOverlayEffect : true,
    imageOverlayOpacity : null,
    allowLandscape : true,
    allowPortrait : false,
    actionAfterPhoto : 'compare', // none, readable, compare,
    actionAfterPhotoReadableText : 'Does the photo match the template?',
    uploadMethod : 'field', //knack, make, field
    uploadField : 'field_2718',
    resizeImageMaxHeight : 1000,
    resizeImageMaxWidth : 1000,
    app_id : '6040dd9a301633001bca5b4e'
  }
  createPhotoButton(appSettings2718,'2718');
  let appSettings1914 = {uploadMethod : 'field', uploadField : 'field_1914',app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings1914,'1914');
  let appSettings2477 = {uploadMethod : 'field', uploadField : 'field_2477', app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2477,'2477');
  let appSettings2478 = {uploadMethod : 'field', uploadField : 'field_2478', app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2478,'2478');
  let appSettings2479 = {uploadMethod : 'field', uploadField : 'field_2479', app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2479,'2479');

  makeFileUploadOffline('field_2332');
  
  createOfflineFormSubmit('3566','6040dd9a301633001bca5b4e',motabReturnsImageUpload,getRecordIdFromHref(location.href));
});

//courtesy inspection page
$(document).on('knack-view-render.view_3592', function (event, view, data) {
  embedPhotoApp();
	 let appSettings2718 = {
    spiritLine : false,
    imageOverlay: 'https://stellantisandyoucouk.github.io/imagesStore/car-background-v2.png',
    imageOverlayEffect : true,
    imageOverlayOpacity : null,
    allowLandscape : true,
    allowPortrait : false,
    actionAfterPhoto : 'compare', // none, readable, compare,
    actionAfterPhotoReadableText : 'Does the photo match the template?',
    uploadMethod : 'field', //knack, make, field
    uploadField : 'field_2718',
    resizeImageMaxHeight : 1000,
    resizeImageMaxWidth : 1000,
    app_id : '6040dd9a301633001bca5b4e'
  }
  let appSettings1914 = {uploadMethod : 'field', uploadField : 'field_1914',app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings1914,'1914');
  let appSettings2477 = {uploadMethod : 'field', uploadField : 'field_2477', app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2477,'2477');
  let appSettings2478 = {uploadMethod : 'field', uploadField : 'field_2478', app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2478,'2478');
  let appSettings2479 = {uploadMethod : 'field', uploadField : 'field_2479', app_id : '6040dd9a301633001bca5b4e',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2479,'2479');

  makeFileUploadOffline('field_2332');

  createOfflineFormSubmit('3592','6040dd9a301633001bca5b4e',null,getRecordIdFromHref(location.href));
});

function makeFileUploadOffline(field){
  $('div[id="kn-input-'+field+'"] div[class="kn-file-upload"]').hide();
  $('<input type="file" fieldName="'+field+'" id="'+field+'_offlinefile" class="input is-file">').insertBefore($('div[id="kn-input-'+field+'"]>div[class="control"]'));
}

function createPhotoButton(appSettings, fieldNumber, buttonText = 'Capture Photo'){
  $('div[id="kn-input-field_'+fieldNumber+'"]').find('input').hide();
  let fM = document.createElement("div");
  fM.setAttribute("id", 'takePhoto_'+$('div[id="kn-input-field_'+fieldNumber+'"]').attr('data-input-id'));
  fM.setAttribute("class", 'kn-detail-body');
  fM.setAttribute('style','padding: 0.375em 0; cursor: pointer');
  fM.innerHTML = '<span><span class="knViewLink__icon knViewLink__icon--isLeft icon is-left"><i class="fa fa-camera"></i></span> <span class="knViewLink__label"><strong><span class="">'+buttonText+'</span></strong></span> <!----></span>'
  fM.onclick = function(){
    let mAppSettings = Object.assign({},appSettings);
    mAppSettings.uploadField = $('div[id="kn-input-field_'+fieldNumber+'"]').attr('data-input-id');
    showPhotoApp(mAppSettings);
  }
  document.querySelector('div[id="kn-input-'+$('div[id="kn-input-field_'+fieldNumber+'"]').attr('data-input-id')+'"]>div[class="kn-asset-current level"]').appendChild(fM) 
}

//PROPERTY AND EVENTS FOR ONLINE/OFFLINE DETECTION
var isOnline = true;
window.addEventListener('online', () => isOnline = true);
window.addEventListener('offline', () => isOnline = false);

var uploadList = [];

//offline form testing
$(document).on('knack-view-render.view_3188', function (event, view, data) {
  embedPhotoApp();
  let appSettings = {
    spiritLine : false,
    imageOverlay: null,
    imageOverlayEffect : false,
    imageOverlayOpacity : null,
    allowLandscape : true,
    allowPortrait : true,
    actionAfterPhoto : 'readable', // none, readable, compare,
    actionAfterPhotoReadableText : 'Is the photo OK?',
    uploadMethod : 'field', //knack, make, field
    uploadField : 'field_2699',
    resizeImageMaxHeight : 1000,
    resizeImageMaxWidth : 1000
  }
  for (let i = 0;i<$('div[class="kn-input kn-input-image control"]').length;i++){
    $('div[class="kn-input kn-input-image control"]').eq(i).find('input').hide();
    let fM = document.createElement("p");
    fM.setAttribute("id", 'takePhoto_'+$('div[class="kn-input kn-input-image control"]').eq(i).attr('data-input-id'));
    fM.innerText = 'Take photo';
    fM.onclick = function(){
      let mAppSettings = Object.assign({},appSettings);
      mAppSettings.uploadField = $('div[class="kn-input kn-input-image control"]').eq(i).attr('data-input-id');
      if (i===0){
        mAppSettings.imageOverlay = 'https://stellantisandyoucouk.github.io/imagesStore/licenceOverlay2.png';
        //appSettings.imageOverlayEffect = true;
        mAppSettings.imageOverlayOpacity = 0.5;
        mAppSettings.allowLandscape = false;
      }
      showPhotoApp(mAppSettings);
    }
    document.querySelector('div[id="kn-input-'+$('div[class="kn-input kn-input-image control"]').eq(i).attr('data-input-id')+'"]>div[class="kn-asset-current level"]').appendChild(fM) 
  }

  var formButton = document.querySelector('div[class="kn-submit"]>button');
  formButton.onclick = function() {
    $('button[type="submit"]').prop('disabled', true);
    if (!isOnline){
      alert('You are offline, please go online before submiting the form.');
      $('button[type="submit"]').removeAttr('disabled');
      return false;
    } else {
      if ($('input[imageToSaveUrl]').length>0){
        uploadList = [];
        $('div[id="view_3188"] button[type="submit"]').prop('disabled', true);
        createFormModal('fMImageUpload','<h3>Images are being uploaded, then the form will be submitted ...</h3><p id="infoText"></p>');
        $('#fMImageUpload').show();
        for (let i =0;i<$('input[imageToSaveUrl]').length;i++){
          uploadList.push({field:$('input[imageToSaveUrl]').eq(i).attr('name')})
          fetch($('input[imageToSaveUrl]').eq(i).attr('imageToSaveUrl'))
          .then(function(response) {
            return response.blob();
          })
          .then(function(blob) {
            uploadImageOnlyPhotoApp('6040dd9a301633001bca5b4e',blob,'photoImg.jpg','infoText',$('input[imageToSaveUrl]').eq(i).attr('name'),imageUploadedSuccesfully);
          });
        }
        $('button[type="submit"]').removeAttr('disabled');
        return false;
      }
    }
  }
});

function getRecordIdFromHref(ur) {
  var ur = ur.substr(0, ur.length - 1);
  return ur.substr(ur.lastIndexOf('/') + 1)
}

function imageUploadedSuccesfully(fieldName, fileId, filename, nextAction = null, recordId = null){
  $('input[name="'+fieldName+'"]').val(fileId);
  $('input[name="'+fieldName+'"]').removeClass('input-error');
  $('div[id="kn-input-'+$('input[name="'+fieldName+'"]').attr('name')+'"] div[class="kn-asset-current"]').html('photoImg.jpg');
  $('#'+$('input[name="'+fieldName+'"]').attr('name')+'_upload').hide();
  $('div[id="kn-input-'+$('input[name="'+fieldName+'"]').attr('name')+' .kn-file-upload').html('File uploaded successfully.');
  $('input[name="'+fieldName+'"]').removeAttr('imageToSaveUrl');
  if (nextAction){
    nextAction(fieldName, fileId, filename, recordId);
  }
  if (!nextAction && fieldName === 'field_2718'){
    console.log('Motab Photo');
    let dataToSend = {
      recordId: recordId,
      imageUrl : 'https://s3.eu-central-1.amazonaws.com/kn-custom-rd/assets/6040dd9a301633001bca5b4e/'+fileId+'/original/photoimg.jpg',
      successMakeWebhook : 'https://hook.eu1.make.celonis.com/kln78kilvne9gknkl8mcupp6v3imktxq',
      failMakeWebhook : 'https://hook.eu1.make.celonis.com/3but1lwjptm6gqi3a0m7uulceuhx8znt'
    }
    $.ajax({
      url: 'https://davidmale--server.apify.actor/photoCheckMotability?token=apify_api_RZdYZJQn0qv7TjdZEYQ5vkZ3XmQxch0BU7p2',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(dataToSend),
      async: true
    })
  }
  let f = uploadList.find(el => el.field === fieldName);
  if (f){
    f.uploaded = true;
  }
  let notUploaded = uploadList.filter(el => !el.uploaded);
  if (notUploaded.length===0){
    $('#fMImageUpload').hide();
    $('button[type="submit"]').removeAttr('disabled');
    $('form').submit();
  }
}

function testSubmitOfflineForm(){
  let notUploaded = uploadList.filter(el => !el.uploaded);
  if (notUploaded.length===0){
    $('#fMImageUpload').hide();
    $('button[type="submit"]').removeAttr('disabled');
    $('form').submit();
  }
}

function fileUploadedSuccesfully(fieldName, fileId, filename){
  $('input[name="'+fieldName+'"]').val(fileId);
  $('input[name="'+fieldName+'"]').removeAttr('disabled');
  $('input[name="'+fieldName+'"]').removeClass('input-error');
  $('input[id="'+fieldName+'_offlinefile"]').val(null);
  $('div[id="kn-input-'+$('input[name="'+fieldName+'"]').attr('name')+'"] div[class="kn-asset-current"]').html(filename);
  $('div[id="kn-input-'+$('input[name="'+fieldName+'"]').attr('name')+' .kn-file-upload').html('File uploaded successfully.');
  $('input[id="'+fieldName+'_offlinefile"]').remove()
  let f = uploadList.find(el => el.field === fieldName);
  if (f){
    f.uploaded = true;
  }
  let notUploaded = uploadList.filter(el => !el.uploaded);
  if (notUploaded.length===0){
    $('#fMImageUpload').hide();
    $('button[type="submit"]').removeAttr('disabled');
    $('form').submit();
  }
}

function createOfflineFormSubmit(view,appId, nextAction=null,recordId = null){
  var formButton = document.querySelector('div[class="kn-submit"]>button');
  formButton.onclick = function() {
    $('button[type="submit"]').prop('disabled', true);
    if (!isOnline){
      alert('You are unable to submit the form as the device is not connected to a network. Please move within range/reconnect to a network to submit the form.');
      $('button[type="submit"]').removeAttr('disabled');
      return false;
    } else {
      if ($('input[imageToSaveUrl]').length>0 || $('input[id*="offline"]').length>0){
        uploadList = [];
        $('div[id="view_'+view+'"] button[type="submit"]').prop('disabled', true);
        $('<h3>Images are being uploaded, then the form will be submitted ...</h3><p id="infoText"></p>').insertBefore($('div[id="view_'+view+'"] button[type="submit"]'))
        createFormModal('fMImageUpload','<h3>Images and files are being uploaded, then the form will be submitted ...</h3><p id="infoText"></p>');
        $('#fMImageUpload').show();
        for (let i =0;i<$('input[imageToSaveUrl]').length;i++){
          uploadList.push({field:$('input[imageToSaveUrl]').eq(i).attr('name')})
          fetch($('input[imageToSaveUrl]').eq(i).attr('imageToSaveUrl'))
          .then(function(response) {
            return response.blob();
          })
          .then(function(blob) {
            uploadImageOnlyPhotoApp(appId,blob,'photoImg.jpg','infoText',$('input[imageToSaveUrl]').eq(i).attr('name'),imageUploadedSuccesfully, nextAction, recordId);
          });
        }
        for (let i =0;i< $('input[id*="offline"]').length;i++){
          if ($('input[id*="offline"]').eq(i).prop('files')[0]){
            uploadList.push({field:$('input[id*="offline"]').eq(i).attr('fieldName')});
            let fU = URL.createObjectURL( $('input[id*="offline"]').eq(i).prop('files')[0]);
            fetch(fU)
            .then(function(response) {
              return response.blob();
            })
            .then(function(blob) {
              uploadFileOnlyPhotoApp(appId,blob,$('input[id*="offline"]').eq(i).prop('files')[0].name,'infoText',$('input[id*="offline"]').eq(i).attr('fieldName'),fileUploadedSuccesfully);
            });
          }
        }
        testSubmitOfflineForm();
        return false;
      }
    }
  }
}

function createFormModal(id, htmlContent){
  let fM = document.createElement("div");
  fM.setAttribute("id", id);
  fM.setAttribute("class", "formModal");
  fM.setAttribute("style","display:none;");
  fM.innerHTML = htmlContent;
  document.body.appendChild(fM)
}

//*Trigger Aftersales - Exit Survey Email From TABLET from Jobcard v2
$(document).on('knack-form-submit.view_2364', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/l033812xruob5c383h0qlfz59oebzwak",{"Record ID":data.id}, "Aftersales - Exit Survey Email from Insecure (customer phone)") 
});

 //technician to unlink from jobcard and send to valet
$(document).on('knack-form-submit.view_3216', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/go73sbo0qfmia3ky1vs7wz2nh8e82wwa",{"RecordID":data.id, "UID":data.field_2190, "Service Wash Required?":data.field_2703}, "technician to unlink from jobcard and send to valet") 
});

//*Trigger Aftersales - Exit Survey Email From FOLLOW UP from Jobcard v2
$(document).on('knack-form-submit.view_2881', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/l033812xruob5c383h0qlfz59oebzwak",{"Record ID":data.id}, "Aftersales - Exit Survey Email From FOLLOW UP from Jobcard v2") 
});

  //refresh  new tech page every 5 seconds
$(document).on('knack-scene-render.scene_935', function(event, scene) {
  recursiveSceneRefresh('935',['view_2900','view_3126'],30000);
});

$(document).on('knack-scene-render.scene_981', function(event, scene) {
  recursiveSceneRefresh('981',['view_3223','view_3086'],30000);
});

// refresh workshop table v1
$(document).on('knack-scene-render.scene_1382', function(event, scene) {
  //Tooltip table 3805
  tooltipsTable('1382','3805','field_1532','field_2586');
  tooltipsTable('1382','3805','field_1537','field_2213');  
	
  recursiveSceneRefresh('1382',['view_3805'],300000);
	console.log('Recursivecallscene_1382');
	});

$(document).on('knack-scene-render.scene_1050', function(event, scene) {	
  //Tooltip table 3595
  tooltipsTable('1050','3595','field_1532','field_2586');
	tooltipsTable('1050','3595','field_1537','field_2213');  
  //Tooltip table 3307
  tooltipsTable('1050','3307','field_1532','field_2586');
	tooltipsTable('1050','3307','field_1537','field_2213');  
	tooltipsTable('1050','3307','field_2298','field_2272');

  recursiveSceneRefresh('1050',['view_3307','view_3805'],300000);
	console.log('Recursivecallscene_1050');
});

//technical ticket hovers
$(document).on('knack-view-render.view_4817', function (event, view, data) {
	    $('th[class="field_978"]').hide();
    $('td[class*="field_978"]').hide();
	  tooltipsTable('1459','4817','field_1532','field_2586');
	tooltipsTable('1459','4817','field_1537','field_2213');  
	tooltipsTable('1459','4817','field_2298','field_2272');

  recursiveSceneRefresh('1459',['view_4817'],300000);
});



$(document).on('knack-scene-render.scene_1411', function(event, scene) {	
  //Tooltip table 3595
  tooltipsTable('1411','3595','field_1532','field_2586');
	tooltipsTable('1411','3595','field_1537','field_2213');  

	console.log('Recursivecallscene_1411');
	recursiveSceneRefresh('1411',['view_3595'],300000);
});


//hover for service details for pre-visit jobcard
$(document).on('knack-view-render.view_3500', function (event, view, data) {
	console.log("hover active")
  if (document.getElementById("showHideMoreServiceVisits")){
    document.getElementById("showHideMoreServiceVisits").onclick = showHideMoreServiceVisits;
    showHideMoreServiceVisits();
  }
  $('div[class="field_325"]').hide();
  serviceVisitsTooltips('3497','325','tooltipTop');
});

//hover for service details for pre-pick job view
$(document).on('knack-view-render.view_3278', function (event, view, data) {
	console.log("hover active")
  if (document.getElementById("showHideMoreServiceVisits")){
    document.getElementById("showHideMoreServiceVisits").onclick = showHideMoreServiceVisits;
    showHideMoreServiceVisits();
  }
  $('div[class="field_325"]').hide();
  serviceVisitsTooltips('3278','325','tooltipTop');
});

//hover for labour details on workshop POT (MOT Table)
$(document).on('knack-view-render.view_3474', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
   	$('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
});

//hover for labour details on workshop POT (service Table)
$(document).on('knack-view-render.view_3476', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
});

//hover for labour details on workshop POT (Predictable work)
$(document).on('knack-view-render.view_3483', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
 });
	
//hover for labour details on workshop POT (diag/inv/recall)
$(document).on('knack-view-render.view_3482', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();	    
});
	
//hover for labour details on workshop POT (Internal)
$(document).on('knack-view-render.view_3477', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
});

//hover for todays internal jobs 
$(document).on('knack-view-render.view_3770', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
  });

//hover for jobs planned in the future 
$(document).on('knack-view-render.view_3806', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
});

var view_3307_refreshDateTime = new Date();
//hover for labour details on workshop table
$(document).on('knack-view-render.view_3307', function (event, view, data) {

let defineButtons = [{linkText:'All',"filters":[]},

{linkText:"W\'Shop Master List","filters":[{"field_name":"Workshop Today's Job","field":"field_3229","value":true,"operator":"is"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"Parts Avail.","filters":[{"field_name":"Parts on status V,I,C,S","field":"field_985","value":true,"operator":"is blank"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"Parts Unavail.","filters":[{"field_name":"Parts on status V,I,C,S","field":"field_985","value":true,"operator":"is not blank"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"Checked In TODAY","filters":[{"field_name":"Date/Time Customer Signature from Service Check In / Inspection Completed","field":"field_2711","value":true,"operator":"is today"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"Clocked On Now","filters":[{"field_name":"Workshop Controller labour Snapshot","field":"field_1537","value":"Working On Currently","operator":"contains"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"Never Clocked","filters":[{"field_name":"Last Clocked Date ","field":"field_787","value":"","operator":"is blank"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"Wait. Auth (VHC)","filters":[{"field":"field_2297","value":"CPL","operator":"is"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"i0001","filters":[{"field":"field_756","value":"i0001","operator":"is"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"i0002","filters":[{"field":"field_756","value":"i0002","operator":"is"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"NO BON","filters":[{"field":"field_1472","value":"Power Supply Order NO BON","operator":"is"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"Write up TODAY","filters":[{"field_name":"Date/Time Technician Write up completed","field":"field_2722","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is today"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"W\'Shop Planned Before Today","filters":[{"field":"field_3429","value":"","operator":"is before today"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"W\'Shop Planned Today","filters":[{"field":"field_3429","value":"","operator":"is today"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"No W\'Shop Planned","filters":[{"field":"field_3429","value":"","operator":"is blank"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete - Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"W\'Shop Planned After Today","filters":[{"field":"field_3429","value":"","operator":"is after today"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"Jobs With Technical Tickets","filters":[{"field":"field_3756","value":"","operator":"is not blank"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts on Order","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Parts Need Ordering","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Diag complete – Requires Prior Approval","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Required","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Technical Ticket - Created/Awaiting Response","operator":"does not contain"},{"field_name":"Internal Job Card Status","field":"field_3781","value":"Carrying Out Overnight Road Test","operator":"does not contain"}]},

{linkText:"DC - Parts On Order","filters":[{"field_name":"Internal Job Card Status","field":"field_3781","value": "Diag complete – Parts on Order","operator":"contains"}]},

{linkText:"DC – Parts Need Ord","filters":[{"field_name":"Internal Job Card Status","field":"field_3781","value": "Diag complete - Parts Need Ordering","operator":"contains"}]},

{linkText:"DC – PRA","filters":[{"field_name":"Internal Job Card Status","field":"field_3781","value": "Diag complete – Requires Prior Approval","operator":"contains"}]},

{linkText:"Carry ORT","filters":[{"field_name":"Internal Job Card Status","field":"field_3781","value": "Carrying Out Overnight Road Test","operator":"contains"}]}];
	
console.log("renderSYSearchButtons('3307',defineButtons);")
  renderSYSearchButtons('3307',defineButtons);
 
  let addFilters = document.querySelector('a[class="kn-add-filter kn-button is-small"]');
  console.log('addFilters',addFilters)
  if (addFilters){
    addFilters.onclick = function(){
      console.log('onclick 2')
      removeFilterFields(['field_1121','field_2411']);
      let addFilters2 = document.querySelector('a[id="add-filter-link"]');
      addFilters2.onclick = function(){
        console.log('onclick 3')
        removeFilterFields(['field_1121','field_2411']);
      }
    }
  }
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
    $('th[class="field_2298"]').hide();
    $('td[class*="field_2298"]').hide();
    $('th[class="field_978"]').hide();
    $('td[class*="field_978"]').hide();

    $('div[id="view_3307"] a[class*="knViewLink"]').has('i[class="fa fa-check-circle"]').on( "click", function() {
      console.log('something clicked',(new Date()-view_3307_refreshDateTime));
      if ((new Date()-view_3307_refreshDateTime)>60*60*1000){
        view_3307_refreshDateTime = new Date()
        console.log('doRefresh');
        document.location.reload();
      }
    });
});

// Add filter menu to FOCUS awaiting/pending pages to allow custom filters

$(document).on('knack-view-render.view_632', function (event, view, data) {

let defineButtons = [{linkText:"Not Completed","filters":[{"field_name":"Date/Time Follow Up Call Was Completed","field":"field_1004","value":{"all_day":false,"date":"","hours":null,"minutes":null,"am_pm":"Invalid+date","time":""},"operator":"is blank"}]},

{linkText:"Completed","filters":[{"field_name":"Date/Time Follow Up Call Was Completed","field":"field_1004","value":{"all_day":false,"date":"","hours":null,"minutes":null,"am_pm":"Invalid+date","time":""},"operator":"is not blank"}]}];
	
console.log("renderSYSearchButtons('632',defineButtons);")
  renderSYSearchButtons('632',defineButtons);
 
  let addFilters = document.querySelector('a[class="kn-add-filter kn-button is-small"]');
  console.log('addFilters',addFilters)
  if (addFilters){
    addFilters.onclick = function(){
      console.log('onclick 2')
      let addFilters2 = document.querySelector('a[id="add-filter-link"]');
      addFilters2.onclick = function(){
        console.log('onclick 3')
      }
    }
  }

});

$(document).on('knack-view-render.view_738', function (event, view, data) {

let defineButtons = [{linkText:"Not Completed","filters":[{"field_name":"Date/Time Follow Up Call Was Completed","field":"field_1004","value":{"all_day":false,"date":"","hours":null,"minutes":null,"am_pm":"Invalid+date","time":""},"operator":"is blank"}]},

{linkText:"Completed","filters":[{"field_name":"Date/Time Follow Up Call Was Completed","field":"field_1004","value":{"all_day":false,"date":"","hours":null,"minutes":null,"am_pm":"Invalid+date","time":""},"operator":"is not blank"}]}];
	
console.log("renderSYSearchButtons('738',defineButtons);")
  renderSYSearchButtons('738',defineButtons);
 
  let addFilters = document.querySelector('a[class="kn-add-filter kn-button is-small"]');
  console.log('addFilters',addFilters)
  if (addFilters){
    addFilters.onclick = function(){
      console.log('onclick 2')
      let addFilters2 = document.querySelector('a[id="add-filter-link"]');
      addFilters2.onclick = function(){
        console.log('onclick 3')
      }
    }
  }

});

// Add filter menu to customer pre-call view

$(document).on('knack-view-render.view_321', function (event, view, data) {

let defineButtons = [{linkText:"To Do","filters":[{"field_name":"Status Of 48 Hour Customer Pre Call For Their Next Booking","field":"field_408","value":"Pre Call Complete","operator":"is not"}]},

		     {linkText:"Done (All)","filters":[{"field_name":"Status Of 48 Hour Customer Pre Call For Their Next Booking","field":"field_408","value":"Pre Call Complete","operator":"is"}]},

{linkText:"Done (Automated SMS)","filters":[{"field_name":"Date/Time SMS Automated Pre Call Sent","field":"field_2581","value":{"all_day":false,"date":"","hours":null,"minutes":null,"am_pm":"Invalid+date","time":""},"operator":"is not blank"}]}];
	
console.log("renderSYSearchButtons('321',defineButtons);")
  renderSYSearchButtons('321',defineButtons);
 
  let addFilters = document.querySelector('a[class="kn-add-filter kn-button is-small"]');
  console.log('addFilters',addFilters)
  if (addFilters){
    addFilters.onclick = function(){
      console.log('onclick 2')
      let addFilters2 = document.querySelector('a[id="add-filter-link"]');
      addFilters2.onclick = function(){
        console.log('onclick 3')
      }
    }
  }

});


function removeFilterFields(addedAlowedFilters){
  setTimeout(function () { 
    console.log('remove from filter',addedAlowedFilters)
    for (let i = 0;i<$('div[id="kn-filters-form"] select[name="field"] option').length;i++){
      let filterField = $('div[id="kn-filters-form"] select[name="field"] option').eq(i).attr('value');
      let allowFilterField = addedAlowedFilters.find(el => el===filterField);// || defineButtons.find(el => el.filters.find(el2 => el2.field === filterField));
      if (!allowFilterField){
        $('div[id="kn-filters-form"] select[name="field"] option').eq(i).hide();
      }
    }
  }, 200);
}
	
//hover for labour details on workshop Today's jobs not checked in
$(document).on('knack-view-render.view_3595', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
});
	
//hover for labour details on workshop jobs planned in the future
$(document).on('knack-view-render.view_3805', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
});

//hover for labour details on workshop pots "completed work"
$(document).on('knack-view-render.view_3826', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();	    
});
		
//Sales prospecting Hover over tables for sales advisor view
$(document).on('knack-view-render.view_4488', function(event, scene) {
	tooltipsTable('1313','4488','field_3350','field_3359');	
	$('th[class="field_3350"]').hide();
  $('td[class*="field_3350"]').hide();

  //vhc work over model
	tooltipsTable('1313','4488','field_3351','field_3354');	
	$('th[class="field_3351"]').hide();
  $('td[class*="field_3351"]').hide();	
	
  //historic visit over due in
	tooltipsTable('1313','4488','field_3352','field_3248','','left');	
	$('th[class="field_3352"]').hide();
  $('td[class*="field_3352"]').hide();	
	
  //cust. name/emax notes over last contact
	tooltipsTable('1313','4488','field_3353','field_3330');	
	$('th[class="field_3353"]').hide();
  $('td[class*="field_3353"]').hide();	

  //date sold over sold new/used
	tooltipsTable('1313','4488','field_3355','field_3371');	
	$('th[class="field_3355"]').hide();
  $('td[class*="field_3355"]').hide();

  //1 Link cust.name over name
	tooltipsTable('1313','4488','field_3356','field_3372','','left');	
	$('th[class="field_3356"]').hide();
  $('td[class*="field_3356"]').hide();

  //Finance Details Over Finance
	tooltipsTable('1313','4488','field_3357','field_3349');	
	$('th[class="field_3357"]').hide();
  $('td[class*="field_3357"]').hide();		

  //Mileage over AT data
	tooltipsTable('1313','4488','field_3361','field_3358');	
	$('th[class="field_3361"]').hide();
  $('td[class*="field_3361"]').hide();
});

//Hover's for sales prospecting Search Table
$(document).on('knack-view-render.view_4431', function(event, scene) {
		tooltipsTable('1313','4431','field_3350','field_3359');	
	  $('th[class="field_3350"]').hide();
    $('td[class*="field_3350"]').hide();

    //vhc work over model
		 tooltipsTable('1313','4431','field_3351','field_3354');	
	  $('th[class="field_3351"]').hide();
    $('td[class*="field_3351"]').hide();	
	
    //historic visit over due in
		 tooltipsTable('1313','4431','field_3352','field_3248','','left');	
	  $('th[class="field_3352"]').hide();
    $('td[class*="field_3352"]').hide();	
	
    //cust. name/emax notes over last contact
		tooltipsTable('1313','4431','field_3353','field_3330');	
	  $('th[class="field_3353"]').hide();
    $('td[class*="field_3353"]').hide();	


    //date sold over sold new/used
		tooltipsTable('1313','4431','field_3355','field_3371');	
	  $('th[class="field_3355"]').hide();
    $('td[class*="field_3355"]').hide();

    //1 Link cust.name over name
		tooltipsTable('1313','4431','field_3507','field_3372','','left');	
	  $('th[class="field_3356"]').hide();
    $('td[class*="field_3356"]').hide();
    $('th[class="field_3507"]').hide();
    $('td[class*="field_3507"]').hide();    
	
    //Finance Details Over Finance
		tooltipsTable('1313','4431','field_3357','field_3349');	
	  $('th[class="field_3357"]').hide();
    $('td[class*="field_3357"]').hide();		
	
    //Mileage over AT data
		tooltipsTable('1313','4431','field_3361','field_3358');	
	  $('th[class="field_3361"]').hide();
    $('td[class*="field_3361"]').hide();	
});

//Hover's for sales prospecting Bar Chart
$(document).on('knack-view-render.view_4435', function(event, scene) {
		tooltipsTable('1340','4435','field_3350','field_3359');	
	  $('th[class="field_3350"]').hide();
    $('td[class*="field_3350"]').hide();

    //vhc work over model
		 tooltipsTable('1340','4435','field_3351','field_3354');	
	  $('th[class="field_3351"]').hide();
    $('td[class*="field_3351"]').hide();	
	
    //historic visit over due in
		 tooltipsTable('1340','4435','field_3352','field_3248','','left');	
	  $('th[class="field_3352"]').hide();
    $('td[class*="field_3352"]').hide();	
	
    //cust. name/emax notes over last contact
		 tooltipsTable('1340','4435','field_3353','field_3330');	
	  $('th[class="field_3353"]').hide();
    $('td[class*="field_3353"]').hide();	

    //date sold over sold new/used
		 tooltipsTable('1340','4435','field_3355','field_3371');	
	  $('th[class="field_3355"]').hide();
    $('td[class*="field_3355"]').hide();

    //1 Link cust.name over name
		 tooltipsTable('1340','4435','field_3356','field_3372','','left');	
	  $('th[class="field_3356"]').hide();
    $('td[class*="field_3356"]').hide();

    //Finance Details Over Finance
		 tooltipsTable('1340','4435','field_3357','field_3349');	
	  $('th[class="field_3357"]').hide();
    $('td[class*="field_3357"]').hide();		

    //Mileage over AT data
		 tooltipsTable('1340','4435','field_3361','field_3358');	
	  $('th[class="field_3361"]').hide();
    $('td[class*="field_3361"]').hide();	
});

//Hover's for sales prospecting from reporting 
$(document).on('knack-view-render.view_4739', function(event, scene) {
		tooltipsTable('1426','4739','field_3350','field_3359');	
	  $('th[class="field_3350"]').hide();
    $('td[class*="field_3350"]').hide();

    //vhc work over model
		 tooltipsTable('1426','4739','field_3351','field_3354');	
	  $('th[class="field_3351"]').hide();
    $('td[class*="field_3351"]').hide();	
	
    //historic visit over due in
		 tooltipsTable('1426','4739','field_3352','field_3248','','left');	
	  $('th[class="field_3352"]').hide();
    $('td[class*="field_3352"]').hide();	
	
    //cust. name/emax notes over last contact
		tooltipsTable('1426','4739','field_3353','field_3330');	
	  $('th[class="field_3353"]').hide();
    $('td[class*="field_3353"]').hide();	


    //date sold over sold new/used
		tooltipsTable('1426','4739','field_3355','field_3371');	
	  $('th[class="field_3355"]').hide();
    $('td[class*="field_3355"]').hide();

    //1 Link cust.name over name
		tooltipsTable('1426','4739','field_3507','field_3372','','left');	
	  $('th[class="field_3356"]').hide();
    $('td[class*="field_3356"]').hide();
    $('th[class="field_3507"]').hide();
    $('td[class*="field_3507"]').hide();    
	
    //Finance Details Over Finance
		tooltipsTable('1426','4739','field_3357','field_3349');	
	  $('th[class="field_3357"]').hide();
    $('td[class*="field_3357"]').hide();		

    //Mileage over AT data
		tooltipsTable('1426','4739','field_3361','field_3358');	
	  $('th[class="field_3361"]').hide();
    $('td[class*="field_3361"]').hide();	
});




//hover for labour details on Quality Check View
$(document).on('knack-view-render.view_3068', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_978"]').hide();
    $('td[class*="field_978"]').hide();
	 tooltipsTable('990','3068','field_1537','field_787');
});

//trigger get tyres and prices for a selected dealer from modal view
$(document).on('knack-form-submit.view_3519', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/osrisywv6fufmcdbf7ih8bc1yfrlvpq8",{"Record ID":data.id, "Selected Dealer":data.field_411}, "Trigger get selected dealer tyres") 
});
  
//auto reload Clear tyres in customer & vehicle look up /precalls
$(document).on('knack-record-update.view_3519', function(event, view, data) {
  setTimeout(function () { location.hash = location.hash + "#"; }, 100);
  Knack.showSpinner();
});
  
//refresh tyres stock on previsit jobcard
$(document).on("knack-scene-render.scene_1103", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_575', //Autoline Tyre Stock For Dealer
          views:['3516']
      }
    ]
    sceneRefresh(refreshData);
});
  
function generateTyres2(){
  try {
    console.log('generateTyres2');
    let tyresJSON = JSON.parse(Knack.views['view_3518'].model.attributes['field_250']);
    tyresJSON = tyresJSON.filter(function(el){
      return el['a:StockPolicy'][0] === 'ACTIVE' && el['a:Winter'][0] === 'N'
    })
    console.log('tyresJSON.length filtered',tyresJSON.length);
    tyresJSON = tyresJSON.sort(function(a,b){
      return (a['a:TotalFittedRetailPriceIncVAT'][0] > b['a:TotalFittedRetailPriceIncVAT'][0]?1:(a['a:TotalFittedRetailPriceIncVAT'][0] < b['a:TotalFittedRetailPriceIncVAT'][0]?-1:0));
    })
    let outputTables = [{name:'Budget'},{name:'Medium'},{name:'Premium'}];
    let recordsPerTableWhole = Math.floor(tyresJSON.length/outputTables.length);
    let remainderOfRecords = tyresJSON.length % outputTables.length;
    for (let i = 0;i<outputTables.length;i++){
      outputTables[i].count = recordsPerTableWhole;
      if (remainderOfRecords>0) {
        outputTables[i].count += 1;
        remainderOfRecords = remainderOfRecords - 1;
      }
    }	  
	  
    let jsonPosition = 0;
    for (let i = 0;i<outputTables.length;i++){
      outputTables[i].text = '<table><tr><th>Manufacturer type</th><th>Price</th></tr>';
      for (let j = jsonPosition;j<jsonPosition + (outputTables[i].count<5?outputTables[i].count:5);j++){
        outputTables[i].text += '<tr title="Available: '+tyresJSON[j]['a:AvailableQuantity'][0]+'; SOR: '+tyresJSON[j]['a:SORQuantity'][0]+'; Delivery date: '+formatDateGB(new Date(tyresJSON[j]['a:DeliveryDate'][0]))+'"><td bgcolor="'+tyreRowColor(tyresJSON[j]['a:AvailableQuantity'][0],tyresJSON[j]['a:SORQuantity'][0])+'">'+tyresJSON[j]['a:ManufacturerName'][0]+' '+tyresJSON[j]['a:StockDesc'][0]+'</td><td>£'+tyresJSON[j]['a:TotalFittedRetailPriceIncVAT'][0]+'</td></tr>';
      }
      jsonPosition += outputTables[i].count;
      outputTables[i].text += '</table>';
    }
    let output = '<table><tr>';
    for (let i =0;i<outputTables.length;i++){
      output += '<td>' + outputTables[i].name + '<br />'+outputTables[i].text+'</td>';
    }
    output += '</tr></table>';

    $('div[class*="field_250"]').html(output);
    $('div[class*="field_250"]').show();
  } catch (e){
    console.log('Error Generating tyres',e);
  }
}
  
$(document).on("knack-scene-render.scene_1103", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_250', //Tyres
          views:['3516'],
          runAfter : generateTyres2 
      }
    ]
    sceneRefresh(refreshData);
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
  $('div[id="kn-input-'+message.pdfAssetField+'"] div[class="kn-file-upload"]').html('File uploaded successfully.');
}
//END OF SCAN APP CODE

//THIS IS ARRAY OF scenes with document scan
var scanDocsSceneNames = ["scene_1260", "scene_1189","scene_928","scene_1097","scene_1012","scene_1015","scene_1013","scene_1073","scene_1215"];
scanDocsSceneNames.forEach(scanDocsLinkFunction);
function scanDocsLinkFunction(selector_view){
  $(document).on("knack-scene-render." + selector_view, function(event, view, data) {
    console.log('prepare scan view, aftersales',selector_view)
    embedScanApp();
    if ($('div[class="kn-input kn-input-file control"]:contains("#SCANALSO#")').length>0){
      for (let i = 0;i<$('div[class="kn-input kn-input-file control"]:contains("#SCANALSO#")').length;i++){
        $('div[class="kn-input kn-input-file control"]:contains("#SCANALSO#")').eq(i).append('<button type="button" id="scanDocument" data-pdfassetfield="'+$('div[class="kn-input kn-input-file control"]:contains("#SCANALSO#")').eq(i).attr('data-input-id')+'" data-app_id="6040dd9a301633001bca5b4e"><i class="fa fa-file-pdf-o" data-redactor-tag="i"></i> Scan document</button>')
      }
      for (let i = $('div[class="kn-input kn-input-file control"]:contains("#SCANALSO#")').length;i>0;i--){
        $('div[class="kn-input kn-input-file control"]:contains("#SCANALSO#")').eq(i).find('label>span').text($('div[class="kn-input kn-input-file control"]:contains("#SCANALSO#")').eq(i).find('label>span').text().trim().replace('#SCANALSO#',''))
      }
    }
    if ($('button[id="scanDocument"]').length>0){
      for (let i = 0;i<$('button[id="scanDocument"]').length;i++){
        $('button[id="scanDocument"]').eq(i).on("click",function(){
          showScanApp(this);
        });
      }
    }
  });
}  

 //Aftersales - Trigger Manual Courtesy service wash/valet
$(document).on('knack-view-render.view_2943', function (event, view, data) {
    if ($('div[class="kn-table kn-view view_2943"]')){
      let rows = $('div[class="kn-table kn-view view_2943"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/sxuvqusgluh7rwst89mk4sm38w5632r2", {"recordId":cell, "userName": Knack.getUserAttributes().name, "Scenario":"Aftersakes - Send Courtesy to wash/valet" },"Aftersales - Send Courtesy to wash/valet");
            //callPostHttpRequest("https://hook.eu1.make.celonis.com/sxuvqusgluh7rwst89mk4sm38w5632r2", {"recordId":cell, "userName": Knack.getUserAttributes().name, "Scenario":"Aftersakes - Send Courtesy to wash/valet" },"Aftersales - Send Courtesy to wash/valet");
          };
        };
        if (currentRow.id!==''){
          currentRow.children[1].onclick = createClickHandler(currentRow);
        }
      }
    }
});

//auto refresh for workshop controller pots
$(document).on('knack-scene-render.scene_1098', function(event, scene) {
  recursiveSceneRefresh('1098',['view_3474','view_3476','view_3483','view_3482','view_3477','view_3806','view_3826'],60000);
  //view 3474
  tooltipsTable('1098','3474','field_1537','field_2213');  
  tooltipsTable('1098','3474','field_1532','field_2586');
  //view 3476
  tooltipsTable('1098','3476','field_1537','field_2213');  
  tooltipsTable('1098','3476','field_1532','field_2586');
  //view 3483
  tooltipsTable('1098','3483','field_1532','field_2586');
  tooltipsTable('1098','3483','field_1537','field_2213'); 
  //view 3482
  tooltipsTable('1098','3482','field_1532','field_2586');
  tooltipsTable('1098','3482','field_1537','field_2213');  
  //view 3477
  tooltipsTable('1098','3477','field_1532','field_2586');	
  tooltipsTable('1098','3477','field_1537','field_2213'); 
  //view 3770
  tooltipsTable('1098','3770','field_1532','field_2586');
  tooltipsTable('1098','3770','field_1537','field_2213'); 
  //view 3806
  tooltipsTable('1098','3806','field_1532','field_2586');
  tooltipsTable('1098','3806','field_1537','field_2213');  
  //view 3826
  tooltipsTable('1098','3826','field_1532','field_2586'); 	
  tooltipsTable('1098','3826','field_1537','field_2213');  
});

/*Aftersales Workshop to mark Job card reports as Ready to invoice (RTI) for Warranty admin
$(document).on('knack-view-render.view_3878', function (event, view, data) {
  if ($('div[class="kn-table kn-view view_3878"]')){
      let rows = $('div[class="kn-table kn-view view_3878"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/q461vgdrkqp309gidqbhbmqioew3r69w", {"recordId":cell, "Scenario":"Aftersales - Warranty - Mark as Ready to Invoice" },"Aftersales - Warranty - Mark as Ready to Invoice");
          };
        };
        if (currentRow.id!==''){
          currentRow.children[10].onclick = createClickHandler(currentRow);
        }
      }
    }
 });
*/
//Aftersales Dealer to send Rejected back to Warranty admin
$(document).on('knack-view-render.view_4277', function (event, view, data) {
  if ($('div[class="kn-table kn-view view_4277"]')){
      let rows = $('div[class="kn-table kn-view view_4277"] table tr');
      console.log('rows',rows.length);
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/r3wrj1rlo4cqt2thkw3wh55odybxon8u", {"recordId":cell, "Scenario":"Aftersales Warranty Admin - Dealer to send Rejected Claim back to warranty" },"Aftersales Warranty Admin - Dealer to send Rejected Claim back to warranty");
          };
        };
        if (currentRow.id!==''){
          currentRow.children[10].onclick = createClickHandler(currentRow);
        }
      }
    }
 });

const mapDealerNamesToCodes = [["Stellantis &You Birmingham Central","GH"],["Stellantis &You Birmingham North","CG"],["Stellantis &You Birmingham South","BK"],["Stellantis &You Brentford","WW"],["Stellantis &You Bristol Cribbs","TC"],["Stellantis &You Chelmsford","ES"],["Stellantis &You Chingford","CH"],["Stellantis &You Coventry","BW"],["Stellantis &You Crawley","VG"],["Stellantis &You Croydon","VY"],["Stellantis &You Edgware","WN"],["Stellantis &You Guildford","ST"],["Stellantis &You Hatfield","HD"],["Stellantis &You Leicester","CL"],["Stellantis &You Liverpool","LP"],["Stellantis &You Maidstone","RM"],["Stellantis &You Manchester","TG"],["Stellantis &You National","BH"],["Stellantis &You Newport","NP"],["Stellantis &You Nottingham","NT"],["Stellantis &You Preston","GL"],["Stellantis &You Redditch","RH"],["Stellantis &You Romford","RF"],["Stellantis &You Sale","SB"],["Stellantis &You Sheffield","GM"],["Stellantis &You Stockport","CT"],["Stellantis &You Walton","WY"],["Stellantis &You West London","LW"],["Stellantis &You Wimbledon","VM"]];
$(document).on('knack-view-render.view_3923', function(event, view, records) {
  getWorkshopAvailability();
});

let globalWorkshopAvailabilityStatus = null;

function getWorkshopAvailability(status = null,useCustomerAddress=false,customAddress=null,retry = 1){
  console.log('getWorkshopAvailability',globalWorkshopAvailabilityStatus)
  try {
    if (globalWorkshopAvailabilityStatus){
      console.log('globalWorkshopAvailabilityStatus.regNumber',globalWorkshopAvailabilityStatus.regNumber,$('div[class="kn-label-none field_31"]').text().trim())
      if (globalWorkshopAvailabilityStatus.regNumber!==$('div[class="kn-label-none field_31"]').text().trim()) globalWorkshopAvailabilityStatus = null;
    }
    if (useCustomerAddress) globalWorkshopAvailabilityStatus.useCustomerAddress = true;
    if (!useCustomerAddress && globalWorkshopAvailabilityStatus && globalWorkshopAvailabilityStatus.useCustomerAddress) useCustomerAddress = true;
    if (customAddress) globalWorkshopAvailabilityStatus.customAddress = customAddress;
    if (!customAddress && globalWorkshopAvailabilityStatus && globalWorkshopAvailabilityStatus.customAddress) customAddress = globalWorkshopAvailabilityStatus.customAddress;

    if (!status) status = globalWorkshopAvailabilityStatus;
    if (!status || !status.availabilityData){
      let aJson = JSON.parse(callGetHttpRequest('https://api.apify.com/v2/key-value-stores/ISl77oKEGWUSIcuXx/records/workshopAvailability'));
      if (!status){
        status = {availabilityData:aJson};
      } else {
        status.availabilityData = aJson;
      }
    }

    let customerAddress = $('div[class="field_308"]>div>span>span').text();
    console.log('customerAddress',customerAddress, 'customAddress',customAddress);
    if ((customerAddress!=='' && useCustomerAddress) || customAddress){
      if (!status || !status.addressData || (customAddress && status.addressToUse !==customAddress)){
        let addressToUse = $('div[class="field_308"]>div>span>span').html();
        if (addressToUse) addressToUse = addressToUse.replace('<br>',', ');
        if (customAddress) addressToUse = customAddress;
        let closestD = callPostHttpRequest('https://davidmale--server.apify.actor/dealersNearAddress?token=apify_api_RZdYZJQn0qv7TjdZEYQ5vkZ3XmQxch0BU7p2',{Address:addressToUse});
        console.log('closestD',closestD)
        closestD = JSON.parse(closestD);
        if (!status){
          status = {addressData:{closestD:closestD},addressToUse:addressToUse}
        } else {
          status.addressData = {closestD:closestD}
          status.addressToUse = addressToUse;
        }
        console.log('status',status);
      }
    }

    let lastDealerVisit = $('div[class="kn-detail field_303"]').text().replace('Last Dealer Visit','').trim();
    if (lastDealerVisit!=='' && !lastDealerVisit.includes('No Last Dealer Found')){
      if (!status || !status.lastVisitData){
        console.log('lastDealerVisit',lastDealerVisit);
        let mapLastDealerVisit = mapDealerNamesToCodes.find(el => el[0] === lastDealerVisit);
        if (mapLastDealerVisit) mapLastDealerVisit = mapLastDealerVisit[1];
        console.log('mapLastDealerVisit',mapLastDealerVisit)
        status.lastVisitData = {lastDealerVisit:lastDealerVisit,mapLastDealerVisit:mapLastDealerVisit};
      }
    }
    globalWorkshopAvailabilityStatus = status;
    globalWorkshopAvailabilityStatus.regNumber = $('div[class="kn-label-none field_31"]').text().trim();

    if (status && (status.lastVisitData || status.addressData)){
      availabilityHTML(status, useCustomerAddress, customAddress);
    } else {
      $('div[id="view_3923"]>div').html('<b>Workshop Availability</b><br /><div class="kn-details-link"><div class="kn-detail-body" style="padding: 0.375em 0;"><span><a onclick="return getCustomAddressForTravelDistance();" data-kn-id="76bbbce4-a39f-40d7-9a8b-752e695f4b8d" class="knViewLink kn-link kn-link-page knViewLink--page knViewLink--filled knViewLink--size-medium knViewLink--uppercase knViewLink--raised" data-vue-component="viewLink"><span class="knViewLink__icon knViewLink__icon--isLeft icon is-left"><i class="fa fa-map-marker"></i></span> <span class="knViewLink__label"><span class="">Update Address for W/shop Lead Time</span></span> <!----></a></span></div></div>');
    }

    if (retry < 10 && (!status.lastVisitData || !status.addressData)){
      console.log('some status empty, wait',retry)
      setTimeout(() => {
        getWorkshopAvailability(status,useCustomerAddress, customAddress,retry+1)
      }, retry*500);
      return;
    }
  } catch (ex){
    console.log('getWorkshopAvailability EX',ex)
  }
}

function formatDateWA(input,emptyText='More than 60 days'){
    if (!input){
      return emptyText;
    } else {
      let date = new Date(input);
      return date.toLocaleDateString('en-UK',{"weekday":"short", "day":"numeric"})+'<br />'+date.toLocaleDateString('en-UK',{"month":"short"});
    }
}

function isTodayF(date){
  let today = new Date();
  return (today.toDateString() == date.toDateString())
}

function formatDateTimeUpdatedWA(input){
  let output = '';
  let date = new Date(input);
  if (!isTodayF(date)) output = formatDateGBShortNotYear(date)+' ';
  output = output + date.getHours()+':'+date.getMinutes().toString().padStart(2,'0');
  return output;
}

function getCustomAddressForTravelDistance(){
  console.log('getCustomAddressForTravelDistance')
  const userInput = prompt("Please enter Post Code or address for travel distance:"); 
  console.log(userInput)
  return getWorkshopAvailability(null,true,userInput);
}

function availabilityHTML(status,useCustomerAddress,customAddress){
  let regDate = newDateFromUK(vehicleRegDate($('div[class="field_318"]').text().trim()));
  console.log('regDate',regDate);
  let isVehicleNewerThen3Years = false;
  if (regDate && (new Date()-regDate)<1095*24*60*60*1000) isVehicleNewerThen3Years = true;
  console.log('isVehicleNewerThen3Years',isVehicleNewerThen3Years);
  let lastVisitedInClosest = false;
  let htmlTable = '<b>Workshop Availability</b><br />';
  if (customAddress) htmlTable += 'Workshop travel times shown for address: '+customAddress+'<br />';
  htmlTable += '<table><tr><td>Dealr</td><td><b>Travl<br>Time<br>For<br>Cust</b></td><td><b>M<br />O<br />T</b></td><td><b>Rcal<br>/Inv</b></td><td><b>All<br>Ser</b></td><td><b>D<br />I<br />A<br />G</b></td><td><b>C<br />&<br />D</b></td><td><b>W<br />A<br />I<br />T</b></td><td><b>Ubr<br>Or<br>Lift</b></td><td><b>Taka</b></td>'+(isVehicleNewerThen3Years?'<td><b>Tri<br />age</b></td>':'')+'</tr>';
  if (useCustomerAddress && status && status.addressData && status.addressData.closestD){
    for (let i = 0;i<status.addressData.closestD.length;i++){
      let avail = status.availabilityData.find(el => el.companyCode === status.addressData.closestD[i].companyCode);
      if (avail) htmlTable += '<tr><td>'+shorthenDealerName(status.addressData.closestD[i].name.replace('Stellantis &You',''))+(status.lastVisitData && status.addressData.closestD[i].companyCode===status.lastVisitData.mapLastDealerVisit?'<br /><b>Last<br />Vist</b>':'')+'</td><td>'+parseInt(status.addressData.closestD[i].duration).toFixed(0)+' min</td><td>'+formatDateWA(avail.work.find(el=>el.work==='MOT').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Recall').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Large service').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Diag').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='C&D').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Wait').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Lift').availability,'No serv')+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Takata').availability,'No serv')+'</td>'+(isVehicleNewerThen3Years?'<td>'+formatDateWA(avail.work.find(el=>el.work==='Triage').availability,'No serv')+'</td>':'')+'</tr>';
      if (status.lastVisitData && status.addressData.closestD[i].companyCode===status.lastVisitData.mapLastDealerVisit) lastVisitedInClosest = true;
    }
  }
  if (status && status.lastVisitData && status.lastVisitData!=='' && !lastVisitedInClosest){
    let avail = status.availabilityData.find(el => el.companyCode === status.lastVisitData.mapLastDealerVisit);
    if (avail) htmlTable += '<tr><td>'+shorthenDealerName(status.lastVisitData.lastDealerVisit.replace('Stellantis &You',''))+'<br /><b>Last<br />Vist</b></td><td></td><td>'+formatDateWA(avail.work.find(el=>el.work==='MOT').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Recall').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Large service').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Diag').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='C&D').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Wait').availability)+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Lift').availability,'No serv')+'</td><td>'+formatDateWA(avail.work.find(el=>el.work==='Takata').availability,'No serv')+'</td>'+(isVehicleNewerThen3Years?'<td>'+formatDateWA(avail.work.find(el=>el.work==='Triage').availability,'No serv')+'</td>':'')+'</tr>';
  }
  htmlTable += '</table>';
  if (!useCustomerAddress){
    htmlTable += '<div class="kn-details-link"><div class="kn-detail-body" style="padding: 0.375em 0;"><span><a onclick="return getWorkshopAvailability(null,true)" data-kn-id="76bbbce4-a39f-40d7-9a8b-752e695f4b8d" class="knViewLink kn-link kn-link-page knViewLink--page knViewLink--filled knViewLink--size-medium knViewLink--uppercase knViewLink--raised" data-vue-component="viewLink"><span class="knViewLink__icon knViewLink__icon--isLeft icon is-left"><i class="fa fa-map-marker"></i></span> <span class="knViewLink__label"><span class="">Click Here To Return Travel Time <br> & Workshop Availability For The 3 Closest Dealers</span></span> <!----></a></span></div></div>';
  }
  htmlTable += '<div class="kn-details-link"><div class="kn-detail-body" style="padding: 0.375em 0;"><span><a onclick="return getCustomAddressForTravelDistance();" data-kn-id="76bbbce4-a39f-40d7-9a8b-752e695f4b8d" class="knViewLink kn-link kn-link-page knViewLink--page knViewLink--filled knViewLink--size-medium knViewLink--uppercase knViewLink--raised" data-vue-component="viewLink"><span class="knViewLink__icon knViewLink__icon--isLeft icon is-left"><i class="fa fa-map-marker"></i></span> <span class="knViewLink__label"><span class="">Update Address for W/shop Lead Time</span></span> <!----></a></span></div></div>';
  console.log('htmlTable',htmlTable);
  $('div[id="view_3923"]>div').html(htmlTable);
}

function vehicleRegDate(vehDescription){
  if (!vehDescription.includes('registered on')) return null;
  return vehDescription.substr(vehDescription.indexOf('registered on ')+14,10);
}

function newDateFromUK(str){
    //console.log('newDateFromUK',str);
    if (str && str.split('/').length===3){
        if (isNaN(parseInt(str.split('/')[1]))) return undefined;
        return new Date(str.split('/')[1]+'/'+str.split('/')[0]+'/'+str.split('/')[2])
    } else { return undefined }
}

function shorthenDealerName(name){
  let nameA = name.split(' ');
  nameA = nameA.map(el => el.substring(0,5));
  return nameA.join(' ');
}

$(document).on('knack-view-render.view_4008', function(event, view, records) {
  $('[id="view_4008"]').hide();
});

var defineButtonsAll = [];

function syButtonsFilter(viewId,index){
  Knack.showSpinner();
  let dbView = defineButtonsAll.find(el => el.viewId === viewId);
  dbView.selectedIndex = index;
  let dbA1 = dbView.defineButtons[index];
  //console.log(viewId, index,dbA1,JSON.stringify(dbA1.filters));
  Knack.views['view_'+viewId].model.setFilters('{"match":"and","rules":'+JSON.stringify(dbA1.filters)+'}');
  Knack.views['view_'+viewId].model.fetch();
}

function renderSYSearchButtons(viewId, defineButtons){
  let dbA1 = defineButtonsAll.find(el => el.viewId === viewId);
  if (!dbA1){
    dbA1 = {viewId:viewId, defineButtons: defineButtons};
    defineButtonsAll.push(dbA1);
  }
  if ($('div[id="syButtons_'+viewId+'"]').length===0){
    let buttonsDiv = '<div id="syButtons_'+viewId+'" class="js-filter-menu tabs is-toggle is-flush"><ul>';
    buttonsDiv += dbA1.defineButtons.map((el,index) =>'<li><a id="syButtons_'+viewId+'_'+index+'" onclick="syButtonsFilter(\''+viewId+'\','+index+'); return false;"><span>'+el.linkText+'</span></a></li>').join('');
    buttonsDiv += '</ul></div>';
    $('div[id="view_'+viewId+'"] div[class="kn-records-nav"]').prepend(buttonsDiv);
  }
  if (dbA1.selectedIndex){
    $('div[id="syButtons_'+viewId+'"] li[class="is-active"]').removeClass('is-active');
    $('div[id="syButtons_'+viewId+'"] a[id="syButtons_'+viewId+'_'+dbA1.selectedIndex+'"]').parent().addClass('is-active');
    if (dbA1.defineButtons[dbA1.selectedIndex].filters.length>0){
      if ($('div[id="view_'+viewId+'"] li[class*="tag kn-tag-filter"]').length===0){
        console.log('index selected but not filtered')
        $('div[id="syButtons_'+viewId+'"] a[id="syButtons_'+viewId+'_'+dbA1.selectedIndex+'"]').click();
      }
    }
  }
  if (dbA1.selectedIndex && dbA1.defineButtons[dbA1.selectedIndex].filters){
    for (let i = 0;i<dbA1.defineButtons[dbA1.selectedIndex].filters.length;i++){
      console.log(dbA1.defineButtons[dbA1.selectedIndex].filters[i].field)
      $('li[class="tag kn-tag-filter kn-filter-'+dbA1.defineButtons[dbA1.selectedIndex].filters[i].field+'"]').hide();
    }
  }
}

$(document).on('knack-view-render.view_2686', function(event, view, records) {
  let defineButtons = [{linkText:'All',filters:[]},{linkText:'TODAY\'s Jobs',filters:[{"field_name":"CA Today's Jobs that Still Has Labour And/OR Parts still To Complete","field":"field_2279","value":true,"operator":"is"}]},{linkText:'Comp. TODAY',filters:[{"field_name":"Date/Time Workshop marked as job completed for today","field":"field_2719","value":true,"operator":"is not blank"}]},{linkText:'Time Agreed TODAY',filters:[{"field_name":"Agreed Collection Time with Customer","field":"field_1117","value":true,"operator":"is today"}]},{linkText:'Checked In TODAY',filters:[{"field_name":"Date Vehicle Checked In Onsite (From Autoline)","field":"field_763","value":true,"operator":"is today"}]},{linkText:'Write up TODAY',filters:[{"field_name":"Date/Time Technician Write up completed","field":"field_2722","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is today"}]},{linkText:'Ready to Invoice',filters:[{"field_name":"ready to invoice","field":"field_1717","value":"Parts + Labour","operator":"contains"}]},{linkText:'Currently Clocked',filters:[{"field":"field_1537","value":"Working on Currently","operator":"contains"}]},{linkText:'Never Clocked',filters:[{"field":"field_787","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is blank"}]},{linkText:'Parts Avail',filters:[{"field":"field_985","value":"Working On Currently","operator":"is blank"}]},{linkText:'Parts Unavail',filters:[{"field":"field_985","value":"Working On Currently","operator":"is not blank"}]},{linkText:'Wait. Auth (VHC)',filters:[{"field":"field_2297","value":"CPL","operator":"is"}]},{linkText:'No CA\'s Linked',filters:[{"field":"field_1121","value":"","operator":"is blank"}]},{linkText:'Outstanding Messages',filters:[{"field":"field_2578","value":"","operator":"is not blank"}]},{linkText:'i0001',filters:[{"field":"field_756","value":"i0001","operator":"is"}]},{linkText:'i0002',filters:[{"field":"field_756","value":"i0002","operator":"is"}]},{linkText:'Await\' Wash',filters:[{"field":"field_2201","value":"Added to Service Wash List","operator":"is"}]},{linkText:'Wash Comp',filters:[{"field":"field_2201","value":"Service Wash Complete","operator":"is"}]},{linkText:'C/D Collected',filters:[{"field":"field_2785","value":{"date":"","time":"","am_pm":"Invalid date","hours":null,"all_day":false,"minutes":null},"operator":"is not blank"}]}]
  renderSYSearchButtons('2686',defineButtons);
  let addFilters = document.querySelector('a[class="kn-add-filter kn-button is-small"]');
  console.log('addFilters',addFilters)
  if (addFilters){
    let addedAlowedFilters = ['field_1121']
    addFilters.onclick = function(){
      setTimeout(function () { 
        console.log('remove from filter')
        for (let i = 0;i<$('div[id="kn-filters-form"] select[name="field"] option').length;i++){
          let filterField = $('div[id="kn-filters-form"] select[name="field"] option').eq(i).attr('value');
          let allowFilterField = addedAlowedFilters.find(el => el===filterField);// || defineButtons.find(el => el.filters.find(el2 => el2.field === filterField));
          if (!allowFilterField){
            $('div[id="kn-filters-form"] select[name="field"] option').eq(i).hide();
          }
        }
      }, 200);
    }
  }
});

//trigger when Jobcard report Created (No DIDA)
$(document).on('knack-form-submit.view_3133', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/wzbopamu9wqee7vp8xy0wlvpbz67a4oi", {"Record ID":data.id},"Job Card Report Created No DIDA")
});

//trigger when Jobcard report Created (With DIDA)
$(document).on('knack-form-submit.view_3161', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/wzbopamu9wqee7vp8xy0wlvpbz67a4oi", {"Record ID":data.id},"Job Card Report Created with DIDA")
});

//Parts Ordering View  
$(document).on('knack-view-render.view_3773', function(event, view, data) {
  $('.field_3181').hide();
  console.log("View render event triggered");

 // Function to load a script and return a promise
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src + '?cache-bust=' + new Date().getTime(); // Add cache-busting
      script.onload = () => resolve(script);
      script.onerror = () => reject(new Error(`Script load error for ${src}`));
      document.head.append(script);
    });
  }
  let trId = '';
  // Load jQuery first
  loadScript('https://code.jquery.com/jquery-3.5.1.min.js').then(() => {
    // Load other scripts after jQuery is loaded
    console.log("jquerry installed");
    return Promise.all([
      loadScript('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'),
    ]);
  }).then(() => {
    
    // Append CSS files after all scripts are loaded
    $('head').append('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" type="text/css" />');          
    let modelHtml = '';


    let keyValueStore = '';
    $('tr').mouseenter(function() {
      trId = $(this).attr('id');
    console.log('Mouse is on before mouse leave: ' + trId);

    });
          $(document).on('mouseleave', '.fa-cart-arrow-down', function() {

            keyValueStore = '';
            $('tr').mouseenter(function() {
              trId = $(this).attr('id');
              console.log('Mouse is on: ' + trId);
          });

          

                $('#myModal').remove();
          $('.modal-backdrop').remove();

                let modelHtml = '';



      // Append the modal structure to the body
      let partsModelHTML = '';

      if(partsModelHTML === ''){

        partsModelHTML = callGetHttpRequest('https://stellantisandyoucouk.github.io/modalHTML/modal.html');
        $('body').append(partsModelHTML);

      }



      // if (partsModelHTML === '') {
      //   partsModelHTML = $.ajax({
      //     type: "GET",
      //     url: 'https://stellantisandyoucouk.github.io/modalHTML/modal.html',
      //     cache: false,
      //     async: false
      //   }).responseText;
      // }
      // $('body').append(partsModelHTML);


      // Show the modal
      $('#myModal').modal({
        keyboard: true,
        show: true,
        handleUpdate: true
      });



      Knack.views.view_3773.model.data.models.forEach((model)=>{

        if(model.id===trId){
          keyValueStore = model.attributes.field_3181_raw
        }

      })
      // const key_value_store = JSON.parse(Knack.views['view_3773'].model.attributes['field_250'])

      let responseJson;
      let output;
      if(modelHtml==='' && keyValueStore != ''){

        const response = callGetHttpRequest(`https://api.apify.com/v2/key-value-stores/${keyValueStore}/records/test.html`);
        responseJson = callGetHttpRequest('https://api.apify.com/v2/key-value-stores/wTDYKllK5dQREMpAR/records/OUTPUT');
        output = JSON.parse(responseJson);
        if(output.WIP==='Test'){
          // TODO: Changed the WIP
          output.WIP='';
        }

         $('#part').append(response);
   
         }

         

//FIXME: Hardcoded WIP
      let payload = {
        "keyValueStoreId": keyValueStore,
        // "WIP": 'output.WIP',
        "WIP": '64046',
        "AccountNumber": output.AccountNumber
      }
      
      if(payload.WIP !== '' && payload.AccountNumber !== ''){      
        
         const responseInvoices = callPostHttpRequest("https://hook.eu1.make.celonis.com/njmr76ctfodft44xtbo77uy3bvbzq287", payload,"Servicebox invoice find");
        let invoices = JSON.parse(responseInvoices);

        
        
        const rows = invoices
      .map(
        (invoice) => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
    ${invoice.PartNumber}
    <span class="badge bg-primary rounded-pill" style="margin-left: 0.2rem;">${parseInt(invoice.OrderQuantity)}
          </span>
  </li>`
      )
      .join("");

//FIXME: Invoiced and Part Numbers for modal pop up
    const htmxTest = `<div class="modal-header">
      <h4 class="modal-title">Invoiced: 14638876</h4>
    </div>
    <div class="modal-body">
      <div class="modal-body">
    <ul class="list-group">${rows}</ul>
  </div>
    </div>
    <div class="modal-footer"></div>`

  $('.invoiced').append(htmxTest);
}else{
  $('.invoiced').append(`<p>Can find the invoice at the moment</p>`);
}

      // if (modelHtml === '' && keyValueStore != '') {
      //   fetch(`https://api.apify.com/v2/key-value-stores/${keyValueStore}/records/test.html`)
      //     .then(response => {
      //       if (!response.ok) {
      //         throw new Error('Network response was not ok');
      //       }
      //       return response.text();
      //     })
      //     .then(text => {
      //       modelHtml = text;
      //       $('#akif').append(modelHtml); // Replace #someElement with the actual target

      //     })
      //     .catch(error => {
      //       console.error('There was a problem with the fetch operation:', error);
      //     });
      // }



      // $('#searchButton').on('click', function() {
      //   Swal.fire({
      //     title: "Lookup Bin",
      //     input: "text",
      //     inputAttributes: {
      //       autocapitalize: "on"
      //     },
      //     showCancelButton: true,
      //     confirmButtonText: "Find",
      //     showLoaderOnConfirm: true,
      //     preConfirm: async (binLocation) => {
      //       try {
      //         payload = `{"PartNumber": ${input}}`;
      //         const url = `https://hook.eu1.make.celonis.com/f3r16bgultmqh9gyyn5nexwbdll6elgs`;
      //         const responseBinLocation = callPostHttpRequest(url, payload,"Servicebox bin location find");
              
      //         if (!responseBinLocation.ok) {
      //           return Swal.showValidationMessage(`Request failed: ${responseBinLocation.statusText}`);
      //         }
      //         return JSON.parse(responseBinLocation);
      //       } catch (error) {
      //         Swal.showValidationMessage(`Request failed: ${error}`);
      //       }
      //     },
      //     allowOutsideClick: () => !Swal.isLoading()
      //   }).then((result) => {
      //     if (result.isConfirmed) {
      //       Swal.fire({
      //         title: `${result.value.binLocation}`,
      //       });
      //     }
      //   });
      // });
   $('#searchButton').on('click', function() {
      Swal.fire({
        title: "Look Up Bin Location",
        input: "text",
        inputAttributes: {
          autocapitalize: "off"
        },
        showCancelButton: true,
        confirmButtonText: "Look up",
        showLoaderOnConfirm: true,
        preConfirm: async (login) => {
          try {
            const githubUrl = `
              https://hook.eu1.make.celonis.com/f3r16bgultmqh9gyyn5nexwbdll6elgs
            `;
            const response = callPostHttpRequest(githubUrl, {"BinLocation":login},"Servicebox bin location find");
            console.log(JSON.parse(response))
            if (!response) {
              return Swal.showValidationMessage(`
                Hey
              `);
            }
            return JSON.parse(response);
          } catch (error) {
            Swal.showValidationMessage(`
              Request failed: ${error}
            `);
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result) {
          Swal.fire({
            title: `Bin Location: ${result.value.BinLocation.replace('SRETURNS', '').replace('RETURNS', '').trim()}`,
            imageUrl: result.value.avatar_url
          });
        }
      });

      });

      // Remove the modal from the DOM when it's closed to prevent clutter
      $('#myModal').on('hidden.bs.modal', function() {
        $(this).remove();
      });

      $('.modal-backdrop').on('hidden.bs.modal', function() {
        $(this).remove();
      });

      console.log("Mouse leave detected");
    });
  }).catch((error) => {
    console.error("Failed to load scripts:", error);
  });
});


$(document).on('knack-scene-render.scene_1230', function(event, scene) {
  let startTime = new Date(); // Log start time
  console.log("User started using the app at: " + startTime);

  // Trigger when the user leaves the page
  $(window).on('beforeunload', function() {
    let endTime = new Date(); // Log end time
    let timeSpent = (endTime - startTime) / 1000; // Time spent in seconds
    console.log("User ended using the app at: " + endTime);
    console.log("Time spent (seconds): " + timeSpent);

    // Send the data using the sendBeacon API to ensure it completes before page unloads
    let payload = JSON.stringify({
        topic: "application-usage",
        message: "User used the application for " + timeSpent + " seconds",
        priority: 5  // Optional: Set priority for ntfy message
    });

    if (navigator.sendBeacon) {
        navigator.sendBeacon('https://ntfy.armojo.com/stapleton', payload);
        console.log("Usage time sent to ntfy server with sendBeacon.");
    } else {
        // Fallback to synchronous AJAX in case sendBeacon is not supported
        $.ajax({
            url: 'https://ntfy.armojo.com/stapleton',
            type: 'POST',
            data: payload,
            contentType: "application/json",
            async: false, // Make it synchronous to ensure it completes before the page unloads
            success: function(response) {
                console.log("Usage time sent to ntfy server.");
            },
            error: function(error) {
                console.error("Error sending usage time", error);
            }
        });
    }

    // Clear the stored start time to indicate the session ended
    localStorage.removeItem('app_start_time');
});

});
 
//hide customer email address from Aftersales Follow up call "Pending"
$(document).on('knack-view-render.view_632', function (event, view, data) {
	  $('th[class="field_2189"]').hide();
    $('td[class*="field_2189"]').hide();
}); 

//hide customer email address from Aftersales Follow up call "Awaiting"
$(document).on('knack-view-render.view_738', function (event, view, data) {
	  $('th[class="field_2189"]').hide();
    $('td[class*="field_2189"]').hide();
}); 



        $(document).on('knack-view-render.view_4531', function(event, scene) {

          //Hover for Stapleton Tyres
          //scene, view, field to have hover, hover info
          //Service Details over Reg 
            tooltipsTable('1370','4531','field_3597','field_3435');  
                $('th[class="field_3597"]').hide();
                $('td[class*="field_3597"]').hide();
            
            
            tooltipsTable('1370','4531','field_3856','field_3855');  

                $('th[class="field_3856"]').hide();
                $('td[class*="field_3856"]').hide();   
        });



        $(document).on('knack-view-render.view_4535', function(event, scene) {

                //Hover for Stapleton Tyres
                //scene, view, field to have hover, hover info
                //Service Details over Reg 
                tooltipsTable('1370','4535','field_3597','field_3435');
                 
  
                    $('th[class="field_3597"]').hide();
                    $('td[class*="field_3597"]').hide();

                tooltipsTable('1370','4535','field_3856','field_3855'); 
                    $('th[class="field_3856"]').hide();
                    $('td[class*="field_3856"]').hide(); 
        });
    
    

        $(document).on('knack-view-render.view_4518', function(event, scene) {

              //Hover for Stapleton Tyres
              //scene, view, field to have hover, hover info
              //Service Details over Reg 
            tooltipsTable('1370','4518','field_3597','field_3435');  
              
                $('th[class="field_3597"]').hide();
                $('td[class*="field_3597"]').hide();

            tooltipsTable('1370','4518','field_3856','field_3855');
                $('th[class="field_3856"]').hide();
                $('td[class*="field_3856"]').hide();  
        });
        
        

        // Check Email valid in Tyre Report
        $(document).on('knack-view-render.view_4524', function(event, view, data) {
                
          console.log("view 4524")
          let howManyEmailsBeforeFormSubmit = $("#field_3569").val().split("\n").length
                    
          $("button.kn-button.is-primary").on("click", function() {
              console.log(" 4524 form submitted")
            let howManyEmailsAfterFormSubmit = $("#field_3569").val().split("\n").length

            if(howManyEmailsAfterFormSubmit > howManyEmailsBeforeFormSubmit){

              for (let index = howManyEmailsBeforeFormSubmit; index < howManyEmailsAfterFormSubmit; index++) {
                  let email = $("#field_3569").val().split("\n")[index];
                  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                  if(!pattern.test(email)){
                             event.preventDefault(); // Stop form submission
                             if(email.length===0){
                              alert(`Please remove the empty space at the end before updating!`); // Show an alert

                             }else{
                              alert(`${email} is not a valid email!`); // Show an alert

                             }
                              $("#field_3569").addClass('input-error'); // Add error styling
                              $("#field_3569").focus(); // Focus on the empty field
                              return false; // Explicitly stop submission
                  }else{
                                      console.log(`Test Email for is ${email}: ${pattern.test(email)}`);
                                      $("#field_3569").removeClass('input-error');


                  }
              }    
            }    

          })
        });  


// If it's search we are looking view not table.
               $(document).on('knack-view-render.view_4776', function(event, view, data) {

                      
// Whenever we have time maybe 5 minutes i can show you find css elements here we are finding css elements by using this $('')
// if html element has id pick id <a href="something.com" id="important">
// you can pick this with $('#important')
// if it's class like this example in 4411 line these all the class kn-view kn-table view_4776 find these class and pick tr inside these class elements.
                         let rows = $('div[class="kn-view kn-table view_4776"] table tr');
                          console.log('rows',rows.length);
                          for (i = 1; i < rows.length; i++) {
                            let currentRow = rows[i];
                              console.log("Current Row:" +currentRow);
                            const createClickHandler = function(row) {
                              return function() {
                                var cell = row.id;
                                
                                console.log("Send request", cell);
                                callPostHttpRequest("https://hook.eu1.make.celonis.com/akfoo8ipo2cgwhy6prhc67dmxia455xz", {"recordId":cell, "Scenario":"prepare policy approval WIP" },"Prepare Policy Approval WIP");
                              };
                            };
                            if (currentRow.id!==''){
                                console.log(currentRow.id);
                              currentRow.children[6].onclick = createClickHandler(currentRow);
                            }
                          }
                    
                  
          
     
        });


               $(document).on('knack-view-render.view_4776', function(event, view, data) {
                         let rows = $('div[class="kn-view kn-table view_4776"] table tr');
                          console.log('rows',rows.length);
                          for (i = 1; i < rows.length; i++) {
                            let currentRow = rows[i];
                              console.log("Current Row:" +currentRow);
                            const createClickHandler = function(row) {
                              return function() {
                                var cell = row.id;
                                
                                console.log("Send request", cell);
                                callPostHttpRequest("https://hook.eu1.make.celonis.com/1znvcwxp9k8q82jg36wkyxa3j1s9en3p", {"recordId":cell, "Scenario":"prepare policy approval WIP" },"Prepare Policy Approval WIP");
                              };
                            };
                            if (currentRow.id!==''){
                                console.log(currentRow.id);
                              currentRow.children[7].onclick = createClickHandler(currentRow);
                            }
                          }
                    
                  
          
     
        });

// Refresh when data appears for policy WIP view

$(document).on("knack-scene-render.scene_1446", function(event, scene, data) {
    let refreshData = [
      {
          mainField : 'field_3703', //Policy WIP Details
          views:['4787','4789']
      }
    ]
    sceneRefresh(refreshData);
  });
  


$(document).on('knack-view-render.view_4863', function (event, view, data) {
  embedPhotoApp();
  let appSettings3901 = {
    spiritLine : false,
    imageOverlay: null,
    imageOverlayEffect : false,
    imageOverlayOpacity : null,
    allowLandscape : true,
    allowPortrait : true,
    actionAfterPhoto : 'readable', // none, readable, compare,
    actionAfterPhotoReadableText : 'Is the tyre description readable?',
    uploadMethod : 'make', //knack, make, field
    uploadWebhook : 'https://hook.eu1.make.celonis.com/ejyphheycdzary55o5mhb58auayu7ln5',
    resizeImageMaxHeight : 1000,
    resizeImageMaxWidth : 1000,
    app_id : '6040dd9a301633001bca5b4e',
    leavePhotoAppOpen : true
  }
  createPhotoButton(appSettings3901,'3901');

  //createOfflineFormSubmit('3841','6040dd9a301633001bca5b4e',motabReturnsImageUpload,getRecordIdFromHref(location.href))
});

$(document).on('knack-scene-render.scene_1480', function(event, scene) {
 recursiveSceneRefresh('1480',['view_4863','view_4911'],10000)
});


// Service To sales -GET HPI Metrics upon clicking search icon
// If it's search we are looking view not table.
               $(document).on('knack-view-render.view_4431', function(event, view, data) {

// if html element has id pick id <a href="something.com" id="important">
// you can pick this with $('#important')
// if it's class like this example in 4411 line these all the class kn-view kn-table view_4776 find these class and pick tr inside these class elements.	
                         let rows = $('div.kn-view.kn-table.view_4431 table.kn-table > tbody > tr');
                          // console.log('rows',rows.length);
                          for (i = 0; i < rows.length; i++) {
                            let currentRow = rows[i];
                              // console.log("Current Row:", currentRow.outerHTML);
                            const createClickHandler = function(row) {
                              return function() {
                                var cell = row.id;
                                
                                // console.log("Send request", cell);
                                callPostHttpRequest("https://hook.eu1.make.celonis.com/dea132usj3mfn9pgvhhoo43m8ktx12s9", {"recordId":cell, "Scenario":"Service to sales - get HPI metrics" },"Service to sales - get HPI metrics");
                              };
                            };
                            if (currentRow.id!==''){
                                // console.log(currentRow.id);
                              currentRow.children[21].onclick = createClickHandler(currentRow);
                            }
                          }
		             });


  $(document).on("knack-scene-render.scene_1512", function(event, scene) {
    $(this).find('.Modal_for_scene_1512').addClass('Modal_for_' + Knack.router.current_scene_key)
	//line above is related to the modal pop up - please look at aftersales css Lines 3062-3065 or copy the below and adjust scene as necessary
/*.Modal_for_scene_769 {
    width: 90%;
    height: 90vh;
}*/
	  Console.log("Found modal");
    let refreshData = [
      {
          mainField : 'field_3319', //recall-recheck - field must be empty for refresh to occur
          views:['4945']
      }
    ]
	  Console.log("Refreshing");
    sceneRefresh(refreshData);
  });
