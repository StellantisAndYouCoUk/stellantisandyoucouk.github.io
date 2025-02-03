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

$( document ).ready(function() {
    work();
});

function work(){
    let qV = getUrlVars();
    $('#reportName').text('Inspection report - '+qV['regNumber']);

    let reportD = callGetHttpRequest('https://api.apify.com/v2/key-value-stores/A9g4nVwadc9Zjbzlg/records/'+qV['date']+'_'+qV['regNumber']+'_reportData');
    console.log(reportD);
    if (reportD.error){
        $('#dataContent').append('<b>The report for the Registration Number and Date was not found</b>')
    }

    let html = '';
    let odd = true;
    for (let i = 0;i<reportD.length;i++){
        if (odd) html += '<div class="row">'
        html += '<div class="col-xl-6"><div class="card mb-4"><div class="card-header">'+reportD[i].vehiclePartLabel+' - '+reportD[i].vehiclePartLocationLabel+'</div><div class="card-body"><div class="row">';
        for (let j = 0;j<reportD[i].images.length;j++){
            html +='<div class="card mb-4 col-auto col"><a href="'+reportD[i].images[j].imageUrl+'" target="_blank"><img src="'+reportD[i].images[j].thumbUrl+'" width="250"></a><br>';
            for (let k = 0;k<reportD[i].images[j].damages.length;k++){
                html +='Damage: ' + reportD[i].images[j].damages[k].severityLabel +' - '+reportD[i].images[j].damages[k].status+(k<reportD[i].images[j].damages.length-1?'<br />':'')
            }
            html +='</div>';
        }
        html += '</div></div></div></div>';
        if (!odd) html += '</div>';
        odd = !odd;
    }
    
    $('#dataContent').append(html)
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