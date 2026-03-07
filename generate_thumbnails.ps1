param(
    [string]$SourcePath = (Join-Path $PSScriptRoot "public\icon_600.png"),
    [string]$SquareOut = (Join-Path $PSScriptRoot "public\thumbnail_square.png"),
    [string]$LandscapeOut = (Join-Path $PSScriptRoot "public\thumbnail_landscape.png"),
    [string]$BackgroundHex = "#3182F6"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $SourcePath)) {
    Write-Error "Source image not found: $SourcePath"
    exit 1
}

$bgColor = [System.Drawing.ColorTranslator]::FromHtml($BackgroundHex)
$sourceImg = [System.Drawing.Image]::FromFile($SourcePath)

try {
    # 1) Square thumbnail: 1000x1000
    $squareBmp = New-Object System.Drawing.Bitmap(1000, 1000)
    $gSquare = [System.Drawing.Graphics]::FromImage($squareBmp)
    $gSquare.Clear($bgColor)
    $gSquare.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gSquare.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $gSquare.DrawImage($sourceImg, 0, 0, 1000, 1000)
    $squareBmp.Save($SquareOut, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Created square thumbnail: $SquareOut"

    # 2) Landscape thumbnail: 1932x828
    $landBmp = New-Object System.Drawing.Bitmap(1932, 828)
    $gLand = [System.Drawing.Graphics]::FromImage($landBmp)
    $gLand.Clear($bgColor)
    $gLand.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gLand.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Center a 1:1 icon on landscape canvas
    $iconHeight = 828 * 0.70
    $iconWidth = $iconHeight
    $x = (1932 - $iconWidth) / 2
    $y = (828 - $iconHeight) / 2
    $gLand.DrawImage($sourceImg, [int]$x, [int]$y, [int]$iconWidth, [int]$iconHeight)
    $landBmp.Save($LandscapeOut, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Created landscape thumbnail: $LandscapeOut"
}
finally {
    if ($gSquare) { $gSquare.Dispose() }
    if ($squareBmp) { $squareBmp.Dispose() }
    if ($gLand) { $gLand.Dispose() }
    if ($landBmp) { $landBmp.Dispose() }
    $sourceImg.Dispose()
}
