function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setDate(date.getDate() + days); 
        date.setHours(0,0,0,0);
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

function callPostHttpRequest(url, headers,payloadObject){
    try{
      let commandURL = url ;
      let dataToSend = JSON.stringify(payloadObject) ;
      let requestObj = {
        url: commandURL,
        type: 'POST',
        contentType: 'application/json',
        data: dataToSend,
        async: false
      };
      console.log(requestObj);
      var rData = $.ajax(requestObj).responseText;
      return JSON.parse(rData);
    } catch(exception) {
      console.log(exception);
    }
}

async function callPostHttpRequestWithCompress(url, headers,payloadObject){
    try{
      let commandURL = url ;
      const stream = new Blob([JSON.stringify(payloadObject)], {type: 'application/json'}).stream();
      const compressedReadableStream = stream.pipeThrough(
        new CompressionStream("gzip")
        );
        const compressedResponse = await new Response(compressedReadableStream);
        const blob = await compressedResponse.blob();
        const buffer = await blob.arrayBuffer();
        console.log(buffer);
      let requestObj = {
        url: commandURL,
        type: 'POST',
        contentType: 'application/json',
        data: buffer,
        async: false,
        headers: {
            'Content-Encoding': 'gzip',
        }
      };
      console.log(requestObj);
      var rData = $.ajax(requestObj).responseText;
      return JSON.parse(rData);
    } catch(exception) {
      console.log(exception);
    }
}

function callGetHttpRequest(url, headers){
    try{
      let commandURL = url ;
      let requestObj = {
        url: commandURL,
        type: 'GET',
        async: false
      };
      console.log(requestObj);
      var rData = $.ajax(requestObj).responseText;
      return JSON.parse(rData);
    } catch(exception) {
      console.log(exception);
    }
}

function pad(n) {return n < 10 ? "0"+n : n;}
function dateTimeToGB(dateobj){
    return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+"/"+dateobj.getFullYear()+' '+dateobj.toLocaleTimeString("en-GB");
}
function dateTimeToGBNoYear(dateobj){
    return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+' '+dateobj.toLocaleTimeString("en-GB");
}

async function fillGlobalVarWithRequest(globalVarPropName,payloadObject, callback, doUpdate = false, doUpdateUniqueId = null ){
    try{
        let commandURL = 'https://davidmale--server.apify.actor/paaXHR?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw';
        let dataToSend = JSON.stringify(payloadObject) ;
        let requestObj = {
          url: commandURL,
          type: 'POST',
          contentType: 'application/json',
          data: dataToSend
        };
        console.log(requestObj);
        $.ajax(requestObj).done(function( data ) {
            globalPageData[globalVarPropName+'TimeStamp'] = new Date();
            if (doUpdate){
                globalPageData[globalVarPropName] = doUpdateGlobalData(globalPageData[globalVarPropName],data,doUpdateUniqueId);
            } else {
                globalPageData[globalVarPropName] = data;
            }
            saveAppData();
            try{
                if (callback) callback();
            } catch (ex){}
          });
      } catch(exception) {
        console.log(exception);
      }
}

function paaPostRequest(payloadObject){
    return callPostHttpRequest('https://davidmale--server.apify.actor/paaXHR?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw',{'token':'apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw'}, payloadObject)
}

async function paaPostRequestWithCompress(payloadObject){
    return await callPostHttpRequestWithCompress('https://davidmale--server.apify.actor/paaXHR?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw',{'token':'apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw'}, payloadObject)
}

function checkAuth(){
    if (window.location.href.includes('file:/')) return;
    if (window.location.href.includes('login.html')) return;
    let paaToken = readCookie('paaToken');
    if (!paaToken){
        window.location = './login.html';
    }
}

checkAuth();

var paaToken = readCookie('paaToken');
var loggedInUser = getLoggedInUser();
if (!loggedInUser.email){
    eraseCookie('paaToken');
    checkAuth();
}

$( document ).ready(function() {
    work();
});

function getLoggedInUser(){
    return paaPostRequest({'action':'userInfo','token':paaToken});
}

function pad(n) {return n < 10 ? "0"+n : n;}
function dateToGB(dateobj){
    return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+"/"+dateobj.getFullYear();
}

var table = null;
var jsonData = null;
var flowCode = null;

var globalPageData = null;

