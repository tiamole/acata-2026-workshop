# Explicit production smoke check. Creates and removes one temporary workspace.
$ErrorActionPreference='Stop'
. (Join-Path (Split-Path $PSScriptRoot) 'scripts/windows-credential.ps1')
$stored=[AcataCredentialStore]::Load($AcataCredentialTarget)
if(-not $stored){throw 'Local administrator credential is unavailable.'}
$secrets=$stored | ConvertFrom-Json
$api='https://acata-workshop-api.acata-2026-workshop.workers.dev'
$origin='https://tiamole.github.io'
$headers=@{Origin=$origin}
$config=Invoke-RestMethod -Uri ($api+'/config') -Headers $headers
if(-not $config.available -or $config.research.enabled){throw 'Unexpected research or service configuration.'}
$health=Invoke-RestMethod -Uri ($api+'/health') -Headers $headers
if(-not $health.ok){throw 'Service health check failed.'}
$workspace=@{version=1;updatedAt=$null;checks=@{};fields=@{};rubric=@();disposition='';reviewSummary=''}
$body=@{workspace=$workspace} | ConvertTo-Json -Depth 20 -Compress
$temporary=Invoke-RestMethod -Method Post -Uri ($api+'/participant') -Headers $headers -ContentType 'application/json' -Body $body
try {
    $privateHeaders=@{Origin=$origin;Authorization=('Bearer '+$temporary.token)}
    $restored=Invoke-RestMethod -Uri ($api+'/progress') -Headers $privateHeaders
    if($restored.revision -ne 1 -or $restored.workspace.version -ne 1){throw 'Workspace retrieval failed.'}
    $workspace.checks=@{blueprint=@($true,$true,$true,$true)}
    $update=@{workspace=$workspace;revision=1} | ConvertTo-Json -Depth 20 -Compress
    $saved=Invoke-RestMethod -Method Put -Uri ($api+'/progress') -Headers $privateHeaders -ContentType 'application/json' -Body $update
    if($saved.revision -ne 2){throw 'Workspace revision check failed.'}
} finally {
    $null=Invoke-RestMethod -Method Delete -Uri ($api+'/progress') -Headers @{Origin=$origin;Authorization=('Bearer '+$temporary.token)}
}
$adminHeaders=@{Origin=$origin;Authorization=('Bearer '+$secrets.ADMIN_TOKEN)}
$stats=Invoke-RestMethod -Uri ($api+'/admin/stats') -Headers $adminHeaders
if(-not $stats.generatedAt){throw 'Administrator dashboard check failed.'}
$export=Invoke-RestMethod -Uri ($api+'/admin/export?kind=research') -Headers $adminHeaders
if(-not $export.csv.Contains('instrument_version')){throw 'Research export header check failed.'}
foreach($test in @(
    @{Path='/admin/stats';Headers=$headers;Method='Get';Expected=401;Body=$null},
    @{Path='/config';Headers=@{Origin='https://unapproved.example'};Method='Get';Expected=403;Body=$null},
    @{Path='/survey';Headers=$headers;Method='Post';Expected=403;Body='{}'}
)) {
    try {
        $arguments=@{Uri=($api+$test.Path);Headers=$test.Headers;Method=$test.Method;UseBasicParsing=$true}
        if($test.Body){$arguments.Body=$test.Body;$arguments.ContentType='application/json'}
        $null=Invoke-WebRequest @arguments
        throw ('Expected rejection for '+$test.Path)
    } catch {
        if(-not $_.Exception.Response -or [int]$_.Exception.Response.StatusCode -ne $test.Expected){throw}
    }
}
Write-Output 'Production API verified: healthy service, closed research gate, temporary workspace create/restore/update/delete, private dashboard/export, and origin/authentication enforcement. No survey responses or visit events were created.'
$stored=$null; $secrets=$null; $temporary=$null
