$h = @{'User-Agent'='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120'}
$dir = 'd:\KARAN\ProjectWebs\limborot.workout\motorsport\images'

$dl = @(
  # Formula One - Red Bull RB19 Austria 2023
  [pscustomobject]@{u='https://upload.wikimedia.org/wikipedia/commons/e/e3/FIA_F1_Austria_2023_Nr._1_%282%29.jpg';f='s-f1.jpg'},
  # Formula 2 - Carlin F2 car Austria 2023
  [pscustomobject]@{u='https://upload.wikimedia.org/wikipedia/commons/b/b3/FIA_F1_Austria_2023_Nr._11_%282%29.jpg';f='s-f2.jpg'},
  # Formula 3 - F3 Austria 2023
  [pscustomobject]@{u='https://upload.wikimedia.org/wikipedia/commons/a/aa/FIA_F1_Austria_2023_Nr._23_%281%29.jpg';f='s-f3.jpg'},
  # Formula E - Berlin E-Prix 2023
  [pscustomobject]@{u='https://upload.wikimedia.org/wikipedia/commons/e/ec/2023-04-21_Motorsport%2C_ABB_FIA_Formula_E_World_Championship%2C_Berlin_E-Prix_2023_1DX_0626_by_Stepro.jpg';f='s-fe.jpg'},
  # Le Mans 24h start 2023
  [pscustomobject]@{u='https://upload.wikimedia.org/wikipedia/commons/4/4b/2023_24HoursofLeMans_start.jpg';f='s-lemans.jpg'},
  # WEC Toyota GR010 2024 Le Mans
  [pscustomobject]@{u='https://upload.wikimedia.org/wikipedia/commons/2/23/2024_24_Hours_of_Le_Mans_%2854093438662%29.jpg';f='s-wec.jpg'},
  # WRC - Toyota GR Yaris Rally1
  [pscustomobject]@{u='https://upload.wikimedia.org/wikipedia/commons/e/ea/Toyota_GR_Yaris_Rally1_%2855060645385%29.jpg';f='s-wrc.jpg'},
  # IndyCar - Josef Newgarden Indianapolis 500 2023
  [pscustomobject]@{u='https://upload.wikimedia.org/wikipedia/commons/e/e4/Josef_Newgarden_2023_Indianapolis_500_%28cropped%29.jpg';f='s-indy.jpg'},
  # NHRA Top Fuel Dragster
  [pscustomobject]@{u='https://upload.wikimedia.org/wikipedia/commons/2/22/Top_Fuel.JPG';f='s-nhra.jpg'},
  # WRC second image for alt series
  [pscustomobject]@{u='https://upload.wikimedia.org/wikipedia/commons/a/a2/Toyota_GR_Yaris_Rally1_%2855060645430%29.jpg';f='s-wrc2.jpg'}
)

Write-Host "Downloading $($dl.Count) images..." -ForegroundColor Cyan
$ok = 0; $fail = 0

foreach ($d in $dl) {
  $path = Join-Path $dir $d.f
  Write-Host "  $($d.f) " -NoNewline
  try {
    Invoke-WebRequest -Uri $d.u -OutFile $path -Headers $h -TimeoutSec 45 -ErrorAction Stop
    $sz = (Get-Item $path).Length
    Write-Host "OK ($([math]::Round($sz/1KB))KB)" -ForegroundColor Green
    $ok++
  } catch {
    Write-Host "FAIL: $_" -ForegroundColor Red
    $fail++
  }
}

Write-Host "`nCompleted: $ok OK, $fail FAIL" -ForegroundColor Cyan
