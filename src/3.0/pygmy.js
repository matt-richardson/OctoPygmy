var pygmy3_0 = (function() {
	var contentElementId = "main-wrapper";	

	function worksWithPage() {
		console.debug("Checking for version 3.0 of Octopus Deploy");
		console.debug("   path: " + commonpygmy.location().pathname);
		console.debug("   title:" + commonpygmy.document().title);

		if (commonpygmy.location().pathname.indexOf('/app') < 0) return false;
		if (commonpygmy.document().title.indexOf("Octopus Deploy") < 0) return false;
		if (!commonpygmy.document().getElementById(contentElementId)) return false;

		return true;
	}

	function setup(options) {
		console.info("Setting up OctoPygmy for Octopus Deploy 3.0");
		
		var content = document.getElementById(contentElementId);
		
		console.debug("Initializing features based upon options");
		if(options.dashboard) this.dashboardCollapser.observe(content);
		if(options.environments) this.environmentCollapser.observe(content);
		if(options.machines) this.environmentFilter.observe(content);
		if(options.libraryTemplate) this.integrateStepTemplateLibrary.observe(content);
		if(options.updateAllTemplate) this.stepTemplateUpdater.observe(content);
		if(options.cloneStep) this.cloneStep.observe(content);
	}

	return {
		worksWithPage: worksWithPage,
		setup: setup
	};

})();