function work(){
    console.log('globalPageData1',globalPageData);
    if (!globalPageData){
        try {
            let lzwString = sessionStorage.getItem('globalPageData');
            globalPageData = JSON.parse(arrayBufferToString(gzip.unzip(base64ToArrayBuffer(lzwString),{level:9})));
            console.log('globalPageData2',globalPageData);
        } catch (ex){
            console.log(ex);
            globalPageData = {};
        }
        if (!globalPageData) globalPageData = {};
    }
    let page = window.location.href;
    //Login page
    $("a[id='loginButton']").bind("click", function() {
        let loginReq = paaPostRequest({'action':'login','email':$('[id="inputEmail"]').val(),'password':$('[id="inputPassword"]').val()});
        console.log(loginReq,loginReq.success);
        if (loginReq.success){
            createCookie('paaToken',loginReq.token,1);
            window.location = './index.html';
        } else {
            $('div[class="card-header"]').append('Wrong credentials')
        }
        return false;
    });

    //Logout
    $("a[id='logoutButton']").bind("click", function() {
        let req = paaPostRequest({'action':'logout','token':paaToken});
        eraseCookie('paaToken');
        window.location = './login.html';
    });

    if (!loggedInUser.isAutolineOpen){
        if ($("#autolineClosed").length===0){
            $('nav[class="sb-topnav navbar navbar-expand navbar-dark bg-dark"]').append('<div id="autolineClosed" class="navbar-brand ps-3">Autoline Closed</div>');
        }
    }

    if (!globalPageData.appLoaded){
        console.log('appNotLoaded',globalPageData.appLoaded)
        loadAppData();
    }

    $('#userName').text(loggedInUser.displayName)
    let qV = getUrlVars();
    if (page.includes('index.html')){
        let sumDate = qV['date'];
        console.log('sumDate',sumDate);
        let req = getServerData('runs', work); // paaPostRequest({'action':'getRuns','token':paaToken,'sortField':'createdDateTime','sortDirection':'Desc','limit':500,'filters':[]});
        let sumDateStart = new Date();
        sumDateStart.setHours(0,0,0,0);
        if (sumDate==='yesterday'){
            sumDateStart.setDate(sumDateStart.getDate()-1);
        }
        $('#sumDate').text(dateToGB(sumDateStart))
        let sumDateEnd = new Date(sumDateStart.getTime());
        sumDateEnd.setHours(23,59,59,59);
        let t0 = req.filter(el => (el.status==='queuedOnServer' || el.status==='running' || el.status==='startedNotConfirmed') && new Date(el.createdDateTime)>sumDateStart && new Date(el.createdDateTime)<sumDateEnd && (el.flowInput && el.flowInput.liveOrPreprod==='live'));
        $('#dashboardActiveRuns').html((t0.length===0?'All done':t0.length + ' running now'));
        let t1 = req.filter(el => el.status==='succeded' && new Date(el.createdDateTime)>sumDateStart && new Date(el.createdDateTime)<sumDateEnd && (el.flowInput && el.flowInput.liveOrPreprod==='live'));
        $('#dashboardSuccessfullRuns').html(t1.length + ' successfull runs today');
        let t2 = req.filter(el => el.status==='failed' && new Date(el.createdDateTime)>sumDateStart && new Date(el.createdDateTime)<sumDateEnd && (el.flowInput && el.flowInput.liveOrPreprod==='live'));
        $('#dashboardFailedRunsToday').html(t2.length + ' failed runs today');
        let t4 = req.filter(el => (el.status==='queued') && new Date(el.createdDateTime)>sumDateStart && new Date(el.createdDateTime)<sumDateEnd && (el.flowInput && el.flowInput.liveOrPreprod==='live'));
        $('#dashboardQueuedRuns').html((t4.length===0?'Nothing queued':t4.length + ' queued now'));
        $('table[id="datatablesSimpleFlowRunsSummary"]>tbody').html('');
        $('table[id="datatablesSimpleFlowRunsSummary"]>tbody').append(getFlowRunsSummary(req.filter(el => new Date(el.createdDateTime)>sumDateStart && new Date(el.createdDateTime)<sumDateEnd && (el.flowInput && el.flowInput.liveOrPreprod==='live')),['flowName','status']));
        const datatablesSimple = document.getElementById('datatablesSimpleFlowRunsSummary');
        if (datatablesSimple) {
            new simpleDatatables.DataTable(datatablesSimple);
        }
        let isSomethingActiveD = req.find(el => el.status!=='succeded' && el.status !=='failed' && el.status !=='canceled');
        setTimeout(() => {
            work();
        }, (isSomethingActiveD?30000:60000));

    }

    if (page.includes('machines.html')){
        //let req = paaPostRequest({'action':'getMachines','token':paaToken, 'refresh':(qV['refresh']?true:false)});
        let machines = getServerData('machines', work);
        let tM = machines.sort((a,b)=>(a.capacity>b.capacity?-1:(a.capacity<b.capacity?1:(a.name>b.name?1:-1)))).map(function (el){
            return '<tr><td>'+el.name+'</td><td>'+(el.enabled?'Yes':'No')+'</td><td>'+(el.serverLocked?'Server Locked':(el.localLocked?'Local Locked':'Free'))+'</td><td></td><td>'+el.capacity+'</td><td>'+(el.capacity===0?(el.attendedModeAvailable?'Available':'Not Ready')+' - '+dateTimeToGB(new Date(el.attendedModeAvailableTestDateTime)):'')+'</td><td>'+(el.connectionId?'Available':'Not set')+'</td><td><a href="#" onclick="editMachine(\''+el.name+'\')">Edit</a></td></tr>';
        })
        $('table[id="datatablesSimpleMachines"]>tbody').html('');
        $('table[id="datatablesSimpleMachines"]>tbody').append(tM.join(''));
        const datatablesSimple = document.getElementById('datatablesSimpleMachines');
        if (datatablesSimple) {
            new simpleDatatables.DataTable(datatablesSimple);
        }
        $('div[class="datatable-search"]').after($('div[class="datatable-dropdown"]'));
        let allowAttendedRuns = paaPostRequest({'action':'getMachineSettings','token':paaToken})
        $('#allowAttendedBotsText').html('Allow Attended Bot Runs: '+(allowAttendedRuns.allowAttendedRuns?'Yes':'No')+ ' - <a href="#" onclick="enableAttendedRuns('+!allowAttendedRuns.allowAttendedRuns+'); return false;">'+(allowAttendedRuns.allowAttendedRuns?'Disable':'Enable')+ '</a> / Number of machines to leave free over priority 1 : '+allowAttendedRuns.numberOfMachinesToLeaveFreeOverPriority1);
        if (qV['refresh']) paaPostRequest({'action':'getMachines','token':paaToken, 'refresh':true});
    }

    if (page.includes('flows.html')){
        let req = paaPostRequest({'action':'getFlows','token':paaToken, 'refresh':(qV['refresh']?true:false)});
        let tM = req.map(function (el){
            return '<tr><td>'+el.name+'</td><td><a href="#" onclick="showRun(\''+el.name+'\'); return false;">Run</a></td><td>'+getFlowStatusData(el)+'</td><td>'+(el.integrations?'Int: '+el.integrations.length:'')+'&nbsp;<a href="flowIntegrations.html?flow='+el.name+'">Integrations</a></td><td><a href="uicoll.html?flow='+el.name+'">Edit UI</a></td><td></td></tr>';
        })
        $('table[id="datatablesSimpleFlows"]>tbody').append(tM.join(''));
        const datatablesSimple = document.getElementById('datatablesSimpleFlows');
        if (datatablesSimple) {
            new simpleDatatables.DataTable(datatablesSimple);
        }
        $('div[class="datatable-search"]').after($('div[class="datatable-dropdown"]'))
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

        let machines = getServerData('machines',null,{},300);
        $('#runMachine').html('<option selected>Not set</option><option>'+machines.map(el => el.name).join('</option><option>')+'</option>')
    }

    if (page.includes('runs.html')){
        if (!table){
            table = new DataTable('#datatablesSimpleRuns',{
                ajax: function (data, callback, settings) {
                    callback({data:getRunsDataForTable()});
                  },
                columns: [
                { data: 'Flow Name',title: 'Flow Name'},
                { data: 'LiveOrPreprod',title: 'Live'},
                { data: 'Machine',title: 'Machine'},
                { data: 'Mode',title: 'Mode'},
                { data: 'State',title: 'State'},
                { data: 'Priority',title: 'Pri'},
                { data: 'Requested',title: 'Requested',name:'Requested'},
                { data: 'Started',title: 'Started'},
                { data: 'Duration',title: 'Duration'},
                { data: 'Details',title:'Details' },
                { data: 'In PA',title: 'In PA'}
                ],
                order: {
                    name: 'Requested',
                    dir: 'desc'
                },
                pageLength: 25,
                scroller: true,
                search: getSearchFromUrl(),
            });

            $('div[class="dt-search"]').detach().appendTo('div[class="dt-layout-cell dt-layout-start"]');
            $('div[class="dt-length"]').detach().appendTo('div[class="dt-layout-cell dt-layout-end"]');
        } else {
            refereshRunsTable();
        }

        let isSomethingActive = globalPageData.runs.find(el => el.status!=='succeded' && el.status !=='failed' && el.status !=='canceled');
        setTimeout(() => {
            work();
        }, (isSomethingActive?15000:45000));

        if ($('#reloadButton').length===0){
            $('div[class="dt-layout-cell dt-layout-start"]').append('<a id="reloadButton" href="#" onclick="reloadRuns(); return false;">Reload</a>');
        }
    }

    if (page.includes('uicoll.html')){
        console.log(qV['flow']);
        $('h1').text(qV['flow'])
        const buttonCodeToPA = document.createElement('button');
        buttonCodeToPA.textContent = 'Upload code from GitHub to PA';
        buttonCodeToPA.addEventListener('click', () => codeFromGithubToPA(qV['flow']));

        $('#uploadToGitHub').append(buttonCodeToPA);

        try {
            let respU = paaPostRequest({'action':'getUIControls','flowName':qV['flow'],'token':paaToken});
            jsonData = JSON.parse(atob(respU.data.content));
            flowCode = atob(respU.code.content);
            showScreenList();

            const buttonUpload = document.createElement('button');
            buttonUpload.textContent = 'Process UI to GitHub and PowerAutomate';
            buttonUpload.addEventListener('click', () => uploadControlsToGitHub(qV['flow']));

            $('#uploadToGitHub').append(buttonUpload);

            document.getElementById('back-button').addEventListener('click', () => {
                document.getElementById('screen-list').style.display = 'block';
                document.getElementById('editor-container').style.display = 'none';
            });
        } catch (ex){
            
        }
    }

    if (page.includes('flowIntegrations.html')){
        console.log(qV['flow']);
        $('h1').text(qV['flow'])
        
        refreshIntegrations(qV['flow'])

        document.getElementById('save-button').addEventListener('click', () => {
            if (globalPageData.flowIntegrationEdit===null || globalPageData.flowIntegrationEdit===undefined){
                alert('problem');
                return;
            }
            let jNew = $('#integration-details-edit').val();
            console.log(jNew);
            let jNewJSON = {}
            try {
                jNewJSON = JSON.parse(jNew);
            } catch (ex){
                console.log(ex);
                alert('JSON can not be parsed');
                return;
            }
            if (globalPageData.flowIntegrationEdit===-1){
                if (!globalPageData.flowData.integrations) globalPageData.flowData.integrations = [];
                globalPageData.flowData.integrations.push(jNewJSON);
            } else {
                globalPageData.flowData.integrations[globalPageData.flowIntegrationEdit] = jNewJSON;
            }
            let respU = paaPostRequest({'action':'uploadIntegrationsForFlow','token':paaToken,'flowName':globalPageData.flowData.name,'integrations':globalPageData.flowData.integrations});
            console.log(respU);
            globalPageData.flowIntegrationEdit = null;
            document.getElementById('editor-container').style.display = 'none';
            $('#add-button').show();
        });
        document.getElementById('back-button').addEventListener('click', () => {
            globalPageData.flowIntegrationEdit = null;
            document.getElementById('editor-container').style.display = 'none';
            $('#add-button').show();
        });
        document.getElementById('add-button').addEventListener('click', () => {
            globalPageData.flowIntegrationEdit = -1;
            $('#integration-details-edit').val('')
            $('#editor-container').show();
            $('#add-button').hide();
            refreshIntegrations(qV['flow'])
        });
    }
}

