function cpnWaitPreloadPageAffiche() { //DOM
	if (document.getElementById){
		 preload = document.getElementById('cpnPreLoad');
		 preload.innerHTML = "<img src='/images/AC/spinner.gif'>";
		 preload.style.visibility='visible';
	}else{
		if (document.layers){ //NS4
			document.cpnPreLoad.visibility = 'visible';	
		} else { //IE4
			document.all.cpnPreLoad.style.visibility = 'visible';
		}
	}
}