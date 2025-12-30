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
    if (window.location.href.includes('file:/')) return;
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

var serviceBookingProcess = {};
var supportData = null;

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

function getPricing(konnectDealerId, konnectFranchiseId, konnectFuelTypeId, modelName, yearOfManufacture, mileage){
    let r = callPostHttpRequest('https://davidmale--shared-server-1.apify.actor/servicePricing?token=apify_api_pt5m4fzVRYCWBTCdu5CKzc02hKZkXg2eeqW3',null,{token:token,function:'getServicePricing',dealerId:konnectDealerId,franchiseId:konnectFranchiseId,fuelTypeId:konnectFuelTypeId,modelName:modelName,yearOfManufacture:yearOfManufacture,mileage:mileage})
    return r;
}

function bookVisit(dealershipId){
    console.log('bookVisit');
    let mileage = $('input[id="currentMileage"]').val();
    if (serviceBookingProcess.bookingData && serviceBookingProcess.bookingData.knackDealerId === dealershipId){
        serviceBookingProcess.bookingData.mileage = mileage;
        serviceBookingProcess.bookingData.pricing = getPricing(serviceBookingProcess.bookingData.konnectDealerId,serviceBookingProcess.bookingData.konnectFranchiseId,serviceBookingProcess.bookingData.konnectFuelTypeId,serviceBookingProcess.bookingData.konnectModelName,serviceBookingProcess.bookingData.yearOfManufacture,mileage);
        sessionStorage.setItem('serviceBookingProcess',JSON.stringify(serviceBookingProcess));
        setTimeout(() => {
            refreshAutolineRTSCodes()
        }, 5000);
        setTimeout(() => {
            refreshAvailabilityData(serviceBookingProcess.bookingData.dealer.field_2442);
        }, 100);
        work();
    } else {
        console.log('bookingVisit not all data');
        return null;
    }
}

