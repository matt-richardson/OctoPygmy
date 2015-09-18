pygmy3_0.stepVariablesViewer = (function() {

	function isActionTemplateDetails(node)
	{
		// action-template="actionTemplate"
			// p class="gray"
			// div.ng-scope
		// ng-repeat="parameter in actionTemplate.Parameters"
		return node.tagName == "DIV" && node.getAttribute("ng-if") == "actionTemplate";
		// node.querySelector("div[action-template=\"actionTemplate\"]");
	}

	function getTemplatParametersNode(node)
	{
		return node.querySelector("div[ng-repeat=\"parameter in actionTemplate.Parameters\"] div.controls");
	}
	
	function generateTestTable()
	{
		var raw = "<table class='process-step-variables' width='100%'>" +
			"<thead><tr>" +
				"<td>Value</td>" +
				"<td>Scope</td>" +
			"</tr></thead>" +
			"<tbody>" +
			"<tr><td>A value</td><td>Scope,Scope2</td></tr>" +
			"<tr class='even'><td>A value</td><td>Scope,Scope2</td></tr>" +
			"</tbody>" +
			"</table>";
		
		return commonpygmy.generateNodeFromHtml(raw);
	}
	
	function nodeInsertion(nodes)
	{
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.
			
			if (isActionTemplateDetails(node))
			{
				console.debug("Found step action template details section...");
				console.debug(node);
				
				getTemplatParametersNode(node).appendChild(generateTestTable());
				//node.firstElementChild.insertBefore(generateTestTable(), node.firstElementChild.firstElementChild.nextSibling);
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
	}

	return {
		observe: observe
	};
})();