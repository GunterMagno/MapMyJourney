import subprocess

def run_tests():
    try:
        subprocess.check_call(["mvn", "test"])
        return "✅ Tests correctos"
    except subprocess.CalledProcessError:
        return "❌ Tests fallidos"

def update_readme(status: str):
    with open("README.md", "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    for line in lines:
        new_lines.append(line)
        if line.strip() == "## Estado de los tests":
            # Si ya hay línea de estado, reemplazarla
            next_index = lines.index(line) + 1
            if next_index < len(lines):
                lines[next_index] = status + "\n"
            else:
                new_lines.append(status + "\n")
            break

    with open("README.md", "w", encoding="utf-8") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    status = run_tests()
    update_readme(status)
