var pygmy3_0 = (function() {
	
	function worksWithPage() {
		console.debug("Checking for version 3.0 of Octopus Deploy");
		console.debug("   path: " + commonpygmy.location().pathname);
		console.debug("   title:" + commonpygmy.document().title);

		if (commonpygmy.location().pathname.indexOf('/app') < 0) return false;
		if (commonpygmy.document().title.indexOf("Octopus Deploy") < 0) return false;
		if (!commonpygmy.document().getElementById("main-wrapper")) return false;

		return true;
	}

	function setup() {
		console.info("Setting up OctoPygmy for Octopus Deploy 3.0");
	}

	return {
		worksWithPage: worksWithPage,
		setup: setup
	};

})();