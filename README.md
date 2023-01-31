Wasmer
======

Inspect
-------

Use
```bash
wasmer inspect wasi_hello_world.wasm
```
to see details about the wasm file

Run
---
Use
```bash
wasmer wasi_hello_world.wasm
```
to run the program. Note that we receive an error due to insufficient permissions.

The program tries to write to /helloworld, which we can make available using a mapping
```bash
wasmer --mapdir=/helloworld:. wasi_hello_world.wasm
```
