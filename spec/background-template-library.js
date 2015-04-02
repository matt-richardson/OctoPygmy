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
			expect(templatesResult[0].downloadUrl).toEqual('https://raw.githubusercontent.com/OctopusDeploy/Library/master/step-templates/F5-Disable-Member-Wait-for%20connections-to-drop.json');
		})
	})

  describe('sendLibraryTemplate', function(){
    var downloadResponse = '{\
  "Id": "ActionTemplates-66",\
  "Name": "Wait",\
  "Description": "Pauses the process for a set duration",\
  "ActionType": "Octopus.Script",\
  "Version": 0,\
  "Properties": {\
    "Octopus.Action.Script.ScriptBody": "Start-Sleep $Seconds"\
  },\
  "SensitiveProperties": {},\
  "Parameters": [\
    {\
      "Name": "Seconds",\
      "Label": "Seconds",\
      "HelpText": "Number of seconds to wait",\
      "DefaultValue": "120",\
      "DisplaySettings": {\
        "Octopus.ControlType": "SingleLineText"\
      }\
    }\
  ],\
  "LastModifiedOn": "2014-08-15T06:44:24.762+00:00",\
  "LastModifiedBy": "leeenglestone",\
  "$Meta": {\
    "ExportedAt": "2014-08-15T08:06:12.316Z",\
    "OctopusVersion": "2.5.4.280",\
    "Type": "ActionTemplate"\
  }\
}'

    beforeEach(function(done){
      spyOn(nanoajax, 'ajax').and.callFake(function(url, callback){
        callback(200, downloadResponse);
      })
      spyOn(chrome.tabs, 'sendMessage')

      sendLibraryTemplate('https://some-valid-url', 0, done)
    })

    it('sends a message with the template name', function(){
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(0, jasmine.objectContaining({ Name: 'Wait'}));
    })
 
    it('sends a message with the template description', function(){
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(0, jasmine.objectContaining({ Description: 'Pauses the process for a set duration'}));
    })

    it('sends a message with the template download url', function(){
     expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(0, jasmine.objectContaining({ DownloadUrl: 'https://some-valid-url'}));
    })
  })

  describe('importLibraryTemplate',function(){
    beforeEach(function(){
      this.content = '{ name: "Some name" }'
      this.root = 'http://example.com'
      
      spyOn(chrome.tabs, 'sendMessage')
    })

    describe('when the POST is unauthorized', function(){
      beforeEach(function(done){
        spyOn(nanoajax,'ajax').and.callFake(function(settings, callback){
          callback(401, 'NOT USED')
        })

        importLibraryTemplate(0, this.content, this.root, done)
      })

      it('sends a message indicating failure', function(){
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(0, { templateImportUnauthorized: true})
      })
    })


    describe('when the POST is authorized', function(){
      beforeEach(function(done){
        spyOn(nanoajax,'ajax').and.callFake(function(settings, callback){
          callback(200, '{}')
        })

        importLibraryTemplate(0, this.content, this.root, done)
      })

      it('sends a message indicating success', function(){
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(0, { templateImportSuccessful: true})
      })
    })
  })
})

var chrome = {
  tabs: {
    sendMessage: function(tabId, message) {}
  }
}