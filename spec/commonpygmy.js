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
		var allItems = '';

		beforeEach(function() {
			allIds = ['1','2','3','4'];
			idsToShow = ['2','4'];
			allItems = {
				'1': { style: { display: ''} },
				'2': { style: { display: ''} },
				'3': { style: { display: ''} },
				'4': { style: { display: ''} }
			}
			spyOn(document,'getElementById').and.callFake(function(id) {
				return allItems[id];
			});
		});

		it("shows the specified items", function() {

			commonpygmy.showItems(allIds, idsToShow, 'show', 'hide');

			expect(allItems['2'].style.display).toEqual('show');
			expect(allItems['4'].style.display).toEqual('show');
		});

		it ("hides the items not specified", function() {
			commonpygmy.showItems(allIds, idsToShow, 'show', 'hide');

			expect(allItems['1'].style.display).toEqual('hide');
			expect(allItems['3'].style.display).toEqual('hide');
		});
	});
});