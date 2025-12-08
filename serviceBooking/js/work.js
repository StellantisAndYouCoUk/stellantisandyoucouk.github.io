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

function checkAuth(){
    //if (window.location.href.includes('file:/')) return;
    if (window.location.href.includes('login.html')) return;
    let paaToken = readCookie('paaToken');
    if (!paaToken){
        window.location = './login.html';
    }
}

checkAuth();

var token = readCookie('bookingToken');
var loggedInUser = getLoggedInUser();
/*if (!loggedInUser.email){
    eraseCookie('bookingToken');
    checkAuth();
}*/

$( document ).ready(function() {
    work();
});

function getLoggedInUser(){
    let d = readCookie('bookingUser');
    console.log(d)
}

function pad(n) {return n < 10 ? "0"+n : n;}
function dateToGB(dateobj){
    return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+"/"+dateobj.getFullYear();
}
function dateToAutoline(dateobj){
    return dateobj.getFullYear()+"-"+pad(dateobj.getMonth()+1)+"-"+pad(dateobj.getDate());
}

var table = null;
var jsonData = null;
var flowCode = null;

var globalPageData = null;

function login(username,password){
    let r = callPostHttpRequest('https://custom-renderer-write.rd.knack.com/v1/session/',null,{"email":username,"password":password,"remember":false,"view_key":"view_1101","url":"https://www.stellantisandyou.co.uk/digital#home/"})
    console.log(r);
    return r;
}

function work(){
    //Login page
    $("a[id='loginButton']").bind("click", function() {
        let loginReq = login($('[id="inputEmail"]').val(),$('[id="inputPassword"]').val())
        if (loginReq.success){
            createCookie('bookingToken',loginReq.token,1);
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

function difFromNowInSeconds(date){
    return (new Date - date)/1000;
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

function getSearchFromUrl(){
    let s = window.location.search;
    if (s!=='' && !s.includes('=')){
        return {
            "search" : s.replace('?','')
        }
    }
    return null;
}

function showModal(modalName,what, fromWhere){
    $('#'+what).html($('#'+fromWhere).html());
    $('#'+modalName).modal('show');
    return false;
}