function newVehicle(){
    serviceBookingProcess = {};
    sessionStorage.setItem('serviceBookingProcess',JSON.stringify(serviceBookingProcess));
    work();
}

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
        console.log('Search registration CLICK')
        if ($('input[id="registrationNumber"]').val()==='') return false;
        let r = callPostHttpRequest('https://davidmale--shared-server-1.apify.actor/getDetailsByRegBasic?token=apify_api_pt5m4fzVRYCWBTCdu5CKzc02hKZkXg2eeqW3',null,{token:token,registrationNumber:$('input[id="registrationNumber"]').val().toUpperCase()})
        Object.assign(serviceBookingProcess, r.data)
        sessionStorage.setItem('serviceBookingProcess',JSON.stringify(serviceBookingProcess));
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
        let supportDataS = sessionStorage.getItem('supportData');
        if (supportDataS) try { supportData = JSON.parse(supportDataS); } catch (ex){}
        console.log('supportData storage',supportData);
        if (!supportData){
            setTimeout(() => {
                supportData = callPostHttpRequest('https://davidmale--shared-server-1.apify.actor/getSupportData?token=apify_api_pt5m4fzVRYCWBTCdu5CKzc02hKZkXg2eeqW3',null,{token:token});
                console.log(supportData);
                sessionStorage.setItem('supportData',JSON.stringify(supportData));
            }, 100);
        }
    }
    if (!serviceBookingProcess.registrationNumber){
        let serviceBookingProcessS = sessionStorage.getItem('serviceBookingProcess')
        console.log('serviceBookingProcess1',serviceBookingProcess,serviceBookingProcessS)
        if (serviceBookingProcessS) try { serviceBookingProcess = JSON.parse(serviceBookingProcessS)} catch (ex){};
    }
    console.log('serviceBookingProcess',serviceBookingProcess)
    let qV = getUrlVars();
    if (page.includes('index.html')){
        if (!serviceBookingProcess.registrationNumber){
            $('h1[id="registrationNumberShow"]').text("Search vehicle")
            $('div[id="step1"]').show();
            $('div[id="step2"]').hide();
            $('div[id="step3"]').hide();
        } else if (serviceBookingProcess.registrationNumber){
            $('h1[id="registrationNumberShow"]').text(serviceBookingProcess.registrationNumber)
            $('h1[id="registrationNumberShow"]').show();
            $('div[id="step1"]').hide();
            $('div[id="step2"]').show();
            $('div[id="step3"]').hide();
            $('div[id="customerDetails').html('<b>'+serviceBookingProcess.customer.Title+' '+serviceBookingProcess.customer.FirstName+' '+serviceBookingProcess.customer.Surname+'</b><br />'+serviceBookingProcess.customer.Address001+'<br />'+serviceBookingProcess.customer.Postcode+' '+serviceBookingProcess.customer.Address002+'<br />');
            let vehicleAge = null;
            if (serviceBookingProcess.motData.firstUsedDate!==''){
                vehicleAge = ((new Date() - new Date(serviceBookingProcess.motData.firstUsedDate))/1000 / 60 / 60 / 24 / 365).toFixed(1);
            }
            $('div[id="vehicleDescription').html('<b>' + vehicleAge + '</b> Year Old <b>'+serviceBookingProcess.motData.fuelType+'</b> '+toTitleCase(serviceBookingProcess.motData.make) + ' '+(serviceBookingProcess.vehicle.BriefDescription!==''?serviceBookingProcess.vehicle.BriefDescription:serviceBookingProcess.motData.model)+' in '+serviceBookingProcess.motData.primaryColour+', registered on <b>'+dateToGB(new Date(serviceBookingProcess.motData.firstUsedDate))+'.</b> System estimates + 283.newCurrentMileage.currentMileage + miles.<br /><br />'+serviceBookingProcess.vehicle.ChassisNumber);
            let lastDealership = supportData.dealerList.find(el => el.field_4998.includes(serviceBookingProcess.vehicle.AftersalesBranch))

            $('div[id="serviceDealership').html((lastDealership?'<b>Last Dealer Visit: </b>'+lastDealership.field_8+' <a class="btn btn-primary" onclick="return bookVisit(\''+lastDealership.id+'\')">Book service</a><br /><br />':'')+'<a class="btn btn-secondary" onclick="return findDealerships(\''+serviceBookingProcess.customer.Postcode+'\')">Find dealership close to customer</a>');
            if (lastDealership && (!serviceBookingProcess.bookingData || serviceBookingProcess.bookingData.knackDealerId!==lastDealership.id)){
                let kF = lastDealership.konnectData.franchises.find(el => el.Name.toLowerCase()===serviceBookingProcess.motData.make.toLowerCase());
                if (!kF){
                    $('div[id="bookingProblems"]').text('Franchise not found in last dealership, car franchise: '+serviceBookingProcess.motData.make);
                    $('div[id="bookingProblems"]').show();
                } else {
                    let mF = kF.modelNames.find(el => el.toLowerCase() === serviceBookingProcess.motData.model.toLowerCase())
                    if (!mF){
                        $('div[id="bookingProblems"]').text('Model not found in last dealership franchise, car model: '+serviceBookingProcess.motData.model)
                        $('div[id="bookingProblems"]').show();
                    } else {
                        let fT = supportData.konnectFuelTypes.find(el => el.Name.toLowerCase().startsWith(serviceBookingProcess.motData.fuelType.toLowerCase()));
                        if (!fT){
                            $('div[id="bookingProblems"]').text('Fuel type not found in last dealership, car fuel type: '+serviceBookingProcess.motData.fuelType)
                            $('div[id="bookingProblems"]').show();
                        } else {
                            serviceBookingProcess.bookingData = {
                                dealer : lastDealership,
                                knackDealerId : lastDealership.id,
                                dealerName : lastDealership.field_8,
                                konnectDealerId : lastDealership.konnectData.ID,
                                konnectFranchiseId : kF.ID,
                                konnectModelName : mF,
                                konnectFuelTypeId : fT.ID,
                                yearOfManufacture : (new Date(serviceBookingProcess.motData.manufactureDate)).getFullYear(),
                                bookingVehicleDescription: toTitleCase(serviceBookingProcess.motData.make)+' '+serviceBookingProcess.motData.model+' '+toTitleCase(serviceBookingProcess.motData.fuelType)+' '+(new Date(serviceBookingProcess.motData.manufactureDate)).getFullYear()
                            };
                            console.log(serviceBookingProcess.bookingData);
                        }
                    }
                }
            }
            if (serviceBookingProcess.bookingData && serviceBookingProcess.bookingData.pricing){
                refreshAvailabilityData(serviceBookingProcess.bookingData.dealer.field_2442)
                $('div[id="step3"]').show(); 
                generatePricingHTML();
                if (serviceBookingProcess.bookingData.orderedCodes && serviceBookingProcess.bookingData.orderedCodes.length>0) refreshAutolineRTSCodes();
                generateBookingSummary();
                $("input[name='otherCode']").bind("click", function() {
                    console.log('otherCode',$(this).attr('data-code'),$(this).is(':checked'));
                    if ($(this).is(':checked')) addCodeToBooking($(this).attr('data-code')); else removeCodeFromBooking($(this).attr('data-code'));
                    refreshAutolineRTSCodes()
                    generateBookingSummary();
                });
                $("input[name='serviceScheduleCode']").bind("click", function() {
                    console.log('serviceScheduleCode',$(this).attr('data-code'),$(this).is(':checked'),$("input[name='serviceScheduleCode']:checked"));
                    if (!$(this).is(':checked')){
                        removeCodeFromBooking($(this).attr('data-code'));
                    } else {
                        addCodeToBooking($(this).attr('data-code'));
                        if ($("input[name='serviceScheduleCode']:checked").length!==1){
                            let uncheckCodes = [];
                            for (let i = 0;i<$("input[name='serviceScheduleCode']:checked").length;i++){
                                if ($("input[name='serviceScheduleCode']:checked").eq(i).attr('data-code')!==$(this).attr('data-code')){
                                    removeCodeFromBooking($("input[name='serviceScheduleCode']:checked").eq(i).attr('data-code'));
                                    uncheckCodes.push($("input[name='serviceScheduleCode']:checked").eq(i).attr('data-code'))
                                }
                            }
                            for (let i =0;i<uncheckCodes.length;i++){
                                console.log(uncheckCodes[i]);
                                $("input[data-code='"+uncheckCodes[i]+"']").prop('checked',false);
                            }
                        }
                    }
                    refreshAutolineRTSCodes()
                    generateBookingSummary();
                });
            }
        }
    }
}

