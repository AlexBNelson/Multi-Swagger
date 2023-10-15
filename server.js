// const http = require('http');
// var fs = require("fs-extra");
// const PORT = process.argv[2]
// const address = process.argv[3]
// const contentType = process.argv[4]



// const server = http.createServer((req, res) => {
//     fs.readFile(address, function(error, content) {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', contentType);
//         res.end(content, 'utf-8');
//     });
 
// })

// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

const { exec } = require('child_process')

const command = process.argv[2]

// var prefix = (process.platform === 'win32' ? ' start /B ' : ' && ');
// let combinedCommand = "http-server " + tmpobj.name + " -p 8521 --cors"
exec(command);
// // let commandOne = "webpack serve --config webpack/dev.babel.js"
// let commandTwo = "http-server ./dist -p 8532 --cors"

// exec(prefix + commandTwo)
// // exec(prefix + commandZero)
// // exec(prefix + commandOne)
