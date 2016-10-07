param(
    [Parameter(Mandatory=$true)]
    $licenseFilePath,
    [Parameter(Mandatory=$true)]
    $version
)

$ErrorActionPreference = "STOP"

if (!(Get-Command cinst -ErrorAction SilentlyContinue))
{
    iwr https://chocolatey.org/install.ps1 -UseBasicParsing | iex
}

Import-Module C:\ProgramData\chocolatey\helpers\chocolateyProfile.psm1
Import-Module C:\ProgramData\chocolatey\helpers\chocolateyInstaller.psm1

Install-ChocolateyPackage `
    -PackageName 'SQLServerExpress2014' `
    -FileType 'exe' `
    -SilentArgs "/IACCEPTSQLSERVERLICENSETERMS /Q /ACTION=install /INSTANCEID=SQLEXPRESS /INSTANCENAME=SQLEXPRESS /UPDATEENABLED=FALSE" `
    -Url 'https://download.microsoft.com/download/E/A/E/EAE6F7FC-767A-4038-A954-49B8B05D04EB/Express%2032BIT/SQLEXPR_x86_ENU.exe' `
    -Url64bit 'https://download.microsoft.com/download/E/A/E/EAE6F7FC-767A-4038-A954-49B8B05D04EB/Express%2064BIT/SQLEXPR_x64_ENU.exe' `
    -Checksum64 '8F712FAEFEE9CEF1D15494C9D6CF5AD3B45EC06D0B2C247F8384A221BAAADDA7' `
    -Checksumtype64 'SHA256' `
    -ValidExitCodes @(0,3010) `
    --allow-empty-checksums-secure

cinst OctopusDeploy -version $version --yes --force
cinst OctopusDeploy.Tentacle -version $version --yes --force

Write-Host "Configure Octopus Deploy Server instance"

# Get license file bytes
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$bytes  = $utf8NoBOM.GetBytes((GC $licenseFilePath))
$licenseBase64 = [System.Convert]::ToBase64String($bytes)

$instance = @{
    name = "OctopusServer";
    server = "C:\Program Files\Octopus Deploy\Octopus\Octopus.Server.exe";
    connectionString = "Server=.\SQLExpress;Database=Octopus;Trusted_Connection=True;";
    serverPort = 80;
    commsListenPort = 1800;
    username = "JoeAdministrator";
    password = "Password 123.";
    thumbprint = "";
}

Write-Host "== Configuring Octopus Deploy Server " -BackgroundColor DarkCyan
& $instance.server create-instance --console --instance $instance.name --config "C:\$($instance.name)\OctopusServer.config"
& $instance.server configure --console --instance $instance.name `
    --home "C:\$($instance.name)" `
    --storageConnectionString $instance.connectionString `
    --upgradeCheck False `
    --upgradeCheckWithStatistics False `
    --webAuthenticationMode UsernamePassword `
    --webForceSSL False `
    --webListenPrefixes http://localhost:$($instance.serverPort) `
    --commsListenPort $instance.commsListenPort
& $instance.server database --console --instance $instance.name --create --grant="NT AUTHORITY\SYSTEM"
& $instance.server service --console --instance $instance.name --stop
& $instance.server admin --console --instance $instance.name --username $instance.username --password $instance.password
& $instance.server license --console --instance $instance.name --licenseBase64 $licenseBase64
& $instance.server service --console --instance $instance.name --install --reconfigure --start

Write-Host "  Get thumbprint for tentacle configuration later on"
$result = & $instance.server show-thumbprint --instance $instance.name
$instance.thumbprint = $result[-1] # Last line of command line output is the server thumbprint.

Write-Host "== Configuring the Tentacle"
$tentacle = "C:\Program Files\Octopus Deploy\Tentacle\Tentacle.exe" 
& $tentacle create-instance --instance "Tentacle" --config "C:\OctopusTentacle\Tentacle.config"
& $tentacle new-certificate --instance "Tentacle" --if-blank
& $tentacle configure --instance "Tentacle" --reset-trust
& $tentacle configure --instance "Tentacle" --home "C:\OctopusTentacle" --app "C:\OctopusTentacle\Applications" --port "10933" --noListen "False"
& $tentacle configure --instance "Tentacle" --trust $instance.thumbprint
& $tentacle service --instance "Tentacle" --install --start

Write-Host "Done"