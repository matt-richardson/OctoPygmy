function startOctoPygmy()
{
	if (pygmy3_0.worksWithPage())
	{
		pygmy3_0.setup()
	}
	else
	{
		if (window.location.pathname.indexOf('/app') < 0 || document.title.indexOf("Octopus Deploy") < 0) return; // Only run for Octopus Deploy

		var defaults = {
			dashboard: true,
			environments: true,
			machines: true,
			libraryTemplate: true,
			debugLogging: false,
			warnLogging: false,
			informationLogging: null
		};
		chrome.storage.sync.get(defaults, function(options) {
			//setupLogging(options)
			//setupFeatures(options)
		});
	}
}

function setupLogging(options)
{
	if (options.debugLogging == false) { window.console.debug = function() {} }
	if (options.warnLogging == false) { window.console.warn = function() {} }
	if (options.informationLogging == false) { window.console.info = function() {} }
}

function setupFeatures(options)
{
	console.debug("Adding OctoPygmy DOM listener.")
	var body = document.getElementById("body")
	body.addEventListener("DOMNodeInserted", function(event)
	{
		if (options.dashboard)	dashboardCollapser.nodeInsertion(event)
		if (options.environments) environmentCollapser.nodeInsertion(event)
		if (options.machines) environmentRoleNameFilter.nodeInsertion(event)
		if (options.libraryTemplate) integrateStepTemplateLibrary.nodeInsertion.call(integrateStepTemplateLibrary, event)
	})
}

startOctoPygmy();