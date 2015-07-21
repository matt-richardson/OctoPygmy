describe("pygmy3_0", function() {
	describe("worksWithPage", function() {

		it("returns false for non angular app path", function() {
			spyOn(commonpygmy, 'location').and.returnValue({ pathname: '/index.html' });
			spyOn(commonpygmy, 'document').and.returnValue({ title: 'Octopus Deploy' });

			expect(pygmy3_0.worksWithPage()).toBe(false);
		});

		it("returns false for an angular app but not Octopus by title", function() {
			spyOn(commonpygmy, 'location').and.returnValue({ pathname: '/app' });
			spyOn(commonpygmy, 'document').and.returnValue({ title: 'Other app' });

			expect(pygmy3_0.worksWithPage()).toBe(false);
		});

		it("returns false for an angular Octopus app with 2.0 structure", function() {
			spyOn(commonpygmy, 'location').and.returnValue({ pathname: '/app' });
			spyOn(commonpygmy, 'document').and.returnValue({ 
				title: 'Octopus Deploy',
				getElementById: function(id) { 
					if (id == "body") // #body is in 2.0
						{ return {}; }
						else { return; }
					}
			});

			expect(pygmy3_0.worksWithPage()).toBe(false);
		});

		/*
		it("does not add the input to the node when it already exists", function() {
			var input = { id: 'the-id' };
			var parent = { appendChild: function() {} };
			spyOn(parent,'appendChild');
			spyOn(document,'getElementById').and.returnValue(input);

			commonpygmy.addFilterInput(input, parent);
			expect(parent.appendChild).not.toHaveBeenCalled();
		});
		*/
	});

});