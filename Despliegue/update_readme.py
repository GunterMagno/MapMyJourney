import subprocess
import sys
from datetime import datetime


def run_tests():
    fechaHora = datetime.now()
    try:
        subprocess.check_call([sys.executable, "-m", "pytest", "-q", "-v"])
        return f"✅ {fechaHora} - Tests correctos"
    except subprocess.CalledProcessError:
        return f"❌ {fechaHora} - Tests fallidos"


def update_readme(status: str):
    with open("README.md", "r", encoding="utf-8") as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if line.strip() == "## Estado de los tests":
            lines[i + 1] = status + "\n"
            break

    with open("README.md", "w", encoding="utf-8") as f:
        f.writelines(lines)


def update_reportmd(status: str):
    total, correctos, fallidos = leer_historial()

    if "✅" in status:
        correctos += 1
    else:
        fallidos += 1
    total = correctos + fallidos

    with open("report.md", "r", encoding="utf-8") as f:
        lines = f.readlines()

    resumen = f"### Test realizados hasta ahora: {total} ({correctos} correctos, {fallidos} fallidos)\n"
    lines[1] = resumen
    lines.append("\n" + status + "\n")

    with open("report.md", "w", encoding="utf-8") as f:
        f.writelines(lines)


def leer_historial():
    correctos = 0
    fallidos = 0
    total = 0

    with open("report.md", "r", encoding="utf-8") as f:
        for line in f:
            if "✅" in line:
                correctos += 1
            elif "❌" in line:
                fallidos += 1
    total = correctos + fallidos

    return total, correctos, fallidos


if __name__ == "__main__":
    status = run_tests()
    update_readme(status)
    """update_reportmd(status)"""