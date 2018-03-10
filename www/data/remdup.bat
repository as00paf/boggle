@ECHO OFF &SETLOCAL ENABLEDELAYEDEXPANSION
SET "file=file"
SET "new=new"
SET "dict=dictionary"

(FOR /f "tokens=1*delims=:" %%a IN ('findstr /n "^" "%file%"') DO (
    SET "nr=%%a"
    SET "line=%%b"
    SET "this="
    FINDSTR /l "!line!" "%dict%" >NUL 2>&1&& ECHO(!line! || (
        FOR /f "tokens=1*delims==" %%x IN ('set "$" 2^>nul') DO IF !line!==%%y SET "this=1"
        IF "!this!"=="" (
            ECHO(!line!
            SET "$!nr!=!line!"
        )
    )
))>"%new%"
TYPE "%new%"