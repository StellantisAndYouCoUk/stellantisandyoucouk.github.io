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

$( document ).ready(function() {
    work();
});

function pad(n) {return n < 10 ? "0"+n : n;}
function dateToGB(dateobj){
    return pad(dateobj.getDate())+"/"+pad(dateobj.getMonth()+1)+"/"+dateobj.getFullYear();
}
function dateToAutoline(dateobj){
    return dateobj.getFullYear()+"-"+pad(dateobj.getMonth()+1)+"-"+pad(dateobj.getDate());
}

function incomeFromMemberships(mA){
    let conversions = {'USD':0.68,'CAD':0.94,'GBP':1.17,'TRY':0.029,'EUR':1}
    return mA.reduce(
        (accumulator, currentValue) => accumulator + (currentValue.currency?parseInt(currentValue.total)*conversions[currentValue.currency]:0),
        0,
    );
}

var membershipDataG = null;

async function work(){
    console.log('work')
    document.getElementById('compute').addEventListener('click', () => {
        let data = compute(new Date($('#dateFrom').attr('value')),new Date($('#dateTo').attr('value')),parseInt($('#percentageOfWWOOFersRegisteringGlobalMembershipInsteadOfLocal').attr('value')),parseInt($('#percentageOfAddedWWOOFersRegisteringGlobalMembership').attr('value')),parseInt($('#globalMembershipPrice').attr('value')),parseInt($('#moreVisitsToCountriesBecauseOfGlobalMultiplicator').attr('value')))
        $('#referenceData').html('Total memberships: '+ data.totalWWOOFers)
        $('#globalMembershipData').html('Global memberships: '+ Math.round(data.globalMembershipData.globalMembershipCount)+'<br />Total income: '+Math.round(data.globalMembershipData.globalMembershipTotal)+' EUR<br /><br />Surplus/deficit: '+Math.round(data.globalMembershipData.globalMembershipRest)+' EUR')

        let tM = data.wwoofersByCountry.map(function (el){
            return '<tr><td>'+el.country+'</td><td>'+Math.round(el.totalWWOOFers)+'</td><td>'+el.percentZero+'%</td><td>'+el.totalIncome+' EUR</td><td>'+el.globalMembershipTotal+' EUR</td><td>'+el.globalMembershipLocalMemberships+' EUR</td><td>'+el.globalMembershipShareOfGlobalMemberships+' EUR</td><td>'+el.globalMembershipsAddedVisitsCount+'</td><td>'+el.globalMembershipsAddedVisitsSum+' EUR</td></tr>';
        })
        $('table[id="datatablesSimpleNationalOrganizationsResults"]>tbody').append(tM.join(''));
        const datatablesSimple = document.getElementById('datatablesSimpleNationalOrganizationsResults');
        if (datatablesSimple) {
            new simpleDatatables.DataTable(datatablesSimple);
        }
    });
    membershipDataG = callGetHttpRequest('https://api.apify.com/v2/key-value-stores/CIUACuDTfgPapuJLB/records/membershipData?signature=1M7MudE4lpMBY5g0gms6R');
}

