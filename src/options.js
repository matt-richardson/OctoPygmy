//
// Lot of DRY clean up to do here. Options, element IDs with checkboxes. ETC.
//

function save_options() {
	var options = {};
	options.analytics = document.getElementById('analytics').checked;
	options.dashboard = document.getElementById('dashboard-collapser').checked;
	options.environments = document.getElementById('environment-collapser').checked;
	options.machines = document.getElementById('environment-machine-filter').checked;
	options.libraryTemplate = document.getElementById('library-template-import').checked;
	options.hasSetOptions = chrome.runtime.getManifest().version.substring(0, chrome.runtime.getManifest().version.lastIndexOf('.')); // Just use major.minor.

	console.debug("Options to save:");
	console.debug(options);

	chrome.storage.sync.set(options, function() {
		var status = document.getElementById('status');

		if (chrome.runtime.lastError) status.textContent = 'Error saving options';
		else status.textContent = 'Options saved, reload your Octopus Deploy tabs.';

		chrome.runtime.sendMessage("reload-options");

		setTimeout(function() {
			status.textContent = '';
		}, 3000);
	});
}

function restore_options() {
	var defaults = {
		analytics: true,
		dashboard: true,
		environments: true,
		machines: true,
		libraryTemplate: true,
	};

	chrome.storage.sync.get(defaults, function(options) {
		console.debug("Got options:");
		console.debug(options);

		document.getElementById('analytics').checked = options.analytics;
		document.getElementById('dashboard-collapser').checked = options.dashboard;
		document.getElementById('environment-collapser').checked = options.environments;
		document.getElementById('environment-machine-filter').checked = options.machines;
		document.getElementById('library-template-import').checked = options.machines;

		pleaForAnalytics({ srcElement: document.getElementById('analytics') });
	});
}

function pleaForAnalytics(event) {
	if (event.srcElement.checked == false) {
		document.getElementById('plea-for-analytics').style.display = "block";
		document.getElementById('thanks-for-analytics').style.display = "none";
	} else {
		document.getElementById('plea-for-analytics').style.display = "none";
		document.getElementById('thanks-for-analytics').style.display = "block";
	}
}

document.getElementById('analytics').addEventListener('change', pleaForAnalytics);
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);