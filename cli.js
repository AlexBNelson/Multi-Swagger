#! /usr/bin/env node
// //Passing in manifest url in command line https://stackoverflow.com/questions/42840422/webpack-dev-server-custom-parameters-from-command-line


//const { exec } = require('child_process')
const process = require('process');
var fs = require("fs-extra");
const tmp = require('tmp');

const cp = require('child_process');
const opener = require('opener')

var manifestPath = process.argv[2];





const tmpobj = tmp.dirSync({ unsafeCleanup : true });

fs.readJson(manifestPath, 'utf8', (err, manifest) => {
    if (err) {
        console.error(err);
        return;
    }
    
    let services = manifest["Services"];
    fs.writeJson(tmpobj.name + "/manifest.json", manifest);

    services.forEach(service => {
        if(service["Endpoints"]){
            fs.readJSON(service["Endpoints"], 'utf8', (err, data) => {
                let midPath = tmpobj.name + "\\" + service["Name"] + ".json"
                fs.writeJson(midPath, data);
            })
        }else{
            let midPath = tmpobj.name + "\\" + service["Name"] + ".json"
            let data = "{\r\n  \"openapi\": \"3.0.1\",\r\n  \"info\": {\r\n    \"title\": \"RoomServiceApi\",\r\n    \"version\": \"1.0\"\r\n  },\r\n  \"paths\": {\r\n              \r\n  }\r\n}"
                let jsonData = JSON.parse(data)

                jsonData["info"]["title"]= service["Name"]
                console.log(jsonData["info"]["title"])
            fs.writeJson(midPath, jsonData);
        }
        

    });
});

var prefix = (process.platform === 'win32' ? ' start /B ' : ' && ');

let commandOne = prefix + "http-server " + tmpobj.name + " -p 8521 --cors"
let commandTwo = prefix + "http-server " + __dirname + "\\dist -p 8532 --cors"

console.log(commandTwo)
console.log(__dirname + '\\server.js')
	
    cp.fork(__dirname + '\\server.js', [commandTwo]);
    cp.fork(__dirname + '\\server.js', [commandOne]);

   opener("http://localhost:8532")











// let root

// exec("npm root",
//     function (error, stdout, stderr) {
//         console.log('stdout: ' + stdout);
//         console.log('stderr: ' + stderr);
//         if (error !== null) {
//             console.log('exec error: ' + error);
//         }
//         root = stdout
//     })


// // let commandZero = "cd " + __dirname
// var prefix = (process.platform === 'win32' ? ' start /B ' : ' && ');
// let combinedCommand = "http-server " + tmpobj.name + " -p 8521 --cors"
// exec(prefix + combinedCommand);
// // let commandOne = "webpack serve --config webpack/dev.babel.js"
// let commandTwo = "http-server ./dist -p 8532 --cors"

// exec(prefix + commandTwo)
// // exec(prefix + commandZero)
// // exec(prefix + commandOne)

// cpuCount.forEach((cpu, index) => {
// 	const PORT = `${4000 + index * 10}`
// 	console.log(`Starting server on port ${PORT} with cpu ${cpu.model}, speed ${cpu.speed}`);
// 	cp.fork('./server.js', [PORT]);
// });


function exitHandler(options, exitCode) {
    console.log("exiting")
    fs.rmSync(tmpobj.name, { recursive: true, force: true });
    tmpobj.removeCallback();
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

process.on('SIGINT', function() {
    console.log("exiting")
    fs.rmSync(tmpobj.name, { recursive: true, force: true });
    tmpobj.removeCallback();
    process.exit();
  });

// tmp.dir({ unsafeCleanup : true }, function _tempDirCreated(err, path, cleanupCallback) {
//     fs.readJson(process.cwd() + '\\manifest.json', 'utf8', (err, manifest) => {
//         if (err) {
//             console.error(err);
//             return;
//         }


//         let services = manifest["Services"];

//         fs.writeJson(path + "/manifest.json", manifest);

//         services.forEach(service => {
//             fs.readJSON(service["Endpoints"], 'utf8', (err, data) => {
//                 let midPath = path + "\\" + service["Name"] + ".json"
//                 fs.writeJson(midPath, data);
//             })

//         });


//     });

//     let root

//     exec("npm root",
//         function (error, stdout, stderr) {
//             console.log('stdout: ' + stdout);
//             console.log('stderr: ' + stderr);
//             if (error !== null) {
//                 console.log('exec error: ' + error);
//             }
//             root = stdout
//         })


//     let commandZero = "cd " + root + "\multi-swagger"
//     var prefix = (process.platform === 'win32' ? ' start /B ' : ' && ');

//     let commandOne = "webpack serve --config webpack/dev.babel.js"


//     let proc = exec(prefix + commandZero)
//     exec(prefix + commandOne)

//     console.log(proc)

//     let combinedCommand = "http-server " + path + " -p 8521 --cors"
//     exec(prefix + combinedCommand);



//     cleanupCallback();
// });