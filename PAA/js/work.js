function checkAuth(){
    if (window.location.href.includes('login.html')) return;
    let paaToken = readCookie('paaToken');
    if (!paaToken){
        window.location = './login.html'
    }
}

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
      }
      if (headers) requestObj.beforeSend = function(request) {
        request.setRequestHeader("token", "apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw");
      },
      console.log(requestObj);
      var rData = $.ajax(requestObj).responseText;
      return rData;
    } catch(exception) {
      console.log(exception);
    }
}

function paaPostRequest(payloadObject){
    return callPostHttpRequest('https://davidmale--server.apify.actor/paaXHR',{'token':'apify_api_nf36PzXI3ydzk2UnFjwWVzrzCHRWOc2srqhw'}, payloadObject)
}

checkAuth();

$( document ).ready(function() {
    work();
});

function work(){
    //Login page
    $("a[id='loginButton']").bind("click", function() {
        let loginReq = paaPostRequest({'action':'login','username':$('[id="inputEmail"]').text().trim(),'password':$('[id="inputPassword"]').text().trim()});
        console.log(loginReq);
        return false;
    });

}