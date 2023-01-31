import * as fs from 'fs'
import * as peggy from 'peggy';
import { Generator } from './generator';

function main() {
    let filename = process.argv[2];
    let sourceCode = fs.readFileSync(filename, 'utf8');
    let grammar = fs.readFileSync('src/grammar.peg', 'utf8');

    let parser = peggy.generate(grammar);

    let parsed = parser.parse(sourceCode);

    let generator = new Generator(parsed);

    fs.writeFileSync('wasm/output.wat', generator.generate());
}

main();
