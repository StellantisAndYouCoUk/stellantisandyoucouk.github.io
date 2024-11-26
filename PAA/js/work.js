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

function pad(n) {return n < 10 ? "0"+n : n;}
function dateTimeToGB(dateobj){
    return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+"/"+dateobj.getFullYear()+' '+dateobj.toLocaleTimeString("en-GB");
}

function paaPostRequest(payloadObject){
    return callPostHttpRequest('https://davidmale--server.apify.actor/paaXHR?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw',{'token':'apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw'}, payloadObject)
}

function checkAuth(){
    if (window.location.href.includes('login.html')) return;
    let paaToken = readCookie('paaToken');
    if (!paaToken){
        window.location = './login.html';
    }
}

//checkAuth();

var paaToken = readCookie('paaToken');
var loggedInUser = getLoggedInUser();
if (!loggedInUser){
    eraseCookie('paaToken');
    //checkAuth();
}

$( document ).ready(function() {
    work();
});

function getLoggedInUser(){
    return paaPostRequest({'action':'userInfo','token':paaToken});
}

function work(){
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

    $('div[class="sb-sidenav-footer"]').append(loggedInUser.displayName)
    if (page.includes('index.html')){
        
    }

    if (page.includes('machines.html')){
        let req = paaPostRequest({'action':'getMachines','token':paaToken});
        let tM = req.map(function (el){
            return '<tr><td>'+el.name+'</td><td>'+(el.serverLocked?'Server Locked':(el.localLocked?'Local Locked':'Free'))+'</td><td></td><td>'+el.capacity+'</td><td>'+(el.connectionId?'Available':'Not set')+'</td></tr>';
        })
        $('table[id="datatablesSimpleMachines"]>tbody').append(tM.join(''));
        const datatablesSimple = document.getElementById('datatablesSimpleMachines');
        if (datatablesSimple) {
            new simpleDatatables.DataTable(datatablesSimple);
        }
    }

    if (page.includes('flows.html')){
        let req = paaPostRequest({'action':'getFlows','token':paaToken});
        let tM = req.map(function (el){
            return '<tr><td>'+el.name+'</td><td>'+el.inputs+'</td></tr>';
        })
        $('table[id="datatablesSimpleFlows"]>tbody').append(tM.join(''));
        const datatablesSimple = document.getElementById('datatablesSimpleFlows');
        if (datatablesSimple) {
            new simpleDatatables.DataTable(datatablesSimple);
        }
    }

    if (page.includes('runs.html')){
        let req = paaPostRequest({'action':'getRuns','token':paaToken,'sortField':'createdDateTime','sortDirection':'Desc','filters':[]});
        let tM = req.map(function (el){
            return '<tr><td>'+el.flowName+'</td><td>'+el.status+'</td><td>'+el.priority+'</td><td>'+ dateTimeToGB(new Date(el.createdDateTime))+'</td><td>'+ dateTimeToGB(new Date(el.startedDateTime))+'</td><td>'+ dateTimeToGB(new Date(el.completedDateTime))+'</td><td>'+formatRunDetails(el)+'</td></tr>';
        })
        console.log(tM[0]);
        $('table[id="datatablesSimpleRuns"]>tbody').append(tM.join(''));
        const datatablesSimple = document.getElementById('datatablesSimpleRuns');
        if (datatablesSimple) {
            new simpleDatatables.DataTable(datatablesSimple);
        }
    }
}

function formatRunDetails(run){
    let d = 'Input:<br />'+JSON.stringify(run.flowInput)+'<br />';
    if (run.status==='failed'){
        d += 'Retry count: '+run.retryCount+'<br />';
        d += 'Error:<br />'+run.statusDescription+'<br />';;
    }
    d += '<a _target="blank" href="'+run.hrefDetails+'">Run details in PA</a><br />';
    return d;
}