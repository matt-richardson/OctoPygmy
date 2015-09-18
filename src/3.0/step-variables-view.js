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

	function getTemplatParametersNodes(node)
	{
		return node.querySelectorAll("div[ng-repeat=\"parameter in actionTemplate.Parameters\"] div.controls");
	}
	
	function getTemplateParameterLabelNodes(node)
	{
		return node.querySelectorAll("div[ng-repeat=\"parameter in actionTemplate.Parameters\"] label.control-label");
	}
	
	function parameterIdentifier(text)
	{
		return text.toLowerCase().replace(/\W/,'-') + "-var-view";
	}
	
	function generateTestTable(parameterId)
	{
		var raw = "<table class='process-step-variables " + parameterId + "' width='100%' style='display: none;'>" +
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
	
	function toggleVariablesView(e)
	{
		console.log("Toggle variables view...");
		var parameterId = e.srcElement.attributes["parameter-id"].value;
		var view = document.querySelector("table." + parameterId);
		view.style.display = view.style.display == 'none' ? 'table' : 'none'
	}
	
	function generateVariableViewButton(parameterId)
	{
		var raw = '<i parameter-id="' + parameterId + '" class="fa fa-cogs view-process-variables"></i>'
		
		var node = commonpygmy.generateNodeFromHtml(raw);
		node.onclick = toggleVariablesView;
		
		return node;
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
				
				_.each(getTemplatParametersNodes(node), function(section) {
					var parameterId = parameterIdentifier(section.parentElement.attributes["label"].value);
					section.appendChild(generateTestTable(parameterId))
				});
				
				_.each(getTemplateParameterLabelNodes(node), function(label) {
					var parameterId = parameterIdentifier(label.parentElement.attributes["label"].value);
					label.appendChild(generateVariableViewButton(parameterId));
				});
				
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