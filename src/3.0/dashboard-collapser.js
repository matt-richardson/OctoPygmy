pygmy3_0.dashboardCollapser = (function() {
	var chooserId = "project-chooser";
	var projectGroupIds = [];
	var chooser;

	function groupingId (groupName) {
		return groupName.toLowerCase().replace(/[^a-z0-9]/g,'') + "-grouping";
	}

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
		chooser.appendChild(item);
	}

	function addGroupToChooser(node)
	{
		// Get project group name.
		var projectHeader = node.getElementsByTagName("TH")[0];
		var groupName = projectHeader.innerText;

		// Assign project group unique DOM id.
		pygmyId = groupingId(groupName);
		commonpygmy.setNodePygmyId(node, pygmyId);

		addItemToChooser(pygmyId, groupName);

		projectGroupIds.push(pygmyId);

		console.debug('Project group added: ' + groupName);
	}

	function showOnlygroup(event) {
		var groupingId = event.target.value;
		commonpygmy.showItems(projectGroupIds, groupingId, 'block', 'none');

		var groupingMetric = groupingId == commonpygmy.allItemsValue ? "all" : "specific"
		//chrome.runtime.sendMessage({ name: "used-dashboard-collapser", properties: { "grouping": groupingMetric  } });
	}

	function nodeInsertion(nodes)
	{
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.

			if (node.parentNode.tagName == 'FASTBOARD')
			{
				console.debug("Found an inserted project grouping");
				addGroupToChooser(node);
			}			
			if (node.tagName == 'UL' && node.innerText == 'Dashboard') {
				console.info('Setting up dashboard filter');
				var filterInput = createChooser();
				commonpygmy.addFilterInput(filterInput, node.parentNode);
			}
		}
	}

	function observe(content)
	{
		var observer = new MutationObserver(function(records) { 
			console.debug("Observing " + records.length + " mutations");
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