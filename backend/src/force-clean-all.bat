@echo off
setlocal

set BASE_DIR=C:\development\github\Christephanie\christephanie\backend\src

echo Cleaning bin, obj, and publish directories in %BASE_DIR%...

for /d /r "%BASE_DIR%" %%d in (bin, obj, publish) do (
    echo Deleting "%%d"...
    rd /s /q "%%d"
)

echo Clean completed successfully.
endlocal
pause
