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

//HIDE THE LOGO AND logged in user in all pages
$(document).on('knack-view-render.any', function (event, view, data) {
	$('[class="kn-container"]').hide();
	$('[class="kn-info kn-container"]').hide();
  submitUserLoginForm();
});

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
  if (url.indexOf('token=')!==-1){
    let tokenS = url.substring(url.indexOf('token=')+6);
    if (tokenS.indexOf('&')!==-1){
      tokenS = tokenS.substring(tokenS,tokenS.indexOf('&'));
    } 
    return decodeURIComponent(tokenS);
  } else { return null}
}

var submitUserLoginForm = function() {
  let url = window.location.href;
    
  let token = getTokenFromURL(url);

  if (!token){
    return;
  }

  token = atob(token);
  if (!token.includes('#')){
    console.log('Wrong token');
    return;
  }
  let userName2 = token.split('#')[0];
  let password = token.split('#')[1];

  if (Knack.session.user && userName2!==Knack.session.user.values.email.email){
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

/*//MASTER/SLAVE CONNECT
//Scenes where the App is accessed from the Master App and needs to login
var loginSceneNames = ["scene_20","scene_32","scene_38","scene_44","scene_52","scene_57","scene_111","scene_73","scene_74","scene_224","scene_340"]; ///add scene numbers as necessary
loginSceneNames.forEach(functionName);
function functionName(selector_scene){
  $(document).on("knack-scene-render." + selector_scene, function(event, scene, data) {
    //console.log(selector_scene)
    submitUserLoginForm();
  });
}*/

$(document).on('knack-view-render.any', function (event, view, data) {
  //  ---------Auto Capitalise Regestration input-------------
  $('input#field_31').keyup(function() {
      this.value = this.value.toUpperCase().replace(new RegExp(' ','g'),'').replace(new RegExp('	','g'),''); 
  });
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
    sendErrorToIntegromat(exception, callName);
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

//function saveStats(stats){
  //console.log('saveStats');
  //let commandURL = "https://hook.integromat.com/cqqou5f36rhra151jzixw3mmhm5fxf1a" ;
  //let textFromStats = 'Duration: '+stats.duration.toLocaleString("en-GB", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  //for (let i = 0;i<stats.log.length;i++){
    //textFromStats += ', ' + stats.log[i].one + ': '+stats.log[i].duration.toLocaleString("en-GB", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  //}
  //let dataToSend = {"knackId":recordId,"stats":stats, 'statsText':textFromStats}; 
  //console.log(dataToSend);
  //$.ajax({
    //url: commandURL,
    //type: 'POST',
    //contentType: 'application/json',
    //data: JSON.stringify(dataToSend),
    //async: true
  //})
//}

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
  /*
  let sceneEl = document.getElementById('kn-scene_24');
  let sections = document.createElement('div');
  sections.setAttribute("id", "sections");
  let sectionLeft = document.createElement('div');
  sectionLeft.setAttribute("id", "sectionLeft");
  let sectionCenter = document.createElement('div');
  sectionCenter.setAttribute("id", "sectionCenter");
  let sectionRight = document.createElement('div');
  sectionRight.setAttribute("id", "sectionRight");
  sceneEl.prepend(sections);
  sections.prepend(sectionRight)
  sections.prepend(sectionCenter)
  sections.prepend(sectionLeft)
  sectionLeft.appendChild(document.getElementById('view_95'));
  sectionLeft.appendChild(document.getElementById('view_98'));
  sectionLeft.appendChild(document.getElementById('view_131'));
  sectionLeft.appendChild(document.getElementById('view_148'));
  sectionLeft.appendChild(document.getElementById('view_170'));
  sectionCenter.appendChild(document.getElementById('view_97'));
  sectionCenter.appendChild(document.getElementById('view_114'));
  sectionCenter.appendChild(document.getElementById('view_121'));
  sectionCenter.appendChild(document.getElementById('view_122'));
  sectionCenter.appendChild(document.getElementById('view_117'));
  sectionCenter.appendChild(document.getElementById('view_149'));
  sectionRight.appendChild(document.getElementById('view_96'));
  sectionRight.appendChild(document.getElementById('view_133'));
  sectionRight.appendChild(document.getElementById('view_115'));
  */
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
  //formatScene24();
  setTimeout(function(){
    refreshScene24();
  }, 100);
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
      name : 'EMAC Service plan - offer',
      mainField : 'field_348', //EMAC - service plan Summary = Service plan
      views:['378','3504']
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

  var recordId = '';
  $(document).on('knack-form-submit.view_71', function(event, view, data) { 
    let commandURL = "https://hook.integromat.com/53yx2tuy820lvzuobdqex8jem2utgwil" ;
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
          showNotification('Virtual reception','','New Aftersales Virtual Reception Message')
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
              showNotification(notifTitle,'',fillTextFromData(notifText, newRecOne.attributes))
            }
          } else {
            showNotification(notifTitle,'','Detail not on current list page')
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


  
$(document).on('knack-form-submit.view_338', function(event, view, data) { 
  let commandURL = "https://hook.integromat.com/82cg83yb0g9ekakjvn4ep8k8xh27kyps" ;
  let dataToSend = Object.assign({"source":"EMACOfferRefresh"}, data); 
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

  refreshView('378', true);
  setTimeout(function(){
    let refreshData = [
      {
        name : 'EMAC Service plan - offer',
        mainField : 'field_348', //EMAC - service plan Summary = Service plan
        views:['378']
      }
    ]
    sceneRefresh(refreshData);
  }, 1000);
});


//trigger Maxoptra webhook v2

$(document).on('knack-form-submit.view_225', function(event, view, data) {

try{

    let commandURL = "https://hook.integromat.com/hbenwdqwud64hds9kjcz7hc5x13ciioy";
    let dataToSend = JSON.stringify({"Record ID":data.id});

    var rData = $.ajax({
        url: commandURL,
        type: 'POST',
        contentType: 'application/json',
        data: dataToSend,
        async: false
    }).responseText;    
}catch(exception){
    console.log("error");
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let commandURL = "https://hook.integromat.com/bxfn25wkj67pptq9bniqmpvvjg868toi";
    let dataToSend = JSON.stringify({"Source":"Javascript error", "Function": "Scenario DESCRIPTION what for the error webhook",
    "Payload": data, "userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "Exception": exception.message, "dateTime": dateTime});
    var rData = $.ajax({
       url: commandURL,
       type: 'POST',
       contentType: 'application/json',
       data: dataToSend,
       async: false
    }).responseText;
}
});

//trigger Aftersales Tyre dealer Stock Lookup

/*$(document).on('knack-form-submit.view_1474', function(event, view, data) {
try{
    let commandURL = "https://hook.eu1.make.celonis.com/95g8pth4f57ytmkkh6i4cei4ks9df5a8";
    let dataToSend = JSON.stringify({"Record ID":data.id, "REG":data.field_31, "POS":data.field_443});
    var rData = $.ajax({
        url: commandURL,
        type: 'POST',
        contentType: 'application/json',
        data: dataToSend,
        async: false
    }).responseText;    
    //let refreshData = [
   //   {
    //      mainField : 'field_605', //Tyres
   //       views:['229']
   //  }
   // ]
    sceneRefresh(refreshData);
}catch(exception){
    console.log("error");
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    let commandURL = "https://hook.integromat.com/bxfn25wkj67pptq9bniqmpvvjg868toi";
    let dataToSend = JSON.stringify({"Source":"Javascript error", "Function": "Scenario DESCRIPTION what for the error webhook",
    "Payload": data, "userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "Exception": exception.message, "dateTime": dateTime});
    var rData = $.ajax({
       url: commandURL,
       type: 'POST',
       contentType: 'application/json',
       data: dataToSend,
       async: false
    }).responseText;
}
}); */

//trigger get tyres and prices from customer job card
$(document).on('knack-form-submit.view_1474', function(event, view, data) { 
    
    try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/f3xcida5tqk6fybgpkga8p9gn7ek6e7o";
        let dataToSend = JSON.stringify({"Record ID":data.id, "REG":data.field_31, "POS":data.field_443, "Dealer":data.field_411});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger get tyres and prices from customer job card");
    }
});

  //trigger get tyres and prices from pre-visit jobcard
$(document).on('knack-form-submit.view_3515', function(event, view, data) { 
    
    try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/f3xcida5tqk6fybgpkga8p9gn7ek6e7o";
        let dataToSend = JSON.stringify({"Record ID":data.id, "REG":data.field_31, "POS":data.field_443, "Dealer":data.field_411});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger get tyres and prices from customer job card");
    }
});
  

/*trigger get tyres and prices for a selected dealer
$(document).on('knack-form-submit.view_1474', function(event, view, data) { 
    
    try{
        
        let commandURL = "https://hook.eu1.make.celonis.com/osrisywv6fufmcdbf7ih8bc1yfrlvpq8";
        let dataToSend = JSON.stringify({"Record ID":data.id, "Selected Dealer":data.field_411});
	    
    let refreshData = [
      {
          mainField : 'field_575', //Autoline Tyre Stock For Dealer
          views:['1475']
      }
    ]
    
        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger get selected dealer tyres");
    }
});
*/
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

//trigger get tyres and prices for a selected dealer from modal view
$(document).on('knack-form-submit.view_1484', function(event, view, data) { 
    
    try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/osrisywv6fufmcdbf7ih8bc1yfrlvpq8";
        let dataToSend = JSON.stringify({"Record ID":data.id, "Selected Dealer":data.field_411});
	    
//   let refreshData = [
 //     {
 //         mainField : 'field_575', //Autoline Tyre Stock For Dealer
  //   views:['1475']
   //   }
  //  ]
    
        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger get selected dealer tyres");
    }
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

function sendErrorToIntegromat(exception, name){
  console.log("error");
  const today = new Date();
  const date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date+' '+time;

  let commandURL = "https://hook.integromat.com/bxfn25wkj67pptq9bniqmpvvjg868toi";
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



//**Trigger Text To Customer To Complete Exit Survey At Workshop "Check Out"
$(document).on('knack-form-submit.view_318', function(event, view, data) { 
    
    try{
        

        let commandURL = "https://hook.integromat.com/wio8wmbeqg4p81kwshmegg7h7fsfawz7";
        let dataToSend = JSON.stringify({"Record ID":data.id});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger Text To Customer To Complete Exit Survey At Workshop \"Check Out\"");
    }
});


//**Trigger Aftersales - Follow Up call - Text. 
$(document).on('knack-form-submit.view_646', function(event, view, data) { 
    
    try{
        

        let commandURL = "https://hook.integromat.com/vkginb5nf78dhi268ujtexqrctayfuab";
        let dataToSend = JSON.stringify({"Record ID":data.id});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Aftersales - Follow Up Call Email");
    }
});

//**Trigger Aftersales - Exit Survey Email From Insecure (Customer Phone)
$(document).on('knack-form-submit.view_310', function(event, view, data) { 
    
    try{
        

        let commandURL = "https://hook.integromat.com/8k4weh9vuci1ffkk2ber72azmqjhmbvv";
        let dataToSend = JSON.stringify({"Record ID":data.id});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Aftersales - Exit Survey Email from Insecure (customer phone)");
    }
});


// ----------  refresh customer account applications table every 60 seconds but not the page itself  ----------
// ----------  efresh customer account applications report every 60 seconds but not the page itself  ----------

$(document).on('knack-scene-render.scene_111', function(event, scene) {
 recursivecallscene_111();
});

function recursivecallscene_111(){
 setTimeout(function () { if($("#view_359").is(":visible")==true){ Knack.views["view_359"].model.fetch();}if($("#view_634").is(":visible")==true){ Knack.views["view_634"].model.fetch();}recursivecallscene_111(); }, 100000);
}

//trigger Tarot API
$(document).on('knack-form-submit.view_1106', function(event, view, data) {

try{

    let commandURL = "https://hook.eu1.make.celonis.com/auyd5lsbizh311g5uzi5pat3ir7bra3w";
    let dataToSend = JSON.stringify({"Record ID":data.id});

    var rData = $.ajax({
        url: commandURL,
        type: 'POST',
        contentType: 'application/json',
        data: dataToSend,
        async: false
    }).responseText;    
}catch(exception){
    console.log("error");
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let commandURL = "https://hook.integromat.com/bxfn25wkj67pptq9bniqmpvvjg868toi";
    let dataToSend = JSON.stringify({"Source":"Javascript error", "Function": "Scenario DESCRIPTION what for the error webhook",
    "Payload": data, "userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "Exception": exception.message, "dateTime": dateTime});
    var rData = $.ajax({
       url: commandURL,
       type: 'POST',
       contentType: 'application/json',
       data: dataToSend,
       async: false
    }).responseText;
}
});

//Trigger tarot v2 (Second column)
$(document).on('knack-form-submit.view_1298', function(event, view, data) {

try{

    let commandURL = "https://hook.eu1.make.celonis.com/a45crmnl4nnfws8iww60ro6teti10t7g";
    let dataToSend = JSON.stringify({"Record ID":data.id});

    var rData = $.ajax({
        url: commandURL,
        type: 'POST',
        contentType: 'application/json',
        data: dataToSend,
        async: false
    }).responseText;    
}catch(exception){
    console.log("error");
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let commandURL = "https://hook.integromat.com/bxfn25wkj67pptq9bniqmpvvjg868toi";
    let dataToSend = JSON.stringify({"Source":"Javascript error", "Function": "Scenario DESCRIPTION what for the error webhook",
    "Payload": data, "userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "Exception": exception.message, "dateTime": dateTime});
    var rData = $.ajax({
       url: commandURL,
       type: 'POST',
       contentType: 'application/json',
       data: dataToSend,
       async: false
    }).responseText;
}
});



//trigger aftersales - wip management notes to update

$(document).on('knack-form-submit.view_654', function(event, view, data) {

try{

    let commandURL = "https://hook.integromat.com/s8j9klwniouvc81742i1hy8yxtc822ut";
    let dataToSend = JSON.stringify({"Record ID":data.id, "Manager's Notes":data.field_1015_raw, "userName": Knack.getUserAttributes().name, "NOM_WIP_REG":data.field_2190_raw, "Nom_wip":data.field_558_raw});

    var rData = $.ajax({
        url: commandURL,
        type: 'POST',
        contentType: 'application/json',
        data: dataToSend,
        async: false
    }).responseText;    
}catch(exception){
    console.log("error");
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let commandURL = "https://hook.integromat.com/bxfn25wkj67pptq9bniqmpvvjg868toi";
    let dataToSend = JSON.stringify({"Source":"Javascript error", "Function": "Scenario DESCRIPTION what for the error webhook",
    "Payload": data, "userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "Exception": exception.message, "dateTime": dateTime});
    var rData = $.ajax({
       url: commandURL,
       type: 'POST',
       contentType: 'application/json',
       data: dataToSend,
       async: false
    }).responseText;
}
});  

//trigger aftersales - admin to uploadcase/warranty evidence and update notes

$(document).on('knack-form-submit.view_3471', function(event, view, data) {

try{

    let commandURL = "https://hook.eu1.make.celonis.com/sopmgf4kiapu7epd6dsulrawendsamtd";
    let dataToSend = JSON.stringify({"Record ID":data.id, "Manager's Notes":data.field_1015_raw, "userName": Knack.getUserAttributes().name, "NOM_WIP_REG":data.field_2190_raw, "Nom_wip":data.field_558_raw});

    var rData = $.ajax({
        url: commandURL,
        type: 'POST',
        contentType: 'application/json',
        data: dataToSend,
        async: false
    }).responseText;    
}catch(exception){
    console.log("error");
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let commandURL = "https://hook.integromat.com/bxfn25wkj67pptq9bniqmpvvjg868toi";
    let dataToSend = JSON.stringify({"Source":"Javascript error", "Function": "Scenario DESCRIPTION what for the error webhook",
    "Payload": data, "userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "Exception": exception.message, "dateTime": dateTime});
    var rData = $.ajax({
       url: commandURL,
       type: 'POST',
       contentType: 'application/json',
       data: dataToSend,
       async: false
    }).responseText;
}
});  
//trigger aftersales - admin to uploadcase/warranty evidence and update notes

$(document).on('knack-form-submit.view_3472', function(event, view, data) {

try{

    let commandURL = "https://hook.eu1.make.celonis.com/sopmgf4kiapu7epd6dsulrawendsamtd";
    let dataToSend = JSON.stringify({"Record ID":data.id, "Manager's Notes":data.field_1015_raw, "userName": Knack.getUserAttributes().name, "NOM_WIP_REG":data.field_2190_raw, "Nom_wip":data.field_558_raw});

    var rData = $.ajax({
        url: commandURL,
        type: 'POST',
        contentType: 'application/json',
        data: dataToSend,
        async: false
    }).responseText;    
}catch(exception){
    console.log("error");
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let commandURL = "https://hook.integromat.com/bxfn25wkj67pptq9bniqmpvvjg868toi";
    let dataToSend = JSON.stringify({"Source":"Javascript error", "Function": "Scenario DESCRIPTION what for the error webhook",
    "Payload": data, "userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "Exception": exception.message, "dateTime": dateTime});
    var rData = $.ajax({
       url: commandURL,
       type: 'POST',
       contentType: 'application/json',
       data: dataToSend,
       async: false
    }).responseText;
}
});  
      
//trigger aftersales update notes triggered from C/D Driver where customer signs work 

$(document).on('knack-form-submit.view_3221', function(event, view, data) {

try{

    let commandURL = "https://hook.integromat.com/s8j9klwniouvc81742i1hy8yxtc822ut";
    let dataToSend = JSON.stringify({"Record ID":data.id, "Manager's Notes":data.field_1015_raw, "userName": Knack.getUserAttributes().name, "NOM_WIP_REG":data.field_2190_raw, "Nom_wip":data.field_558_raw});

    var rData = $.ajax({
        url: commandURL,
        type: 'POST',
        contentType: 'application/json',
        data: dataToSend,
        async: false
    }).responseText;    
}catch(exception){
    console.log("error");
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let commandURL = "https://hook.integromat.com/bxfn25wkj67pptq9bniqmpvvjg868toi";
    let dataToSend = JSON.stringify({"Source":"Javascript error", "Function": "Scenario DESCRIPTION what for the error webhook",
    "Payload": data, "userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "Exception": exception.message, "dateTime": dateTime});
    var rData = $.ajax({
       url: commandURL,
       type: 'POST',
       contentType: 'application/json',
       data: dataToSend,
       async: false
    }).responseText;
}
});  


// ----------  refresh status of tarot upload ----------

$(document).on('knack-scene-render.scene_224', function(event, scene) {
 recursivecallscene_224();
});

function recursivecallscene_224(){
 setTimeout(function () { if($("#view_638").is(":visible")==true){ Knack.views["view_638"].model.fetch();recursivecallscene_224();} }, 30000);
}

// Trigger Customer Incident Form

$(document).on('knack-form-submit.view_781', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/fbuumn73d29ycs7o5ell2c4kflbnkhfb", {"Record ID":data.id},"Send Pre Visit Digital Customer Incident Form V2")
});

$(document).on('knack-form-submit.view_1394', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e681sgmbzwk1hgugd3ph4kr34addh61o", {"Record ID":data.id,"Origin":data.field_1815},"Pre Visit Digital Customer Incident Form DEV")
});

$(document).on('knack-form-submit.view_834', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/nm7ndnq4ixrw3r5lx2slrimrxwg4g9ht", {"Record ID":data.id,"Origin":data.field_1107,"Auto Increment":data.field_1064},"Completed Engine Pre Visit Digital Customer Incident Form")
});

$(document).on('knack-form-submit.view_845', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/nm7ndnq4ixrw3r5lx2slrimrxwg4g9ht", {"Record ID":data.id,"Origin":data.field_1107,"Auto Increment":data.field_1064},"Completed Steering Pre Visit Digital Customer Incident Form")
});

$(document).on('knack-form-submit.view_846', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/nm7ndnq4ixrw3r5lx2slrimrxwg4g9ht", {"Record ID":data.id,"Origin":data.field_1107,"Auto Increment":data.field_1064},"Completed Gearbox Pre Visit Digital Customer Incident Form")
});

$(document).on('knack-form-submit.view_859', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/nm7ndnq4ixrw3r5lx2slrimrxwg4g9ht", {"Record ID":data.id,"Origin":data.field_1107,"Auto Increment":data.field_1064},"Completed Suspension Pre Visit Digital Customer Incident Form")
});

$(document).on('knack-form-submit.view_1092', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/nm7ndnq4ixrw3r5lx2slrimrxwg4g9ht", {"Record ID":data.id,"Origin":data.field_1107,"Auto Increment":data.field_1064},"Completed Brakes Pre Visit Digital Customer Incident Form")
});

$(document).on('knack-form-submit.view_864', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/nm7ndnq4ixrw3r5lx2slrimrxwg4g9ht", {"Record ID":data.id,"Origin":data.field_1107,"Auto Increment":data.field_1064},"Completed Software Pre Visit Digital Customer Incident Form")
});

$(document).on('knack-form-submit.view_863', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/nm7ndnq4ixrw3r5lx2slrimrxwg4g9ht", {"Record ID":data.id,"Origin":data.field_1107,"Auto Increment":data.field_1064},"Completed Warning Light Pre Visit Digital Customer Incident Form")
});

$(document).on('knack-form-submit.view_867', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/nm7ndnq4ixrw3r5lx2slrimrxwg4g9ht", {"Record ID":data.id,"Origin":data.field_1107,"Auto Increment":data.field_1064},"Completed Other Pre Visit Digital Customer Incident Form")
});

//Submit form for GDPR preferences update in Check-in process
$(document).on('knack-form-submit.view_732', function(event, view, data) { 
  callPostHttpRequest("https://hook.eu1.make.celonis.com/whf6h2e18t2n2iqxhmorh4s8v9lcaf9m", {"Record ID":data.id, "Service GDPR PHONE":data.field_1048_raw, "Service GDPR EMAIL":data.field_1050_raw, "Service GDPR POST":data.field_1051_raw,
  "Service GDPR SMS":data.field_1052_raw, "Sales GDPR PHONE":data.field_1054_raw, "Sales GDPR EMAIL":data.field_1055_raw,"Sales GDPR POST":data.field_1056_raw, "Sales GDPR SMS":data.field_1057_raw, "Customer Magic Number":data.field_1006_raw.replace(/[^0-9]/g,'')},"Submit form for GDPR preferences update in Check-in process")
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
 recursivecallscene_94();
});

function recursivecallscene_94(){
 setTimeout(function () { if($("#view_1337").is(":visible")==true){ Knack.views["view_1337"].model.fetch();recursivecallscene_94();} }, 10000);
}

// ----------  Refresh Aftersales Customer Exit Survey Results table every 60 seconds but not the page itself  ---------- //

$(document).on('knack-scene-render.scene_148', function(event, scene) {
 recursivecallscene_148();
});

function recursivecallscene_148(){
 setTimeout(function () { if($("#view_423").is(":visible")==true){ Knack.views["view_423"].model.fetch();recursivecallscene_148();} }, 100000);
}

// Exit Survey E-mails webhook to trigger – 
$(document).on('knack-form-submit.view_307', function(event, view, data) { 
    let createData = {"Record ID":data.id};
    callPostHttpRequest("https://hook.integromat.com/a7w9c122du5khow3a9ufyoezq7zdnh0x",deleteEmpty(createData),"Aftersales - Exit Survey Email from Tablet");    
  });

// ------------ Refresh Aftersales Wip Management Table every 20 mins but not the page itself -----------------------//
$(document).on('knack-scene-render.scene_152', function(event, scene) {
 recursivecallscene_152();
});

function recursivecallscene_152(){
 setTimeout(function () { if($("#view_596").is(":visible")==true){ Knack.views["view_596"].model.fetch();recursivecallscene_152();} }, 1200000);
}

// Refresh the Parts Hubs Pre Pick List         

$(document).on('knack-scene-render.scene_340', function(event, scene) {
 recursivecallscene_340();
});

function recursivecallscene_340(){
 setTimeout(function () { if($("#view_947").is(":visible")==true){ Knack.views["view_947"].model.fetch();recursivecallscene_340();} }, 300000);
}

//Trigger failed Quality check (QC) emails to workshop controller/ manager

$(document).on('knack-form-submit.view_1628', function(event, view, data) {
  callPostHttpRequest("https://hook.integromat.com/2tfc5ujqwtit3x3r60it41o6vmczrd0t", {"Record ID":data.id},"Failed Quality Check (QC)")
});

//Trigger failed Quality check (QC) emails to workshop controller/ manager

$(document).on('knack-form-submit.view_1182', function(event, view, data) {
  callPostHttpRequest("https://hook.integromat.com/2tfc5ujqwtit3x3r60it41o6vmczrd0t", {"Record ID":data.id},"Failed Quality Check (QC)")
});

//Trigger failed Quality check (QC) emails to workshop controller/ manager

$(document).on('knack-form-submit.view_1260', function(event, view, data) {
  callPostHttpRequest("https://hook.integromat.com/2tfc5ujqwtit3x3r60it41o6vmczrd0t", {"Record ID":data.id},"Failed Quality Check (QC)")
});

//Trigger failed Quality check (QC) emails to workshop controller/ manager

$(document).on('knack-form-submit.view_1261', function(event, view, data) {
  callPostHttpRequest("https://hook.integromat.com/2tfc5ujqwtit3x3r60it41o6vmczrd0t", {"Record ID":data.id},"Failed Quality Check (QC)")
});

//Trigger failed Quality check (QC) emails to workshop controller/ manager within TECH VIEW

$(document).on('knack-form-submit.view_2725', function(event, view, data) {
  callPostHttpRequest("https://hook.integromat.com/2tfc5ujqwtit3x3r60it41o6vmczrd0t", {"Record ID":data.id},"Failed Quality Check (QC)")
});

// Trigger Update To VR (Virtual Reception) Status

$(document).on('knack-form-submit.view_1177', function(event, view, data) {
  callPostHttpRequest("https://hook.integromat.com/3b7aqxlblay6r5egi5rev56ql8qiy4g2", {"Record ID":data.id},"Aftersales VR Update")
});

// Trigger When VR (Virtual Reception) Message Manually Added From Aftersales App

$(document).on('knack-form-submit.view_1180', function(event, view, data) {
  callPostHttpRequest("https://hook.integromat.com/f1k56q7sd97mlqn37v37y9s759it9ghn", {"Record ID":data.id},"Aftersales VR New Message")
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



  // --- Aftersales vehicle look up 'vehicle on site' ---
/*$(document).on('knack-view-render.view_1223', function(event, view) {
  //get the vin value from the table
 const vinNumber = $(".col-5").text().trim()
 //send a http request with the vin an record id

 /*const triggerRecord = (event2) => {
  console.log(event2.taget);
  console.log("Test106")
   console.log(event2.view.app_id)
   console.log(event2.view.Knack)
   let k = Object.assign({},event2.view.Knack);
   console.log(event2.view.Knack.hash_parts)
   console.log(k.hash_parts)
   console.log(event2.view.Knack.scene_hash)
   console.log(event2.view.Knack.google_loading)
   console.log(event2.view.Knack.domain)
  
   callPostHttpRequest("https://hook.eu1.make.celonis.com/a61ljkqf5jw5d643274gixjtqdx5hgo8", {"Record ID":event2.view.app_id, "VIN": vinNumber, "Scenario":"vehicle customer look up" },"Aftersales- update individual LIVE WIPS 'touched today' and UPDATE Parts & Labour v4");
 }
    //add an event listner to the arrow table element
    $(".fa-search").on("click", triggerRecord);

 
 // trigger a webhook from a action link - Aftersales - update live individual wip from Reg & Status Lookup for Vehicles Onsite

    if ($('div[class="kn-view kn-table view_1223"]')){
      let rows = $('div[class="kn-view kn-table view_1223"] table tr');
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/a61ljkqf5jw5d643274gixjtqdx5hgo8", {"recordId":cell, "VIN": vinNumber, "Scenario":"vehicle customer look up" },"Aftersales- update individual LIVE WIPS 'touched today' and UPDATE Parts & Labour v4");
          };
        };
        currentRow.children[5].onclick = createClickHandler(currentRow);
      }
    }
	});*/


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
 


/*trigger update live wip from VR 
$(document).on('knack-form-submit.view_1229', function(event, view, data) { 
    
    try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/a61ljkqf5jw5d643274gixjtqdx5hgo8";
        let dataToSend = JSON.stringify({"recordId":data.id});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Aftersales - trigger update live wip from VR");
    }
});
*/
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

/*trigger update live wip from wip management reminders table
$(document).on('knack-view-render.view_1212', function (event, view, data) {

	    if ($('div[class="kn-view kn-table view_1212"]')){
      let rows = $('div[class="kn-view kn-table view_1212"] table tr');
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/a61ljkqf5jw5d643274gixjtqdx5hgo8", {"recordId":cell, "VIN": vinNumber, "Scenario":"vehicle customer look up" },"Aftersales- update individual LIVE WIPS 'touched today' and UPDATE Parts & Labour v4");
          };
        };
        currentRow.children[4].onclick = createClickHandler(currentRow);
      }
    }
	});
*/
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
  console.log("Test106")
   console.log(event2.view.app_id)
   console.log(event2.view.Knack)
   let k = Object.assign({},event2.view.Knack);
   console.log(event2.view.Knack.hash_parts)
   console.log(k.hash_parts)
   console.log(event2.view.Knack.scene_hash)
   console.log(event2.view.Knack.google_loading)
   console.log(event2.view.Knack.domain)
  
   callPostHttpRequest("https://hook.eu1.make.celonis.com/311tdiov4qlsg7g84pvialsggdawolta", {"Record ID":event2.view.app_id, "VIN": vinNumber },"Parts - Hub to hub v2");
 }
 //add an event listner to the arrow table element
 $(".fa-exchange").on("click", triggerRecord2)
});

// ------------ Refresh Hub to Hub transfer every 2 mins but not the page itself -----------------------//
$(document).on('knack-scene-render.scene_439', function(event, scene) {
 recursivecallscene_439();
});

function recursivecallscene_439(){
 setTimeout(function () { if($("#view_1248").is(":visible")==true){ Knack.views["view_1248"].model.fetch();recursivecallscene_439();} }, 120000);
}


// ------------ Refresh WIP Reporting status but not the page itself -----------------------//
$(document).on('knack-scene-render.scene_152', function(event, scene) {
 recursivecallscene_152();
});

function recursivecallscene_152(){
 setTimeout(function () { if($("#view_1285").is(":visible")==true){ Knack.views["view_1285"].model.fetch();recursivecallscene_439();} }, 120000);
}

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

$(document).on('knack-scene-render.any', function(event, scene) {
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
      if (versionC!==appVersionID && appVersionID!==''){
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
    dateTimeOfFirstRun = new Date();
    window.location.reload(false);
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

/*Send Data When Vehicle Is Checked Out From Digital Aftersales - View_1564
$(document).on('knack-form-submit.view_1564', function(event, view, data) { 
    
 if (data.field_2042 === "No")	 {
	 try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno";
        let dataToSend = JSON.stringify({"Record ID":data.id, "WIP":data.field_441, "POS":data.field_443, "Onsite":data.field_2042, "Source": "View_1564, When vehicle Checked out from digital"});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger to Send Data When Vehicle Is Checked Out From Digital Aftersales - View_1564");
    }}
});
*/
//Send Data When Vehicle Is Checked Out From Digital Aftersales - View_1556
/*$(document).on('knack-form-submit.view_1556', function(event, view, data)  { 
    
 if (data.field_2042 === "No")	
 { try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno";
        let dataToSend = JSON.stringify({"Record ID":data.id, "WIP":data.field_441, "POS":data.field_443, "Onsite":data.field_2042,"Source": "View_1556 - Wip Management Trigger for vehicle onsite"});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger to Send Data When Vehicle Is Checked Out From Digital Aftersales - View_1556 ");
    }}
});
*/
//Send Data When Vehicle Is Checked Out From Digital Aftersales managers notes Vehicle on-site - View_1516
/*$(document).on('knack-form-submit.view_1516', function(event, view, data) { 
    
 if (data.field_2042 === "No")	
 { try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno";
        let dataToSend = JSON.stringify({"Record ID":data.id, "WIP":data.field_441, "POS":data.field_443, "Onsite":data.field_2042, "Source": "View_1516 - triggered from manager's note"});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger to Send Data When Vehicle Is Checked Out From Digital Aftersales managers notes Vehicle on-site - View_1516");
    }}
});
*/

/*Send Data When Vehicle Is Checked Out From Digital Aftersales managers notes Vehicle on-site - View_654
$(document).on('knack-form-submit.view_654', function(event, view, data) { 
    
 if (data.field_2042 === "No")	
 { try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno";
        let dataToSend = JSON.stringify({"Record ID":data.id, "WIP":data.field_441, "POS":data.field_443, "Onsite":data.field_2042, "Source": "View_654 - triggered from manager's note"});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger to Send Data When Vehicle Is Checked Out From Digital Aftersales managers notes Vehicle on-site - View_654");
    }}
});*/

/*trigger to Send Data When Vehicle Is Checked Out From Digital Aftersales Wip on site check out button
$(document).on('knack-view-render.view_1512', function (event, view, data) {
	    if ($('div[class="kn-table kn-view view_1512"]')){
      let rows = $('div[class="kn-table kn-view view_1512"] table tr');
      for (i = 1; i < rows.length; i++) {
        let currentRow = rows[i];
        const createClickHandler = function(row) {
          return function() {
            var cell = row.id;
            console.log('cell',cell);
            callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":data.id, "WIP":data.field_441, "POS":data.field_443, "Onsite":data.field_2042},"trigger to Send Data When Vehicle Is Checked Out From Digital Aftersales Wip on site check out button");
          };
        };
        currentRow.children[4].onclick = createClickHandler(currentRow);
      }
    }
	});
*/
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
    //start
    /*$('th[class="field_318"]').hide();
    $('td[class*="field_318"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
	
	  
    $('div[id="view_1880"] table>tbody>tr').each(function(){
      //console.log($(this));
      //$(this).find('td[data-field-key="field_763"]').attr('title',getTextFromHTML(getFieldForRowID('view_1880','field_318',$(this).attr('id'))));
      //$(this).find('td[data-field-key="field_763"]').addClass('title');
	    
      $(this).find('td[data-field-key="field_899"]').attr('title',getTextFromHTML(getFieldForRowID('view_1880','field_1537',$(this).attr('id'))));
      $(this).find('td[data-field-key="field_899"]').addClass('title');
    });
*/
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
  // tooltipsTable('540','1902','field_1532','field_1021');
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



//trigger Create Service Wash From Manager's Note
$(document).on('knack-form-submit.view_1899', function(event, view, data) { 
    
    try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/4w3cn2lcxhem6tp9l7dfbtc9r1sc8h6g";
        let dataToSend = JSON.stringify({"RecordID from Jobcard":data.id, "Service Comments":data.field_982, "userName": Knack.getUserAttributes().name,"Manual Request":"Yes"});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Aftersales - trigger service wash from Manager's Note");
    }
});

// --- manual delete service wash from Workshop controller view
$(document).on('knack-view-render.view_1898', function(event, view) {
  //get the vin value from the table
 const valRecID = $(".col-7").text().trim()
 //send a http request with the vin an record id

 /*const triggerRecord = (event2) => {
  console.log(event2.taget);
  console.log("Test106")
   console.log(event2.view.app_id)
   console.log(event2.view.Knack)
   let k = Object.assign({},event2.view.Knack);
   console.log(event2.view.Knack.hash_parts)
   console.log(k.hash_parts)
   console.log(event2.view.Knack.scene_hash)
   console.log(event2.view.Knack.google_loading)
   console.log(event2.view.Knack.domain)
  
   callPostHttpRequest("https://hook.eu1.make.celonis.com/a61ljkqf5jw5d643274gixjtqdx5hgo8", {"Record ID":event2.view.app_id, "VIN": vinNumber, "Scenario":"vehicle customer look up" },"Aftersales- update individual LIVE WIPS 'touched today' and UPDATE Parts & Labour v4");
 }
    //add an event listner to the arrow table element
    $(".fa-search").on("click", triggerRecord);*/

 
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

/*testing moving Icons for workshop controller v2 checked in but not started today
$(document).on('knack-view-render.view_1904', function (event, view, data) {

 if ($('div[class="kn-table kn-view view_1904"]')){
      let rows = $('div[class="kn-table kn-view view_1904"] table>tbody>tr[id]');
      for (i = 0; i < rows.length; i++) {
        $('div[id="view_1904"] table>tbody>tr[id]').eq(i).find('span[class="col-0"]>a').appendTo($('div[id="view_1904"] table>tbody>tr[id]').eq(i).find('span[class="col-1"]').parent())
        $('div[id="view_1904"] table>tbody>tr[id]').eq(i).find('span[class="col-1"]>a').appendTo($('div[id="view_1904"] table>tbody>tr[id]').eq(i).find('span[class="col-0"]').parent())
      }
    }
  });
*/
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
    tooltipsTable('761','2246','field_1532','field_2586');
	tooltipsTable('761','2246','field_1537','field_2213');
	tooltipsTable('761','2246','field_2298','field_2272');
	//tooltipsTable('761','2246','field_2278','field_1118','Tag No: ');
	
	     $('th[class="field_2240"]').hide();
    $('td[class*="field_2240"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
	  $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
	// $('th[class="field_2278"]').hide();
    //$('td[class*="field_2278"]').hide(); 

	/*hide allocate tech
	$('th[class="field_2411"]').hide();
    $('td[class*="field_2411"]').hide();*/
}); 


//completed by not invoiced jobs - all jobs view
$(document).on('knack-view-render.view_3168', function (event, view, data) {
    tooltipsTable('1017','3168','field_1532','field_2586');
	tooltipsTable('1017','3168','field_1537','field_2213');
	tooltipsTable('1017','3168','field_2298','field_2272');
	//tooltipsTable('1017','3168','field_2278','field_1118','Tag No: ');
	
	     $('th[class="field_2240"]').hide();
    $('td[class*="field_2240"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
	  $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
//	 $('th[class="field_2278"]').hide();
 //   $('td[class*="field_2278"]').hide(); 
}); 

$(document).on('knack-scene-render.scene_1017', function(event, scene) {
 recursivecallscene_1017();
});

function recursivecallscene_1017(){
 setTimeout(function () { if($("#view_3168").is(":visible")==true){ Knack.views["view_3168"].model.fetch();recursivecallscene_1017();} }, 300000);
}



//trigger Create Service Wash From Job card v2
$(document).on('knack-form-submit.view_2362', function(event, view, data) { 
    
    try{
        let commandURL = "https://hook.eu1.make.celonis.com/4w3cn2lcxhem6tp9l7dfbtc9r1sc8h6g";
        let dataToSend = JSON.stringify({"RecordID from Jobcard":data.id, "Service Comments":data.field_982, "UID":data.field_2190, "userName": Knack.getUserAttributes().name});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Aftersales - Create service wash from Job card v2");
    }
});

//trigger aftersales - wip management notes to update + is vehicle on site

$(document).on('knack-form-submit.view_2361', function(event, view, data) {

try{

    let commandURL = "https://hook.integromat.com/s8j9klwniouvc81742i1hy8yxtc822ut";
    let dataToSend = JSON.stringify({"Record ID":data.id, "Manager's Notes":data.field_1015_raw, "userName": Knack.getUserAttributes().name, "NOM_WIP_REG":data.field_978_raw, "Nom_wip":data.field_558_raw});

    var rData = $.ajax({
        url: commandURL,
        type: 'POST',
        contentType: 'application/json',
        data: dataToSend,
        async: false
    }).responseText;    
}catch(exception){
    console.log("error");
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let commandURL = "https://hook.integromat.com/bxfn25wkj67pptq9bniqmpvvjg868toi";
    let dataToSend = JSON.stringify({"Source":"Javascript error", "Function": "Scenario DESCRIPTION what for the error webhook",
    "Payload": data, "userName": Knack.getUserAttributes().name, "userEmail": Knack.getUserAttributes().email, "Exception": exception.message, "dateTime": dateTime});
    var rData = $.ajax({
       url: commandURL,
       type: 'POST',
       contentType: 'application/json',
       data: dataToSend,
       async: false
    }).responseText;
}


/* if (data.field_2042 === "No")	
 { try{
        let commandURL = "https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno";
        let dataToSend = JSON.stringify({"Record ID":data.id, "WIP":data.field_441, "POS":data.field_443, "Onsite":data.field_2042, "Source": "View_2361 - triggered from manager's note"});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger to Send Data When Vehicle Is Checked Out From Digital Aftersalses job card v2- View_2361");
    }}*/

});


//Wip reporting "on-site" page hover for operator details 
$(document).on('knack-view-render.view_1512', function (event, view, data) {
    tooltipsTable('509','1512','field_2240','field_2220');
	//scene, view, field to have hover, hover info
	     $('th[class="field_2240"]').hide();
    $('td[class*="field_2240"]').hide();
}); 

//Wip reporting "off-site" page hover for operator details 
$(document).on('knack-view-render.view_1506', function (event, view, data) {
    tooltipsTable('510','1506','field_2240','field_2220');
	//scene, view, field to have hover, hover info
	     $('th[class="field_2240"]').hide();
    $('td[class*="field_2240"]').hide();
}); 

//Wip reporting "All jobs" hover for operator
$(document).on('knack-view-render.view_596', function (event, view, data) {
    tooltipsTable('152','596','field_2240','field_2220');
	//scene, view, field to have hover, hover info
	     $('th[class="field_2240"]').hide();
    $('td[class*="field_2240"]').hide();
}); 

/*Submit form for Vehicle Check-in JOBCARD V2 now using form submission in make
$(document).on('knack-form-submit.view_2351', function(event, view, data) { 

  callPostHttpRequest("https://hook.eu1.make.celonis.com/jcvomnieu3i0k2a5bkce88csho75et9s", {"Record ID":data.id, "Summary Of Work That Has Been Booked In": data.field_1116_raw,
 "Date / Time Collection Time agreed With Customer At Check in":handlAll(data.field_1117_raw, "date"), "Parking Bay That Customer Vehicle Is Currently Parked In":data.field_1118_raw,
 "Alternative Mobile Phone Number To Use whilst vehicle is with us Instead Of Stored Contact numbers": handlAll(data.field_1119_raw, "formatted"), "Would Customer Like Us To Make This New Number The Default For Future Communication": data.field_1120_raw,
  "Customer Signature At Check in":data.field_1122_raw, "Labour Summary":data.field_432_raw, "Customer & Advisor Job Card Notes":data.field_446_raw, "Autoline - customer email":data.field_277_raw,
  "Use Autoline - Customer Phone 1":data.field_782_raw, "Use Autoline - Customer Phone 2":data.field_783_raw, "Use Autoline - Customer Phone 3":data.field_784_raw, "Use Autoline - Customer Phone 3":data.field_785_raw},"Submit form for Vehicle Check-in")

});
*/
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
    
    try{
        

        let commandURL = "https://hook.integromat.com/wio8wmbeqg4p81kwshmegg7h7fsfawz7";
        let dataToSend = JSON.stringify({"Record ID":data.id});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger Text To Customer To Complete Exit Survey At Workshop \"Check Out\"");
    }
});



// trigger to Send Data When Vehicle Is Checked Out From Customer Satisfaction check (sms) jobcard v2

$(document).on('knack-form-submit.view_2365', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":data.field_1601, "WIP":data.field_441, "DemoTransactionNumber":data.field_1332, "POS":data.field_443, "Date Courtesy Car Agreement Completed":data.field_2482, "Source": "View_2365 - Satisfaction check (SMS)"},"Aftersales - customer satisfaction exit survey to trigger bot autoline check out")
});
/**Trigger Text To Customer To Complete Exit Survey At Workshop "Check Out" from jobcard v2
$(document).on('knack-form-submit.view_2365', function(event, view, data) { 
    
    try{
        

        let commandURL = "https://hook.integromat.com/wio8wmbeqg4p81kwshmegg7h7fsfawz7";
        let dataToSend = JSON.stringify({"Record ID":data.id});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger Text To Customer To Complete Exit Survey At Workshop \"Check Out\"");
    }
});*/

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
 recursivecallscene_761();
 
});

function recursivecallscene_761(){
 setTimeout(function () { if($("#view_2246").is(":visible")==true){ Knack.views["view_2246"].model.fetch();recursivecallscene_761();} }, 300000);
}

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
 recursivecallscene_755();
 
});

function recursivecallscene_755(){
 setTimeout(function () { 
  if($("#view_2478").is(":visible")==true) Knack.views["view_2478"].model.fetch();
  if($("#view_2722").is(":visible")==true) Knack.views["view_2722"].model.fetch();
  recursivecallscene_755();
  }, 30000);
}

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
	//tooltipsTable('753','2686','field_2278','field_1118','Tag No: ');
		 tooltipsTable('753','2686','field_1532','field_2586');
	//scene, view, field to have hover, hover info
	
	  $('th[class="field_2240"]').hide();
    $('td[class*="field_2240"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
	  $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
	// $('th[class="field_2278"]').hide();
   // $('td[class*="field_2278"]').hide(); 
/*allocate tech to hide
		 $('th[class="field_2411"]').hide();
    $('td[class*="field_2411"]').hide(); 

*/	
});

$(document).on('knack-scene-render.scene_753', function(event, scene) {
 recursivecallscene_753();
});

function recursivecallscene_753(){
 setTimeout(function () { if($("#view_2686").is(":visible")==true){ Knack.views["view_2686"].model.fetch();recursivecallscene_753();} }, 300000);
	 
}

//Workshop Controller all in one table (Off-site jobs)
$(document).on('knack-view-render.view_2722', function (event, view, data) {
    tooltipsTable('755','2722','field_1532','field_2586');
	tooltipsTable('755','2722','field_1537','field_2213');
	tooltipsTable('755','2722','field_2298','field_2272');
//	tooltipsTable('755','2722','field_2278','field_1118','Tag No: ');
	
	     $('th[class="field_2240"]').hide();
    $('td[class*="field_2240"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
	  $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
//	 $('th[class="field_2278"]').hide();
  //  $('td[class*="field_2278"]').hide(); 
	/*hide allocate tech
	$('th[class="field_2411"]').hide();
    $('td[class*="field_2411"]').hide(); */
}); 


//Workshop Controller all in one table (MY jobs)
$(document).on('knack-view-render.view_2892', function (event, view, data) {
    tooltipsTable('934','2892','field_1532','field_2586');
	tooltipsTable('934','2892','field_1537','field_2213');
	tooltipsTable('934','2892','field_2298','field_2272');
	//tooltipsTable('934','2892','field_2278','field_1118','Tag No: ');
	
	     $('th[class="field_2240"]').hide();
    $('td[class*="field_2240"]').hide();
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide(); 
	  $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide(); 
//	 $('th[class="field_2278"]').hide();
//    $('td[class*="field_2278"]').hide(); 
	/*hide allocate tech
	$('th[class="field_2411"]').hide();
    $('td[class*="field_2411"]').hide();*/
}); 

$(document).on('knack-scene-render.scene_934', function(event, scene) {
 recursivecallscene_934();
});

function recursivecallscene_934(){
 setTimeout(function () { if($("#view_2892").is(":visible")==true){ Knack.views["view_2892"].model.fetch();recursivecallscene_934();} }, 300000);
	
}

// Trigger Licence Link - Customer Manually Enters Driving Licence

$(document).on('knack-form-submit.view_2510', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/ouosl7cqftin4d5xk4ybco0q96t5bwk2", {"Record ID":data.id,"Courtesy Car Agreement Record ID":data.field_2318_raw,"Date Of Birth":data.field_2325,"Driving Licence Number":data.field_2316},"Customer and Driver Same Person + Manually Entering Driving Licence Details")
});

$(document).on('knack-form-submit.view_2940', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/ouosl7cqftin4d5xk4ybco0q96t5bwk2", {"Record ID":data.id,"Forename":data.field_2461,"Surname":data.field_2462,"Date Of Birth":data.field_2325,"First Line Of Address":data.field_2312,"Postcode":data.field_2314,"Email Address":data.field_2315_raw,"Driving Licence Number":data.field_2316},"Customer and Driver NOT Same Person + Manually Entering Driving Licence Details")
});

//trigger bot for exit survey (job card v2 - Check out via tablet)
$(document).on('knack-form-submit.view_2364', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":data.field_2223, "WIP":data.field_719, "DemoTransactionNumber":data.field_2476, "POS":data.field_720, "Date Courtesy Car Agreement Completed":data.field_2547, "Source": "View_2364 - Satisfaction check(tablet)"},"Aftersales - customer satisfaction exit survey to trigger bot autoline check out")
});

