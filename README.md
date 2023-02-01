DULL Iteration 2
================

Running
-------

Build compiler and compile inputs/example_1.dull :
```bash
npm start inputs/example_1.dull
```

Run web-server to see the result in the browser:
```
npm run serve
```

Build example in wasm/example.wat :
```
npm run build-example
```

Layout
======

We will be changing mostly the src/grammar.peg and src/generator.ts files.

For PEG grammar for peggy see:
<https://peggyjs.org/documentation.html#grammar-syntax-and-semantics>

For WebAssembly Text format:
<https://webassembly.github.io/spec/core/text/index.html>

But for the WAT it is mostly easier to look at the supplied example at wasm/example.wat
