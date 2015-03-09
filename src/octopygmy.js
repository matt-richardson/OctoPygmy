function startOctoPygmy()
{
	if (window.location.pathname != '/app' || document.title.indexOf("Octopus Deploy") < 0) return; // Only run for Octopus Deploy
	
	var options = { 
		dashboard: true,
		environments: true,
		machines: true
	};
	chrome.storage.sync.get(options, function(result) { options = result; });

	console.debug("Adding OctoPygmy DOM listener.")
	var body = document.getElementById("body");
	body.addEventListener("DOMNodeInserted", function(event)
	{
		if (options.dashboard)	dashboardCollapser.nodeInsertion(event);
		if (options.environments) environmentCollapser.nodeInsertion(event);
		if (options.machines) environmentRoleNameFilter.nodeInsertion(event);
	});
}

startOctoPygmy();