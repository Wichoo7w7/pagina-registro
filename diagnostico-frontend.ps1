Write-Host "🔍 DIAGNÓSTICO COMPLETO DEL FRONTEND" -ForegroundColor Yellow
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host ""

# 1. Verificar procesos Node.js
Write-Host "1. 📊 Procesos Node.js activos:" -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Select-Object ProcessName, Id, StartTime | Format-Table
Write-Host ""

# 2. Verificar puerto 5173
Write-Host "2. 🌐 Estado del puerto 5173:" -ForegroundColor Cyan
$portInfo = netstat -ano | findstr :5173
if ($portInfo) {
    $portInfo | ForEach-Object { Write-Host $_ -ForegroundColor White }
} else {
    Write-Host "❌ Puerto 5173 no está en uso" -ForegroundColor Red
}
Write-Host ""

# 3. Probar conectividad HTTP
Write-Host "3. 🔗 Prueba de conectividad HTTP:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Conexión exitosa" -ForegroundColor Green
    Write-Host "   📊 Código de respuesta: $($response.StatusCode)" -ForegroundColor White
    Write-Host "   📄 Tipo de contenido: $($response.Headers['Content-Type'])" -ForegroundColor White
    Write-Host "   📝 Tamaño: $($response.Content.Length) bytes" -ForegroundColor White
} catch {
    Write-Host "❌ Error de conexión: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4. Verificar firewall
Write-Host "4. 🛡️ Verificando firewall de Windows:" -ForegroundColor Cyan
try {
    $firewallStatus = Get-NetFirewallProfile | Select-Object Name, Enabled
    $firewallStatus | Format-Table
} catch {
    Write-Host "No se pudo obtener información del firewall" -ForegroundColor Yellow
}
Write-Host ""

# 5. Probar diferentes URLs
Write-Host "5. 🌍 Probando diferentes URLs:" -ForegroundColor Cyan
$urls = @("http://localhost:5173", "http://127.0.0.1:5173", "http://[::1]:5173")
foreach ($url in $urls) {
    try {
        $test = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
        Write-Host "✅ $url - OK ($($test.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ $url - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# 6. Información del sistema
Write-Host "6. 💻 Información del sistema:" -ForegroundColor Cyan
Write-Host "   OS: $(Get-WmiObject -Class Win32_OperatingSystem | Select-Object -ExpandProperty Caption)" -ForegroundColor White
Write-Host "   PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor White
Write-Host ""

Write-Host "🎯 INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Abre tu navegador web (Chrome, Firefox, Edge)" -ForegroundColor White
Write-Host "2. Ve a: http://localhost:5173" -ForegroundColor White
Write-Host "3. Si no funciona, prueba: http://127.0.0.1:5173" -ForegroundColor White
Write-Host "4. Si ves errores en el navegador, presiona F12 y revisa la consola" -ForegroundColor White