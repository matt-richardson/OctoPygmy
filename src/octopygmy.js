var octopygmy = (function() {
	
	function startOctoPygmy()
	{
		var defaultOptions = {
			dashboard: true,
			dashboardFilter: true,
			environments: true,
			machines: true,
			libraryTemplate: true,
			debugLogging: false,
			warnLogging: false,
			informationLogging: null,
			updateAllTemplate: true,
			cloneStep: true,
			editStepAsJson: true,
			viewReleaseDeploymentProcess: true,
			viewResultantVariableList: true,
		};

		chrome.storage.sync.get(defaultOptions, function(options) {
			setupLogging(options);
			setupFeatures(options);
		});
	}

	function setupFeatures(options)
	{
		if (pygmy3_0.worksWithPage())
		{
			pygmy3_0.setup(options);
		}
		else
		{
			console.log("Setting up OctoPygmy for Octopus Deploy 2.x");
			
			if (window.location.pathname.indexOf('/app') < 0 || document.title.indexOf("Octopus Deploy") < 0) return; // Only run for Octopus Deploy

			console.debug("Adding OctoPygmy DOM listener.");
			var body = document.getElementById("body");
			body.addEventListener("DOMNodeInserted", function(event)
			{
				if (options.dashboard)	dashboardCollapser.nodeInsertion(event)
				if (options.dashboardFilter) dashboardFilter.nodeInsertion(event)
				if (options.environments) environmentCollapser.nodeInsertion(event)
				if (options.machines) environmentRoleNameFilter.nodeInsertion(event)
				if (options.libraryTemplate) integrateStepTemplateLibrary.nodeInsertion.call(integrateStepTemplateLibrary, event)
				if (options.updateAllTemplate) stepTemplateUpdater.nodeInsertion(event)
			});
		}

	}

	function setupLogging(options)
	{
		if (options.debugLogging == false) { window.console.debug = function() {} };
		if (options.warnLogging == false) { window.console.warn = function() {} };
		if (options.informationLogging == false) { window.console.info = function() {} };
	}

	return {
		start: startOctoPygmy
	};

})();

octopygmy.start();