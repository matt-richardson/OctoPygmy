function startOctoPygmy()
{
	if (window.location.pathname != '/app' || document.title.indexOf("Octopus Deploy") < 0) return; // Only run for Octopus Deploy

	console.debug("Adding OctoPygmy DOM listener.")
	var body = document.getElementById("body");
	body.addEventListener("DOMNodeInserted", function(event)
	{
		dashboardCollapser.nodeInsertion(event);
		environmentCollapser.nodeInsertion(event);
		environmentRoleNameFilter.nodeInsertion(event);
	});
}

startOctoPygmy();