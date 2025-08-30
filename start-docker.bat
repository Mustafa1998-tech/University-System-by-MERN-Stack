@echo off
echo Starting SIS Application with Docker...
echo.

echo Checking Docker status...
docker --version
if %errorlevel% neq 0 (
    echo Docker is not running or not installed!
    echo Please make sure Docker Desktop is running.
    pause
    exit /b 1
)

echo.
echo Stopping any existing containers...
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose down

echo.
echo Starting database services (MongoDB and Redis)...
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose up mongodb redis -d

echo.
echo Waiting for databases to become healthy...
timeout /t 30 /nobreak

echo.
echo Checking database status...
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose ps

echo.
echo Starting backend and frontend services...
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose up backend frontend -d

echo.
echo Application is starting...
echo.
echo You can access the application at:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5001
echo MongoDB: localhost:27017
echo Redis: localhost:6379
echo.
echo To view logs, run: docker compose logs -f
echo To stop the application, run: docker compose down
echo.
pause