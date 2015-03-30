describe('integrate-step-template-library', function() {
	var libraryNode = {};

	beforeEach(function() {
		integrateStepTemplateLibrary.theDocument = document.createElement('div');
		integrateStepTemplateLibrary.theDocument.innerHTML = '<div id="library-templates"></div>';
		libraryNode = integrateStepTemplateLibrary.theDocument.childNodes[0];
	})

	describe('addTemplatesToListing', function() {
		var items = [
			{'name':'Test1'},
			{'name':'Test2'}
		];

		beforeEach(function() {
			integrateStepTemplateLibrary.addTemplatesToListing(items);
		})

		it('adds each template to the library node', function() {
			expect(libraryNode.childNodes.length).toEqual(2);
		})

		it('puts the template name in the node', function() {
			expect(libraryNode.childNodes[0].innerText).toContain('Test1');
			expect(libraryNode.childNodes[1].innerText).toContain('Test2');
		})
	})
})