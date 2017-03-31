describe("dashboard-filter-3.0", function() {
	describe("nodeInsertion", function() {
		it("adds the search filter", function() {
			var node = { nodeType: 1, parentNode: { tagName: "FASTBOARD" }, innerHTML: "" };

			pygmy3_0.dashboardFilter.nodeInsertion([node]);
		});
	});
});