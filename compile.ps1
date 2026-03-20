$ErrorActionPreference = "Stop"
Write-Host "Downloading Tailwind CLI..."
Invoke-WebRequest -Uri "https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-windows-x64.exe" -OutFile "tailwindcss.exe"
Write-Host "Compiling CSS..."
.\tailwindcss.exe -i .\input.css -o .\assets\css\tailwind.min.css --minify
Write-Host "Cleaning up..."
Remove-Item tailwindcss.exe
Write-Host "Done!"
