---
description: Revisa los cambios, crea un commit con un mensaje descriptivo y hace push al repositorio remoto
argument-hint: [mensaje de commit opcional]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(git remote:*)
---

## Contexto

- Estado actual: !`git status`
- Rama actual: !`git branch --show-current`
- Remotos: !`git remote -v`
- Cambios (staged y unstaged): !`git diff HEAD`
- Últimos commits: !`git log --oneline -10`

## Tarea

Hacé commit y push de los cambios actuales siguiendo estos pasos:

1. **Verificar que hay cambios.** Si no hay nada para commitear, avisá y terminá.
2. **Revisar los archivos.** No incluyas archivos con secretos (`.env`, credenciales, claves) ni artefactos de build (`node_modules`, `dist`, etc.). Si aparece alguno, avisá y excluilo.
3. **Agregar los archivos** relevantes con `git add` (por nombre, o `git add -A` si todos son válidos).
4. **Crear el commit.**
   - Si se pasó un mensaje como argumento, usalo: `$ARGUMENTS`
   - Si no, escribí un mensaje conciso siguiendo el estilo de los commits anteriores, que explique el *por qué* del cambio.
5. **Hacer push** a la rama actual. Si la rama no tiene upstream, usá `git push -u origin <rama>`.
6. **Si el push falla** (por ejemplo, el remoto tiene cambios nuevos), no uses `--force`. Explicá el error y sugerí el paso siguiente (p. ej. `git pull --rebase`).
7. **Resumir** al final: hash del commit, mensaje y rama a la que se hizo push.
