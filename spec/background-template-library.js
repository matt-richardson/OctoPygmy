describe('background-template-library', function(){
	describe('getLibraryTemplatesList', function(){
		var templatesResult = [];
		var githubResponse = '[\
  {\
    "name": "F5-Disable-Member-Wait-for connections-to-drop.json",\
    "path": "step-templates/F5-Disable-Member-Wait-for connections-to-drop.json",\
    "sha": "bea136c026c3fc3ff44f9a72d303b14590cf5140",\
    "size": 8902,\
    "url": "https://api.github.com/repos/OctopusDeploy/Library/contents/step-templates/F5-Disable-Member-Wait-for%20connections-to-drop.json?ref=master",\
    "html_url": "https://github.com/OctopusDeploy/Library/blob/master/step-templates/F5-Disable-Member-Wait-for%20connections-to-drop.json",\
    "git_url": "https://api.github.com/repos/OctopusDeploy/Library/git/blobs/bea136c026c3fc3ff44f9a72d303b14590cf5140",\
    "download_url": "https://raw.githubusercontent.com/OctopusDeploy/Library/master/step-templates/F5-Disable-Member-Wait-for%20connections-to-drop.json",\
    "type": "file",\
    "_links": {\
      "self": "https://api.github.com/repos/OctopusDeploy/Library/contents/step-templates/F5-Disable-Member-Wait-for%20connections-to-drop.json?ref=master",\
      "git": "https://api.github.com/repos/OctopusDeploy/Library/git/blobs/bea136c026c3fc3ff44f9a72d303b14590cf5140",\
      "html": "https://github.com/OctopusDeploy/Library/blob/master/step-templates/F5-Disable-Member-Wait-for%20connections-to-drop.json"\
    }\
  },\
  {\
    "name": "TeamCity-Pin-Build.json",\
    "path": "step-templates/TeamCity-Pin-Build.json",\
    "sha": "d89cfbe54bbab4b388bc4f6d057a9226e3bdc76c",\
    "size": 2764,\
    "url": "https://api.github.com/repos/OctopusDeploy/Library/contents/step-templates/TeamCity-Pin-Build.json?ref=master",\
    "html_url": "https://github.com/OctopusDeploy/Library/blob/master/step-templates/TeamCity-Pin-Build.json",\
    "git_url": "https://api.github.com/repos/OctopusDeploy/Library/git/blobs/d89cfbe54bbab4b388bc4f6d057a9226e3bdc76c",\
    "download_url": "https://raw.githubusercontent.com/OctopusDeploy/Library/master/step-templates/TeamCity-Pin-Build.json",\
    "type": "file",\
    "_links": {\
      "self": "https://api.github.com/repos/OctopusDeploy/Library/contents/step-templates/TeamCity-Pin-Build.json?ref=master",\
      "git": "https://api.github.com/repos/OctopusDeploy/Library/git/blobs/d89cfbe54bbab4b388bc4f6d057a9226e3bdc76c",\
      "html": "https://github.com/OctopusDeploy/Library/blob/master/step-templates/TeamCity-Pin-Build.json"\
    }\
  }\
]';
		beforeEach(function(done){
			nanoajax.ajax = function(url, callback) {
				callback(200, githubResponse)
			};

			getLibraryTemplatesList(function(result){
				templatesResult = result;
				done();
			})
		})

		it('returns each library template available', function(){
			expect(templatesResult.length).toEqual(2);
		})

		it('returns the name of the templates', function(){
			expect(templatesResult[0].name).toEqual('F5-Disable-Member-Wait-for connections-to-drop');
		})

		it('returns the content url of the templates', function(){
			expect(templatesResult[0].contentUrl).toEqual('https://raw.githubusercontent.com/OctopusDeploy/Library/master/step-templates/F5-Disable-Member-Wait-for%20connections-to-drop.json');
		})
	})
});