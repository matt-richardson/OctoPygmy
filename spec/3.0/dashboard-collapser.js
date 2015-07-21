describe("dashboard-collapser-3.0", function() {
	describe("nodeInsertion", function() {
		it("adds the group to chooser when project group is inserted", function() {
			var node = { nodeType: 1, parentNode: { tagName: "FASTBOARD" }, innerHTML: "" };

			pygmy3_0.dashboardCollapser.nodeInsertion([node]);
		});
	});
});