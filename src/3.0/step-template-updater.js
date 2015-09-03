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

		var currentVersion = _.find(paneNode.querySelectorAll("p"), function(node){
			return node.innerText.indexOf("Current version:") == 0;
		});

		if((typeof currentVersion) != "undefined"){
			console.debug("Found current version paragraph.");
			currentVersion.appendChild(button);
		}
/*
		var table = paneNode.querySelector("table");
		var view = table.parentNode;
		view.insertBefore(button, table);
*/
	}

	function createUpdaterButton()
	{
		var raw = '<button type="button" class="btn btn-sm btn-warning" style="margin-left: 10px;" id="' + buttonId + '">Update All</button>';
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
		}
	}

	function receiveMessage(message, sender) {
		if(message.message == "process-updated"){
			console.log("Received message of updated process:" + message.process.Id);
			console.log(message.actionIdsUpdated);
			
			var actionLinks = usagePane.querySelectorAll("table tbody tr td:nth-child(2) a");
			
			for(var i = 0; i < actionLinks.length; i++) {
				var actionId = _.find(message.actionIdsUpdated, function(id){
					return actionLinks[i].href.indexOf(id) > 0;
				});
				var manualId = _.find(message.actionsNotUpdated,function(id){
					return actionLinks[i].href.indexOf(id) > 0;
				});
				
				if((typeof actionId) != "undefined"){
					console.log("Action was updated: " + actionId);
					
					var stepAction = _.find(message.process.Steps, function(step){
						return step.Actions[0].Id == actionId;
					}).Actions[0];
					
					var status = actionLinks[i].parentNode.nextElementSibling.querySelector("span");
					var version = status.previousSibling;
					
					status.innerHTML = "Updated";
					status.classList.remove("label-warning");
					status.classList.add("label-success");
					version.nodeValue = stepAction.Properties["Octopus.Action.Template.Version"];
										
				} else if((typeof manualId) != "undefined"){
					console.log("Action requires manual update: " + manualId);
					
					var status = actionLinks[i].parentNode.nextElementSibling.querySelector("span");

					status.innerHTML = "Update Manually";
					status.classList.remove("label-warning");
					status.classList.add("label-info");					
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
		
		chrome.runtime.onMessage.addListener(receiveMessage);
	}

	return {
		observe: observe
	};
})();