var autolineRTSCodes = null;
var autolineRTSCodesExpires = null;
function refreshAutolineRTSCodes(hardRefresh = false){
    if (hardRefresh || !autolineRTSCodes || autolineRTSCodesExpires<new Date()){
        autolineRTSCodes = callPostHttpRequest('https://davidmale--shared-server-1.apify.actor/getAutolineRTSCodes?token=apify_api_pt5m4fzVRYCWBTCdu5CKzc02hKZkXg2eeqW3',null,{token:token});
        autolineRTSCodesExpires = new Date();
        autolineRTSCodesExpires.setMinutes(autolineRTSCodesExpires.getMinutes()+5);
    }
}

function addCodeToBooking(code){
    if (!serviceBookingProcess.bookingData.orderedCodes) serviceBookingProcess.bookingData.orderedCodes =[];
    let cT = serviceBookingProcess.bookingData.orderedCodes.find(el => el === code);
    if (!cT){
        serviceBookingProcess.bookingData.orderedCodes.push(code);
        sessionStorage.setItem('serviceBookingProcess',JSON.stringify(serviceBookingProcess));
    }
}

function removeCodeFromBooking(code){
    if (!serviceBookingProcess.bookingData.orderedCodes) serviceBookingProcess.bookingData.orderedCodes =[];
    serviceBookingProcess.bookingData.orderedCodes = serviceBookingProcess.bookingData.orderedCodes.filter(el => el !== code);
    sessionStorage.setItem('serviceBookingProcess',JSON.stringify(serviceBookingProcess));
}

var availabilityData = [];
function refreshAvailabilityData(companyCode, hardRefresh = false){
    let availabilityDataCompany = availabilityData.find(el => el.companyCode === companyCode);
    if (hardRefresh || !availabilityDataCompany || availabilityDataCompany.expiresAt<new Date()){
        let availabilityDataCompanyN = {companyCode :companyCode, availability: callPostHttpRequest('https://davidmale--shared-server-1.apify.actor/getWorkshopAvailability?token=apify_api_pt5m4fzVRYCWBTCdu5CKzc02hKZkXg2eeqW3',null,{token:token,companyCode:companyCode})};
        availabilityDataCompanyN.expiresAt = new Date();
        availabilityDataCompanyN.expiresAt.setMinutes(availabilityDataCompanyN.expiresAt.getMinutes()+5);
        if (availabilityDataCompany){
            Object.assign(availabilityDataCompany,availabilityDataCompanyN);
        } else {
            availabilityData.push(availabilityDataCompanyN);
        }
        if (!availabilityDataCompanyN.availability.checkedAt){
            setTimeout(() => {
                refreshAvailabilityData(serviceBookingProcess.bookingData.dealer.field_2442);
            }, 5000);
        }
    }
}

