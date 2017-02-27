pygmy3_0.environmentCollapser = (function() {
	var chooserId = "envrionment-chooser";
	var environmentGroupIds = [];
	var chooser;

	function createChooser() {
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

	// Copy and pasted from dashboard collapser. Refactor to common method?
	function addItemToChooser(id, name)
	{
		var item = document.createElement("option");
		item.value = id;
		item.innerHTML = name;
		
		chooser.appendChild(item);
	}

	function addGroupToChooser(node) {

		// Get environment name
		var groupName = node.getElementsByTagName("SPAN")[0].innerText;
		var groupNode = node;

		// Assign environment unique DOM id
		pygmyId = commonpygmy.groupingId(groupName);
		commonpygmy.setNodePygmyId(groupNode, pygmyId);

		addItemToChooser(pygmyId, groupName);

		environmentGroupIds.push(pygmyId);

		console.debug('Environment group added: ' + groupName);
	}

	function showOnlygroup(event) {
		var groupingId = event.target.value;
		commonpygmy.showItems(environmentGroupIds, groupingId, 'block', 'none');

		var groupingMetric = groupingId == commonpygmy.allItemsValue ? "all" : "specific"
		chrome.runtime.sendMessage({ name: "used-environment-collapser", properties: { "grouping": groupingMetric  } });
	}

	function removeEnvironmentCollapserIfExists() {
		if (chooser) {
			chooser.parentNode.removeChild(chooser);
			chooser = null;
		}
	}

	function nodeInsertion(nodes) {

		if (window.location.href.indexOf('/app#/environments') == -1) {
			removeEnvironmentCollapserIfExists();
 			return;
		}

		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.
			
			if (node.parentNode && node.parentNode.tagName == 'DIV' && node.getAttribute("ng-repeat") == "environment in environments") {
				console.debug("Found an inserted environment");
				ensureChooserExists();
				addGroupToChooser(node);
			}

			// This is just like the dashboard collapser. Refactor to a common method?
			if (node.tagName == 'UL' && node.innerText.trim() == 'Environments') {
				console.info('Setting up environment collapser');
				var filterInput = createChooser();
				commonpygmy.addFilterInput(filterInput, node.parentNode);
			}
		}
	}

	function ensureChooserExists()
	{
		if (chooser == null)
		{
			console.debug("Adding the environment chooser. Due to hard refresh of page");
			var breadcrumb = commonpygmy.getPageBreadcrumb("Environments");
			var filterInput = createChooser();
			commonpygmy.addFilterInput(filterInput, breadcrumb.parentNode);
		}
	}

	// Copy and pasted from dashboard collapser. Refactor to common method?
	function observe(content) {
		var observer = new MutationObserver(function(records) { 
			for (var i = 0; i < records.length; i++) {
				nodeInsertion(records[i].addedNodes);
			}
		});
		observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});
	}

	return {
		observe: observe
	};
})();