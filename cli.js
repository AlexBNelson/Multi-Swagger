#! /usr/bin/env node
// //Passing in manifest url in command line https://stackoverflow.com/questions/42840422/webpack-dev-server-custom-parameters-from-command-line

// const {exec} = require('child_process')
// const process = require('process');


// let commandOne = "webpack serve --config webpack/dev.babel.js"
// let commandTwo = "cd " + __dirname
// let commandThree = "http-server -p 8521 --cors"
// var prefix = (process.platform === 'win32' ? ' start /B ' : ' && ');


// exec(prefix + commandOne)

// exec(prefix + commandTwo);
// exec(prefix + commandThree);


const { exec } = require('child_process')
const process = require('process');
var fs = require("fs-extra");
const tmp = require('tmp');



tmp.dir(function _tempDirCreated(err, path, cleanupCallback) {
    fs.readJson(process.cwd() + '\\manifest.json', 'utf8', (err, manifest) => {
        if (err) {
            console.error(err);
            return;
        }


        let services = manifest["Services"];

        fs.writeJson(path + "/manifest.json", manifest);

        services.forEach(service => {
            fs.readJSON(service["ExposedEndpoints"], 'utf8', (err, data) => {
                let midPath = path + "\\" + service["Name"] + ".json"
                fs.writeJson(midPath, data);
            })

        });


    });

    let modulepath = exec("npm root",
        function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }


            let commandZero = "cd " + stdout + "\multi-swagger"
            let commandTwo = "cd " + path
            let commandThree = "http-server -p 8521 --cors"
            var prefix = (process.platform === 'win32' ? ' start /B ' : ' && ');

            let commandOne = "webpack serve --config webpack/dev.babel.js"


            exec(prefix + commandZero)
            exec(prefix + commandOne)

            console.log(path)

            // exec(prefix + commandTwo);
            // exec(prefix + commandThree);

            let combinedCommand = "http-server " + path + " -p 8521 --cors"
            exec(prefix + combinedCommand);

        });



    // cleanupCallback();
});