//trigger bot for exit survey (job card v2 - Check out via tablet (mark for follow up)
$(document).on('knack-form-submit.view_2881', function(event, view, data) {
  callPostHttpRequest("https://hook.eu1.make.celonis.com/e8f4buzy7rhplrdf1rgmclqkudy2mcno", {"Record ID":data.field_2223, "WIP":data.field_719, "DemoTransactionNumber":data.field_2476, "POS":data.field_720, "Date Courtesy Car Agreement Completed":data.field_2547, "Source": "View_2881 - Satisfaction check(tablet)"},"Aftersales - customer satisfaction exit survey to trigger bot autoline check out")
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


// Code to wait following Form Submission while Licence Is Being Checked in Make - Customer View


$(document).on('knack-form-submit.view_2999', function(event, view, data) { 


	setTimeout(function(){ 

    	Knack.showSpinner();

    }, 0); 

  

	commandURL = "https://hook.eu1.make.celonis.com/ouosl7cqftin4d5xk4ybco0q96t5bwk2?recordid=" + data.id ;


 	$.get(commandURL, function(data, status){


      Knack.hideSpinner();

      $(".kn-message.success").html("<b>" + data + "</b>");


    });

});

// Code to wait following Form Submission while Licence Is Being Checked in Make - Customer Advisor View

$(document).on('knack-form-submit.view_3047', function(event, view, data) { 


	setTimeout(function(){ 

    	Knack.showSpinner();

    }, 0); 

  

	commandURL = "https://hook.eu1.make.celonis.com/ouosl7cqftin4d5xk4ybco0q96t5bwk2?recordid=" + data.id ;


 	$.get(commandURL, function(data, status){


      Knack.hideSpinner();

      $(".kn-message.success").html("<b>" + data + "</b>");


    });

});

//Commence courtesy car agreement to trigger part 2 of Digital check in
$(document).on('knack-form-submit.view_3592', function(event, view, data) { 
    
    try{
	    
        let commandURL = "https://hook.eu1.make.celonis.com/1v52b45xmqgp25kqsocwmoab3cu88ikf";
        let dataToSend = JSON.stringify({"RecordID":data.id, "source": "Courtesy Inspection Page"});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Aftersales - Create service wash from Job card v2");
    }
});

 //Commence courtesy car agreement to trigger part 2 of Digital check in from inspection page
$(document).on('knack-form-submit.view_2353', function(event, view, data) { 
    
    try{
	    
        let commandURL = "https://hook.eu1.make.celonis.com/ursfgeixws3xf5cl2j9d1bozxizq7air";
        let dataToSend = JSON.stringify({"RecordID":data.id, "from":"Original Courtesy commence"});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Commence courtesy car agreement to trigger checin in from inspection page");
    }
});

/*Trigger aftersales check in from jobcard inspection page
$(document).on('knack-form-submit.view_3566', function(event, view, data) { 
    
    try{
	    
        let commandURL = "https://hook.eu1.make.celonis.com/4fgvpdfd1uc67sr8our7b7wy5ikd84uu";
        let dataToSend = JSON.stringify({"RecordID":data.id, "from":"Job card Inspection Page"});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Commence checkin in from jobcard inspection page");
    }
});

//Trigger aftersales check in from courtesy car inspection page
$(document).on('knack-form-submit.view_3592', function(event, view, data) { 
    
    try{
	    
        let commandURL = "https://hook.eu1.make.celonis.com/4fgvpdfd1uc67sr8our7b7wy5ikd84uu";
        let dataToSend = JSON.stringify({"RecordID":data.id, "from":"Courtesy Car Inspection Page"});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Commence courtesy car agreement to trigger checin in from inspection page");
    }
});*/

// ----------  refresh Enquiry Max Table every 5 seconds but not the page itself  ----------

$(document).on('knack-scene-render.scene_778', function(event, scene) {
 recursivecallscene_778();
});

function recursivecallscene_778(){
 setTimeout(function () { if($("#view_2352").is(":visible")==true){ Knack.views["view_2352"].model.fetch();recursivecallscene_778();} }, 1000);
}


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
    
    try{

        let commandURL = "https://hook.eu1.make.celonis.com/go73sbo0qfmia3ky1vs7wz2nh8e82wwa";
        let dataToSend = JSON.stringify({"RecordID":data.id, "UID":data.field_2190, "Service Wash Required?":data.field_2703});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Technician to remove from list and send to service wash");
    }
});

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
    //resizeImageMaxHeight : 1000,
    //resizeImageMaxWidth : 1000,
    app_id : '591eae59e0d2123f23235769'
  }
  createPhotoButton(appSettings2718,'2718');
  let appSettings1914 = {uploadMethod : 'field', uploadField : 'field_1914',app_id : '591eae59e0d2123f23235769',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings1914,'1914');
  let appSettings2477 = {uploadMethod : 'field', uploadField : 'field_2477', app_id : '591eae59e0d2123f23235769',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2477,'2477');
  let appSettings2478 = {uploadMethod : 'field', uploadField : 'field_2478', app_id : '591eae59e0d2123f23235769',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2478,'2478');
  let appSettings2479 = {uploadMethod : 'field', uploadField : 'field_2479', app_id : '591eae59e0d2123f23235769',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2479,'2479');

  //if (Knack.user.id === '6079ce7212c6d9001b7309a4'){
    makeFileUploadOffline('field_2332');
  //}
  
  var formButton = document.querySelector('div[class="kn-submit"]>button');
  formButton.onclick = function() {
    if (!isOnline){
      alert('You are unable to submit the Vehicle Inspection as the device is not connected to a network. Please move within range/reconnect to a network to submit the Vehicle Inspection.');
      return false;
    } else {
      if ($('input[imageToSaveUrl]').length>0 || $('input[id*="offline"]').length>0){
        uploadList = [];
        $('div[id="view_3566"] button[type="submit"]').prop('disabled', true);
        $('<h3>Images are being uploaded, then the form will be submitted ...</h3><p id="infoText"></p>').insertBefore($('div[id="view_3566"] button[type="submit"]'))
        createFormModal('fMImageUpload','<h3>Images and files are being uploaded, then the form will be submitted ...</h3><p id="infoText"></p>');
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
        for (let i =0;i< $('input[id*="offline"]').length;i++){
          if ($('input[id*="offline"]').eq(i).prop('files')[0]){
            uploadList.push({field:$('input[id*="offline"]').eq(i).attr('fieldName')});
            let fU = URL.createObjectURL( $('input[id*="offline"]').eq(i).prop('files')[0]);
            fetch(fU)
            .then(function(response) {
              return response.blob();
            })
            .then(function(blob) {
              uploadFileOnlyPhotoApp('6040dd9a301633001bca5b4e',blob,$('input[id*="offline"]').eq(i).prop('files')[0].name,'infoText',$('input[id*="offline"]').eq(i).attr('fieldName'),fileUploadedSuccesfully);
            });
          }
        }
        testSubmitOfflineForm();
        return false;
      }
    }
  }
});

