Tool for inspecting package-lock.json file to determine, why some package installed.

## Installing

npm install npm-dependency-inspector -g


## Usage

```
npm-dependency-inspector [options] <command> [inputFile]

Arguments:
  inputFile               package-lock.json file to analyze (default: "package-lock.json")

Options:
  -o, --out <outputFile>  Output file path (default: "explain.json")
  -h, --help                            display help for command

Commands:
  explain [options] [inputFile]         Explain for every package reason, why
                                        it was installed.
  dependency-map [options] [inputFile]  Show direct dependencies for every
                                        package.
  dependents-map [options] [inputFile]  Show, who directly uses package for
                                        every package.
  depenency-tree [options] [inputFile]  Build depenecies tree
  help [command]                        display help for command

```

Usage examples:

> npm-dependency-inspector explain

> npm-dependency-inspector explain package-lock.json -out result.json

## Output format

Let create simple package, and look at Inspector output for it.

> npm init

> npm i react

> npm-dependency-inspector explain

We will see next explain.json:

```
{
  "js-tokens": [
    "react     (js-tokens <- loose-envify <- react)"
  ],
  "loose-envify": [
    "react     (loose-envify <- react)"
  ],
  "react": [
    "react     (direct dependency)"
  ]
}
```

It means, that we have 3 dependencies: js-tokens, loose-envify and react. But why? We have only installed react! There explanation:

* loose-envify installed, because it is dependency of react
* js-tokens installed, becaus it is dependecny of loose-envify, that is dependency of react

So explanation row consist of next parts:

```
"package, that we have": [
  "our direct dependency, that is reason, why package installed"      (path of dependency)
]
```