var options = { 
	analytics: false,
	hasSetOptions: '0.0', // Which version have the options been set for. Just major.minor
};
chrome.storage.sync.get(options, function(result) 
{ 
	options = result;
	setupMetrics();
	displayOptionsPageIfNeeded();
});

function getLibraryTemplatesList(done)
{
	console.debug("Getting library template listing");
	var templatesUrl = 'https://api.github.com/repos/OctopusDeploy/Library/contents/step-templates'

	nanoajax.ajax(templatesUrl, function(status, response){
		var templates = JSON.parse(response);
		
		templates = templates.map(function(template, index, all){
			return {
				name: template.name.slice(0,-5),
				contentUrl: template.download_url,
			};
		});

		console.debug('Received ' + templates.length + ' templates from Github');
		done(templates);
	});
}

function setupMetrics()
{
	var version = chrome.runtime.getManifest().version;

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
	{
		console.debug('Message received:');
		console.debug(request);

		if (request == 'reload-options') {
			chrome.storage.sync.get(options, function(result) { options = result; });
			return;
		}

		if (request == 'get-library-templates') {
			getLibraryTemplatesList(sendResponse);
			return true;
		}

		if (options.analytics) {
			console.debug("Message received: " + request.name);

			request.properties.version = version;
			mixpanel.track(request.name, request.properties);
		}
	});

	console.log("OnMessage listener added for OctoPygmy");
}

function displayOptionsPageIfNeeded()
{
	var optionsVersion = chrome.runtime.getManifest().version.substring(0, chrome.runtime.getManifest().version.lastIndexOf('.'));
	if (options.hasSetOptions != optionsVersion) {
		console.debug("This version's options have not been set yet. " + options.hasSetOptions + " Ext: " + optionsVersion);

		chrome.tabs.create(
		{
			url: 'chrome-extension://' + chrome.runtime.id + '/options.html'
		});
	}
}