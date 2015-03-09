function save_options() {
  var options = {};
  options.analytics = document.getElementById('analytics').checked;
  options.dashboard = document.getElementById('dashboard-collapser').checked;
  options.environments = document.getElementById('environment-collapser').checked;
  options.machines = document.getElementById('environment-machine-filter').checked;

  console.debug("Options to save:");
  console.debug(options);

  chrome.storage.sync.set(options, function() {
    var status = document.getElementById('status');
    
    if (chrome.runtime.lastError) status.innerHTML = 'Error saving options';
    else status.innerHTML = 'Options saved.';

    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    analytics: null,
    dashboard: true,
    environments: true,
    machines: true
  }, function(options) {
    
    console.debug("Got options:");
    console.debug(options);

    document.getElementById('analytics').checked = options.analytics;
    document.getElementById('dashboard-collapser').checked = options.dashboard;
    document.getElementById('environment-collapser').checked = options.environments;
    document.getElementById('environment-machine-filter').checked = options.machines;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);