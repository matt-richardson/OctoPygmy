# Contributing to Blue fin

Thank you for wanting to contribute. I'm sure we all have full time work and taking time out of your day to assist in the development of Blue fin is greatly appreciated.

### Creating features
Every Blue fin feature is a separate javascript file pulled in via the manifest.js file. This allows the users to enable/disable each feature separately and for contributors to work on different things at the same time easily. The general pattern for each feature is the following (assuming for Octopus 3.x+):

##### Feature logic
* src/3.0/some-feature.js [Feature UI][]
  * This is the content script portion that affects the UI
* src/3.0/background/some-feature.js
  * This is the background script part of the same feature if needed.
* src/3.0/pygmy.js
  * This file is where you hookup your new feature to the extension. You do not create this, just update it accordingly.

##### Feature Options
So far all features have either been enabled/disabled. Having no individual options to set for a single feature. I hope that continues but if a feature does require individual options for the user then we can chat about how to handle it.

For now just be sure to update the `options.html` and `options.js` files to include your feature within them.

[Feature Options][not-done-yet]

##### Feature Analytics
Analytics are processed by the background script messaging handler. If you send a message with a `name` property and a `properties` property then the background script will use the `name` as the event name and the `properties` as additional information for that event. **Do not** send personally identifiable information through analytics. No names of servers, environments, projects, etc. **Do** send the fact your feature was used and if you want in a specific way that helps understand usage.

Since you won't have access to the analytics (since I stated I don't share the information on the options screen) you can skip this part if you want. I can fill it in. I may mention usage online from time to time but it's extremely vague using terms such as 'a lot', 'country x', etc. Not enough to identify anyone.


### Inconsistencies
This project (like many) was started because I needed to solve a problem (many projects/machines). I was not as consistent as I have been in the naming and code style. If you find an inconsistency try to find the other examples and go with the style that is used most, try to focus on the style used in the 3.0 folder. Or just ask a question on the github issue.

[Feature UI]: contributing-feature-ui.md
