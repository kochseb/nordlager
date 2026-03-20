$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Compress-Image {
    param([string]$in, [string]$out, [long]$quality)
    Write-Host "Compressing $in to $out"
    $img = [System.Drawing.Image]::FromFile($in)
    $bmp = new-object System.Drawing.Bitmap($img)
    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageDecoders() | Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid }
    $encParams = new-object System.Drawing.Imaging.EncoderParameters(1)
    $encParams.Param[0] = new-object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
    $bmp.Save($out, $encoder, $encParams)
    $bmp.Dispose()
    $img.Dispose()
}

Compress-Image "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\map-placeholder.jpg" "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\map-placeholder-opt.jpg" 50
Compress-Image "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\selfstorage.jpg" "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\selfstorage-opt.jpg" 50
Compress-Image "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\box4.jpg" "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\box4-opt.jpg" 50

# replace original files
Move-Item "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\map-placeholder-opt.jpg" "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\map-placeholder.jpg" -Force
Move-Item "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\selfstorage-opt.jpg" "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\selfstorage.jpg" -Force
Move-Item "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\box4-opt.jpg" "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\box4.jpg" -Force

# delete unneeded map-placeholder.jpg.png
Remove-Item "c:\Users\kochs\OneDrive\Dokumente\nordlager-opt_jan26\nordlager-halle.de\map-placeholder.jpg.png" -ErrorAction SilentlyContinue

Write-Host "Done!"
