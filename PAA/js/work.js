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
function dateTimeToGBNoYear(dateobj){
    return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+' '+dateobj.toLocaleTimeString("en-GB");
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

var table = null;

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

    $('#userName').text(loggedInUser.displayName)
    if (page.includes('index.html')){
        let req = paaPostRequest({'action':'getRuns','token':paaToken,'sortField':'createdDateTime','sortDirection':'Desc','filters':[]});
        let today00 = new Date();
        today00.setHours(0,0,0,0);
        let t0 = req.filter(el => (el.status==='queued' || el.status==='running') && new Date(el.createdDateTime)>today00);
        $('#dashboardActiveRuns').html((t0.length===0?'All done':t0.length + ' queued now'));
        let t1 = req.filter(el => el.status==='succeded' && new Date(el.createdDateTime)>today00);
        $('#dashboardSuccessfullRuns').html(t1.length + ' successfull runs today');
        let t2 = req.filter(el => el.status==='failed' && new Date(el.createdDateTime)>today00);
        $('#dashboardFailedRunsToday').html(t2.length + ' failed runs today');
    }

    if (page.includes('machines.html')){
        let req = paaPostRequest({'action':'getMachines','token':paaToken});
        let tM = req.map(function (el){
            return '<tr><td>'+el.name+'</td><td>'+(el.serverLocked?'Server Locked':(el.localLocked?'Local Locked':'Free'))+'</td><td></td><td>'+el.capacity+'</td><td>'+(el.capacity===0?(el.attendedModeAvailable?'Available':'Not Ready')+' - '+dateTimeToGB(new Date(el.attendedModeAvailableTestDateTime)):'')+'</td><td>'+(el.connectionId?'Available':'Not set')+'</td></tr>';
        })
        $('table[id="datatablesSimpleMachines"]>tbody').append(tM.join(''));
        const datatablesSimple = document.getElementById('datatablesSimpleMachines');
        if (datatablesSimple) {
            new simpleDatatables.DataTable(datatablesSimple);
        }
        $('div[class="datatable-search"]').after($('div[class="datatable-dropdown"]'))
    }

    if (page.includes('flows.html')){
        let req = paaPostRequest({'action':'getFlows','token':paaToken});
        let tM = req.map(function (el){
            return '<tr><td>'+el.name+'</td><td>'+(el.integrations?el.integrations.length:'')+'</td><td>'+el.inputs+'"</td></tr>';
        })
        $('table[id="datatablesSimpleFlows"]>tbody').append(tM.join(''));
        const datatablesSimple = document.getElementById('datatablesSimpleFlows');
        if (datatablesSimple) {
            new simpleDatatables.DataTable(datatablesSimple);
        }
        $('div[class="datatable-search"]').after($('div[class="datatable-dropdown"]'))
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    }

    if (page.includes('runs.html')){
        let req = paaPostRequest({'action':'getRuns','token':paaToken,'sortField':'createdDateTime','sortDirection':'Desc','filters':[]});
        /*let tM = req.map(function (el){
            return '<tr><td>'+el.flowName+'</td><td>'+el.status+(el.retryCount?' R:'+el.retryCount:'')+'</td><td>'+el.priority+'</td><td>'+ dateTimeToGB(new Date(el.createdDateTime))+'</td><td>'+ (el.startedDateTime?dateTimeToGB(new Date(el.startedDateTime)):'')+'</td><td>'+ (el.completedDateTime&&el.startedDateTime?(new Date((new Date(el.completedDateTime)-new Date(el.startedDateTime))).toISOString().substring(14, 19)):'')+'</td><td><button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#runDetails" onclick="fillModal(\'runDetailsBody\',\'runDetailsText-'+el.runId+'\');">Show details</button>'+formatRunDetails(el)+'</td><td><a target="_blank" href="'+el.hrefDetails+'">Open</a></td></tr>';
        })*/
       let contentToHide = '';
        let tMJ = req.map(function (el){
            contentToHide += formatRunDetails(el);
            return {'Flow Name':el.flowName,'State':el.status+(el.retryCount?' R:'+el.retryCount:'')+(el.status==='failed'?'<a href="#" onclick="resurrectRun(\''+el.runId+'\');return false;">Resurrect</a>':''),'Priority':el.priority,'Requested':dateTimeToGBNoYear(new Date(el.createdDateTime)),'Started':(el.startedDateTime?dateTimeToGBNoYear(new Date(el.startedDateTime)):''),'Duration': (el.completedDateTime&&el.startedDateTime?(new Date((new Date(el.completedDateTime)-new Date(el.startedDateTime))).toISOString().substring(14, 19)):''),'Details':'<a href="#" onclick="showModal(\'runDetails\',\'runDetailsBody\',\'runDetailsText-'+el.runId+'\');return false;">Show details</a>','In PA':'<a target="_blank" href="'+el.hrefDetails+'">Open</a>'};
        })
        console.log(tMJ);
        $('div[id="runDetailsData"]').append(contentToHide);
        /*$('table[id="datatablesSimpleRuns"]>tbody').html('')
        $('table[id="datatablesSimpleRuns"]>tbody').append(tM.join(''));*/

        /* ajax: {
        url: 'data.json',
        contentType: 'application/json',
        type: 'POST',
        data: function (d) {
            return JSON.stringify(d);
        }
    }*/
        if (!table){
            table = new DataTable('#datatablesSimpleRuns',{
                ajax: function (data, callback, settings) {
                    callback({data:getRunsDataForTable()});
                  },
                columns: [
                { data: 'Flow Name',title: 'Flow Name'},
                { data: 'LiveOrPrerod',title: 'Live'},
                { data: 'Machine',title: 'Machine'},
                { data: 'State',title: 'State'},
                { data: 'Priority',title: 'Priority'},
                { data: 'Requested',title: 'Requested'},
                { data: 'Started',title: 'Started'},
                { data: 'Duration',title: 'Duration'},
                { data: 'Details',title:'Details' },
                { data: 'In PA',title: 'In PA'}
            ],
            order: [['Requested', 'desc']],
            pageLength: 25,
            scroller: true,
            search: getSearchFromUrl(),
            /*,initComplete: function () {
                this.api()
                    .columns()
                    .every(function () {
                        let column = this;
                        let title = column.header().textContent;
         
                        // Create input element
                        let input = document.createElement('input');
                        input.placeholder = title;
                        column.header().append(input);
         
                        // Event listener for user input
                        input.addEventListener('keyup', () => {
                            if (column.search() !== this.value) {
                                column.search(input.value).draw();
                            }
                        });
                    });
            }*/});

            $('div[class="dt-search"]').detach().appendTo('div[class="dt-layout-cell dt-layout-start"]');
            $('div[class="dt-length"]').detach().appendTo('div[class="dt-layout-cell dt-layout-end"]');
        } else {
            table.ajax.reload(null, false);
        }

        let isSomethingActive = req.find(el => el.status!=='succeded' && el.status !=='failed');
        setTimeout(() => {
            work();
        }, (isSomethingActive?15000:60000));
    }
}

