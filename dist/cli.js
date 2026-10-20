#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Demo CLI: index a list of terms (from a file or arguments) and print the
 * top fuzzy matches for a query.
 *
 *   fuzzy-search "aple" apple apply applet banana
 *   fuzzy-search -f words.txt --limit 5 "wrld"
 */
const fs_1 = require("fs");
const fuzzyIndex_1 = require("./fuzzyIndex");
function printUsage() {
    console.log(`Usage:
  fuzzy-search [-f <terms-file>] [--limit N] [--distance N] <query> [term...]

Reads candidate terms from a file (one per line) or from trailing arguments,
then prints the best fuzzy matches for <query> with their scores.`);
}
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
        printUsage();
        process.exit(args.length === 0 ? 1 : 0);
    }
    let terms = [];
    let limit = 10;
    let maxDistance = 2;
    let query = "";
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "-f" || arg === "--file") {
            const path = args[++i];
            if (!path)
                throw new Error("missing file path after -f");
            terms = (0, fs_1.readFileSync)(path, "utf-8")
                .split(/\r?\n/)
                .map((t) => t.trim())
                .filter((t) => t.length > 0);
        }
        else if (arg === "--limit") {
            limit = parseInt(args[++i] ?? "", 10);
            if (Number.isNaN(limit))
                throw new Error("--limit needs a number");
        }
        else if (arg === "--distance") {
            maxDistance = parseInt(args[++i] ?? "", 10);
            if (Number.isNaN(maxDistance))
                throw new Error("--distance needs a number");
        }
        else if (!query) {
            query = arg;
        }
        else {
            terms.push(arg);
        }
    }
    if (!query) {
        printUsage();
        process.exit(1);
    }
    if (terms.length === 0) {
        console.error("error: no candidate terms given (use -f <file> or list terms)");
        process.exit(1);
    }
    const index = new fuzzyIndex_1.FuzzyIndex();
    index.addAll(terms, (t) => t);
    const results = index.search(query, { limit, maxDistance });
    if (results.length === 0) {
        console.log(`no matches for "${query}" within distance ${maxDistance}`);
        return;
    }
    for (const { item, score } of results) {
        console.log(`${score.toFixed(3)}\t${item}`);
    }
}
main();
//# sourceMappingURL=cli.js.map