function saveMachine(){
    let machineName = $('#machineName').text();
    console.log(machineName);
    let machines = getServerData('machines',null,{},300);
    let fM = machines.find(el => el.name === machineName);
    console.log(fM,document.querySelector('#enabled').value,document.querySelector('#connectionId').value);
    if (fM){
        paaPostRequest({'action':'setMachineData','token':paaToken,'machineName':machineName,'connectionId':document.querySelector('#connectionId').value,'enabled':(document.querySelector('#enabled').value==='1'?true:false)})
    }
    $('#editor-container').hide();
    getServerData('machines',null,{},0);
    work();
}

function editMachine(machineName){
    let machines = getServerData('machines',null,{},300);
    let fM = machines.find(el => el.name === machineName);
    console.log(fM);
    $('#editor-container').show();
    $('#machineName').text(machineName);
    $('#connectionId').attr('value',fM.connectionId);
    if (fM.enabled){
        $('select[id="enabled"]>option[value=1]').attr('selected',true);
        $('select[id="enabled"]>option[value=0]').removeAttr('selected')
    } else {
        $('select[id="enabled"]>option[value=0]').attr('selected',true);
        $('select[id="enabled"]>option[value=1]').removeAttr('selected')
    }
}

function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function arrayBufferToString( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return binary;
}

