interface Node {
    type: string;
    child: Node;
    children: Node[];
    value: string;
}

export class Generator {
    private parsed: Node;
    constructor(parsed: Node) {
        this.parsed = parsed;
    }
    public generate(): string {
        return this._generate(this.parsed);
    }
    private _generate(element: Node): string {
        let str = "";
        switch (element.type) {
            case 'program':
                str += '(module \n';
                str += '(func (export "_start") ';
                let first = element.children[0];
                if (first && first.type == 'inputs') {
                    str += this._generate(first);
                }

                str += '(result i32)\n';
                for (let child of element.children) {
                    if (child.type == 'inputs') {
                        continue;
                    }
                    str += this._generate(child) + '\n';
                }
                str += '))\n';
                break;
            case 'return':
                str += this._generate(element.child);
                break;
            case 'inputs':
                for (let child of element.children) {
                    str += '(param $' + child.value + ' i32)';
                }
                break;
            case 'locals':
                for (let child of element.children) {
                    str += '(local $' + child.value + ' i32)';
                }
                break;
            case 'assignment':
                str += '(local.set $' + element.children[0].value + ' ' + this._generate(element.children[1]) + ')';
                break;
            case 'sum':
            case 'product':
                if (element.children.length === 0) {
                    str += this._generate(element.child);
                } else {
                    let tmp = this._generate(element.child);
                    for (let child of element.children) {
                        let sign = child[1];
                        let operation = '(i32.';
                        switch (sign) {
                            case '+':
                                operation += 'add'
                                break;
                            case '-':
                                operation += 'sub'
                                break;
                            case '*':
                                operation += 'mul'
                                break;
                            case '/':
                                operation += 'div_s'
                                break;
                        }
                        operation += ' ' + tmp + ' ';
                        operation += this._generate(child[3]);
                        operation += ')';
                        tmp = operation;
                    }
                    str += tmp;
                }
                break;
            case 'number':
                str += '(i32.const ' + element.value + ')';
                break;
            case 'identifier':
                str += '(local.get $' + element.value + ')';
                break;
        }
        return str;
    }


}