function findAvailabilityDaysForBooking(){
    if (serviceBookingProcess.bookingData.labourSummary){
        let av = callPostHttpRequest('https://davidmale--shared-server-1.apify.actor/getWorkshopAvailabilityForLabour?token=apify_api_pt5m4fzVRYCWBTCdu5CKzc02hKZkXg2eeqW3',null,{token:token,companyCode:serviceBookingProcess.bookingData.dealer.field_2442,labourArray:serviceBookingProcess.bookingData.labourSummary});
        console.log(av);
    }
}

function generateBookingSummary(){
    let html = serviceBookingProcess.bookingData.dealerName+'<br/>'+serviceBookingProcess.bookingData.bookingVehicleDescription+' - '+serviceBookingProcess.bookingData.mileage+' miles';
    if (serviceBookingProcess.bookingData.orderedCodes){
        let labourSummary = [];
        html += '<br />'
        for (let i = 0;i<serviceBookingProcess.bookingData.orderedCodes.length;i++){
            html += serviceBookingProcess.bookingData.orderedCodes[i]+'<br />'
            if (autolineRTSCodes){
                let aCode = autolineRTSCodes.find(el => el.RTSCode === serviceBookingProcess.bookingData.orderedCodes[i]);
                if (aCode){
                    let lT = labourSummary.find(el => el.LoadGroup === aCode.LoadGroup);
                    if (lT){
                        lT.Time += parseFloat(aCode.AllowedUnits001);
                    } else {
                        labourSummary.push({LoadGroup:aCode.LoadGroup,Time:parseFloat(aCode.AllowedUnits001)})
                    }
                }
            }
        }
        if (labourSummary.length>0){
            html += '<br />Labour:';
            for (let i = 0;i<labourSummary.length;i++){
                html += '<br /><b>Group: '+labourSummary[i].LoadGroup+', Time: '+labourSummary[i].Time.toFixed(1)+'</b>';
            }
            serviceBookingProcess.bookingData.labourSummary = labourSummary;
        } else {serviceBookingProcess.bookingData.labourSummary=null}
    }
    findAvailabilityDaysForBooking();
    $('div[id="bookingSummary"]').html(html);
}

function generatePricingHTML(){
    $('div[id="pricingServiceSchedule"]').html(generateTableFromData(serviceBookingProcess.bookingData.pricing.ServiceSchedule.ServiceIntervals,true));
    $('div[id="pricingGeneral"]').html(generateTableFromData(serviceBookingProcess.bookingData.pricing.GeneralItemPrices,false));
    $('div[id="pricingMOT"]').html(generateTableFromData(serviceBookingProcess.bookingData.pricing.MOTItemPrices,false));
    $('div[id="pricingDutyOfCare"]').html(generateTableFromData(serviceBookingProcess.bookingData.pricing.DutyOfCareItemPrices,false));
    $('div[id="pricingRecommended"]').html(generateTableFromData(serviceBookingProcess.bookingData.pricing.RecommendedItemPrices,false));
    $('div[id="pricingPromotions"]').html(generateTableFromData(serviceBookingProcess.bookingData.pricing.Promotions,false));
    $('div[id="pricingDropType"]').html(generateTableFromData(serviceBookingProcess.bookingData.pricing.DropTypes,false));
}

function generateTableFromData(data, isServiceSchedule = false){
    let html = '<table class="table table-condensed" width="100%"><tbody>';
    for (let i = 0;i<data.length;i++){
        html += '<tr'+(data[i].IsPreselected?' style="background-color: yellow;"':'')+'><td><input type="checkbox" name="'+(isServiceSchedule?'serviceScheduleCode':'otherCode')+'" data-code="'+data[i].Code+'" class="ng-pristine ng-untouched ng-valid ng-empty"'+(serviceBookingProcess.bookingData.orderedCodes && serviceBookingProcess.bookingData.orderedCodes.find(el => el === data[i].Code)?' checked=true':'')+'></td>'+(isServiceSchedule?'<td class="ng-binding">Year '+data[i].Age+'</td><td class="ng-binding">'+data[i].Mileage+'</td>':'')+'<td class="ng-binding">'+data[i].Code+'</td><td class="ng-binding">'+data[i].Name+'</td><td style="text-align: right;" class="ng-binding">'+data[i].PriceDisplay+'</td></tr>'
    }
    html += '</tbody></table>';
    return html;
}

function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
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
