var formatJson = require("format-json");
var fs = require("fs");
var walk = require("walk");
var path = require("path");
var eol = require("eol");

var root = ".";

if(process.argv.length > 2) {
    root = process.argv[2];
}

console.log("Checking " + root + "...");

var walker = walk.walk(root, {
    filters: [".git"]
});

walker.on("file", function(root, fileStat, next) {
    var ext = path.extname(fileStat.name);
    if(ext === ".json") {
        //console.log("Prettifying " + fileStat.name);
        prettify(path.join(root, fileStat.name), next);
    } else {
        //console.log("Skipping " + fileStat.name);
        next();
    }
});

walker.on("end", function() {
    console.log("done.");
});


function prettify(name, next) {
    
    fs.readFile(name, "utf-8", function(err, data) {
        if(err) throw err;
        
        var obj = JSON.parse(data);
        var newData = formatJson.diffy(obj);
        
        newData = eol.auto(newData);
        
        if(newData === data) {
            next();
            return;
        }
        
        console.log("Prettifying " + name);
        
        fs.writeFile(name, newData, "utf-8", function(err) {
            if(err) throw err;
            next();
        });
    });
}