$(document).on('knack-view-render.view_3592', function (event, view, data) {
  embedPhotoApp();
  let appSettings1914 = {uploadMethod : 'field', uploadField : 'field_1914',app_id : '591eae59e0d2123f23235769',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings1914,'1914');
  let appSettings2477 = {uploadMethod : 'field', uploadField : 'field_2477', app_id : '591eae59e0d2123f23235769',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2477,'2477');
  let appSettings2478 = {uploadMethod : 'field', uploadField : 'field_2478', app_id : '591eae59e0d2123f23235769',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2478,'2478');
  let appSettings2479 = {uploadMethod : 'field', uploadField : 'field_2479', app_id : '591eae59e0d2123f23235769',actionAfterPhoto : 'none'}
  createPhotoButton(appSettings2479,'2479');

  //if (Knack.user.id === '6079ce7212c6d9001b7309a4'){
    makeFileUploadOffline('field_2332');
  //}
  
  var formButton = document.querySelector('div[class="kn-submit"]>button');
  formButton.onclick = function() {
    if (!isOnline){
      alert('You are unable to submit the Vehicle Inspection as the device is not connected to a network. Please move within range/reconnect to a network to submit the Vehicle Inspection.');
      return false;
    } else {
      if ($('input[imageToSaveUrl]').length>0 || $('input[id*="offline"]').length>0){
        uploadList = [];
        $('div[id="view_3592"] button[type="submit"]').prop('disabled', true);
        $('<h3>Images are being uploaded, then the form will be submitted ...</h3><p id="infoText"></p>').insertBefore($('div[id="view_3592"] button[type="submit"]'))
        createFormModal('fMImageUpload','<h3>Images and files are being uploaded, then the form will be submitted ...</h3><p id="infoText"></p>');
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
        for (let i =0;i< $('input[id*="offline"]').length;i++){
          if ($('input[id*="offline"]').eq(i).prop('files')[0]){
            uploadList.push({field:$('input[id*="offline"]').eq(i).attr('fieldName')});
            let fU = URL.createObjectURL( $('input[id*="offline"]').eq(i).prop('files')[0]);
            fetch(fU)
            .then(function(response) {
              return response.blob();
            })
            .then(function(blob) {
              uploadFileOnlyPhotoApp('6040dd9a301633001bca5b4e',blob,$('input[id*="offline"]').eq(i).prop('files')[0].name,'infoText',$('input[id*="offline"]').eq(i).attr('fieldName'),fileUploadedSuccesfully);
            });
          }
        }
        testSubmitOfflineForm();
        return false;
      }
    }
  }
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
    console.log('clicked')
    if (!isOnline){
      alert('You are offline, please go online before submiting the form.');
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
        return false;
      }
    }
  }
});

