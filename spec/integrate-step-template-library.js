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
			{'Name':'Test2', 'Description': 'Some other description'}
		];

		beforeEach(function() {
			integrateStepTemplateLibrary.addTemplateToListing(items[0]);
			integrateStepTemplateLibrary.addTemplateToListing(items[1]);
		})

		it('adds each template to the library node', function() {
			expect(libraryNode.childNodes.length).toEqual(2);
		})

		it('puts the template name in the node', function() {
			expect(libraryNode.childNodes[0].innerText).toContain('Test1');
			expect(libraryNode.childNodes[1].innerText).toContain('Test2');
		})

		it('puts the description in the node', function() {
			expect(libraryNode.childNodes[0].innerText).toContain('Some description')
		})
	})
})