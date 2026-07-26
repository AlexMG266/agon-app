#!/bin/sh
set -e

MARKER=/tmp/.last_build

recompile() {
    echo "[backend] Cambios detectados, recompilando..."
    mvn compile -q -DskipTests
    echo "[backend] Recompilación completada. DevTools reiniciará la aplicación."
}

touch "$MARKER"
recompile

(
    while true; do
        sleep 2

        changed_sources=$(find /app/src -type f \( -name '*.java' -o -name '*.yml' -o -name '*.properties' \) -newer "$MARKER" 2>/dev/null | head -1)
        changed_pom=$(find /app/pom.xml -newer "$MARKER" 2>/dev/null)

        if [ -n "$changed_sources" ] || [ -n "$changed_pom" ]; then
            touch "$MARKER"
            if [ -n "$changed_pom" ]; then
                mvn dependency:go-offline -B -q || true
            fi
            recompile
        fi
    done
) &

exec mvn spring-boot:run -DskipTests
