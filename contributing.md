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

##### Dependencies

Keep them small and few. Don't pull in Angular for instance, it's not useful here since we are modifying the output of an Angular app. In `src/lib` you will see the current libraries in use:

* [list.min.js][] (Used in the template library feature)
* [nanoajax.min.js][] (For making AJAX calls)
* [underscore-min.js][] (General javascript utilities)
* mixpanel.js (For the analytics)

I thought a lot about using jQuery but mainly it came down to taking this opportunity to see what other options existed and give them a try. So far they have worked out quite well.

If found those at [micro.js][]. That is a great spot to find a wide range of small focused javascript libraries.

#### Testing

Sigh, I'm kicking myself everyday for not getting the tests going in a better fashion than I have. Mainly becuase I'm just not used to testing Javascript Chrome Extensions but that's an excuse, not a valid reason to put the testing aside. Currently using [Jasmine][]. That's what will continue to be used. Tests are in the `spec` folder. You can open the `SpecRunner.html` file in root to run the tests or run the `test.bat` file to run it headless in [phantomjs][]. If you do that be sure to have phantomjs installed. I do have a build setup in TravisCI but it's been failing on the tests recently. Just try to add some and make sure it works locally. I'll run them myself and get the automatic build taken care of.

### Inconsistencies
This project (like many) was started because I needed to solve a problem (many projects/machines). I was not as consistent as I have been in the naming and code style. If you find an inconsistency try to find the other examples and go with the style that is used most, try to focus on the style used in the 3.0 folder. Or just ask a question on the github issue.

One other inconsistency you will see is due to the name change. This was originally called Octopygmy. Thus pygmy.js and octopygmy.js. But I renamed it to Blue fin but have not renamed those files. Not worried about it now.

[Feature UI]: contributing-feature-ui.md
[micro.js]: http://micro.js.com
[list.min.js]: http://www.listjs.com/
[nanoajax.min.js]: https://github.com/yanatan16/nanoajax
[underscore-min.js]: http://underscorejs.org/
[phantomjs]: http://phantomjs.org
[Jasmine]: http://jasmine.github.io/2.3/introduction.html
