# Feature UI

All features should do something with the UI. I can't think of anything at the moment that would not modify the UI in some way. Refer to the existing feature files in `src/3.0/*.js` as examples and to see what goes on in a feature. I'll outline some of the major repeated points here.

##### Feature file (some-feature.js)
```
pygmy3_0.someFeature = (function() {
	/*
		You're feature's variables and functions.
	*/

	function receiveMessage(message) {
			// Handle the message from the background script here
	}

	function nodeInsertion(nodes) {
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.

			if (yourFunctionToDetermineIfThisIsTheNodeForYourFeature(node))
			{
				console.debug("Some message indicating you're loading the feature");
				// Things here to start adding your feature.
			}
		}
	}

	function observe(content) {
		var observer = new MutationObserver(function(records) {
			for (var i = 0; i < records.length; i++) {
				nodeInsertion(records[i].addedNodes);
			}
		});
		observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});

		// Only use this if you have a background script that will process messages and respond to this content script.
		chrome.runtime.onMessage.addListener(receiveMessage);
	}

	return {
		// This is the only function that is required of all features. It's what is used in pygmy.js upon startup.
		observe: observe
	};
})();
```
The `observe` function is called by Blue fin at startup for any page that is determined to be Octopus Deploy. The `content` parameter is the `#main-wrapper` element in Octopus Deploy 3.0. When you setup the `MutationObserver` on that element be aware that you are going to get events for everything that happens within Octopus Deploy. So your `nodeInsertion` needs to operate quickly. That is why the first thing done is to skip any non element nodes `node.nodeType != 1`. You are welcome to observe some other element if you want. However Octopus Deploy is an Angular app and so most of what you see on the web UI is not available at startup time.

The most difficult thing of any new feature will be figuring out the correct element to look for during the `nodeInsertion` process. It depends on how the Angular views are setup. So you will experience a **lot** of experimentation to find the correct node to test for. You will most likely then have to traverse the node tree a bit to get to the node you want to manipulate for your feature. I highly recommend checking the existing features to see what they look for. Don't be afraid to use console.debug a lot. There is an option in Blue fin that will turn that off for the users so debug logging won't affect performance during real usage.

##### Main feature hookup
Each feature file is independent of all the others, the `pygmy.js` file is how they all get hooked up into Octopus Deploy.

While initially developing your feature just add the following to the end of the `setup` function in `pygmy.js`

```
	this.someFeature.observe(content);
```

You won't need to mess with anything else in the `pymgy.js` file as it's only checking for the existence of Octopus Deploy.

Once you have the feature fully developed then you will add the feature to the [options page][not-done-yet] but in `pygmy.js` you will need to put that above statement inside an if.

```
	if(options.someFeature) this.someFeature.observe(content);
```

Every feature must operate in this manner. This give's the user control over how much of Blue fin they will want to use. Also, currently there are three `pygmy.js` files.

* src/3.0/pygmy.js for features in Octopus Deploy 3.0
* src/3.0/background/pygmy.js for background functionality in 3.0
* src/octopygmy.js for features in Octopus Deploy 2.x

I'd focus on 3.0 for now since that is the latest release. I don't have analytics on 2.x/3.0 usage of Blue fin yet.