function getSearchFromUrl(){
    let s = window.location.search;
    console.log('s',s)
    if (s!==''){
        return {
            "search" : s.replace('?','')
        }
    }
    return null;
}

function getRunsDataForTable(){
    console.log('getRunsDataForTable')
    let req = paaPostRequest({'action':'getRuns','token':paaToken,'sortField':'createdDateTime','sortDirection':'Desc','filters':[]});
    let contentToHide = '';
    let tMJ = req.map(function (el){
        contentToHide += formatRunDetails(el);
        return {'Flow Name':el.flowName,'LiveOrPreprod':(el.liveOrPreprod?el.liveOrPreprod:(el.flowInput.liveOrPreprod?el.flowInput.liveOrPreprod:'')),'Machine':(el.machine?el.machine.name:''),'State':el.status+(el.retryCount?' R:'+el.retryCount:'')+(el.status==='failed'?' - <a href="#" onclick="resurrectRun(\''+el.runId+'\');return false;">Resurrect</a>':''),'Priority':el.priority,'Requested':dateTimeToGBNoYear(new Date(el.createdDateTime)),'Started':(el.startedDateTime?dateTimeToGBNoYear(new Date(el.startedDateTime)):''),'Duration': (el.completedDateTime&&el.startedDateTime?(new Date((new Date(el.completedDateTime)-new Date(el.startedDateTime))).toISOString().substring(14, 19)):''),'Details':'<a href="#" onclick="showModal(\'runDetails\',\'runDetailsBody\',\'runDetailsText-'+el.runId+'\');return false;">Show details</a>','In PA':'<a target="_blank" href="'+el.hrefDetails+'">Open</a>'};
    })
    console.log(tMJ);
    $('div[id="runDetailsData"]').html('');
    $('div[id="runDetailsData"]').append(contentToHide);
    return tMJ;
}

function showModal(modalName,what, fromWhere){
    $('#'+what).html($('#'+fromWhere).html());
    $('#'+modalName).modal('show');
    return false;
}

function resurrectRun(runId){
    paaPostRequest({'action':'resurrectRun','token':paaToken,'runId':runId});
}

function formatRunDetails(run){
    let d = '<div id="runDetailsText-'+run.runId+'" style="display: none">Input:<br />'+JSON.stringify(run.flowInput,null,2)+'<br />';
    if (run.status==='failed'){
        d += 'Retry count: '+run.retryCount+'<br />';
        d += 'Error:<br />'+run.statusDescription+'<br />';;
    }
    if (run.status==='succeded' && run.retryHistory){
        d += 'Retry count: '+run.retryCount+'<br />';
        d += 'Retry summary:<br />'+run.retryHistory.map(function(el){ return  dateTimeToGBNoYear(new Date(el.startedDateTime)) +' : '+ el.statusDescription+' - <a target="_blank" href="'+el.hrefDetails+'">Run details in PA</a>'}).join('<br />')
    }
    d += '<a target="_blank" href="'+run.hrefDetails+'">Run details in PA</a><br /></div>';
    return d;
}