function getRecordIdFromHref(ur) {
  var ur = ur.substr(0, ur.length - 1);
  return ur.substr(ur.lastIndexOf('/') + 1)
}

function imageUploadedSuccesfully(fieldName, fileId){
  //alert(fieldName);
  //alert(fileId);
  $('input[name="'+fieldName+'"]').val(fileId);
  $('div[id="kn-input-'+$('input[name="'+fieldName+'"]').attr('name')+'"] div[class="kn-asset-current"]').html('photoImg.jpg');
  $('#'+$('input[name="'+fieldName+'"]').attr('name')+'_upload').hide();
  $('div[id="kn-input-'+$('input[name="'+fieldName+'"]').attr('name')+' .kn-file-upload').html('File uploaded successfully.');
  $('input[name="'+fieldName+'"]').removeAttr('imageToSaveUrl');
  if (fieldName === 'field_2718'){
    console.log('Motab Photo');
    let dataToSend = {
      recordId:getRecordIdFromHref(location.href),
      imageUrl : 'https://s3.eu-central-1.amazonaws.com/kn-custom-rd/assets/6040dd9a301633001bca5b4e/'+fileId+'/original/photoimg.jpg'
    }
    $.ajax({
      url: 'https://7rhnwcwqj9ap.runs.apify.net/photoCheckMotability',
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
  //alert(fieldName);
  //alert(fileId);
  $('input[name="'+fieldName+'"]').val(fileId);
  $('input[name="'+fieldName+'"]').removeAttr('disabled');
  $('input[id="'+fieldName+'_offlinefile"]').val(null);
  $('div[id="kn-input-'+$('input[name="'+fieldName+'"]').attr('name')+'"] div[class="kn-asset-current"]').html(filename);
  //$('div[id="kn-input-'+$('input[name="'+fieldName+'"]').attr('name')+'"] div[class="kn-asset-current"]').html('photoImg.jpg');
  //$('#'+$('input[name="'+fieldName+'"]').attr('name')+'_upload').hide();
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
    
    try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/l033812xruob5c383h0qlfz59oebzwak";
        let dataToSend = JSON.stringify({"Record ID":data.id});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Aftersales - Exit Survey Email from Insecure (customer phone)");
    }
});

 //technician to unlink from jobcard and send to valet
$(document).on('knack-form-submit.view_3216', function(event, view, data) { 
    
    try{

        let commandURL = "https://hook.eu1.make.celonis.com/go73sbo0qfmia3ky1vs7wz2nh8e82wwa";
        let dataToSend = JSON.stringify({"RecordID":data.id, "UID":data.field_2190, "Service Wash Required?":data.field_2703});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Technician to remove from list and send to service wash");
    }
});


//*Trigger Aftersales - Exit Survey Email From FOLLOW UP from Jobcard v2
$(document).on('knack-form-submit.view_2881', function(event, view, data) { 
    
    try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/l033812xruob5c383h0qlfz59oebzwak";
        let dataToSend = JSON.stringify({"Record ID":data.id});

        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Aftersales - Exit Survey Email from Insecure (customer phone)");
    }
});

  //refresh  new tech page every 5 seconds
