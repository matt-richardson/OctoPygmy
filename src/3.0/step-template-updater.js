pygmy3_0.stepTemplateUpdater = (function() {
	var usageSelector = "div[ng-class=\"{active: tab == 'usage'}\"]";
	var buttonId = "template-update-all";

	function isStepTemplateUsageView(node)
	{
		if (node.innerHTML.indexOf('Usage') > -1) {
			console.log(node.innerHTML);
			var ngClassAttribute = node.attributes['ng-class'];
			if (ngClassAttribute && ngClassAttribute.value == "{active: tab == 'usage'}") {
				return node.className == 'active';
			}
		}
		return false;
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
		chrome.runtime.sendMessage({name: "update-template-usage", properties: {}});
	}

	function nodeInsertion(nodes)
	{
		if (window.location.href.indexOf('/app#/library/steptemplates/') == -1 && window.location.href.indexOf('/app#/library/steps/') == -1)
			return;

		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.

			console.debug("Viewing step template usage, adding update all button");
			var usagePane = node.querySelector(usageSelector);
			if (usagePane)
				addUpaterButton(usagePane);
		}
	}

	function receiveMessage(message, sender) {
		if(message.message == "process-updated"){
			console.log("Received message of updated process:" + message.process.Id);
			console.log(message.actionIdsUpdated);

			var usagePane = document.querySelector(usageSelector);
			var actionLinks = usagePane.querySelectorAll("table tbody tr td:nth-child(2) a");

			for(var i = 0; i < actionLinks.length; i++)
			{
				var actionId = _.find(message.actionIdsUpdated, function(id){
					return actionLinks[i].href.indexOf(id) > 0;
				});
				var manualId = _.find(message.actionsNotUpdated,function(id){
					return actionLinks[i].href.indexOf(id) > 0;
				});

				var version = actionLinks[i].parentNode.nextElementSibling
				var status = version.nextElementSibling;

				if((typeof actionId) != "undefined"){
					console.log("Action was updated: " + actionId);

					var processActions = _.flatten(_.pluck(message.process.Steps, "Actions"), true);
					var stepAction = _.find(processActions, function(action){
						return action.Id == actionId;
					});

					if (status == null) {
						//pre 3.8.5
						status = version.querySelector('span');
						version = status.previousSibling;
						status.innerHTML = "Updated";
						status.classList.remove("label-warning");
						status.classList.add("label-success");
					} else {
						status.innerHTML = "<div class='up-to-date-version'><p>Updated</p></div>";
					}
					version.nodeValue = stepAction.Properties["Octopus.Action.Template.Version"];
				}
				else if ((typeof manualId) != "undefined")
				{
					console.log("Action requires manual update: " + manualId);

					if (status == null) {
						//pre 3.8.5
						status = version.querySelector('span');
						status.innerHTML = "Update Manually";
						status.classList.remove("label-warning");
						status.classList.add("label-info");
					} else {
						status.innerHTML = "<div class='out-of-date-version'><p>Update Manually</p></div>";
					}
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