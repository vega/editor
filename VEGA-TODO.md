### TODO 1

`create-react-app` limits (by convention) webpack's module resolution to `src/` via `ModuleScopePlugin` but `vega-editor` imports stuff from outside.
Needs fixing or dropping `ModuleScopePlugin`.

---

### TODO 2

Webpack's `config.resolveLoader` property is obsolete.
Needs a migration equivalent.
