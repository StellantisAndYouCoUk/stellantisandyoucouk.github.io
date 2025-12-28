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
        async: false,
        headers:headers
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
    token = readCookie('bookingToken');
    if (!token){
        window.location = './login.html';
    }
    loggedInUser = getLoggedInUser();
    if (!loggedInUser){
        window.location = './login.html';
    }
}

var token = null;
var loggedInUser = null;

checkAuth();

/*if (!loggedInUser.email){
    eraseCookie('bookingToken');
    checkAuth();
}*/

$( document ).ready(function() {
    work();
});

function getLoggedInUser(){
    let d = readCookie('bookingToken');
    let u = callPostHttpRequest('https://davidmale--shared-server-1.apify.actor/getUser?token=apify_api_pt5m4fzVRYCWBTCdu5CKzc02hKZkXg2eeqW3',{'Authorization':'Bearer apify_api_pt5m4fzVRYCWBTCdu5CKzc02hKZkXg2eeqW3'},{token:d})
    return (u.data && u.data.session && u.data.session.user);
}

function pad(n) {return n < 10 ? "0"+n : n;}
function dateToGB(dateobj){
    return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+"/"+dateobj.getFullYear();
}
function dateToAutoline(dateobj){
    return dateobj.getFullYear()+"-"+pad(dateobj.getMonth()+1)+"-"+pad(dateobj.getDate());
}

function login(username,password){
    let r = callPostHttpRequest('https://custom-renderer-write.rd.knack.com/v1/session/',{'x-knack-application-id':'591eae59e0d2123f23235769','x-knack-rest-api-key':'renderer'},{"email":username,"password":password,"remember":false,"view_key":"view_1101","url":"https://www.stellantisandyou.co.uk/digital#home/"})
    return r;
}

function findDealerships(postcode){

}

var serviceBookingProcess = {};
var supportData = null;

function work(){
    let page = window.location.href;
    //Login page
    $("a[id='loginButton']").bind("click", function() {
        let loginReq = login($('[id="inputEmail"]').val(),$('[id="inputPassword"]').val())
        if (loginReq.session && loginReq.session.user){
            createCookie('bookingToken',loginReq.session.user.token,1);
            callPostHttpRequest('https://davidmale--shared-server-1.apify.actor/addSession?token=apify_api_pt5m4fzVRYCWBTCdu5CKzc02hKZkXg2eeqW3',null,{data:loginReq})
            window.location = './index.html';
            loggedInUser = loginReq.session.user;
        } else {
            $('div[class="card-header"]').append('Login problem - ' + loginReq.errors[0].message);
        }
        return false;
    });

    $("a[id='searchRegistration']").bind("click", function() {
        let r = callPostHttpRequest('https://davidmale--shared-server-1.apify.actor/getDetailsByRegBasic?token=apify_api_pt5m4fzVRYCWBTCdu5CKzc02hKZkXg2eeqW3',null,{token:token,registrationNumber:$('input[id="registrationNumber"]').val()})
        serviceBookingProcess.registrationNumber = r.data.registrationNumber;
        serviceBookingProcess.vehicle = r.data.vehicle;
        serviceBookingProcess.customer = r.data.customer;
        sessionStorage.setItem('serviceBookingProcess',serviceBookingProcess);
        work();
        return false;
    });

    //Logout
    $("a[id='logoutButton']").bind("click", function() {
        eraseCookie('bookingToken');
        window.location = './login.html';
    });

    $('#userName').text(loggedInUser.values.field_2.full);
    if (!supportData){
        supportData = sessionStorage.getItem('supportData');
        if (!supportData){
            supportData = callPostHttpRequest('https://davidmale--shared-server-1.apify.actor/getSupportData?token=apify_api_pt5m4fzVRYCWBTCdu5CKzc02hKZkXg2eeqW3',null,{token:token});
            console.log(supportData);
            sessionStorage.setItem('supportData',supportData);
        }
    }
    if (!serviceBookingProcess) serviceBookingProcess = sessionStorage.getItem('serviceBookingProcess');
    console.log('serviceBookingProcess',serviceBookingProcess)
    let qV = getUrlVars();
    if (page.includes('index.html')){
        if (!serviceBookingProcess.registrationNumber){
            $('div[id="step1"]').show();
            $('div[id="step2"]').hide();
        } else if (serviceBookingProcess.registrationNumber){
            $('h1[id="registrationNumberShow"]').text(serviceBookingProcess.registrationNumber)
            $('h1[id="registrationNumberShow"]').show();
            $('div[id="step1"]').hide();
            $('div[id="step2"]').show(); 
            $('div[id="customerDetails').html('<b>'+serviceBookingProcess.customer.Title+' '+serviceBookingProcess.customer.FirstName+' '+serviceBookingProcess.customer.Surname+'</b><br />'+serviceBookingProcess.customer.Address001+'<br />'+serviceBookingProcess.customer.Postcode+' '+serviceBookingProcess.customer.Address002+'<br />');
            //$('div[id="vehicleDetails').html('<b>{{if(toString(86.firstUseDate) = emptystring; emptystring; formatNumber((now - parseDate(86.firstUseDate; "YYYY-MM-DD")) / 1000 / 60 / 60 / 24 / 365; 1; ".") + "</b> Year Old <b>")}}{{289.data.fuelType}}</b> {{ifempty(switch(45.data.data[].Franchise; "P"; "Peugeot"; "C"; "Citroen"; "V"; "Vauxhall"); 289.data.make)}} {{replace(toString(45.data.data[].BriefDescription); "{object}"; 289.data.model)}} in {{289.data.primaryColour}}, registered on <b>{{formatDate(parseDate(86.firstUseDate; "YYYY-MM-DD"); "DD/MM/YYYY")}}.</b> {{if(58.field_66 > 0; "Customer reported " + 58.field_66 + " miles."; if(283.newCurrentMileage.currentMileage; "System estimates " + 283.newCurrentMileage.currentMileage + " miles."; emptystring))}}');
            console.log(serviceBookingProcess.vehicle.AftersalesBranch)
            let lastDealership = supportData.dealerList.find(el => el.field_4998.includes(serviceBookingProcess.vehicle.AftersalesBranch))
            $('div[id="serviceDealership').html((lastDealership?'<b>Last Dealer Visit: </b>'+lastDealership.field_8+' <a class="btn btn-primary" onclick="return bookService(\''+lastDealership.id+'\')">Book service</a><br /><br />':'')+'<a class="btn btn-secondary" onclick="return findDealerships(\''+serviceBookingProcess.customer.Postcode+'\')">Find dealership close to customer</a>');
        }
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
