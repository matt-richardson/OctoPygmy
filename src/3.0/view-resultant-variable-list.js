pygmy3_0.viewResultantVariableList = (function() {
    function receiveMessage(response) {
        if (response.message == 'get-template-response' && response.properties.templateName == 'view-resultant-variable-list.html') {
            console.debug("  - got template 'view-resultant-variable-list.html'");
            console.debug("  - adding handler");
            var viewResultantVariableListHandlerScript = document.createElement("script");
            viewResultantVariableListHandlerScript.id = 'bluefin-viewresultantvariablelist-handler';
            viewResultantVariableListHandlerScript.type = 'text/javascript';
            var functionAsText = angularShowModalDialog.toString()
            functionAsText = functionAsText.replace("#{template}", response.properties.template.replace(/'/g,"\\'"));
            viewResultantVariableListHandlerScript.text = functionAsText.slice(functionAsText.indexOf("{") + 1, functionAsText.lastIndexOf("}"));
            document.body.appendChild(viewResultantVariableListHandlerScript);
        } else if (response.message == 'get-template-response' && response.properties.templateName == 'view-resultant-variable-list-controller.js') {
            console.debug("  - got template 'view-resultant-variable-list-controller.js'");
            console.debug("  - adding controller");
            var viewResultantVariableListControllerScript = document.createElement("script");
            viewResultantVariableListControllerScript.id = 'bluefin-viewresultantvariablelist-controller';
            viewResultantVariableListControllerScript.type = 'text/javascript';
            viewResultantVariableListControllerScript.text = response.properties.template;
            document.body.appendChild(viewResultantVariableListControllerScript);
        }
    }

    function angularShowModalDialog() {
        console.log("in angularShowModalDialog()")
        var button = document.getElementById('bluefin-viewresultantvariablelist-button');
        button.onClick = button.onclick = function() {
            var analyticsHandler = document.getElementById('bluefin-viewresultantvariablelist-analytics-handler');
            analyticsHandler.click();

            // var module = angular.module("octopusApp.projects");
            // var element = angular.element("#content-wrapper");
            // debugger;
            // var modal = element.injector().get('$modal');
            // var modalInstance = modal.open({
            //     backdrop: "static",
            //     keyboard: !0,
            //     size: 'lg',
            //     template: '#{template}',
            //     controller: 'foo',
            //     dialogClass: "modal"
            // });
            // debugger;
            // var element = angular.element("#content-wrapper");
            // var $compile = element.injector().get("$compile");
            // var target = angular.element("#bluefin-viewresultantvariablelist-button2")
            // $compile(target);
        }
    }

    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    function addViewResultantVariableListButton(sendMessageHandler, receiveMessageHandler) {
        if (document.getElementById('bluefin-viewresultantvariablelist-button'))
            return;

        var links = document.querySelectorAll('a');
        var includeVariableSetsLink = null;
        var chooseVariableSetsLink = null;
        for(var i=0; i < links.length; i++ ) {
            if (links[i].innerText === 'Include variable sets from the Library') {
                includeVariableSetsLink = links[i];
            }
            if (links[i].innerText === 'Choose different library variable sets') {
                chooseVariableSetsLink = links[i];
            }
        }
        if (includeVariableSetsLink == null) {
            console.log("Unable to find the 'Include variable sets from the Library' link - unable to setup the 'view resultant variable list' functionality");
            return;
        }
        if (chooseVariableSetsLink == null) {
            console.log("Unable to find the 'Choose different library variable sets' link - unable to setup the 'view resultant variable list' functionality");
            return;
        }

        var includeVariableSetsLinkContainer = includeVariableSetsLink.parentNode;
        //dont add the link until we've got one of these on the screen
        if (hasClass(includeVariableSetsLinkContainer, "ng-hide") && hasClass(chooseVariableSetsLink, "ng-hide"))
            return;

        console.log("Loading Blue fin feature 'show variable set variables'");

        console.debug("  - adding 'show' link");
        var showLinkContainer = document.createElement('div');
        showLinkContainer.className = 'pull-right'
        var showLink = document.createElement('a');
        showLink.innerText = 'Show resultant variable list';
        showLink.title = "Lists all available variables, combinining the project and variable sets variables";
        showLink.id = 'bluefin-viewresultantvariablelist-button';
        showLink.style.cursor = 'pointer';
        showLinkContainer.appendChild(showLink);

        // showLink = document.createElement('a');
        // showLink.title = "Lists all available variables, combinining the project and variable sets variables";
        // showLink.id = 'bluefin-viewresultantvariablelist-button2';
        // showLink.style.cursor = 'pointer';
        // showLink.innerText = 'Show resultant variable list 2';
        // var attrib = document.createAttribute("ng-controller");
        // attrib.value = 'foo';
        // showLink.setAttributeNode(attrib);
        // attrib = document.createAttribute("ng-click");
        // attrib.value = 'show';
        // showLink.setAttributeNode(attrib);
        // showLinkContainer.appendChild(showLink);

        //if the choose is hidden, then there are no variable sets yet
        if (hasClass(chooseVariableSetsLink, "ng-hide")) {
            showLinkContainer.className = 'ng-hide';
        }

        includeVariableSetsLinkContainer.parentNode.insertBefore(showLinkContainer, includeVariableSetsLinkContainer.nextSibling);

        console.debug("  - adding analytics handler");
        var span = document.createElement('span');
        span.id = 'bluefin-viewresultantvariablelist-analytics-handler';
        span.onclick = span.onClick = function () {
            chrome.runtime.sendMessage({ name: 'view-resultant-variable-list', properties: {} }); // Analytics
        }
        includeVariableSetsLinkContainer.appendChild(span);

        sendMessageHandler = sendMessageHandler || chrome.runtime.sendMessage;
        receiveMessageHandler = receiveMessageHandler || receiveMessage;
        console.debug("  - getting template html 'view-resultant-variable-list.html'");
        sendMessageHandler({ message: 'get-template', properties: { templateName: 'view-resultant-variable-list.html' }}, receiveMessageHandler);
        console.debug("  - getting template html 'view-resultant-variable-list-controller.js'");
        sendMessageHandler({ message: 'get-template', properties: { templateName: 'view-resultant-variable-list-controller.js' }}, receiveMessageHandler);
    }

    //separate function for mocking
    function getPageLocationHash() {
        return location.hash;
    }

    function checkIfWeAreOnVariablesPage(handler, getPageLocationHashfn) {
        getPageLocationHashfn = getPageLocationHashfn || getPageLocationHash;
        hash = getPageLocationHashfn();
        if (hash.match(/#\/projects\/.*\/variables$/i)) {
            handler = handler || addViewResultantVariableListButton
            handler();
        }
    }

    function observe(content) {
        var observer = new MutationObserver(function(targets, observer) { checkIfWeAreOnVariablesPage(); });
        observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});

        chrome.runtime.onMessage.addListener(receiveMessage);
    }

    return {
        observe: observe,
        receiveMessage: receiveMessage,
        checkIfWeAreOnVariablesPage: checkIfWeAreOnVariablesPage,
        addViewResultantVariableListButton: addViewResultantVariableListButton
    };
})();