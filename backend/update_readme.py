def read_report():
    with open("report.md", "r", encoding="utf-8") as f:
        lines = f.readlines()
        for line in reversed(lines):
            if "✅" in line:
                return "### ✅ - Test Correctos"
            elif "❌" in line:
                return "### ❌ - Test Fallidos"

def update_readme(status: str):
    with open("README.md", "r", encoding="utf-8") as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if line.strip() == "## Estado de los tests":
            if "✅" in lines[i + 2] or "❌" in lines[i + 2]:
                 lines[i + 2] = status
            else:
                lines.append(status)
            break

    with open("README.md", "w", encoding="utf-8") as f:
        f.writelines(lines)


if __name__ == "__main__":
    status = read_report()
    update_readme(status)