$(document).on('knack-scene-render.scene_935', function(event, scene) {
 recursivecallscene_935();
});
function recursivecallscene_935(){
 setTimeout(function () { 
  if($("#view_2900").is(":visible")==true) Knack.views["view_2900"].model.fetch();
  if($("#view_3126").is(":visible")==true) Knack.views["view_3126"].model.fetch();
  recursivecallscene_935();
  }, 30000);
}

$(document).on('knack-scene-render.scene_981', function(event, scene) {
 recursivecallscene_981();
});
function recursivecallscene_981(){
 setTimeout(function () { 
  if($("#view_3223").is(":visible")==true) Knack.views["view_3223"].model.fetch();
  if($("#view_3086").is(":visible")==true) Knack.views["view_3086"].model.fetch();
  recursivecallscene_981();
  }, 30000);
}


// refresh workshop table v1
$(document).on('knack-scene-render.scene_1050', function(event, scene) {
 recursivecallscene_1050();
});

function recursivecallscene_1050(){
 setTimeout(function () { if($("#view_3307").is(":visible")==true){ Knack.views["view_3307"].model.fetch();recursivecallscene_1050();} }, 300000);
	 
}


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
    //start
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
   	$('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
	tooltipsTable('1098','3474','field_1537','field_2213');  
	   tooltipsTable('1098','3474','field_1532','field_2586');
	    
    });

	//hover for labour details on workshop POT (service Table)
   $(document).on('knack-view-render.view_3476', function (event, view, data) {
    //start
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
   	
	tooltipsTable('1098','3476','field_1537','field_2213');  
	   
     tooltipsTable('1098','3476','field_1532','field_2586');
	//scene, view, hover info, field to have hover
	

	    
    });
	//hover for labour details on workshop POT (Predictable work)
   $(document).on('knack-view-render.view_3483', function (event, view, data) {
    //start
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
	   
	 tooltipsTable('1098','3483','field_1532','field_2586');
	//scene, view, hover info, field to have hover
   	
	tooltipsTable('1098','3483','field_1537','field_2213');  
 });
	
		//hover for labour details on workshop POT (diag/inv/recall)
   $(document).on('knack-view-render.view_3482', function (event, view, data) {
    //start
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
	
	 tooltipsTable('1098','3482','field_1532','field_2586');
	//scene, view, hover info, field to have hover
	tooltipsTable('1098','3482','field_1537','field_2213');  	    
    });
	
		//hover for labour details on workshop POT (Internal)
   $(document).on('knack-view-render.view_3477', function (event, view, data) {
    //start
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
	
	 tooltipsTable('1098','3477','field_1532','field_2586');
	//scene, view, hover info, field to have hover
   	
	tooltipsTable('1098','3477','field_1537','field_2213');  
    });

		//hover for todays internal jobs 
   $(document).on('knack-view-render.view_3770', function (event, view, data) {
    //start
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
	
	 tooltipsTable('1098','3770','field_1532','field_2586');
	//scene, view, hover info, field to have hover
   	
	tooltipsTable('1098','3770','field_1537','field_2213');  
    });

		//hover for jobs planned in the future 
   $(document).on('knack-view-render.view_3806', function (event, view, data) {
    //start
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
	
	 tooltipsTable('1098','3806','field_1532','field_2586');
	//scene, view, hover info, field to have hover
   	
	tooltipsTable('1098','3806','field_1537','field_2213');  
    });