function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new Uint8Array(bytes.buffer);
}

function enableAttendedRuns(enable){
    let res = paaPostRequest({'action':'setAllowAttendedRuns','token':paaToken,'allowAttendedRuns':enable});
    work();
}

function loadAppData(){
    console.log('loadData')
    getServerData('machines');
    getServerData('runs');
    globalPageData.appLoaded = true;
}

function saveAppData(){
    sessionStorage.setItem("globalPageData",arrayBufferToBase64(gzip.zip(JSON.stringify(globalPageData),{level:9})));
}

function manageRunsList(){

}

function getRunsServerData(refreshCallback){
    console.log('getRunsServerData')
    if (!globalPageData['runs'] || globalPageData['runs'].length === 0){
        if (refreshCallback && globalPageData['runs']){
            refreshServerData('runs',null, true, refreshCallback);
            return globalPageData['runs'];
        }
        return refreshServerData('runs',null);
    }
    let lastNotSolved = globalPageData['runs'].filter(el => el.status !== 'failed' && el.status!=='succeded' && el.status!=='canceled');
    if (lastNotSolved.length===0){
        globalPageData['runs'] = globalPageData['runs'].sort((a,b)=> (new Date(a.createdDateTime)>new Date(b.createdDateTime)?1:-1));
        let otherParams1 = {filters:[{'field':'createdDateTime','value':globalPageData['runs'][0].createdDateTime}]};
        if (refreshCallback && globalPageData['runs']){
            refreshServerData('runs',otherParams1, true, refreshCallback,true);
            return globalPageData['runs'];
        }
        return refreshServerData('runs',otherParams1,false,null,true);
    }
    lastNotSolved = lastNotSolved.sort((a,b)=> (new Date(a.createdDateTime)>new Date(b.createdDateTime)?1:-1));
    console.log(lastNotSolved);
    let otherParams2 = {filters:[{'field':'createdDateTime','value':lastNotSolved[0].createdDateTime}]};
    if (refreshCallback && globalPageData['runs']){
        refreshServerData('runs',otherParams2, true, refreshCallback,true);
        return globalPageData['runs'];
    }
    return refreshServerData('runs',otherParams2,false,null,true);
}

function getServerData(dataName,refreshCallback=null, otherParams = {}, maxSecFromRefresh = 60){
    if (globalPageData[dataName] && globalPageData[dataName+'TimeStamp'] && difFromNowInSeconds(new Date(globalPageData[dataName+'TimeStamp']))<maxSecFromRefresh){
        return globalPageData[dataName];
    }
    if (dataName==='runs'){
        return getRunsServerData(refreshCallback, maxSecFromRefresh)
    }
    if (refreshCallback && globalPageData[dataName]){
        refreshServerData(dataName,otherParams, true, refreshCallback);
        return globalPageData[dataName];
    }
    return refreshServerData(dataName,otherParams);
}

