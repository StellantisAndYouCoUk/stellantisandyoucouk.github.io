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

function paaPostRequest(payloadObject){
    return callPostHttpRequest('https://davidmale--server.apify.actor/paaXHR?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw',{'token':'apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw'}, payloadObject)
}

async function paaPostRequestWithCompress(payloadObject){
    return await callPostHttpRequestWithCompress('https://davidmale--server.apify.actor/paaXHR?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw',{'token':'apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw'}, payloadObject)
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
if (!loggedInUser.email){
    eraseCookie('paaToken');
    //checkAuth();
}

$( document ).ready(function() {
    work();
});

function getLoggedInUser(){
    return paaPostRequest({'action':'userInfo','token':paaToken});
}

var table = null;
var jsonData = null;
var flowCode = null;

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
    let qV = getUrlVars();
    if (page.includes('index.html')){
        let req = paaPostRequest({'action':'getRuns','token':paaToken,'sortField':'createdDateTime','sortDirection':'Desc','filters':[]});
        let today00 = new Date();
        today00.setHours(0,0,0,0);
        let t0 = req.filter(el => (el.status==='queued' || el.status==='running') && new Date(el.createdDateTime)>today00 && (el.flowInput && el.flowInput.liveOrPreprod==='live'));
        $('#dashboardActiveRuns').html((t0.length===0?'All done':t0.length + ' queued now'));
        let t1 = req.filter(el => el.status==='succeded' && new Date(el.createdDateTime)>today00 && (el.flowInput && el.flowInput.liveOrPreprod==='live'));
        $('#dashboardSuccessfullRuns').html(t1.length + ' successfull runs today');
        let t2 = req.filter(el => el.status==='failed' && new Date(el.createdDateTime)>today00 && (el.flowInput && el.flowInput.liveOrPreprod==='live'));
        $('#dashboardFailedRunsToday').html(t2.length + ' failed runs today');
        $('table[id="datatablesSimpleFlowRunsSummary"]>tbody').append(getFlowRunsSummary(req.filter(el => new Date(el.createdDateTime)>today00 && (el.flowInput && el.flowInput.liveOrPreprod==='live')),['flowName','status']));
        const datatablesSimple = document.getElementById('datatablesSimpleFlowRunsSummary');
        if (datatablesSimple) {
            new simpleDatatables.DataTable(datatablesSimple);
        }
    }

    if (page.includes('machines.html')){
        let req = paaPostRequest({'action':'getMachines','token':paaToken, 'refresh':(qV['refresh']?true:false)});
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
        let req = paaPostRequest({'action':'getFlows','token':paaToken, 'refresh':(qV['refresh']?true:false)});
        let tM = req.map(function (el){
            return '<tr><td>'+el.name+'</td><td>'+(el.integrations?el.integrations.length:'')+'</td><td>'+getFlowStatusData(el)+'</td><td><a href="uicoll.html?flow='+el.name+'">Edit UI</a></td><td>'+el.inputs+'"</td></tr>';
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
       /*let contentToHide = '';
        let tMJ = req.map(function (el){
            contentToHide += formatRunDetails(el,machines);
            return {'Flow Name':el.flowName,'State':el.status+(el.retryCount?' R:'+el.retryCount:'')+(el.status==='failed'?'<a href="#" onclick="resurrectRun(\''+el.runId+'\');return false;">Resurrect</a>':''),'Priority':el.priority,'Requested':dateTimeToGBNoYear(new Date(el.createdDateTime)),'Started':(el.startedDateTime?dateTimeToGBNoYear(new Date(el.startedDateTime)):''),'Duration': (el.completedDateTime&&el.startedDateTime?(new Date((new Date(el.completedDateTime)-new Date(el.startedDateTime))).toISOString().substring(14, 19)):''),'Details':'<a href="#" onclick="showModal(\'runDetails\',\'runDetailsBody\',\'runDetailsText-'+el.runId+'\');return false;">Show details</a>','In PA':'<a target="_blank" href="'+el.hrefDetails+'">Open</a>'};
        })
        console.log(tMJ);
        $('div[id="runDetailsData"]').append(contentToHide);*/
        if (!table){
            table = new DataTable('#datatablesSimpleRuns',{
                ajax: function (data, callback, settings) {
                    callback({data:getRunsDataForTable()});
                  },
                columns: [
                { data: 'Flow Name',title: 'Flow Name'},
                { data: 'LiveOrPreprod',title: 'Live'},
                { data: 'Machine',title: 'Machine'},
                { data: 'State',title: 'State'},
                { data: 'Priority',title: 'Pri'},
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

    if (page.includes('uicoll.html')){
        console.log(qV['flow']);
        $('h1').text(qV['flow'])
        const buttonCodeToPA = document.createElement('button');
        buttonCodeToPA.textContent = 'Upload from GitHub to PA';
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
}

function getFlowStatusData(flowData){
    let o = '';
    o += (!flowData.statusData?'ready':flowData.statusData.status)+'<br />';
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
        newFlowCode = newFlowCode.replaceAll('\\','\\\\');
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
    let machines = paaPostRequest({'action':'getMachines','token':paaToken, 'refresh':false});
    let req = paaPostRequest({'action':'getRuns','token':paaToken,'sortField':'createdDateTime','sortDirection':'Desc','filters':[]});
    let contentToHide = '';
    let tMJ = req.map(function (el){
        contentToHide += formatRunDetails(el,machines);
        return {'Flow Name':el.flowName,'LiveOrPreprod':(el.liveOrPreprod?el.liveOrPreprod:(el.flowInput.liveOrPreprod?el.flowInput.liveOrPreprod:'')),'Machine':(el.machine?el.machine.name:''),'State':el.status+(el.retryCount?' R:'+el.retryCount:'')+(el.status==='failed' || el.status==='canceled'?'<br /><a href="#" onclick="resurrectRun(\''+el.runId+'\');return false;">Resurrect</a>':'')+(el.status==='running'?'<br /><a href="#" onclick="cancelRun(\''+el.runId+'\');return false;">Cancel run</a>':''),'Priority':el.priority,'Requested':dateTimeToGBNoYear(new Date(el.createdDateTime)),'Started':(el.startedDateTime?dateTimeToGBNoYear(new Date(el.startedDateTime)):''),'Duration': (el.completedDateTime&&el.startedDateTime?(new Date((new Date(el.completedDateTime)-new Date(el.startedDateTime))).toISOString().substring(14, 19)):''),'Details':'<a href="#" onclick="showModal(\'runDetails\',\'runDetailsBody\',\'runDetailsText-'+el.runId+'\');return false;">Show details</a>','In PA':'<a target="_blank" href="'+el.hrefDetails+'">Open</a>'};
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

function cancelRun(runId){
    paaPostRequest({'action':'cancelRun','token':paaToken,'runId':runId});
}

function reRunInPreprod(runId){
    console.log('reRunInPreprod',runId);
    let req = paaPostRequest({'action':'getRuns','token':paaToken,'sortField':'createdDateTime','sortDirection':'Desc','filters':[]});
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
    $('button[aria-label="Close"]').click();
    return callPostHttpRequest('https://davidmale--server.apify.actor/powerAutomateNewRequest?token=apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw',{'token':'apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw'},runData)
}

function formatRunDetails(run, machines){
    let d = '<div id="runDetailsText-'+run.runId+'" style="display: none">Input:<br />'+JSON.stringify(run.flowInput,null,2)+'<br />';
    if (run.status==='failed'){
        d += 'Retry count: '+run.retryCount+'<br />';
        d += 'Error:<br />'+run.statusDescription+'<br />';;
    }
    if (run.status==='succeded' && run.retryHistory){
        d += 'Retry count: '+run.retryCount+'<br />';
        d += 'Retry summary:<br />'+run.retryHistory.map(function(el){ return  dateTimeToGBNoYear(new Date(el.startedDateTime)) +' : '+ el.statusDescription+' - <a target="_blank" href="'+el.hrefDetails+'">Run details in PA</a>'}).join('<br />')
    }
    d += '<a target="_blank" href="'+run.hrefDetails+'">Run details in PA</a><br />';
    if (run.flowInput && JSON.stringify(run.flowInput).includes('liveOrPreprod')){
        d += '<a href="#" onclick="reRunInPreprod(\''+run.runId+'\'); return false;">Rerun in Pre-Prod on machine</a> <select id="preProdMachine_'+run.runId+'"><option>'+machines.map(el => el.name).join('</option><option>')+'</option></select> in <select id="preProdMode_'+run.runId+'"><option>attended</option><option>unattended</option></select> mode</div>';
    }
    d += '</div>';
    return d;
}