//hover for labour details on workshop table
   $(document).on('knack-view-render.view_3307', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
	
	 tooltipsTable('1098','3307','field_1532','field_2586');
	//scene, view, hover info, field to have hover
   	
	tooltipsTable('1098','3307','field_1537','field_2213');  
	   	tooltipsTable('1098','3307','field_2298','field_2272');
	    
    });
	
//hover for labour details on workshop Today's jobs not checked in
   $(document).on('knack-view-render.view_3595', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
	
	 tooltipsTable('1098','3595','field_1532','field_2586');
	//scene, view, hover info, field to have hover
   	
	tooltipsTable('1098','3595','field_1537','field_2213');  
	    
    });
	
//hover for labour details on workshop jobs planned in the future
   $(document).on('knack-view-render.view_3805', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
	
	 tooltipsTable('1098','3805','field_1532','field_2586');
	//scene, view, hover info, field to have hover
   	
	tooltipsTable('1098','3805','field_1537','field_2213');  
	    
    });

//hover for labour details on workshop pots "completed work"
   $(document).on('knack-view-render.view_3826', function (event, view, data) {
    $('th[class="field_1537"]').hide();
    $('td[class*="field_1537"]').hide();
    $('th[class="field_1532"]').hide();
    $('td[class*="field_1532"]').hide();
	
	 tooltipsTable('1098','3826','field_1532','field_2586');
	//scene, view, hover info, field to have hover
   	
	tooltipsTable('1098','3826','field_1537','field_2213');  
	    
    });

	//auto refresh for C/D Driver pick up and return table