function refreshServerData(dataName, otherParams = {}, async = false, callback=null, doUpdate = false){
    let serverDataGetList = [{ name : 'machines', action:'getMachines', uniqueId:'id'},{name:'runs',action:'getRuns', uniqueId:'queueId',defaultParams:{'sortField':'createdDateTime','sortDirection':'Desc','limit':1500,'filters':[]}}];
    let serverDataGet = serverDataGetList.find(el => el.name === dataName);
    let payload = {'action':serverDataGet.action,'token':paaToken};
    if (serverDataGet.defaultParams) Object.assign(payload,serverDataGet.defaultParams);
    if (otherParams) Object.assign(payload,otherParams);
    if (async){
        fillGlobalVarWithRequest(dataName,payload,callback, doUpdate,serverDataGet.uniqueId)
    } else {
        let data = paaPostRequest(payload);
        globalPageData[dataName+'TimeStamp'] = new Date();
        if (doUpdate){
            globalPageData[dataName] = doUpdateGlobalData(globalPageData[dataName],data,serverDataGet.uniqueId);
        } else {
            globalPageData[dataName] = data;
        }
        saveAppData();
        return globalPageData[dataName];
    }
}

function doUpdateGlobalData(oldData, newData, fieldToMatch){
    for (let i = 0;i<newData.length;i++){
        let f = oldData.findIndex(el => el[fieldToMatch] === newData[i][fieldToMatch]);
        if (f>-1){
            oldData[f] = newData[i];
        } else {
            oldData.push(newData[i]);
        }
    }
    return oldData;
}

function reloadRuns(){
    refreshServerData('runs',{},true,refereshRunsTable);
    //fillGlobalVarWithRequest('runs',{'action':'getRuns','token':paaToken,'sortField':'createdDateTime','sortDirection':'Desc','limit':500,'filters':[]},refereshRuns)
    //globalPageData.runsTimeStamp = new Date();
}

function refereshRunsTable(){
    console.log('refreshRuns')
    if (table) table.ajax.reload(null, false);
}

function difFromNowInSeconds(date){
    return (new Date - date)/1000;
}

function showRun(flowName){
    $('#editor-container').show();
    $('#flowName').text(flowName);
    globalPageData.flowToRun = flowName;
}

function runFlow(){
    $('#validationMessage').text('');
    if (!globalPageData.flowToRun){
        $('#validationMessage').text('No flow selected');
        return false;
    }
    let newInputStr = $('#runInput').val();
    if (newInputStr===''){
        $('#validationMessage').text('Input can not be empty');
        return false;
    }
    let newInput = {};
    try {
        newInput = JSON.parse(newInputStr);
    } catch (ex){
        console.log(ex);
        $('#validationMessage').text('Error parsing JSON input');
        return false;
    }
    if (!newInput.liveOrPreprod){
        $('#validationMessage').text('liveOrPreprod property is mandatory for input');
        return false;
    }
    let runData = {
        priority : $('#runPriority').val(),
        flowName : globalPageData.flowToRun,
        flowInput : newInput,
        runMode :$('#runMode').val(),
        noRetry : true
    }
    if ($('#runMachine').val()!=="Not set") runData.preferedMachineName = $('#runMachine').val();
    console.log(runData);
    $('#editor-container').hide();
    return callPostHttpRequest('https://davidmale--server.apify.actor/powerAutomateNewRequest?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw',{'token':'apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw'},runData)
}

function refreshIntegrations(flowName){
    let req = paaPostRequest({'action':'getFlows','token':paaToken, 'refresh':false});
    let f = req.find(el =>el.name === flowName);
    globalPageData.flowData = f;
    console.log(f.integrations);
    if (f.integrations){
        let intUl = document.getElementById('integrations');
        $('#integrations').empty()
        f.integrations.forEach((integ, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = integ.executeLiveOrPreprod.join(',')+ ' - '+integ.statuses.join(',')+'  '
            const button = document.createElement('button');
            button.textContent = 'Edit';
            button.addEventListener('click', () => editIntegration(index));
            listItem.appendChild(button);
            intUl.appendChild(listItem);
        });
    }
}

function editIntegration(index){
    if (!globalPageData.flowData) return;
    globalPageData.flowIntegrationEdit = index;
    console.log('to edit',globalPageData.flowData.integrations[index]);
    $('#integration-details-edit').val(JSON.stringify(globalPageData.flowData.integrations[index],null,2))
    $('#editor-container').show();
    $('#add-button').hide();
}

function getFlowStatusData(flowData){
    let o = '';
    o += (!flowData.statusData?'ready':flowData.statusData.status)+'&nbsp;';
    if (!flowData.statusData || flowData.statusData.status==='ready'){
        o += '<a href="#" onclick="changeFlowStatus(\''+flowData.name+'\',\'stopped\'); return false;">Stop flow</a>';
    } else {
        o += '<a href="#" onclick="changeFlowStatus(\''+flowData.name+'\',\'ready\'); return false;">Enable flow</a>';
    }
    return o;
}

function changeFlowStatus(flowName,status){
    let res = paaPostRequest({action:'changeFlowStatus',flowName:flowName,newStatus:status});
    window.location = './flows.html?refresh=true';
}

function getFlowRunsSummary(data,groupFields){
    let d = getArraySummary(data, groupFields);
    let o = '';// '<table><thead><tr><th>Flow Name</th><th>Status</th><th>Count</th></tr></thead><tbody>';
    for (let i =0;i<d.length;i++){
        o += '<tr><td>'+d[i].flowName+'</td><td>'+d[i].status+'</td><td>'+d[i].count+'</td></tr>'
    }
    //o += '</tbody></table>';
    return o;
}