function compute(dateFrom, dateTo, percentageOfWWOOFersRegisteringGlobalMembershipInsteadOfLocal,percentageOfAddedWWOOFersRegisteringGlobalMembership,globalMembershipPrice,moreVisitsToCountriesBecauseOfGlobalMultiplicator){
    /*let dateFrom = new Date("2025-01-01");
    let dateTo = new Date("2025-07-01");
    let percentageOfWWOOFersRegisteringGlobalMembershipInsteadOfLocal = 15;
    let percentageOfAddedWWOOFersRegisteringGlobalMembership = 5;
    let globalMembershipPrice = 78;
    let moreVisitsToCountriesBecauseOfGlobalMultiplicator = 3;*/
    console.log(dateFrom, dateTo, percentageOfWWOOFersRegisteringGlobalMembershipInsteadOfLocal,percentageOfAddedWWOOFersRegisteringGlobalMembership,globalMembershipPrice,moreVisitsToCountriesBecauseOfGlobalMultiplicator)

    let countries = ['CA','CL','CZ','DE','DK','ES','FR','GR','IT','NL','NO','PT','RO','SE','GB','US','TG','TR','WI'];

    let membershipData = membershipDataG.filter(el => new Date(el.startAt)>= dateFrom && new Date(el.startAt)<=dateTo);

    let output = {'dateFrom':dateFrom, 'dateTo':dateTo, totalWWOOFers:membershipData.length};

    let wi = membershipData.filter(el => el.domainId === 'WI');
    let wi0 = wi.filter(el => el.bookingsCount === 0);
    let wiMoreThen1Country = wi.filter(el => el.bookingCountries && el.bookingCountries.length>1);
    let numberOfCountriesArray = [];
    wiMoreThen1Country.map(function(el){
        let nCA = numberOfCountriesArray.find(el2 => el2.number === el.bookingCountries.length);
        if (nCA){
            nCA.wwoofers += 1;
        } else {
            numberOfCountriesArray.push({number : el.bookingCountries.length,wwoofers:1})
        }
    })

    console.log('Independents total:',wi.length,'0 requests',wi0.length,'more countries',wiMoreThen1Country.length, numberOfCountriesArray)

    let helpMapByUserId = new Map(membershipData.map(el => [el.userId, el]));
    let moreThenOneCountryMembershipUsers = [];

    membershipData.map(async(element)=>{
        let hM1 = helpMapByUserId.get(element.userId);
        if (hM1 && hM1.domainId!==element.domainId){
            let aT = moreThenOneCountryMembershipUsers.find(el => el.userId === element.userId);
            if (!aT) moreThenOneCountryMembershipUsers.push({userId:element.userId})
        }
    });

    let moreThenOneCountryMembershipSummary = [];
    let countriesCombinationsSummary = [];
    moreThenOneCountryMembershipUsers.map(async(element)=>{
        let mFUM = new Map(membershipData.filter(el => el.userId === element.userId).map(el => [el.domainId,el]));
        let mTR = moreThenOneCountryMembershipSummary.find(el => el.countriesCount === mFUM.size);
        if (mTR){
            mTR.wwoofers += 1;
        } else {
            moreThenOneCountryMembershipSummary.push({countriesCount:mFUM.size, wwoofers:1})
        }
        let tmpC = (Array.from(mFUM.keys())).join(',');
        let ccR = countriesCombinationsSummary.find(el => el.countries === tmpC);
        if (ccR){
            ccR.wwoofers += 1;
        } else {
            countriesCombinationsSummary.push({countries:tmpC,wwoofers:1})
        }
    });

    let wwoofersByCountry = [];
    let totalWWOOFersCount = membershipData.length;
    let globalMembershipCount = totalWWOOFersCount*(percentageOfAddedWWOOFersRegisteringGlobalMembership+percentageOfWWOOFersRegisteringGlobalMembershipInsteadOfLocal)/100;
    let globalMembershipTotal = globalMembershipCount*globalMembershipPrice;
    let globalMembershipRest = globalMembershipTotal;
    for (let i = 0;i<countries.length;i++){
        let mC = membershipData.filter(el => el.domainId === countries[i]);
        let mC0 = mC.filter(el => el.bookingsCount === 0);
        let cR = {
            country : countries[i],
            totalWWOOFers: mC.length,
            totalIncome : Math.round(incomeFromMemberships(mC)),
            zeroRequestWWOOFers : mC0.length,
            percentZero : Math.round((mC0.length/mC.length)*100)
        }
        let toGetFromGM = (cR.totalIncome/cR.totalWWOOFers)*(cR.totalWWOOFers-cR.zeroRequestWWOOFers)*((percentageOfWWOOFersRegisteringGlobalMembershipInsteadOfLocal+percentageOfAddedWWOOFersRegisteringGlobalMembership)/100)
        if (!toGetFromGM) toGetFromGM = 0;
        cR.globalMembershipLocalMemberships = Math.round(cR.totalIncome*(100-percentageOfWWOOFersRegisteringGlobalMembershipInsteadOfLocal)/100);
        cR.globalMembershipShareOfGlobalMemberships = Math.round(toGetFromGM);
        globalMembershipRest -= toGetFromGM;

        cR.globalMembershipsAddedVisitsCount = moreVisitsToCountriesBecauseOfGlobalMultiplicator*countriesCombinationsSummary.filter(el => el.countries.includes(countries[i])).map(el=> el.wwoofers).reduce((partialSum, a) => partialSum + a, 0)
        cR.globalMembershipsAddedVisitsSum = (cR.totalIncome/cR.totalWWOOFers)*cR.globalMembershipsAddedVisitsCount
        globalMembershipRest -= (cR.globalMembershipsAddedVisitsSum?cR.globalMembershipsAddedVisitsSum:0)

        cR.globalMembershipTotal = cR.globalMembershipLocalMemberships + cR.globalMembershipShareOfGlobalMemberships + cR.globalMembershipsAddedVisitsSum;

        wwoofersByCountry.push(cR)
    }
    output.wwoofersByCountry = wwoofersByCountry;
    output.globalMembershipData = {globalMembershipCount:globalMembershipCount,globalMembershipTotal:globalMembershipTotal,globalMembershipRest:globalMembershipRest};
    output.independetsData = {moreThan1Country:wiMoreThen1Country.length,numberOfCountriesArray:numberOfCountriesArray}
    output.multipleCountryMemberships = {moreThenOneCountryMembershipSummary:moreThenOneCountryMembershipSummary,countriesCombinationsSummary:countriesCombinationsSummary};

    console.log(output);   
    return output; 
}