function recursivecallscene_1031(){
 setTimeout(function () { 
  if($("#view_3218").is(":visible")==true){ Knack.views["view_3218"].model.fetch()};
  if($("#view_3269").is(":visible")==true){ Knack.views["view_3269"].model.fetch()};
  recursivecallscene_1031(); }, 30000);
}


  //trigger get tyres and prices for a selected dealer from modal view
$(document).on('knack-form-submit.view_3519', function(event, view, data) { 
    
    try{
        

        let commandURL = "https://hook.eu1.make.celonis.com/osrisywv6fufmcdbf7ih8bc1yfrlvpq8";
        let dataToSend = JSON.stringify({"Record ID":data.id, "Selected Dealer":data.field_411});
	    
//   let refreshData = [
 //     {
 //         mainField : 'field_575', //Autoline Tyre Stock For Dealer
  //   views:['1475']
   //   }
  //  ]
    
        var rData = $.ajax({
            url: commandURL,
            type: 'POST',
            contentType: 'application/json',
            data: dataToSend,
            async: false
        }).responseText;
    }catch(exception){
        sendErrorToIntegromat(exception, "Trigger get selected dealer tyres");
    }
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
  $('div[id="kn-input-'+message.pdfAssetField+'"] div[class="kn-asset-current"]').html(message.fileName);
  $('#'+message.pdfAssetField+'_upload').hide();
  $('div[id="kn-input-'+message.pdfAssetField+'"] div[class="kn-file-upload"]').html('File uploaded successfully.');
}

//END OF SCAN APP CODE
//END

//THIS IS ARRAY OF scenes with document scan
var scanDocsSceneNames = ["scene_928","scene_1097","scene_1012","scene_1015","scene_1013","scene_1073","scene_1073"];
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



 //Aftersales - Trigger Manual Courtesy service wash/valet
  $(document).on('knack-view-render.view_2943', function (event, view, data) {
	  
    //This part is for column headers
    //Column header


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
          };
        };
        if (currentRow.id!==''){
          currentRow.children[1].onclick = createClickHandler(currentRow);
        }
      }
    }

  });

