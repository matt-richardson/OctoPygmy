pygmy3_0.cloneStep = (function() {
    function receiveMessage(response) {
        if (response.message == 'clone-step-response') {
            console.log('got a clone-step-response message');

            var refreshHandler = document.getElementById("bluefin-clonestep-refreshbutton");
            refreshHandler.attributes['status'].value = response.properties.status;

            if (response.properties.status == 'success') {
                message = '';
            }
            else {
                message = 'Failed to clone the step. ' + response.properties.errorMessage;
                for(var i = 0; i < response.properties.errors.length; i++) {
                    message += ' ' + response.properties.errors[i];
                }
            }
            refreshHandler.attributes['message'].value = message;
            if (refreshHandler.onClick)
                refreshHandler.onClick();
            else
                refreshHandler.click();
        }
    }

    function isProcessEditDropdown(node) {
        return (node.tagName == 'SCRIPT' && node.id == 'processEditDropdown');
    }

    function cloneStep(sender, sendMessageHandler, receiveMessageHandler) {
        var menuItem = this;
        var stepId = this.parentElement.attributes["data-step-id"].value;

        var isAction = this.parentElement.attributes["data-is-child"].value == 'true';
        var actionId = isAction ? this.parentElement.attributes["data-action-id"].value : undefined;
        var deploymentProcessId = this.parentElement.attributes["data-deployment-process-id"].value;
        console.debug("sending clone-step message for stepId '" + stepId + "', actionId = '" + actionId + "'");

        sendMessageHandler = sendMessageHandler || chrome.runtime.sendMessage;
        receiveMessageHandler = receiveMessageHandler || receiveMessage;

        sendMessageHandler({ name: 'clone-step', properties: {} }); // Analytics
        sendMessageHandler({ message: 'clone-step', properties: { stepId: stepId, actionId: actionId, deploymentProcessId: deploymentProcessId }}, receiveMessageHandler);
        return false;
    }

    function addCloneStepMenuItem() {
        console.debug("Adding clone menu item to dropdown menu")
        var menu = document.querySelector("ul.dropdown-menu[role='menu']");

        //ensure we dont add the menu twice
        for(i = 0; i < menu.children.length; i++ ) {
            if (menu.children[i].innerText == 'Clone')
                return;
        }

        var newMenuItem = document.createElement('li')
        newMenuItem.className = 'divider';
        menu.appendChild(newMenuItem);

        newMenuItem = document.createElement('li')
        newMenuItem.innerHTML = '<a tabindex="-1" href="">Clone</a>'
        newMenuItem.onClick = newMenuItem.onclick = cloneStep;
        menu.appendChild(newMenuItem);
    }

    function addCloneStepMetaData() {
        console.debug(" - adding step id and deploymentprocess id to dropdown template")
        var template = document.getElementById('processEditDropdown');
        template.text = template.text.replace(
          '<ul class="dropdown-menu" role="menu">',
          '<ul class="dropdown-menu" role="menu" data-step-id="{{step.Id}}" data-deployment-process-id="{{project.DeploymentProcessId}}" data-action-id="{{action.Id}}" data-is-child="{{isChild}}">');
    }

    function addCloneStepRefreshHandler() {
        if (!document.getElementById('bluefin-clonestep-refreshbutton')) {
            console.debug(" - creating refresh handler element")
            var span = document.createElement('span');
            span.id = 'bluefin-clonestep-refreshbutton';

            var attribute = document.createAttribute("status");
            attribute.value = "";
            span.setAttributeNode(attribute);

            attribute = document.createAttribute("message");
            attribute.value = "";
            span.setAttributeNode(attribute);

            document.body.appendChild(span);

            console.debug(" - creating refresh handler script")
            var script = document.createElement("script");
            script.id = 'bluefin-clonestep-refreshhandler';
            script.type = 'text/javascript';
            script.text = "var button = document.querySelector('#bluefin-clonestep-refreshbutton'); button.onClick = button.onclick = function() { if (this.attributes['status'].value == 'success') { angular.element(\"#processEditDropdown\").injector().get(\"$route\").reload();} else { angular.element(\"#processEditDropdown\").injector().get(\"octoDialog\").messageBox('Clone Step Failed', this.attributes['message'].value, [{label: 'ok'}]);} }";
            document.body.appendChild(script);
        }
    }

    function addCloneStepMenuItems(node) {
        var normalStep = "{id: 'processEditDropdown', scope: { step: step, action: step.Actions[0] } }";
        var parentStep = "{id: 'processEditDropdown', scope: { step: step } }";
        var childStep = "{id: 'processEditDropdown', scope: { step: step, action: action, isChild: true } }";

        var nodes = node.querySelectorAll("DIV.menu-button A[external-dropdown]");
        for(i = 0; i < nodes.length; i++ ) {
            var dropdownType = nodes[i].attributes['external-dropdown'].value
            if ((dropdownType == normalStep) || (dropdownType == parentStep) || (dropdownType == childStep)) {
                var oldClickHandler = nodes[i].onclick;
                nodes[i].onClick = nodes[i].onclick = function() { if (oldClickHandler) oldClickHandler(); addCloneStepMenuItem(); }
            }
        }
    }

    function nodeMutated(node) {
        if (node.querySelector("#processEditDropdown")) {
            console.debug("Loading Bluefin feature 'clone step'");
            addCloneStepMetaData();
            addCloneStepRefreshHandler();
        }
        addCloneStepMenuItems(node);
    }

    function nodesMutated(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.nodeType != 1) return; // Not an element just ignore.
            nodeMutated(node);
        }
    }

    function observe(content) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                nodesMutated(mutation.addedNodes);
            });
        });
        observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});

        chrome.runtime.onMessage.addListener(receiveMessage);
    }

    return {
        observe: observe,
        receiveMessage: receiveMessage,
        cloneStep: cloneStep,
        addCloneStepMetaData: addCloneStepMetaData,
        addCloneStepMenuItem: addCloneStepMenuItem,
        addCloneStepRefreshHandler: addCloneStepRefreshHandler,
        addCloneStepMenuItems : addCloneStepMenuItems
    };
})();