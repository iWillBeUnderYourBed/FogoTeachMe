const videoContainerCollection = document.getElementsByClassName('video-container');
const videoContainerArray = [...videoContainerCollection];
const avgDiffCollection = document.getElementsByClassName('avgDiffOf8');
const avgDiffArray = [...avgDiffCollection];
const audioContainerCollection = document.getElementsByClassName('audio-container');
const audioArray = [...audioContainerCollection];

const playPauseButton = document.getElementById('playPause');
const stopButton = document.getElementById('stop');
const timeDifferenceTextField = document.getElementById('timeDifferenceTextField');
const timeInput = document.getElementById('timeInputInButton');

var shouldPlay = false;
var playPauseButtonSaysPlay = true;
//var videosHavePlayed = false;

var playInSec = 0;
var playInSecCounter = 0;

const referenceVideoIndex = 6;

const noAudioSourceArray = [];
audioArray.forEach(function(item, index) {
	const count = item.getElementsByTagName("source").length;
	if(count == 0) {
		noAudioSourceArray.push(index);
	}
});


playPauseButton
	.addEventListener('click', function (e) {
       if(playPauseButtonSaysPlay){


				 var videosAllInitialized = true;
           videoContainerArray.forEach(function(item) {
		           if(item.getAttribute('poster') !== 'fogo_poster.png'){
								 videosAllInitialized = false;
			             return;
		           }
	     });
			 if(!videosAllInitialized) {
			 		return;
			 }

				 e = window.event || e;
			 	 if(this !== e.target) {
						return;
			 	 }
					 const timeInputValue = timeInput.value;
					 if(isNaN(timeInputValue) || timeInputValue <= 0 || timeInputValue == null || timeInputValue == "") {
						 shouldPlay = true;
						 playIfBuffered();
					 } else {
						 playInSec = timeInputValue;
						 playInSecCounter = timeInputValue;
					 }

       } else { // clicked on "Pause"
	         shouldPlay = false;
	         pause();
		 			 playPauseButton.className = playPauseButton.className.replace( /(?:^|\s)blue(?!\S)/g , 'green' );
					 playPauseButton.innerHTML = "&nbsp;Play in";
					 timeInput.value = playInSec;
					 playPauseButtonSaysPlay = true;
			 }
	}, true);

	videoContainerArray.forEach(function(item) {
		item.addEventListener('canplaythrough', (event) => {
			item.setAttribute('poster','fogo_poster.png');
			if(shouldPlay){
				 playIfBuffered();
			}
    });
	});

	videoContainerArray.forEach(function(item) {
		item.addEventListener('waiting', (event) => {
			if(shouldPlay){
				playIfBuffered();
		 }
    });
	});


	videoContainerArray.forEach(function(item) {
		item.onerror = function() {
			console.log("  error " );
			item.load();
			if(shouldPlay){
				playIfBuffered();
		 }
		}
	});

	audioArray.forEach(function(item) {
		item.onerror = function() {
			console.log("  error " );
			item.load();
			if(shouldPlay){
				playIfBuffered();
		 }
		}
	});

	document.onerror = function(error, url, line) {
    console.log("Window Error: " + error);
	    console.log("url: " + url);
		    console.log("line: " + line);
};