//auto refresh for workshop controller pots
function recursivecallscene_1098(){
 setTimeout(function () { 
  if($("#view_3474").is(":visible")==true) Knack.views["view_3474"].model.fetch();
  if($("#view_3476").is(":visible")==true) Knack.views["view_3476"].model.fetch();
  if($("#view_3483").is(":visible")==true) Knack.views["view_3483"].model.fetch();
  if($("#view_3482").is(":visible")==true) Knack.views["view_3482"].model.fetch();
  if($("#view_3477").is(":visible")==true) Knack.views["view_3477"].model.fetch();
  recursivecallscene_1098();
  }, 30000);
}

$(document).on('knack-scene-render.scene_1098', function(event, scene) {
 recursivecallscene_1098();
});

//Aftersales Workshop to mark Job card reports as Ready to invoice (RTI) for Warranty admin
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
          currentRow.children[12].onclick = createClickHandler(currentRow);
        }
      }
    }
 });

 const mapDealerNamesToCodes = [["Stellantis &You Birmingham Central","GH"],["Stellantis &You Birmingham North","CG"],["Stellantis &You Birmingham South","BK"],["Stellantis &You Brentford","WW"],["Stellantis &You Bristol Cribbs","TC"],["Stellantis &You Chelmsford","ES"],["Stellantis &You Chingford","CH"],["Stellantis &You Coventry","BW"],["Stellantis &You Crawley","VG"],["Stellantis &You Croydon","VY"],["Stellantis &You Edgware","WN"],["Stellantis &You Guildford","ST"],["Stellantis &You Hatfield","HD"],["Stellantis &You Leicester","CL"],["Stellantis &You Liverpool","LP"],["Stellantis &You Maidstone","RM"],["Stellantis &You Manchester","TG"],["Stellantis &You National","BH"],["Stellantis &You Newport","NP"],["Stellantis &You Nottingham","NT"],["Stellantis &You Preston","GL"],["Stellantis &You Redditch","RH"],["Stellantis &You Romford","RF"],["Stellantis &You Sale","SB"],["Stellantis &You Sheffield","GM"],["Stellantis &You Stockport","CT"],["Stellantis &You Walton","WY"],["Stellantis &You West London","LW"],["Stellantis &You Wimbledon","VM"]];
	  
 $(document).on('knack-view-render.view_3923', function(event, view, records) {
  getWorkshopAvailability();
});

function getWorkshopAvailability(retry = 1){
  console.log('v2')
  let lastDealerVisit = $('div[class="kn-detail field_303"]').text().replace('Last Dealer Visit','').trim();
  if ((lastDealerVisit==='' || lastDealerVisit.includes('No Last Dealer Found')) && retry < 10){
    console.log('lastDealerVisit empty, wait',retry)
    setTimeout(() => {
      getWorkshopAvailability(retry+1)
    }, retry*500);
    return;
  }
  if (lastDealerVisit==='' || lastDealerVisit.includes('No Last Dealer Found')){
    console.log('lastDealerVisit empty, exit');
    return;
  }
  console.log('lastDealerVisit',lastDealerVisit);
  let mapLastDealerVisit = mapDealerNamesToCodes.find(el => el[0] === lastDealerVisit);
  if (mapLastDealerVisit) mapLastDealerVisit = mapLastDealerVisit[1];
  console.log('mapLastDealerVisit',mapLastDealerVisit)
  if (!mapLastDealerVisit) return;
  let aJson = JSON.parse(callGetHttpRequest('https://api.apify.com/v2/key-value-stores/ISl77oKEGWUSIcuXx/records/workshopAvailability'));
  let avail = aJson.find(el => el.companyCode === mapLastDealerVisit);
  console.log('avail',avail);
  let htmlTable = '<b>Workshop Availability</b><br /><table><tr><td>Dealer</td><td>MOT</td><td>Recall</td><td>Small service</td><td>Large service</td></tr><tr><td>'+lastDealerVisit+'</td><td>'+formatDateGBShort(new Date(avail.work.find(el=>el.work==='MOT').availability))+'</td><td>'+formatDateGBShort(new Date(avail.work.find(el=>el.work==='Recall').availability))+'</td><td>'+formatDateGBShort(new Date(avail.work.find(el=>el.work==='Small service').availability))+'</td><td>'+formatDateGBShort(new Date(avail.work.find(el=>el.work==='Large service').availability))+'</td></tr>'
  $('div[id="view_3923"]>div').html(htmlTable);

}