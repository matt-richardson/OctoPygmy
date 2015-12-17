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
        var deploymentProcessId = this.parentElement.attributes["data-deployment-process-id"].value;
        console.debug("sending clone-step message for step " + stepId);

        sendMessageHandler = sendMessageHandler || chrome.runtime.sendMessage;
        receiveMessageHandler = receiveMessageHandler || receiveMessage;

        sendMessageHandler({ message: 'clone-step', properties: { stepId: stepId, deploymentProcessId: deploymentProcessId }}, receiveMessageHandler);
    }

    function addCloneStepMenuItem() {
        console.debug("Adding clone menu item to dropdown menu")
        var menu = document.querySelector("ul.dropdown-menu[role='menu']");

        var newMenuItem = document.createElement('li')
        newMenuItem.className = 'divider';
        menu.appendChild(newMenuItem);

        newMenuItem = document.createElement('li')
        newMenuItem.innerHTML = '<a tabindex="-1" href="">Clone</a>'
        newMenuItem.onClick = newMenuItem.onclick =cloneStep;
        menu.appendChild(newMenuItem);
    }

    function addCloneStepMetaData() {
        console.debug(" - adding step id and deploymentprocess id to dropdown template")
        var template = document.getElementById('processEditDropdown');
        template.text = template.text.replace(
          '<ul class="dropdown-menu" role="menu">',
          '<ul class="dropdown-menu" role="menu" data-step-id="{{step.Id}}" data-deployment-process-id="{{project.DeploymentProcessId}}">');
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
        var nodes = node.querySelectorAll("DIV.menu-button A[external-dropdown]");
        for(i = 0; i < nodes.length; i++ ) {
            if (nodes[i].attributes['external-dropdown'].value == "{id: 'processEditDropdown', scope: { step: step, action: step.Actions[0] } }") {
                nodes[i].onClick = nodes[i].onclick = addCloneStepMenuItem;
            }
        }
    }

    function nodeMutated(node) {
        if (node.querySelector("#processEditDropdown")) {
            console.debug("Loading Blue fin feature 'clone step'");
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