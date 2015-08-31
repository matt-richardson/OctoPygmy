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
		button.onclick = requestUpdateAll;
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

	function requestUpdateAll()
	{
		console.log("Updating all usage");
		chrome.runtime.sendMessage({message: "update-template-usage"});
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

	function receiveMessage(message, sender) {
		if(message.message == "process-updated"){
			console.log("Received message of updated process:" + message.process.Id);
			console.log(message.actionIdsUpdated);
			var actionLinks = usagePane.querySelectorAll("table tbody tr td:nth-child(2) a");
			for(var i = 0; i < actionLinks.length; i++) {
				if(actionLinks[i].href.indexOf(message.actionIdsUpdated[0]) > 0) {
					var version = actionLinks[i].parentNode.nextElementSibling.querySelector("span");
					version.innerHTML = "Updated";
					version.classList.remove("label-warning");
					version.classList.add("label-success");
				}
			}
		}
	}	
	
	function observe(content)
	{
		var observer = new MutationObserver(function(records) { 
			for (var i = 0; i < records.length; i++) {
				nodeInsertion(records[i].addedNodes);
			}
		});
		observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});
		
		//chrome.runtime.onMessage.removeListener(receiveMessage)
		chrome.runtime.onMessage.addListener(receiveMessage);

	}

	return {
		observe: observe
	};
})();