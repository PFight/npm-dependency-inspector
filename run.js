#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');

program
  .name('npm-dependency-inspector')
  .version("0.1");

program.command('explain')
  .description('Explain for every package reason, why it was installed.')
  .argument('[inputFile]', 'package-lock.json file to analyze', 'package-lock.json')
  .option('-o, --out <outputFile>', 'Output file path', 'explain.json')
  .action(run);

program.command('dependency-map')
  .description('Show direct dependencies for every package.')
  .argument('[inputFile]', 'package-lock.json file to analyze', 'package-lock.json')
  .option('-o, --out <outputFile>', 'Print direct dependencies for every package.', 'dependency-map.json')
  .action(run);

program.command('dependents-map')
  .description('Show, who directly uses package for every package.')
  .argument('[inputFile]', 'package-lock.json file to analyze', 'package-lock.json')
  .option('-o, --out <outputFile>', 'Print for every package who uses directly.', 'dependents-map.json')
  .action(run);

program.command('depenency-tree')
  .description('Build depenecies tree')
  .argument('[inputFile]', 'package-lock.json file to analyze', 'package-lock.json')
  .option('-o, --out <outputFile>', 'Build dependency hierarchy.', 'depenency-tree.json')
  .action(run);
  

function run(inputFile, options, command) {
    console.info("Running " + command.name() + " for " + inputFile);

    var fileContent = fs.readFileSync(inputFile);
    var root = JSON.parse(fileContent);

    // Какие модули требуются для данных модулей
    var dependencyMap = {};
    // Какие модули требуют данный модуль
    var dependentsMap = {};

    var modules = [];

    function collectDependecies(dependencies) {
        for (let dependency in dependencies) {
            if (!modules.includes(dependency)) {
                modules.push(dependency);
            }
            let depenecyInfo = dependencies[dependency];
            for (let requiredModule in depenecyInfo.requires) {
                dependencyMap[dependency] = dependencyMap[dependency] || [];
                if (!dependencyMap[dependency].includes(requiredModule)) {
                    dependencyMap[dependency].push(requiredModule);
                }
                if (!modules.includes(requiredModule)) {
                    modules.push(requiredModule);
                }
                dependentsMap[requiredModule] = dependentsMap[requiredModule] || [];
                if (!dependentsMap[requiredModule].includes(dependency)) {
                    dependentsMap[requiredModule].push(dependency);
                }
            }
            if (depenecyInfo.dependencies) {
                collectDependecies(depenecyInfo.dependencies);
            }
        }
    }
    collectDependecies(root.dependencies);

    var depenedentsList = {};
    for (let module of modules) {
        var dependents = [];
        findRootDepenents(module, dependents, [module]);
        depenedentsList[module] = dependents;
    }

    function findRootDepenents(module, dependents, path) {
        if (dependentsMap[module] && path.filter(x => x === module).length <= 1) {
            for (let dependent of dependentsMap[module]) {
                findRootDepenents(dependent, dependents, [...path, dependent]);
            }
        } else {
            if (!dependents.includes(module)) {
                if (module === "docsvision.web") {
                    module = path[path.length - 2];
                }
                if (path.length === 1) {
                    dependents.push(module + "     (direct dependency)");
                } else {
                    dependents.push(module + "     (" + path.join(" <- ") + ")");
                }
                
            }
        }
    }

    if (command.name() === 'explain') {
        fs.writeFileSync(options.out, JSON.stringify(depenedentsList, null, 2));
        console.info("Result written to " + options.out);
    } else if (command.name() === 'dependency-map') {
        fs.writeFileSync(options.out, JSON.stringify(dependencyMap, null, 2));
        console.info("Result written to " + options.out);
    } else if (command.name() === 'dependents-map') {
        fs.writeFileSync(options.out, JSON.stringify(dependentsMap, null, 2));
        console.info("Result written to " + options.out);
    } else if (command.name() === 'depenency-tree') {
        var tree = {};
        for (let dependency in root.dependencies) {
            if (!dependentsMap[dependency]) {
                var depencyObject = tree[dependency] = {};
                buildDepenencyTree(dependency, depencyObject, 0, [dependency]);
            }
        }
    
        function buildDepenencyTree(dependency, dependencyObject, level, path) {
            if (path.filter(x => x === dependency).length > 1) {
                return;
            }
            if (dependencyMap[dependency]) {
                for (let child of dependencyMap[dependency]) {
                    var childObject = dependencyObject[child] = {};
                    buildDepenencyTree(child, childObject, level + 1, [...path, child]);
                }
            }
        }
    
        fs.writeFileSync(options.out, JSON.stringify(tree, null, 2));
        console.info("Result written to " + options.out);
    }
}



program.parse();
