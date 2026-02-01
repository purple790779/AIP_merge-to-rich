
Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\JAY\.gemini\antigravity\brain\ddf9349b-a2e9-4f97-8340-660654c2e365\app_icon_v8_solid_bg_fix_1769954058224.png"
$squareOut = "E:\Daddy_Project\Apps-in-Toss\AIP_merge-to-rich\public\thumbnail_square.png"
$landOut = "E:\Daddy_Project\Apps-in-Toss\AIP_merge-to-rich\public\thumbnail_landscape.png"
$bgColor = [System.Drawing.ColorTranslator]::FromHtml("#3182F6")

# Load source image
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source image not found at $sourcePath"
    exit 1
}
$sourceImg = [System.Drawing.Image]::FromFile($sourcePath)

# --- 1. Square Thumbnail (1000x1000) ---
$squareBmp = New-Object System.Drawing.Bitmap(1000, 1000)
$gSquare = [System.Drawing.Graphics]::FromImage($squareBmp)
$gSquare.Clear($bgColor)
$gSquare.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gSquare.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Draw resized source to fit nicely (e.g., 90% size or full bleed coverage?)
# Since source is "full bleed" background, we can just resize fully.
$gSquare.DrawImage($sourceImg, 0, 0, 1000, 1000)
$squareBmp.Save($squareOut, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created Square Thumbnail: $squareOut"

# --- 2. Landscape Thumbnail (1932x828) ---
$landBmp = New-Object System.Drawing.Bitmap(1932, 828)
$gLand = [System.Drawing.Graphics]::FromImage($landBmp)
$gLand.Clear($bgColor)
$gLand.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gLand.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Calculate centered icon size for landscape
# Let's make the icon height about 60% of canvas height so it looks balanced
$iconHeight = 828 * 0.70
$iconWidth = $iconHeight # aspect ratio 1:1

$x = (1932 - $iconWidth) / 2
$y = (828 - $iconHeight) / 2

$gLand.DrawImage($sourceImg, [int]$x, [int]$y, [int]$iconWidth, [int]$iconHeight)
$landBmp.Save($landOut, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created Landscape Thumbnail: $landOut"

# Cleanup
$gSquare.Dispose()
$squareBmp.Dispose()
$gLand.Dispose()
$landBmp.Dispose()
$sourceImg.Dispose()
