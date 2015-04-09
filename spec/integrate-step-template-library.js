describe('integrate-step-template-library', function() {
	var libraryNode = {};

	beforeEach(function() {
		integrateStepTemplateLibrary.theDocument = document.createElement('div');
		integrateStepTemplateLibrary.theDocument.innerHTML = '<div id="library-templates"></div>';
		libraryNode = integrateStepTemplateLibrary.theDocument.childNodes[0];
	})

	describe('addTemplatesToListing', function() {
		var items = [
			{'Name':'Test1', 'Description': 'Some description'},
			{'Name':'Test2', 'Description': 'Some other description'},
			{'Name':'Common', 'Description': 'This one is pre-existing'}
		];
		var result = []

		beforeEach(function() {
			var fakeListAdder = function(item) {
				result.push(item)
			}
			integrateStepTemplateLibrary.libraryList.add = fakeListAdder.bind(this)
			integrateStepTemplateLibrary.libraryList.sort = function() {}
			integrateStepTemplateLibrary.existingTemplateNames = ['Common']

			integrateStepTemplateLibrary.addTemplateToListing(items[0]);
			integrateStepTemplateLibrary.addTemplateToListing(items[1]);
			integrateStepTemplateLibrary.addTemplateToListing(items[2]);
		})

		it('adds each template to the library node', function() {
			expect(result.length).toEqual(2)
		})

		it('puts the template name in the node', function() {
			expect(result[0]['template-name']).toEqual('Test1')
			expect(result[1]['template-name']).toEqual('Test2')
		})

		it('puts the description in the node', function() {
			expect(result[0]['description']).toEqual('Some description')
			expect(result[1]['description']).toEqual('Some other description')
		})
	})
})