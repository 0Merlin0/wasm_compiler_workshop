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
                str += '(func (export "_start") (result i32)\n';
                str += this._generate(element.child) + '\n';
                str += '))\n';
                break;
            case 'return':
                str += 'i32.const ' + this._generate(element.child);
                break;
            case 'value':
                str += element.value;
                break;
        }
        return str;
    }


}

