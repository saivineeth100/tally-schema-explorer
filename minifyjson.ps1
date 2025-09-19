# 1. SET THE TOP-LEVEL FOLDER where the script should start searching.
$basePath = "public/Data"

Write-Host "Starting recursive search for JSON files in: $basePath"

# 2. GET ALL .json files in ALL subfolders using the -Recurse switch.
# We also exclude any 'index.json' files from being modified.
$jsonFiles = Get-ChildItem -Path $basePath -Filter "*.json" -Recurse | Where-Object { $_.Name -ne "index.json" }

# 3. LOOP THROUGH EACH FILE FOUND and minify it in place.
foreach ($file in $jsonFiles) {
    try {
        # Using .FullName to show the complete path of the file being processed
        Write-Host "Minifying $($file.FullName)..." -NoNewline
        
        # Read, parse, and re-write the JSON with the -Compress switch
        (Get-Content -Path $file.FullName -Raw | ConvertFrom-Json) | 
            ConvertTo-Json -Compress -Depth 20 | 
            Out-File -FilePath $file.FullName -Encoding utf8 -Force
            
        Write-Host " Done." -ForegroundColor Green
    } catch {
        # This will catch errors if a file is not valid JSON
        Write-Host " FAILED. Error processing file $($file.FullName)." -ForegroundColor Red
    }
}

Write-Host "Recursive minification complete."