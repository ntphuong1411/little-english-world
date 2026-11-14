# Development audio only. Review listening quality and redistribution rights before public release.
Add-Type -AssemblyName System.Speech
$speech = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $speech.SelectVoice('Microsoft Zira Desktop')
    $speech.Rate = -2
    $speech.Volume = 85
    $clips = [ordered]@{
        'welcome' = "Hello, little explorer! I'm Bunny. Let's find some kitchen treasures."
        'spoon' = 'Spoon.'
        'fork' = 'Fork.'
        'bowl' = 'Bowl.'
        'choose-spoon' = 'Can you find the spoon?'
        'choose-fork' = 'Can you find the fork?'
        'choose-bowl' = 'Can you find the bowl?'
        'assist-spoon' = "Let's do it together. This is the spoon. Tap the glowing picture."
        'assist-fork' = "Let's do it together. This is the fork. Tap the glowing picture."
        'assist-bowl' = "Let's do it together. This is the bowl. Tap the glowing picture."
        'correct' = 'You found it! Lovely exploring.'
        'retry' = "A lovely try. Let's listen again."
        'celebrate' = 'You did it! Bunny loved learning with you.'
        'sticker' = 'A little chef sticker for your adventure!'
    }
    $audioDirectory = Join-Path $PSScriptRoot '../public/audio'
    New-Item -ItemType Directory -Force -Path $audioDirectory | Out-Null
    foreach ($clip in $clips.GetEnumerator()) {
        $speech.SetOutputToWaveFile((Join-Path $audioDirectory ($clip.Key + '.wav')))
        $speech.Speak($clip.Value)
        $speech.SetOutputToNull()
    }
    Write-Output "Generated $($clips.Count) static en-US WAV clips."
} finally { $speech.Dispose() }
