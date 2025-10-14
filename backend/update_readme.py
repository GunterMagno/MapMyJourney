
def read_report():
    with open("backend/report.md", "r", encoding="utf-8") as f:
        lines = f.readlines()
        for line in reversed(lines):
            if "✅" in line:
                return "\n### ✅ - Test Correctos"
            elif "❌" in line:
                return "\n### ❌ - Test Fallidos"
        

def update_readme(status: str):
    with open("README.md", "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    while i < len(lines):
        new_lines.append(lines[i])

        if lines[i].strip() == "## Estado de los tests":

            if "✅" in lines[i+2] or "❌" in lines[i+2]:
                new_lines.append(status + "\n")
                lines.remove(i)
            else:
                new_lines.append(status + "\n")
        i += 1

    with open("README.md", "w", encoding="utf-8") as f:
        f.writelines(new_lines)


if __name__ == "__main__":
    status = read_report()
    update_readme(status)