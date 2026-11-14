# json-formatter-local

A small local JSON formatter. No dependencies, no network calls — everything runs on `localhost`.

- Paste JSON → **Format** / **Minify** / **Copy**
- Size stats: top-level type, item/key count, characters, bytes, lines
- **Tree** view (collapsible) and **Graph** view (node-link diagram with pan, zoom, collapse)
- Save and reopen files from a folder on your machine

## Install

Needs Node 16+.

```bash
npm install -g github:Tarushfx/json-formatter
```

Then run it anywhere:

```bash
json-formatter --open
```

Or without installing:

```bash
npx github:Tarushfx/json-formatter --open
```

## Options

| Flag | Default | Meaning |
| --- | --- | --- |
| `--port` | `3000` (or `$PORT`) | Port to listen on |
| `--dir` | `~/json-formatter-data` (or `$JSON_FORMATTER_DIR`) | Folder where files are saved |
| `--open` | off | Open the page in your browser |

Example: `json-formatter --dir ~/Documents/json --port 4000 --open`

You can also change the save folder from the page: type a path and click **Set folder**, click **Browse…** to pick a folder (with a **New folder…** option), or choose from **Recent…**. This works on macOS, Windows and Linux.
The choice and the last 8 folders are remembered in `~/.json-formatter.json`. Priority: `--dir` flag, then `$JSON_FORMATTER_DIR`, then the remembered folder, then `~/json-formatter-data`.

## Notes

- Binds to `127.0.0.1` only, so it isn't reachable from other machines.
- Saved file names are sanitised and always end in `.json`; invalid JSON is refused.

## Update / uninstall

```bash
npm install -g github:Tarushfx/json-formatter   # update
npm uninstall -g json-formatter-local            # remove
```
