pygmy3_0.stepTemplateUpdater = (function() {
	var usageSelector = "div[ng-class=\"{active: tab == 'usage'}\"]";
	var buttonId = "template-update-all";
	var usagePane;
	
	function isStepTemplateUsageView(node)
	{
		return node.tagName == "DIV"
			&& node.querySelector(usageSelector);
	}	

	function addUpaterButton(paneNode)
	{
		if(paneNode.querySelector("#" + buttonId)) return; // Already added.

		var button = createUpdaterButton();
		var table = paneNode.querySelector("table");
		var view = table.parentNode;
		view.insertBefore(button, table);
	}

	function createUpdaterButton()
	{
		var raw = '<button type="button" class="btn btn-lg btn-warning" id="' + buttonId + '">Update All</button>';
		return generateNodeFromHtml(raw);
	}

	function generateNodeFromHtml(rawHtml)
	{
		var stub = document.createElement('div');
		stub.innerHTML = rawHtml;
		return stub.childNodes[0];
	}

	function nodeInsertion(nodes)
	{
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.

			if (isStepTemplateUsageView(node))
			{
				console.debug("Viewing step template usage, adding update all button");
				usagePane = node.querySelector(usageSelector);
				addUpaterButton(usagePane);
			}			
			/*
			if (node.tagName == 'UL' && node.innerText == 'Dashboard') {
				console.info('Setting up dashboard filter');
				var filterInput = createChooser();
				commonpygmy.addFilterInput(filterInput, node.parentNode);
			}
			*/
		}
	}

	function observe(content)
	{
		var observer = new MutationObserver(function(records) { 
			console.debug("Observing " + records.length + " mutations.");
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