Add-Type -AssemblyName System.Drawing
$sourcePath = 'c:\Users\Envy\Downloads\Telegram Desktop\3x4.jpg'
$destDir = 'c:\Users\Envy\Downloads\advokatai.new\public'
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

$img = [System.Drawing.Image]::FromFile($sourcePath)
# The first photo in the sheet:
# Outer bounds approx: X=75, Y=74, Width=350, Height=468
$srcRect = New-Object System.Drawing.Rectangle(76, 75, 348, 466)
$bmp = New-Object System.Drawing.Bitmap($srcRect.Width, $srcRect.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$destRect = New-Object System.Drawing.Rectangle(0, 0, $srcRect.Width, $srcRect.Height)
$graphics.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$targetPath = Join-Path $destDir 'zafar_zokirov.jpg'
$bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

$graphics.Dispose()
$bmp.Dispose()
$img.Dispose()
Write-Output "Saved to $targetPath"
