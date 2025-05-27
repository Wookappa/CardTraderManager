# Path to configuration files
$appSettingsPath = ".\appsettings.json"
$localSettingsPath = ".\local.settings.json"

# Load JSON files
$appSettings = Get-Content $appSettingsPath | ConvertFrom-Json -Depth 10
$localSettings = Get-Content $localSettingsPath | ConvertFrom-Json -Depth 10

# Function to convert nested JSON into flattened keys like "UpdateStrategies:CustomRules:0:MinPriceRange"
function ConvertTo-FlattenedDictionary {
    param (
        [Parameter(Mandatory = $true)] $JsonObject,
        [string] $Prefix = "",
        [int] $ArrayIndex = 0
    )
    
    $result = @{}

    foreach ($key in $JsonObject.PSObject.Properties.Name) {
        $fullKey = if ($Prefix -eq "") { $key } else { "$Prefix`:$key" }
        $value = $JsonObject.$key
        
        if ($value -is [PSCustomObject]) {
            # If the value is an object, perform recursion
            $nested = ConvertTo-FlattenedDictionary -JsonObject $value -Prefix $fullKey
            $result += $nested
        } elseif ($value -is [System.Collections.IEnumerable] -and $value -isnot [string]) {
            # If the value is an array, recursively add the array index
            $index = 0
            foreach ($item in $value) {
                $nested = ConvertTo-FlattenedDictionary -JsonObject $item -Prefix "${fullKey}:${index}"
                $result += $nested
                $index++
            }
        } else {
            # If it's a simple property, add it to the result
            $result[$fullKey] = $value
        }
    }

    return $result
}

# Convert appsettings.json into key-value format for Azure
$flattenedSettings = ConvertTo-FlattenedDictionary -JsonObject $appSettings

# Add or update values in local.settings.json
foreach ($entry in $flattenedSettings.GetEnumerator()) {
    $key = $entry.Key
    $value = $entry.Value

    # Check if the key exists in the local.settings.json file
    if ($localSettings.Values.PSObject.Properties.Name -contains $key) {
        # If the key exists, update the value
        $localSettings.Values.$key = $value
    } else {
        # If the key does not exist, add the new key
        $localSettings.Values | Add-Member -MemberType NoteProperty -Name $key -Value $value
    }
}

# Save the updated local.settings.json
$localSettings | ConvertTo-Json -Depth 10 | Set-Content $localSettingsPath -Encoding UTF8

Write-Host "local.settings.json updated successfully!"