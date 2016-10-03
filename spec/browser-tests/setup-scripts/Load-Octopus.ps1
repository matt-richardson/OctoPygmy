param(
    [string] $OctopusRootUrl = "http://localhost:8033/",
    [string] $SqlServerInstance = "SQLExpress",
    [string] $DatabaseName = "Octopus33",
    [string] $ServiceName = "OctopusDeploy: OctopusServer33",
    [string] $OctopusAdminUsername = "JoeAdministrator",
    [string] $OctopusAdminPassword = "Password 123.",
    [string] $GeneratedDataFilePath = ".\gendata.json",
    [string] $DatabaseBackupFilePath = "C:\Backups\Octopus33Loaded.bak",
    [string] $TentaclePath = "C:\Program Files\Octopus Deploy\Tentacle\Tentacle.exe",
    [string] $ExportPath = "C:\Backups\OctopusExport",
    [string] $MigratorPath = "C:\Program Files\Octopus Deploy\Octopus-3.3.0\Octopus.Migrator.exe",
    [string] $InstanceName = "OctopusServer33"
)
$ErrorActionPreference = "STOP"

function Write-Log
{
    param (
       $message
    )

    $timestamp = ([System.DateTime]::UTCNow).ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ss")
    Write-Host "[$timestamp] $message"
}

function Write-CommandOutput
{
    param (
        $output
    )

    if (!$output -or $output -eq "") { return }

    Write-Host ""
    @() + $output |% { Write-Host "`t| $($_.Trim())" }
    Write-Host ""
}

function Write-SectionHeader()
{
    param (
        $section
    )

    Write-Log "======================================"
    Write-Log " $section"
    Write-Log ""
}

function Create-InstallLocation
{
    param (
        $installBasePath
    )

    Write-SectionHeader "Create install location"
    
    if (!(Test-Path $installBasePath))
    {
        Write-Log "Creating installation folder at '$installBasePath' ..."
        New-Item -ItemType Directory -Path $installBasePath | Out-Null
        Write-Log "done."
    }
    else
    {
        Write-Log "Installation folder at '$installBasePath' already exists."
    }

    Write-Log ""
}

function CreateBackupLocation()
{
    $directory = [System.IO.Path]::GetDirectoryName($DatabaseBackupFilePath)
    if((Test-Path $directory) -eq $false)
    {
        Write-SectionHeader "Create backup location"

        New-Item -Path $directory -ItemType Directory | Out-Null

        $username = "NT Service\MSSQL"   #... \MSSQLSERVER if NOT SQL Express
        if($SqlServerInstance -ne "")
        { 
            $username += "`$$($SqlServerInstance)"
        }
        Write-Log "Adding write permissions for $username"
        $acl = Get-Acl $directory
        $acl.SetAccessRuleProtection($False, $False) | Out-Null
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($username, "Write", "ContainerInherit, ObjectInherit", "None", "Allow")
        $acl.AddAccessRule($rule) | Out-Null
        Set-Acl $directory $acl
    }
}

function CreateConnection()
{
    $connectionString = "Server=.\$SqlServerInstance;Database=$DatabaseName;Trusted_Connection=true"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString);
    return $connection;
}

function CreateInitialBackupIfNeeded($connection)
{
    if((Test-Path $DatabaseBackupFilePath) -eq $false)
    {
        Write-SectionHeader "Create initial database backup"
        CreateBackupLocation
        
        $command = $connection.CreateCommand()
        $command.CommandText = "BACKUP DATABASE [$DatabaseName] TO  DISK = N'$DatabaseBackupFilePath' WITH COPY_ONLY, NOFORMAT, INIT, NAME=N'Octopus-Initial-Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10"
        $command.ExecuteNonQuery()
    }
}

function RestoreDatabase($connection)
{
    Write-SectionHeader "Restore initial database"
    Stop-Service $ServiceName
    $restoreCommands = $connection.CreateCommand()

    $restoreCommands.CommandText = @"
USE [master];
ALTER DATABASE [$DatabaseName] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
RESTORE DATABASE [$DatabaseName] FROM  DISK = N'$DatabaseBackupFilePath' WITH  FILE = 1,  NOUNLOAD,  REPLACE,  STATS = 5;
ALTER DATABASE [$DatabaseName] SET MULTI_USER;
"@
    $restoreCommands.ExecuteNonQuery()
    Start-Service $ServiceName
    Write-Log "Database restoration complete"
    Write-Log "Giving Octopus Deploy a few seconds to restart after the database restoration."
    Sleep -Seconds 5
}

function Get-TentacleThumbprint
{
    Write-SectionHeader "Get tentacle thumbprint"
    $exe = "$TentaclePath"
    $output = & $exe show-thumbprint
    Write-CommandOutput $output
    $thumbprint = $output[-1].Substring($output[-1].IndexOf(": ")+2)
    return $thumbprint
}

function GetApiKey($keyName, $username, $password)
{
    Write-SectionHeader "Generate api key"
    $login = @{Username=$username;Password=$password}
    $result = Invoke-RestMethod "$root/api/users/login" -Method POST -Body (ConvertTo-Json $login) -SessionVariable octopusSession
    
    $key = @{Purpose=$keyName}
    $apiKey = Invoke-RestMethod "$root/api/users/$($result.Id)/apikeys" -Method POST -Body (ConvertTo-Json $key) -WebSession $octopusSession
    return $apiKey.ApiKey
}

