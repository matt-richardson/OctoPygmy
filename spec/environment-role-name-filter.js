describe('environment-rolename-filter', function() {
	var environmentHtml = '<div ng-show="machines[environment.Id][\'Offline\']" class="">' +
'                  <h5 class="separator">Offline</h5>'+
'                  <machine-list machines="machines[environment.Id][\'Offline\']" show="show" class="ng-isolate-scope"><ul class="octo-tiles">'+
'  <!-- ngRepeat: machine in machines --><li ng-repeat="machine in machines" class="ng-scope" id="kpteched3-machine">'+
'    <div class="container machine clickable" ng-click="show(machine)">'+
'      <div class="row no-margin-left">'+
'        <div class="span3 machine-status">'+
'          <img alt="There was a problem communicating with this machine (last checked: Friday, March 13, 2015 4:23 AM)" title="There was a problem communicating with this machine (last checked: Friday, March 13, 2015 4:23 AM)" ng-src="img/machines/Server-Offline.png" for="machine" class="ng-isolate-scope" src="img/machines/Server-Offline.png"></div>'+
'        <div class="span9 machine-summary tight">'+
'          <h5 class="ng-binding">KPTECHED3</h5>'+
'          <div class="subtle" ng-show="machine.CommunicationStyle == \'TentaclePassive\'"><span class="fixed smaller-fonts ng-binding">23.102.176.120</span></div>'+
'          <div class="subtle ng-hide" ng-show="machine.CommunicationStyle == \'TentacleActive\'">Polling</div>'+
'          <p>!-- ngRepeat: role in machine.Roles --><span class="label truncate ng-scope ng-binding" ng-repeat="role in machine.Roles" title="app-server">app-server </span><!-- end ngRepeat: role in machine.Roles --><span class="label truncate ng-scope ng-binding" ng-repeat="role in machine.Roles" title="web-server">web-server </span><!-- end ngRepeat: role in machine.Roles --></p>'+
'        </div>'+
'      </div>'+
'    </div>'+
'  </li><!-- end ngRepeat: machine in machines --><li ng-repeat="machine in machines" class="ng-scope" id="narrieta1-machine">'+
'    <div class="container machine clickable" ng-click="show(machine)">'+
'      <div class="row no-margin-left">'+
'        <div class="span3 machine-status">'+
'          <img alt="There was a problem communicating with this machine (last checked: Friday, March 13, 2015 4:23 AM)" title="There was a problem communicating with this machine (last checked: Friday, March 13, 2015 4:23 AM)" ng-src="img/machines/Server-Offline.png" for="machine" class="ng-isolate-scope" src="img/machines/Server-Offline.png"></div>'+
'        <div class="span9 machine-summary tight">'+
'          <h5 class="ng-binding">NARRIETA-1</h5>'+
'          <div class="subtle" ng-show="machine.CommunicationStyle == \'TentaclePassive\'"><span class="fixed smaller-fonts ng-binding">104.42.96.162</span></div>'+
'          <div class="subtle ng-hide" ng-show="machine.CommunicationStyle == \'TentacleActive\'">Polling</div>'+
'          <p><!-- ngRepeat: role in machine.Roles --><span class="label truncate ng-scope ng-binding" ng-repeat="role in machine.Roles" title="web-server">web-server </span><!-- end ngRepeat: role in machine.Roles --></p>'+
'        </div>'+
'      </div>'+
'    </div>'+
'  </li><!-- end ngRepeat: machine in machines -->'+
'</ul></machine-list>'+
''+
'                  <div class="margin-bottom-20" ng-show="machines[environment.Id][\'Offline\'].length > 1">'+
'                    <button class="btn" ng-disabled="isResetting.busy" ng-click="massReset(machines[environment.Id][\'Offline\'])">Reset <span class="ng-binding">connections to these 2 machines</span> </button>'+
'                    <div class="spin-container ng-isolate-scope" active="isResetting.busy">'+
'</div>'+
'                    <div class="validation-errors errors alert alert-error ng-isolate-scope ng-hide" ng-show="hasError &amp;&amp; isOpen" error="isResetting.error" style="opacity: 0; display: block;">'+
'  <button type="button" class="close" ng-click="dismiss()">×</button>'+
''+
'  <p ng-bind="error.ErrorMessage" class="ng-binding"></p>'+
''+
'  <ul ng-show="error.Errors" class="ng-hide">'+
'    <!-- ngRepeat: err in error.Errors -->'+
'  </ul>'+
''+
'  <p ng-show="error.HelpText" class="subtle ng-binding ng-hide"></p>'+
''+
'  <p ng-show="error.HelpLink" class="ng-hide"><a class="external" target="_blank" href="">More information...</a></p>'+
'' +
'  <!-- <pre ng-show=\'error.FullException\' ng-bind=\'error.FullException\'></pre> -->'+
'</div>'+
'                  </div>'+
'                </div>';

	describe('addMachineToCache', function() {
		var environmentNode = '';

		beforeEach(function() {
			var element = document.createElement('div');
			element.innerHTML = environmentHtml;
			environmentNode = element.childNodes[0];
			rolesTextNode = environmentNode.querySelector("P SPAN");

			environmentRoleNameFilter.machineIds = [];
			environmentRoleNameFilter.machines = {};

			// ACTION!
			environmentRoleNameFilter.addMachineToCache(rolesTextNode);
		});

		it('adds machine id to all machine id cache with id', function() {
			expect(environmentRoleNameFilter.machineIds.length).toEqual(1);
			expect(environmentRoleNameFilter.machineIds).toContain('kpteched3-machine');
		});

		it('adds machine to machine cache using the name of the machine', function() {
			expect(environmentRoleNameFilter.machines['kpteched3']).not.toBeUndefined();
			var machineNodeId = environmentRoleNameFilter.machines['kpteched3'][0];
			expect(machineNodeId).toEqual('kpteched3-machine');
		});

		it('adds machine to machine cache using the role names of the machine', function() {
			expect(environmentRoleNameFilter.machines['web-server']).not.toBeUndefined();
			expect(environmentRoleNameFilter.machines['app-server']).not.toBeUndefined();

			expect(environmentRoleNameFilter.machines['app-server']).toContain('kpteched3-machine');
			expect(environmentRoleNameFilter.machines['web-server']).toContain('kpteched3-machine');
		});

		it('adds machine to machine cache using the status of the machine', function() {
			expect(environmentRoleNameFilter.machines['offline']).not.toBeUndefined();
			expect(environmentRoleNameFilter.machines['offline']).toContain('kpteched3-machine');
		});

		it('sets the machine node id to what is used in the cache', function() {
			var machineNode = environmentNode.getElementsByTagName('LI')[0];
			expect(machineNode.id).toEqual('kpteched3-machine');
		});
	});
});