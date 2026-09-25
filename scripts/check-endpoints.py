import json
import os
import pathlib
import re

catalog_path = pathlib.Path(
    os.environ.get(
        "BACKEND_ROUTE_CATALOG",
        "../review_backend/src/docs/route-catalog.json",
    )
)
if not catalog_path.exists():
    raise SystemExit(
        "Backend route catalog not found. Set BACKEND_ROUTE_CATALOG to "
        "the backend src/docs/route-catalog.json path."
    )
backend = json.loads(catalog_path.read_text())


def normalize(value):
    value = value.split("?", 1)[0]
    value = re.sub(r"\$\{[^}]+\}", "{}", value)
    value = re.sub(r":[^/]+", "{}", value)
    value = re.sub(r"\{[^}]+\}", "{}", value)
    return value.rstrip("/") or "/"


backend_set = {(route["method"], normalize(route["path"])) for route in backend}
found = []
root = pathlib.Path(__file__).resolve().parents[1]
for file_path in (root / "src").rglob("*"):
    if file_path.suffix not in (".js", ".jsx"):
        continue
    source = file_path.read_text(errors="ignore")
    for line_number, line in enumerate(source.splitlines(), 1):
        for match in re.finditer(
            r"http(Get|Post|Put|Delete|PostFormData|PutFormData)\s*\(\s*[`\"]([^`\"]+)",
            line,
        ):
            kind, raw_path = match.groups()
            method = {
                "Get": "GET",
                "Post": "POST",
                "Put": "PUT",
                "Delete": "DELETE",
                "PostFormData": "POST",
                "PutFormData": "PUT",
            }[kind]
            raw_path = re.sub(r"\$\{[^}]+\}", "{}", raw_path)
            full_path = raw_path if raw_path.startswith("/api/") else (
                "/api" + raw_path
                if raw_path.startswith("/")
                and any(
                    raw_path.startswith("/" + role)
                    for role in (
                        "auth",
                        "student",
                        "parent",
                        "assistant",
                        "teacher",
                        "super-admin",
                    )
                )
                else raw_path
            )
            found.append((method, normalize(full_path), str(file_path), line_number))

seen = {(method, path) for method, path, *_ in found}
missing = sorted({item for item in found if (item[0], item[1]) not in backend_set})
result = {
    "frontend_unique_calls": len(seen),
    "backend_operations": len(backend_set),
    "missing_count": len({(method, path) for method, path, *_ in missing}),
    "missing": missing,
}
print(json.dumps(result, indent=2))
if result["missing_count"]:
    raise SystemExit(1)
