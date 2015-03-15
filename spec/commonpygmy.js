describe("commonpygmy", function() {
	describe("addFilterInput", function() {
		it("adds the input to the node", function() {
			var input = { id: 'the-id' };
			var parent = { appendChild: function() {} };
			spyOn(parent,'appendChild');

			commonpygmy.addFilterInput(input, parent);
			expect(parent.appendChild).toHaveBeenCalled();
		});

		it("does not add the input to the node when it already exists", function() {
			var input = { id: 'the-id' };
			var parent = { appendChild: function() {} };
			spyOn(parent,'appendChild');
			spyOn(document,'getElementById').and.returnValue(input);

			commonpygmy.addFilterInput(input, parent);
			expect(parent.appendChild).not.toHaveBeenCalled();
		});

	});

	describe("showItems", function() {
		var allIds = '';
		var idsToShow = '';
		// When setting the style.display. Be sure to use valid values.
		// It runs against the XHTML parser.
		var nodeHtml = '<div id="a">&nbsp;</div>' +
						'<div id="b">&nbsp;</div>' +
						'<div id="c">&nbsp;</div>' +
						'<div id="d">&nbsp;</div>'
		var nodeSegment = '';

		beforeEach(function() {
			commonpygmy.theDocument = document.createElement('div');
			commonpygmy.theDocument.innerHTML = nodeHtml;
			nodeSegment = commonpygmy.theDocument;

			allIds = ['a','b','c','d'];
			idsToShow = ['b','d'];
		});

		it("shows the specified items", function() {
			commonpygmy.showItems(allIds, idsToShow, 'block', 'none');
			
			expect(nodeSegment.childNodes[1].style.display).toEqual('block');
			expect(nodeSegment.childNodes[3].style.display).toEqual('block');
		});

		it("hides the items not specified", function() {
			commonpygmy.showItems(allIds, idsToShow, 'block', 'none');

			expect(nodeSegment.childNodes[0].style.display).toEqual('none');
			expect(nodeSegment.childNodes[2].style.display).toEqual('none');
		});

		it("shows all items when given the allspark", function() {
			commonpygmy.showItems(allIds, '~all~', 'block', 'none');

			for (var index = 0; index < nodeSegment.childNodes.length; index++) {
				expect(nodeSegment.childNodes[index].style.display).toEqual('block');
			}
		});

		it("shows all items when given blank idsToShow", function() {
			// This is for the text filtering inputs.
			commonpygmy.showItems(allIds, '', 'block', 'none');

			for (var index = 0; index < nodeSegment.childNodes.length; index++) {
				expect(nodeSegment.childNodes[index].style.display).toEqual('block');
			}
		});
	});
});