function checkReady() {
	var countReady = 0;
	videoContainerArray.forEach(function(item) {
		if ( item.readyState >= 3 ) { 	// it's loaded
			countReady++;
		}
	});
	audioArray.forEach(function(item) {
		if ( item.readyState >= 3 ) { 	// it's loaded
			countReady++;
		}
	});
	return countReady + noAudioSourceArray.length;
}

	function playIfBuffered() {
		const stillBuffering = videoContainerArray.length + audioArray.length - checkReady()
		if(stillBuffering == 0){
			videoContainerArray.forEach(function(item) {
	        item.play();
	    });
			audioArray.forEach(function(item, index) {
				if(!noAudioSourceArray.includes(index)){
	        item.play();
				}
	    });
			playPauseButton.innerHTML = "&nbsp;Pause&nbsp;";
			playPauseButton.className = playPauseButton.className.replace( /(?:^|\s)green(?!\S)/g , 'blue' );
			playPauseButtonSaysPlay = false;
		} else {
			pause();
			playPauseButton.className = playPauseButton.className.replace( /(?:^|\s)green(?!\S)/g , 'blue' );
			playPauseButton.innerHTML = stillBuffering + " of " + (videoContainerArray.length + audioArray.length - noAudioSourceArray.length) + " streams are buffering. Please Wait.";
		}
	}

	function pause() {
		  const currentTimeReference = audioArray[referenceVideoIndex].currentTime;
	    videoContainerArray.forEach(function(item) {
			   item.pause();
				 item.currentTime = currentTimeReference;
	    });
			audioArray.forEach(function(item, index) {
				if(!noAudioSourceArray.includes(index)){
					 item.pause();
					 item.currentTime = currentTimeReference;
				}
	    });
	}

	stopButton
		.addEventListener('click', function () {
			shouldPlay = false;
			playPauseButtonSaysPlay = true;
			playPauseButton.innerHTML = "&nbsp;Play in";
			timeInput.value = playInSec;
			playPauseButton.className = playPauseButton.className.replace( /(?:^|\s)blue(?!\S)/g , 'green' );
			videoContainerArray.forEach(function(item) {
				item.pause();
				item.currentTime = 0;
		 });
		 audioArray.forEach(function(item, index) {
			 if(!noAudioSourceArray.includes(index)){
			     item.pause();
			     item.currentTime = 0;
		 }
		});
		 //videosHavePlayed = false;
		}, false);

videoContainerArray.forEach(toggleMute);
function toggleMute(item, index) {
  item.addEventListener('click', function() {
    if (item.style.opacity == "0.5") {
			if(!noAudioSourceArray.includes(index)){
          audioArray[index].muted = false;
		  }
      item.style.opacity = "1";
      item.style.filter  = 'alpha(opacity=100)'; // IE fallback
    }
    else {
			if(!noAudioSourceArray.includes(index)){
          audioArray[index].muted = true;
		}
      item.style.opacity = "0.5";
      item.style.filter  = 'alpha(opacity=50)'; // IE fallback
    }
  });
}


var average = 0;
setInterval(
   function(){
		 if(playInSecCounter > 1){
         playInSecCounter--;
         timeInput.value = playInSecCounter;
		 } else if (playInSecCounter == 1) {
	       playInSecCounter--;
         timeInput.value = playInSecCounter;
         shouldPlay = true;
         playIfBuffered();
		 }
	     audioArray.forEach(function(item, index) {

					if(avgDiffArray[index].innerHTML.indexOf("Referenzvideo") === -1 && !noAudioSourceArray.includes(index)){
					  	 const currentTime = audioArray[referenceVideoIndex].currentTime;
	 		         const videoTime = item.currentTime;
							 avgDiffArray[index].innerHTML = Math.round((currentTime - videoTime) * 100000) / 100 + " ms";
	 			    	 average = average + Math.abs(currentTime - videoTime);
					}
					if(index == audioArray.length - 1){
						timeDifferenceTextField.innerHTML = Math.round(average / (audioArray.length - noAudioSourceArray.length) * 1000) + " ms" ;
						average = 0;
					}
 	     });
    }, 1000);

		var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

document.onload = (function() {
	const firefoxOn = "<p> Please do not use friefox for this website, since it's not optimized for firefox. <br> Use <a href=\"https://www.google.com/chrome/\"  target=\"_blank\">chrome</a>. Don't like google? Use <a href=\"https://www.srware.net/iron/\"  target=\"_blank\">Iron</a>. </p>";
  const windowsOn = "<p> <blockquote><em>You seem to be running windows. Microsoft Edge works best and is most likely already installed!</em></blockquote>  </p>";
	const end = "<p> Or click on the x and do as you please. </p>"
	const infoPanel = document.getElementById('infoPanel');
	//const infoPanelText = document.getElementById('infoPanelText');
	if (navigator.userAgent.indexOf("Firefox") != -1) {
       infoPanel.style.display='block';
			 infoPanel.innerHTML += firefoxOn;
  }
  if (navigator.appVersion.indexOf("Win") != -1) {
	    infoPanel.innerHTML += windowsOn;
  }
  infoPanel.innerHTML += end;
})();
