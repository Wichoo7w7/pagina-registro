$body = @{
    email = "admin@example.com"
    password = "AdminPassword123!"
} | ConvertTo-Json

try {
    Write-Host "🔑 Probando login con credenciales de admin..." -ForegroundColor Yellow
    Write-Host "📧 Email: admin@example.com" -ForegroundColor Green
    Write-Host "🔒 Password: AdminPassword123!" -ForegroundColor Green
    Write-Host "🌐 Endpoint: http://localhost:3000/api/auth/login" -ForegroundColor Blue
    Write-Host ""

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $body
    
    Write-Host "✅ Respuesta del servidor:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host
    
    if ($response.accessToken -and $response.user) {
        Write-Host ""
        Write-Host "🎉 ¡LOGIN EXITOSO!" -ForegroundColor Green
        Write-Host "👤 Usuario: $($response.user.firstName) $($response.user.lastName)" -ForegroundColor Cyan
        Write-Host "📧 Email: $($response.user.email)" -ForegroundColor Cyan
        Write-Host "🔑 Rol: $($response.user.role)" -ForegroundColor Cyan
        Write-Host "🎟️ Token generado: $($response.accessToken.Substring(0, 50))..." -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Login falló - formato de respuesta incorrecto" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error en la petición:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}