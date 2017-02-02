pygmy3_0.dashboardCollapser = (function() {
	var chooserId = "project-chooser";
	var projectGroupIds = [];
	var chooser;

	function createChooser ()
	{
		chooser = document.createElement("select");
		chooser.id = chooserId;
		chooser.onchange = showOnlygroup;
		chooser.className = "grouping-chooser";
		
		var item = document.createElement("option");
		item.value = commonpygmy.allItemsValue;
		item.innerHTML = "~ All ~";

		chooser.appendChild(item);

		return chooser;
	}

	function addItemToChooser(id, name)
	{
		var item = document.createElement("option");
		item.value = id;
		item.innerHTML = name;

		chooser = document.getElementById(chooserId);
		if (chooser == null) {
			console.info('Setting up dashboard filter');
			var filterInput = createChooser();
			var dashboard = document.getElementsByClassName('breadcrumb');
			if (dashboard.length == 0) {
				//pre 3.8.5
				dashboard = document.getElementsByClassName('breadcrumb ng-scope');
			}
			commonpygmy.addFilterInput(filterInput, dashboard[0]);
			chooser = document.getElementById(chooserId);
		}
		chooser.appendChild(item);
	}

	function addGroupToChooser(node)
	{
		// Get project group name.
		var projectHeader = node.getElementsByTagName("TH")[0];
		var groupName = projectHeader.innerText;

		// Assign project group unique DOM id.
		pygmyId = commonpygmy.groupingId(groupName);
		commonpygmy.setNodePygmyId(node, pygmyId);

		addItemToChooser(pygmyId, groupName);

		projectGroupIds.push(pygmyId);

		console.debug('Project group added: ' + groupName);
	}

	function showOnlygroup(event) {
		var groupingId = event.target.value;
		commonpygmy.showItems(projectGroupIds, groupingId, 'block', 'none');

		var groupingMetric = groupingId == commonpygmy.allItemsValue ? "all" : "specific"
		chrome.runtime.sendMessage({ name: "used-dashboard-collapser", properties: { "grouping": groupingMetric  } });
	}

	function nodeInsertion(nodes)
	{
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.

			/* Just going to leave this here in case anyone else want's to see what I'm talking about. Just turn on debug logs
			if (!node.parentNode)
			{
				// WAT! Apparently the <p><em>[first line of template description]<em><p> node on the step template library has no parent.
				// Which when looking at in developer tools is actually a <markdown> element. But it's not in the JS DOM?
				console.debug("~~ Node with no parent WAT?! ~~")
				console.debug(node.outerHTML);
				console.debug(node);
			}
			*/

			if (node.parentNode && node.parentNode.tagName == 'FASTBOARD')
			{
				console.debug("Found an inserted project grouping");
				addGroupToChooser(node);
			}
		}
	}

	function observe(content)
	{
		var observer = new MutationObserver(function(records) {
			if (!window.location.href.endsWith('/app#/'))
				return;
			for (var i = 0; i < records.length; i++) {
				nodeInsertion(records[i].addedNodes);
			}
		});
		observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});
	}

	return {
		observe: observe,
	};

})();