class Import {
    memory = new WebAssembly.Memory({ initial: 1 });
    wasi_unstable = { fd_write: (fd: number, iov_ptr: number, iov_len: number, nwritten_ptr: number) => {
        let enc = new TextDecoder("utf-8");
        let nwritten = 0;

        let iov_mem = new Uint32Array(this.memory.buffer.slice(iov_ptr, iov_ptr + iov_len * 8))

        for (let i = 0; i < iov_len; i++) {
            let ptr = iov_mem[iov_ptr + i * 2];
            let len = iov_mem[iov_ptr + 1 + i * 2];

            let buf = new Uint8Array(this.memory.buffer.slice(ptr, ptr + len))
            if (fd == 1) {
                let string = enc.decode(buf);
                console.log(string);
                let div = document.getElementById("stdOut");
                div.append(string);
            } else if (fd == 2) {
                let string = enc.decode(buf);
                console.error(string);
                let div = document.getElementById("stdErr");
                div.append(string);
            }
            nwritten += len;
        }
        let nwrittenBuf = new Uint32Array(this.memory.buffer.slice(nwritten_ptr, nwritten_ptr + 4))
        nwrittenBuf[0] = nwritten;
        return nwritten;
    }};
    console = { log: (o: number, l: number)=>{this.logString(o, l)} };

    logString(offset: number, length: number) {
          const bytes = new Uint8Array(this.memory.buffer, offset, length);
          const string = new TextDecoder("utf8").decode(bytes);
          console.log(string);
            let div = document.getElementById("stdOut");
            div.append(string);
    }
}

class RunTime {
    modules = {};
    onLoaded = new Array<CallableFunction>;

    addLoadHandler(handler: CallableFunction) {
        this.onLoaded.push(handler);
    }

    load (moduleName: string) {

        if (undefined !== this.modules[moduleName]) {
            console.warn("Module with name '" + moduleName + "' has been previously loaded and will be overwritten");
        }
        this.modules[moduleName] = {};
        let importObject = new Import();
        this.modules[moduleName].importObject = importObject;

        WebAssembly.instantiateStreaming(fetch("build/" + moduleName + ".wasm"), importObject as any).then((obj) => {
            console.log(obj.instance);
            console.log("'", moduleName, "' module exports: ");
              for (let obj_key of Object.keys(obj.instance.exports)) {

                let exported_symbol = obj.instance.exports[obj_key];
                let type:string = typeof exported_symbol;
                if (exported_symbol instanceof WebAssembly.Memory) {
                    importObject.memory = exported_symbol as WebAssembly.Memory;
                    type = "Memory";
                }

                if (undefined === this.modules[moduleName].functions) {
                    this.modules[moduleName].functions = {};
                }

                if (exported_symbol instanceof Function) {
                    this.modules[moduleName].functions[obj_key] = exported_symbol as CallableFunction;
                    type = "Function";
                }

                console.log("\t", obj_key, ": ", type);
              }
              for (let handler of this.onLoaded) {
                  handler(moduleName);
              }
        });
    }

    run (module: string, fun: string): any {
        return this.modules[module]["functions"][fun]();
    }
}

function getInputName(name: string, input_no: number) {
    return name + "-" + input_no;

}
function addFunctionRunner (name: string, fun: CallableFunction) {
    let div = document.createElement("div");
    div.append(name);

    for (let i = 0; i < fun.length; i++) {
        let input = document.createElement("input");
        input.id = getInputName(name, i);
        div.append(input);
    }

    let button = document.createElement("button");
    button.append("Run");
    button.onclick = function () {
        let args = [];
        for (let i = 0; i < fun.length; i++) {
            let element = document.getElementById(getInputName(name, i)) as HTMLInputElement;
            args.push(element.value);
        }
        let ret = fun(...args);
        let output = document.getElementById(name + "-return");
        output.innerHTML = "Returned: " + ret;

    }

    div.appendChild(button);

    let ret = document.createElement("div");
    ret.id = name + "-return";
    div.appendChild(ret);

    document.getElementById("functions").appendChild(div);

}

let rt = new RunTime();
rt.addLoadHandler( () => {
    for (let fun in rt.modules["app"]["functions"]) {
        console.log(fun);
        addFunctionRunner(fun, rt.modules["app"]["functions"][fun]);
    }
    rt.run("app", "_start");
});
rt.load("app");