function getArraySummary(data,groupFields){
    let sumData = data.reduce(function(output,val){
        let f = output.find(function(el){
            for (let i = 0;i<groupFields.length;i++){
                if (val[groupFields[i]]!==el[groupFields[i]]) return false;
            }
            return true;
        })
        if (!f){
            let newO = {count:1};
            for (let i = 0;i<groupFields.length;i++){
                newO[groupFields[i]] = val[groupFields[i]];
            }
            output.push(newO);
        } else {
            f.count += 1;
        }
        return output;
    },[])
    return sumData;
}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

async function codeFromGithubToPA(flowName){
    let respU = await paaPostRequest({'action':'codeFromGitHubToPA','token':paaToken,'flowName':flowName});
    console.log(respU);
    if (respU.success){
        $('#actionInfo').text('Code from GitHub to PA FINISHED SUCCESS');
    } else {
        $('#actionInfo').text('Code from GitHub to PA ERROR');
    }
    clearActionInfoAfter15sec();
}

async function uploadControlsToGitHub(flowName){
    console.log('uploadControlsToGitHub',flowName);
    $('#actionInfo').text('Prepare data');
    let newFlowCode = flowCode;
    let screensToMerge = jsonData.Screens.filter(el => el.mergeToScreen);
    if (screensToMerge.length>0){
        for (let i = 0;i<screensToMerge.length;i++){
            let mergeTo = jsonData.Screens.find(el => el.InstanceId === screensToMerge[i].mergeToScreen);
            for (let j = 0;j<screensToMerge[i].Controls.length;j++){
                copyToWindowInt(screensToMerge[i].InstanceId,screensToMerge[i].Controls[j].InstanceId,mergeTo.InstanceId);
            }
            console.log('from','appmask[\''+screensToMerge[i].Name.replaceAll('\'','\\\'')+'\']', 'to','appmask[\''+mergeTo.Name.replaceAll('\'','\\\'')+'\']');
            newFlowCode = newFlowCode.replaceAll('appmask[\''+screensToMerge[i].Name.replaceAll('\'','\\\'')+'\']','appmask[\''+mergeTo.Name.replaceAll('\'','\\\'')+'\']')
        }
        console.log(newFlowCode);
    }
    $('#actionInfo').text('Upload to GitHub started');
    let respU = await paaPostRequest({'action':'setUIControls','token':paaToken,'flowName':flowName,'data':jsonData,'code':newFlowCode});
    console.log(respU);
    if (respU.success){
        $('#actionInfo').text('Upload to GitHub FINISHED SUCCESS');
    } else {
        $('#actionInfo').text('Upload to GitHub ERROR');
    }
    clearActionInfoAfter15sec();
}

function showScreenList() {
    const screenList = document.getElementById('screens');
    const screens = jsonData.Screens || [];
    screenList.innerHTML = '';

    screens.forEach((screen, index) => {
        const listItem = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = screen.Name || `Screen ${index + 1}`;
        button.addEventListener('click', () => showScreenDetails(index));
        listItem.appendChild(button);
        screenList.appendChild(listItem);
    });
}

function showScreenDetails(index) {
    const screen = jsonData.Screens[index];
    const detailsContainer = document.getElementById('screen-details');
    detailsContainer.innerHTML = '';

    // Display screen name
    const nameElement = document.createElement('h3');
    nameElement.textContent = `Name: ${screen.Name}`;
    detailsContainer.appendChild(nameElement);

    // Display selectors
    if (screen.Selectors) {
        const selectorsTitle = document.createElement('h4');
        selectorsTitle.textContent = 'Selectors:';
        detailsContainer.appendChild(selectorsTitle);

        const selectorsList = document.createElement('ul');
        screen.Selectors.forEach(selector => {
            const selectorItem = document.createElement('li');

            // Create selector summary
            const selectorName = document.createElement('strong');
            selectorName.textContent = selector.Name || 'Unnamed Selector';
            selectorItem.appendChild(selectorName);

            if (selector.Elements) {
                const elementsList = document.createElement('ul');
                selector.Elements.forEach(element => {
                    if (element.Attributes) {
                        Object.entries(element.Attributes).forEach(([attrName, attrValue]) => {
                            if (!attrValue.Ignore) {
                                const elementItem = document.createElement('li');
                                elementItem.textContent = `${attrValue.Name} - ${attrValue.Operation || 'No Operation'} - ${attrValue.Value || 'No Value'}`;
                                elementsList.appendChild(elementItem);
                            }
                        });
                    }
                });
                selectorItem.appendChild(elementsList);
            }

            selectorsList.appendChild(selectorItem);
        });
        detailsContainer.appendChild(selectorsList);
    }

    const selectorsTitle = document.createElement('h4');
    selectorsTitle.textContent = 'Merge screen to:';
    detailsContainer.appendChild(selectorsTitle);
    if (screen.mergeToScreen){
        const strongMT = document.createElement('strong');
        strongMT.textContent = 'This screen will be merged to '+screen.mergeToScreen;
        detailsContainer.appendChild(strongMT);
    } else {
        var selectList = document.createElement("select");
        selectList.id = "newWindowFor_"+screen.InstanceId;
        detailsContainer.appendChild(selectList);
        for (var i = 0; i < jsonData.Screens.length; i++) {
            var option = document.createElement("option");
            option.value = jsonData.Screens[i].InstanceId;
            option.text = jsonData.Screens[i].Name;
            selectList.appendChild(option);
        }
        const buttonM = document.createElement('button');
        buttonM.textContent = `Merge`;
        buttonM.addEventListener('click', () => mergeWindowToWindow(screen.InstanceId));
        detailsContainer.appendChild(buttonM);
    }

    // Display controls
    if (screen.Controls) {
        const controlsTitle = document.createElement('h4');
        controlsTitle.textContent = 'Controls:';
        detailsContainer.appendChild(controlsTitle);

        const controlsList = document.createElement('ul');
        screen.Controls.forEach(control => {
            const controlItem = document.createElement('li');
            controlItem.textContent = control.Name || 'Unnamed Control';
            const buttonE = document.createElement('button');
            buttonE.textContent = `Edit`;
            buttonE.addEventListener('click', () => showControlDetails(control.InstanceId));
            controlItem.appendChild(buttonE);
            const buttonM = document.createElement('button');
            buttonM.textContent = `Copy to `;
            buttonM.addEventListener('click', () => copyToWindow(screen.InstanceId,control.InstanceId));
            controlItem.appendChild(buttonM);
            var selectList = document.createElement("select");
            selectList.id = "windowForC_"+control.InstanceId;
            controlItem.appendChild(selectList);
            for (var i = 0; i < jsonData.Screens.length; i++) {
                var option = document.createElement("option");
                option.value = jsonData.Screens[i].InstanceId;
                option.text = jsonData.Screens[i].Name;
                selectList.appendChild(option);
            }
            controlsList.appendChild(controlItem);
        });
        detailsContainer.appendChild(controlsList);
    }

    document.getElementById('screen-list').style.display = 'none';
    document.getElementById('editor-container').style.display = 'block';
}

