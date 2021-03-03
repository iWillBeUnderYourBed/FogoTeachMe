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

var playPauseButtonSaysPlay = true;

var playInSec = 0;
var playInSecCounter = 0;

const referenceVideoIndex = 6;

const noAudioSourceArray = [];
const downloadedArray = [];
const bothDownloadedArray = [];
const downloadedMap = new Map();
const totalDownloadMap = new Map();
const corsProxiesEnabled = document.getElementById('EnabledOrDisabled').innerHTML.trim() == "Enabled";
const proxyCollection = document.getElementsByTagName('Proxy');
const proxyArray = [...proxyCollection];
const musicDomain = "http://music";
const videoDomain = "https://video";

playPauseButton
	.addEventListener('click', function (e) {
       if(playPauseButtonSaysPlay){

           if(isAllBuffered()){
						const timeInputValue = timeInput.value;
					 	if(isNaN(timeInputValue) || timeInputValue <= 0 || timeInputValue == null || timeInputValue == "") {
					 		play();
					 	} else {
					 		playInSec = timeInputValue;
					 		playInSecCounter = timeInputValue;
					 	}
           } else {
               //pause();
               playPauseButton.className = playPauseButton.className.replace( /(?:^|\s)green(?!\S)/g , 'blue' );
               playPauseButton.innerHTML = stillBuffering() + " of " + videoContainerArray.length + " videos are buffering. Please Wait.";
           }

       } else { // clicked on "Pause"
	         pause();
		 			 playPauseButton.className = playPauseButton.className.replace( /(?:^|\s)blue(?!\S)/g , 'green' );
					 playPauseButton.innerHTML = "&nbsp;Play in";
					 timeInput.value = playInSec;
					 playPauseButtonSaysPlay = true;
			 }
	}, true);

   function displayPlayButtonWhileBuffering(stillBuffering) {
     if(playPauseButton.classList.contains("blue")){
			 if(stillBuffering != 0){
				 playPauseButton.innerHTML = stillBuffering + " of " + videoContainerArray.length + " videos are buffering. Please Wait.";
			 } else {
				 playPauseButton.className = playPauseButton.className.replace( /(?:^|\s)blue(?!\S)/g , 'green' );
				 playPauseButton.innerHTML = "&nbsp;Play in";
			 }
		 }
   }

	function play() {
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
	}

	function pause() {
		  //const currentTimeReference = audioArray[referenceVideoIndex].currentTime;
	    videoContainerArray.forEach(function(item) {
			   item.pause();
				 //item.currentTime = currentTimeReference;
	    });
			audioArray.forEach(function(item, index) {
				if(!noAudioSourceArray.includes(index)){
					 item.pause();
					 //item.currentTime = currentTimeReference;
				}
	    });
	}

	stopButton
		.addEventListener('click', function () {
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
			const time = item.currentTime;
			audioArray.forEach(function(item, index) {
				if(!noAudioSourceArray.includes(index)){
	        item.currentTime = time;
				}
	    });
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
//var needsToLoadCounter = 2;
setInterval(
   function(){
		 if(playInSecCounter > 1){
         playInSecCounter--;
         timeInput.value = playInSecCounter;
		 } else if (playInSecCounter == 1) {
	       playInSecCounter--;
         timeInput.value = playInSecCounter;
         play();
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

    if(!isAllBuffered()) {
     	var allLoaded = 0;
    	var allTotal = 0;
			const totalAmountOfDownloads = videoContainerArray.length + audioArray.length - noAudioSourceArray.length;
			const factorOfDownloadsToWorkOn = totalAmountOfDownloads / downloadedMap.size;
			for (let amount of downloadedMap.values()) {
         allLoaded += amount;
      }
      for (let amount of totalDownloadMap.values()) {
         allTotal += amount;
      }
			allTotal *= factorOfDownloadsToWorkOn;
			const percentageDownloaded = Math.round(allLoaded / allTotal * 100);
			if(playPauseButton.classList.contains("green")){
				playPauseButton.className = playPauseButton.className.replace( /(?:^|\s)green(?!\S)/g , 'blue' );
			}
 			playPauseButton.innerHTML = "Buffering: " + percentageDownloaded + " %";
    }

		console.log("simultaionsConnections: " + (downloadedMap.size + simultaionsConnections));

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

	function preloadAudioVideo() {
		videoContainerArray.forEach(function(item, index) {
			 preloadSingleAudioVideo(item, index);
		});
		audioArray.forEach(function(item, index) {
			const count = item.getElementsByTagName("source").length;
			if(count == 0) {
				noAudioSourceArray.push(index);
			} else {
				preloadSingleAudioVideo(item, index);
			}
		});
	}

var simultaionsConnections = 0;

	function preloadSingleAudioVideo(item, index) {
    var url = item.getElementsByTagName("source")[0].src;
		var req = new XMLHttpRequest();
    var proxy = ""
		if(corsProxiesEnabled && proxyArray.length > 0){
			if(url.startsWith(musicDomain)){
				proxy = proxyArray[0];
			} else {
				for (i = 0; i < proxyArray.length; i++) {
            if(url.startsWith(proxyArray[i])){
							url = url.split(proxyArray[i])[1];
							if(i+1 < proxyArray.length){
								proxy = proxyArray[i + 1];
							} else {
								url = videoDomain + url.split(musicDomain)[1];
							}
						}
				}
			}
		} else if(url.startsWith(musicDomain)) {
		  	url = videoDomain + url.split(musicDomain)[1];
		}
    item.getElementsByTagName("source")[0].src = proxy + url;
		console.log("connection to: " +  proxy + url);
		req.open('GET', proxy + url, true); //    http://alloworigin.com/get?url=    https://cors.bridged.cc/  https://api.allorigins.win/raw?url=    https://api.allorigins.win/get?url=
		req.responseType = 'blob';
		//req.withCredentials = false;
    //req.setRequestHeader('origin', '');
    //req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

		req.onload = function() {
			simultaionsConnections--;
		   // Onload is triggered even on 404
		   // so we need to check the status code
		   if (this.status === 200) {
		      var videoBlob = this.response;
		      var vid = URL.createObjectURL(videoBlob); // IE10+
		      // Video is now downloaded
		      // and we can set it as source on the video element
		      item.src = vid;
					const alreadyContainedIndex = downloadedArray.includes(index) || noAudioSourceArray.includes(index);
					if(alreadyContainedIndex){
						videoContainerArray[index].setAttribute('poster','fogo_poster.png');
						bothDownloadedArray.push(index);
						displayPlayButtonWhileBuffering(stillBuffering());
					}
					downloadedArray.push(index);
		   }
		}
		req.onprogress = function (event) {
			downloadedMap.set(item, event.loaded);
		  totalDownloadMap.set(item, event.total);
		};
		req.onerror = function() {
			 console.log("req.onerror proxy: " + proxy  );
			//if(proxy != ""){
          preloadSingleAudioVideo(item, index);
		//	}
		}
		req.send();
	}

	function stillBuffering() {
			return videoContainerArray.length - bothDownloadedArray.length;
	}

  function isAllBuffered() {
      return stillBuffering() == 0;
  }

document.onload = (function() {
	for (i = 0; i < proxyArray.length; i++) {
		proxyArray[i] = proxyArray[i].innerHTML.trim();
	}

	preloadAudioVideo();
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
