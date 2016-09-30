param(
    $octopusUrl
)

$ENV:OctopusPassword = "Password 123." # This is only used for testing. And on a install that has no real data. So there.

Write-Host "Running browser tests..."
$resultsPath = "results\browser-tests-local"
mkdir .\$resultsPath -force | Out-Null
& .\node_modules\.bin\jasmine-node --captureExceptions --verbose spec/browser-tests --junitreport --output $resultsPath --config TestIdFilename ".\$resultsPath\test-ids.txt" --config OctopusUrl "$octopusUrl" --config OctopusVersion "local" --config BluefinVersion "current"