function mergeWindowToWindow(screenInstanceId){
    let screenMoveTo = $('select[id="newWindowFor_'+screenInstanceId+'"]>option:selected').val();
    console.log('screenMoveTo',screenMoveTo);
    jsonData.Screens.find(el => el.InstanceId === screenInstanceId).mergeToScreen = screenMoveTo;
    $('#back-button').click();
}

function copyToWindow(screenInstanceId,controlInstanceId){
    let screenMoveTo = $('select[id*="'+controlInstanceId+'"]>option:selected').val();
    console.log('screenMoveTo',screenMoveTo);
    let res = copyToWindowInt(screenInstanceId,controlInstanceId, screenMoveTo)
    $('#actionInfo').text('Control '+res.controlName+' created in '+res.newWindowName);
    clearActionInfoAfter15sec();
}

function copyToWindowInt(screenInstanceId,controlInstanceId, screenMoveToInstanceId){
    let controlToCopy = jsonData.Screens.find(el => el.InstanceId === screenInstanceId).Controls.find(el => el.InstanceId === controlInstanceId);
    let cJ = Object.assign({},jsonData.Screens.find(el => el.InstanceId === screenInstanceId).Controls.find(el => el.InstanceId === controlInstanceId));
    controlToCopy.InstanceId = crypto.randomUUID();
    controlToCopy.Name = cJ.Name+ ' old';
    console.log(cJ);
    let toWindow = jsonData.Screens.find(el => el.InstanceId === screenMoveToInstanceId);
    toWindow.Controls.push(cJ);
    return {controlName: cJ.Name, newWindowName:toWindow.Name};
}

function clearActionInfoAfter15sec(){
    setTimeout(() => {
        $('#actionInfo').text('');
    }, 15000);
}

function getSearchFromUrl(){
    let s = window.location.search;
    if (s!==''){
        return {
            "search" : s.replace('?','')
        }
    }
    return null;
}

function getRunsDataForTable(){
    console.log('getRunsDataForTable')
    let runs = getServerData('runs',refereshRunsTable,null,15)
    let contentToHide = '';
    runs = runs.sort((a,b)=> (new Date(a.createdDateTime)>new Date(b.createdDateTime)?1:-1));
    let tMJ = runs.map(function (el){
        contentToHide += formatRunDetails(el,getServerData('machines',null,{},300));
        return {'Flow Name':el.flowName,'LiveOrPreprod':(el.liveOrPreprod?el.liveOrPreprod:(el.flowInput.liveOrPreprod?el.flowInput.liveOrPreprod:'')),'Machine':(el.machine?el.machine.name:''),'Mode':(el.runMode?el.runMode:''),'State':el.status+(el.retryCount?' R:'+el.retryCount:'')+(el.status==='queued' && el.flowStopped?'<br/>Flow stopped':'')+(el.status==='failed' || el.status==='canceled'?'<br /><a href="#" onclick="resurrectRun(\''+el.queueId+'\');return false;">Resurrect</a>':'')+(el.status==='running' || el.status==='queuedOnServer' || el.status==='queued'?'<br /><a href="#" onclick="cancelRun(\''+el.queueId+'\');return false;">Cancel run</a>':'')+(el.status==='succeded'?getSuccOutputDet(el):'')+(el.status==='waiting'?'<br />'+dateTimeToGB(new Date(el.waitingStartSonestAt)):''),'Priority':el.priority,'Requested':dateTimeToGBNoYear(new Date(el.createdDateTime)),'Started':(el.startedDateTime?dateTimeToGBNoYear(new Date(el.startedDateTime)):''),'Duration': (el.completedDateTime&&el.startedDateTime?(new Date((new Date(el.completedDateTime)-new Date(el.startedDateTime))).toISOString().substring(14, 19)):''),'Details':'<a href="#" onclick="showModal(\'runDetails\',\'runDetailsBody\',\'queueDetailsText-'+el.queueId+'\');return false;">Show details</a>'+(el.outputs?'<br /><a href="#" onclick="showModal(\'runDetails\',\'runDetailsBody\',\'runOutputsText-'+el.runId+'\');return false;">Show output</a>':''),'In PA':'<a target="_blank" href="'+el.hrefDetails+'">Open</a>'};
    })
    console.log(tMJ);
    $('div[id="runDetailsData"]').html('');
    $('div[id="runDetailsData"]').append(contentToHide);
    return tMJ;
}

