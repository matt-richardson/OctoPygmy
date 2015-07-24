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

	function setup() {
		console.info("Setting up OctoPygmy for Octopus Deploy 3.0");
		
		var content = document.getElementById(contentElementId);
		this.dashboardCollapser.observe(content);
		this.environmentCollapser.observe(content);
		this.environmentFilter.observe(content);
		this.integrateStepTemplateLibrary.observe(content);
	}

	return {
		worksWithPage: worksWithPage,
		setup: setup
	};

})();