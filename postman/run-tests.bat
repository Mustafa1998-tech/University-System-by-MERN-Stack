@echo off
setlocal enabledelayedexpansion

:: SIS API Test Runner for Windows
:: This script runs the complete API test suite using Newman

:: Default values
set ENVIRONMENT=Development
set COLLECTION=SIS_API_Collection.json
set VERBOSE=false
set GENERATE_REPORT=true

:: Function to print status messages
:print_status
echo [INFO] %~1
exit /b

:print_error
echo [ERROR] %~1
exit /b

:print_warning
echo [WARNING] %~1
exit /b

:: Function to show usage
:show_usage
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   -e, --environment ENV    Environment to test (Development^|Production)
echo   -c, --collection FILE    Collection file to run
echo   -v, --verbose           Enable verbose output
echo   -r, --no-report         Skip report generation
echo   -h, --help              Show this help message
echo.
echo Examples:
echo   %0                                      # Run with default settings
echo   %0 -e Production                       # Run against production
echo   %0 -c Student_Management.json          # Run specific collection
echo   %0 -e Development -v                   # Run with verbose output
exit /b

:: Parse command line arguments
:parse_args
if "%~1"=="" goto :validate_args
if "%~1"=="-e" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--environment" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-c" (
    set COLLECTION=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--collection" (
    set COLLECTION=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-v" (
    set VERBOSE=true
    shift
    goto :parse_args
)
if "%~1"=="--verbose" (
    set VERBOSE=true
    shift
    goto :parse_args
)
if "%~1"=="-r" (
    set GENERATE_REPORT=false
    shift
    goto :parse_args
)
if "%~1"=="--no-report" (
    set GENERATE_REPORT=false
    shift
    goto :parse_args
)
if "%~1"=="-h" (
    call :show_usage
    exit /b 0
)
if "%~1"=="--help" (
    call :show_usage
    exit /b 0
)
call :print_error "Unknown option: %~1"
call :show_usage
exit /b 1

:validate_args
:: Validate environment
if not "%ENVIRONMENT%"=="Development" if not "%ENVIRONMENT%"=="Production" (
    call :print_error "Invalid environment: %ENVIRONMENT%"
    call :print_error "Must be either 'Development' or 'Production'"
    exit /b 1
)

:: Check if Newman is installed
newman --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Newman is not installed. Please install it first:"
    call :print_error "npm install -g newman"
    call :print_error "npm install -g newman-reporter-html"
    exit /b 1
)

:: Create reports and logs directories
if not exist "reports" mkdir reports
if not exist "logs" mkdir logs

:: Set up file paths
set ENVIRONMENT_FILE=environments\%ENVIRONMENT%.postman_environment.json
set COLLECTION_FILE=collections\%COLLECTION%

:: Check if files exist
if not exist "%COLLECTION_FILE%" (
    if not exist "%COLLECTION%" (
        call :print_error "Collection file not found: %COLLECTION%"
        exit /b 1
    ) else (
        set COLLECTION_FILE=%COLLECTION%
    )
)

if not exist "%ENVIRONMENT_FILE%" (
    call :print_error "Environment file not found: %ENVIRONMENT_FILE%"
    exit /b 1
)

call :print_status "Starting SIS API Tests"
call :print_status "Collection: %COLLECTION_FILE%"
call :print_status "Environment: %ENVIRONMENT_FILE%"

:: Generate timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do if not "%%I"=="" set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%

:: Build Newman command
set NEWMAN_CMD=newman run "%COLLECTION_FILE%" -e "%ENVIRONMENT_FILE%"

:: Add reporters
if "%GENERATE_REPORT%"=="true" (
    set REPORT_FILE=reports\api-test-report-%TIMESTAMP%.html
    set JSON_REPORT=reports\api-test-results-%TIMESTAMP%.json
    
    set NEWMAN_CMD=!NEWMAN_CMD! --reporters cli,html,json
    set NEWMAN_CMD=!NEWMAN_CMD! --reporter-html-export "!REPORT_FILE!"
    set NEWMAN_CMD=!NEWMAN_CMD! --reporter-json-export "!JSON_REPORT!"
    
    call :print_status "Report will be generated: !REPORT_FILE!"
) else (
    set NEWMAN_CMD=!NEWMAN_CMD! --reporters cli
)

:: Add verbose flag if requested
if "%VERBOSE%"=="true" (
    set NEWMAN_CMD=!NEWMAN_CMD! --verbose
)

:: Add global variables
for /f %%i in ('powershell -command "([DateTimeOffset]::Now.ToUnixTimeSeconds())"') do set UNIX_TIMESTAMP=%%i
set NEWMAN_CMD=!NEWMAN_CMD! --global-var "test_run_id=%UNIX_TIMESTAMP%"
set NEWMAN_CMD=!NEWMAN_CMD! --global-var "environment=%ENVIRONMENT%"

:: Set timeout values
set NEWMAN_CMD=!NEWMAN_CMD! --timeout-request 30000
set NEWMAN_CMD=!NEWMAN_CMD! --timeout-script 5000

:: Log file
set LOG_FILE=logs\test-run-%TIMESTAMP%.log

call :print_status "Running tests..."

:: Execute Newman command
%NEWMAN_CMD% > "%LOG_FILE%" 2>&1

if errorlevel 1 (
    call :print_error "Tests failed!"
    call :print_error "Check log file for details: %LOG_FILE%"
    exit /b 1
) else (
    call :print_status "Tests completed successfully!"
    
    if "%GENERATE_REPORT%"=="true" (
        call :print_status "Test report generated: !REPORT_FILE!"
        call :print_status "JSON results: !JSON_REPORT!"
        
        :: Try to open report in browser
        start "" "!REPORT_FILE!"
    )
    
    call :print_status "Log file: %LOG_FILE%"
    exit /b 0
)

:: Parse command line arguments
call :parse_args %*