function getSuccOutputDet(run){
    let retText = '';
    if (run.outputs && run.outputs.FlowOutput && run.outputs.FlowOutput.data && run.outputs.FlowOutput.data.length>0){
        let succ = run.outputs.FlowOutput.data.filter(el => el.success);
        let fail = run.outputs.FlowOutput.data.filter(el => !el.success);
        retText = '<br />S:'+succ.length+', F:'+fail.length
    }
    return retText;
} 

function showModal(modalName,what, fromWhere){
    $('#'+what).html($('#'+fromWhere).html());
    $('#'+modalName).modal('show');
    return false;
}

function resurrectRun(queueId){
    paaPostRequest({'action':'resurrectRun','token':paaToken,'queueId':queueId});
}

function cancelRun(queueId){
    paaPostRequest({'action':'cancelRun','token':paaToken,'queueId':queueId});
}

function reRunInPreprod(runId){
    console.log('reRunInPreprod',runId);
    $('button[aria-label="Close"]').click();
    let req = paaPostRequest({'action':'getRuns','token':paaToken,'sortField':'createdDateTime','sortDirection':'Desc','limit':250,'filters':[]});
    let run = req.find(el => el.runId === runId);
    console.log('machine',$('div[id="runDetailsBody"] select[id="preProdMachine_'+runId+'"]').val())
    console.log('mode',$('div[id="runDetailsBody"] select[id="preProdMode_'+runId+'"]').val())
    console.log(run);
    let newInput = run.flowInput;
    newInput.liveOrPreprod = 'preprod';
    let runData = {
        priority : run.priority,
        flowName : run.flowName,
        flowInput : newInput,
        preferedMachineName : $('div[id="runDetailsBody"] select[id="preProdMachine_'+runId+'"]').val(),
        runMode : $('div[id="runDetailsBody"] select[id="preProdMode_'+runId+'"]').val(),
        noRetry : true
    }
    return callPostHttpRequest('https://davidmale--server.apify.actor/powerAutomateNewRequest?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw',{'token':'apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw'},runData)
}

function formatRunDetails(run, machines){
    let d = '<div id="queueDetailsText-'+run.queueId+'" style="display: none">Input:<br />'+JSON.stringify(run.flowInput,null,2)+'<br />';
    if (run.status==='failed'){
        d += 'Retry count: '+(run.retryCount?run.retryCount:0)+'<br />';
        d += 'Max retry count: '+run.maxRetryCount +'<br />';
        d += 'Error:<br />'+(run.statusDescription?run.statusDescription.substring(0,150)+' ...':'')+'<br />';;
    }
    if (run.hrefDetails) d += '<a target="_blank" href="'+run.hrefDetails+'">Run details in PA</a><br />';
    if (run.runId){
        if (run.flowInput && JSON.stringify(run.flowInput).includes('liveOrPreprod')){
            d += '<br /><br /><a href="#" onclick="reRunInPreprod(\''+run.runId+'\'); return false;">Rerun in Pre-Prod on machine</a> <select id="preProdMachine_'+run.runId+'"><option>'+machines.map(el => el.name).join('</option><option>')+'</option></select> in <select id="preProdMode_'+run.runId+'"><option>attended</option><option>unattended</option></select> mode<br />';
        }
    }
    if (run.status==='succeded'){
        d += '<a href="#" onclick="resurrectRun(\''+run.queueId+'\'); alert(\'The run will be resurrected.\'); return false;">Resurrect - it will run this successful run again !</a>';
    }
    if (run.retryHistory){
        d += 'Retry count: '+run.retryCount+'<br />';
        d += 'Retry summary:<br />'+run.retryHistory.map(function(el){ return  dateTimeToGBNoYear(new Date(el.startedDateTime)) +' : '+ (el.statusDescription?el.statusDescription.substring(0,150)+' ...':'')+' - <a target="_blank" href="'+el.hrefDetails+'">Run details in PA</a>'}).join('<br />')
    }
    d += '</div>';
    if (run.outputs){
        d += '<div id="runOutputsText-'+run.runId+'" style="display: none">Output:<br />'+JSON.stringify(run.outputs,null,2);
        if (run.outputs.FlowOutput && run.outputs.FlowOutput.data && run.outputs.FlowOutput.data.length>0){
            let failedD = run.outputs.FlowOutput.data.filter(el => !el.success);
            d += '<br />Failed data:<br />' +JSON.stringify(failedD,null,2)
            if (run.flowInput && run.flowInput.data && run.flowInput.data.length>0){
                let newFlowInput = Object.assign({},run.flowInput);
                newFlowInput.data = newFlowInput.data.filter(el => (failedD.find(el2 => el2.RegNumber === el.RegNumber)===undefined?false:true))
                d += '<br />To rerun input:<br />' +JSON.stringify(newFlowInput,null,2)
            }
        }
        d += '</div>';
    }
    
    return d;
}