# Vite + React Pages migration checkpoint

```json
{
  "milestone": "vite-react-pages",
  "iteration": 2,
  "objective": "Migrate the QML learning site to Vite + React without losing README coverage or existing Pages routes.",
  "status": "implementation-ready-for-ci",
  "scope_score": 17,
  "scope_denominator": 24,
  "acceptance": {
    "legacy_routes_preserved": true,
    "readme_headings_and_toc_mapped": true,
    "duplicate_anchors_preserved": true,
    "labs_retained": true,
    "ci_build_and_validation": "pending",
    "deployment_verified": "pending"
  },
  "verification": {
    "local_allowed": ["static inspection", "git diff --check"],
    "ci_required": ["dependency resolution", "typecheck", "unit tests", "browser smoke tests", "build", "Pages deploy"]
  }
}
```

README coverage, route preservation, and the lab implementations are recorded from static source inspection and checked-in assertions; those assertions have not run yet. CI results are pending for the pushed revision.
