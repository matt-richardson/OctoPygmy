pygmy3_0.environmentCollapser = (function() {
	var chooserId = "envrionment-chooser";
	var environmentGroupIds = [];
	var chooser;

	function groupingId(groupName) {
		return groupName.toLowerCase().replace(/[^a-z0-9]/g,'') + "-grouping";
	}

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
		
		chooser = document.getElementById(chooserId);
		chooser.appendChild(item);
	}

	function addGroupToChooser(node) {

		// Get environment name
		var groupName = node.getElementsByTagName("SPAN")[0].innerText;
		var groupNode = node;

		// Assign environment unique DOM id
		pygmyId = groupingId(groupName);
		commonpygmy.setNodePygmyId(groupNode, pygmyId);

		addItemToChooser(pygmyId, groupName);

		environmentGroupIds.push(pygmyId);

		console.debug('Environment group added: ' + groupName);
	}

	function showOnlygroup(event) {
		var groupingId = event.target.value;
		commonpygmy.showItems(environmentGroupIds, groupingId, 'block', 'none');

		var groupingMetric = groupingId == commonpygmy.allItemsValue ? "all" : "specific"
		//chrome.runtime.sendMessage({ name: "used-environment-collapser", properties: { "grouping": groupingMetric  } });
	}

	function nodeInsertion(nodes) {
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.
			
			if (node.parentNode.tagName == 'DIV' && node.getAttribute("ng-repeat") == "environment in environments") {
				console.debug("Found an inserted environment");
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