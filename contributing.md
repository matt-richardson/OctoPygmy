# Contributing to Blue fin

Thank you for wanting to contribute. I'm sure we all have full time work and taking time out of your day to assist in the development of Blue fin is greatly appreciated.

### Creating features
Every Blue fin feature is a separate javascript file pulled in via the manifest.js file. This allows the users to enable/disable each feature separately and for contributors to work on different things at the same time easily. The general pattern for each feature is the following:

###### Feature file (some-feature.js)
```
pygmy3_0.someFeature = (function() {
	/*
		You're feature's variables and functions.
	*/

	function nodeInsertion(nodes) {
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.

			if (isAppropriateElementForFeature(node))
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

		chrome.runtime.onMessage.addListener(receiveMessage);
	}

	return {
		observe: observe
	};
})();
```
The `observe` function is called by Blue fin at startup for any page that is determined to be Octopus Deploy. The `content` parameter is the `#main-wrapper` element in Octopus Deploy 3.0. When you setup the `MutationObserver` on that element be aware that you are going to get events for everything that happens within Octopus Deploy. So your `nodeInsertion` needs to operate quickly. That is why the first thing done is to skip any non element nodes `node.nodeType != 1`. You are welcome to observe some other element if you want. However Octopus Deploy is an Angular app and so most of what you see on the web UI is not available at startup time.

The most difficult thing of any new feature will be figuring out the correct element to look for during the `nodeInsertion` process. It depends on how the Angular views are setup. So you will experience a **lot** of experimentation to find the correct node to test for. You will most likely then have to traverse the node tree a bit to get to the node you want to manipulate for your feature. I highly recommend checking the existing features to see what they look for. Don't be afraid to use console.debug a lot. There is an option in Blue fin that will turn that off for the users so debug logging won't affect performance during real usage.

###### Main feature hookup
Each feature file is independent of all the others, the `pygmy.js` file is how they all get hooked up into Octopus Deploy.

While initially developing your feature just add the following to the end of the `setup` function in `pygmy.js`

```
	this.someFeature.observe(content);
```

You won't need to mess with anything else in the `pymgy.js` file as it's only checking for the existence of Octopus Deploy.

Onc you have the feature fully developed then you will add the feature to the options page (see next section) but in `pygmy.js` you will need to put that above statement inside an if.

```
	if(options.someFeature) this.someFeature.observe(content);
```

Every feature must operate in this manner. This give's the user control over how much of Blue fin they will want to use.

###### Feature Options
###### Feature Analytics

### Inconsistencies
This project (like many) was started because I needed to solve a problem (many projects/machines). I was not as consistent as I have been in the naming and code style. If you find an inconsistency try to find the other examples and go with the style that is used most, try to focus on the style used in the 3.0 folder. Or just ask a question on the github issue.
