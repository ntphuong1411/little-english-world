# Original geometric app icon, kept inside the safe area for maskable launchers.
Add-Type -AssemblyName System.Drawing
foreach ($size in @(192, 512)) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = 'AntiAlias'
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#376650'))
    $petal = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#f1b48b'))
    $center = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#fff8e9'))
    $scale = $size / 192.0
    foreach ($point in @(@(96,66), @(125,87), @(114,121), @(78,121), @(67,87))) {
        $graphics.FillEllipse($petal, [single](($point[0]-25)*$scale), [single](($point[1]-25)*$scale), [single](50*$scale), [single](50*$scale))
    }
    $graphics.FillEllipse($center, [single](79*$scale), [single](79*$scale), [single](34*$scale), [single](34*$scale))
    $bitmap.Save((Join-Path $PSScriptRoot "../public/icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose(); $bitmap.Dispose(); $petal.Dispose(); $center.Dispose()
}
