if(document.getElementById("principalLayoutES")){document.getElementById("principalLayoutES").parentNode.style.position="static"}var IE=window.ActiveXObject?true:false;var MOZ=window.sidebar?true:false;var miniPanier=document.getElementById("contenuPanier");hubMarque=(hubMarque||"AC");var patchUrl=window.location.protocol+"//"+window.location.host+"/csspatch/"+hubMarque+"/framePatch.css";if(miniPanier){miniPanier.onload=function(){var cssPatchLink='<link rel="stylesheet" type="text/css"'+' href="'+patchUrl+'"/>';var iFrameHead;if(miniPanier.contentDocument){iFrameHead=miniPanier.contentDocument.getElementsByTagName("head")[0]}else{if(miniPanier.contentWindow){iFrameHead=miniPanier.contentWindow.document.body}}}}if(!(typeof installAccueil=="undefined")){var divglobal=document.getElementById("global");divglobal.className=divglobal.className+=" configurateur"}if(!(typeof afficheAjaxListeDocPneumatique=="undefined")){var divglobal=document.getElementById("global");divglobal.className=divglobal.className+=" pneu"}if(document.getElementById("f1")!=null){document.getElementById("f1").nextSiblings=function(){return new Array(document.getElementById("infosAPV"))}}if(!String.prototype.trim){String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")}};