function DeleteApiKey($keyPurpose)
{
    Write-SectionHeader "Delete generated api key"
    # No, I'm not dealing with paging. Shouldn't be more than 1 or two anyway here.
    $me = Invoke-RestMethod "$root/api/users/me" -Method GET -Headers $OctopusHeaders
    $apiKeys = Invoke-RestMethod "$root/api/users/$($me.Id)/apikeys" -Method GET -Headers $OctopusHeaders
    $headers = $OctopusHeaders.Clone()
    $headers["X-HTTP-Method-Override"] = "DELETE"
    $apiKeys.Items | Sort Created | Where Purpose -eq $keyPurpose | %{
        # Watch out. -Method Default makes Octopus throw exceptions trying to convert one type to another. Weird yeah.
        Invoke-RestMethod "$root$($_.Links.Self)" -Method Delete -Headers $OctopusHeaders | Out-Null
    }
}

function PostToApi($apiPath, $body)
{
    return Invoke-RestMethod "$root$($apiPath)" -Body (ConvertTo-Json $body) -Method Post -Headers $OctopusHeaders
}

function NewProjectGroup($name)
{
    $group = @{ "Name" = $name }
    return PostToApi "/api/projectgroups" $group
}

function NewProject($name, $lifecycle, $group)
{
    $project = @{ Name = $name; ProjectGroupId = $group.Id; LifecycleId = $lifecycle.Id }
    return PostToApi "/api/projects" $project
}

function NewEnvironment($name)
{
    $environment = @{ "Name" = $name }
    return PostToApi "/api/environments" $environment
}

function NewTarget($name, $environment, $roles, $uri, $thumbprint)
{
    $target = @{ Name = $name; EnvironmentIds = @($environment.Id); Roles = $roles;
        # Endpoint REQUIRES Uri and CommunicationStyle. W/O those it throws NullReferenceException.
        Endpoint = @{ Uri = $uri; CommunicationStyle = "TentaclePassive"; Thumbprint = $thumbprint }
    }
    return PostToApi "/api/machines" $target
}

function GetFirstLifecycle()
{
    $result = Invoke-RestMethod "$root/api/lifecycles" -Method Get -Headers $OctopusHeaders
    return $result.Items[0]
}

function GetProjectGroups()
{
    return (Invoke-RestMethod "$root/api/projectgroups?skip=10" -Method Get -Headers $OctopusHeaders).Items
}

function LoadEnvironments($data, $thumbprint)
{
    Write-SectionHeader "Generate environments with targets"
    foreach($environmentData in $data.environments)
    {
        Write-Log "Add targets in the $($environmentData.name) environment"
        $environment = NewEnvironment $environmentData.name
        foreach($targetData in $environmentData.targets)
        {
            Write-Log "  $($targetData.name)"
            NewTarget $targetData.name $environment $targetData.roles "https://localhost:10933/" $thumbprint | Out-Null
        }
    }
}

function LoadProjects($data)
{
    Write-SectionHeader "Generate project groups with projects"
    foreach($groupData in $data.groups)
    {
        Write-Log "Adding projects in $($groupData.name) group"
        $group = $existingGroups | Where { $_.Name -eq $groupData.name } | Select -First 1
        $group = if($group) { $group } else { (NewProjectGroup $groupData.name) }
        $existingProjects = (Invoke-RestMethod "$root$($group.Links.Projects)" -Method Get -Headers $OctopusHeaders).Items

        foreach($projectData in $groupData.projects)
        {
            if($existingProjects.Name -contains $projectData)
            {
                Write-Log "$projectData EXISTS"
            }
            else
            {
                Write-Log "  $projectData"
                NewProject $projectData $defaultLifecycle $group | Out-Null
            }
        }
    }
    Write-Host "======================================"
}

function VerifyParameters()
{
    Write-SectionHeader "Checking your parameters"
    if((Test-Path $MigratorPath -PathType Leaf) -eq $false)
    {
        Write-Error "The migrator path of '$MigratorPath' does not exist. Specify the full path to Octopus.Migrator.exe"
        return
    }
    if((Test-Path $TentaclePath -PathType Leaf) -eq $false)
    {
        Write-Error "The Tentacle path of '$TentaclePath' does not exist. Specify the full path to Tentacle.exe"
        return
    }
    if((Test-Path $GeneratedDataFilePath -PathType Leaf) -eq $false)
    {
        Write-Error "The generated data path of '$GeneratedDataFilePath' does not exist. Specify the full path to the generated data JSON file."
        return
    }
}

VerifyParameters

$connection = CreateConnection
$connection.Open()
CreateInitialBackupIfNeeded $connection
RestoreDatabase $connection
$connection.Close()


if(Test-Path $ExportPath)
{
    & $MigratorPath import --instance=$InstanceName --directory=$ExportPath --password=Password123. --console
} else {

    $root = $OctopusRootUrl
    $apiKey = (GetApiKey "Load It" $OctopusAdminUsername $OctopusAdminPassword)
    $OctopusHeaders = @{"X-Octopus-ApiKey" = $apiKey }

    $defaultLifecycle = GetFirstLifecycle
    $existingGroups = GetProjectGroups

    $gen = gc $GeneratedDataFilePath | ConvertFrom-Json

    LoadProjects $gen
    LoadEnvironments $gen (Get-TentacleThumbprint)

    DeleteApiKey "Load It"

    & $MigratorPath export --instance=$InstanceName --directory=$ExportPath --password=Password123. --console
}

