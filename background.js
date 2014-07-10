function changeUrl(){
	window.location.href = 'http://ars.sng.local/Default.htm';
	console.log('href=' + location.href);
}
chrome.browserAction.onClicked.addListener(changeUrl);
