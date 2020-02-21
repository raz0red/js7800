const readline = require('readline');
const fs = require('fs');
const args = process.argv.slice(2);

var lineReader = readline.createInterface({
    input: fs.createReadStream(args[0])
});

console.log(
    "var DATABASE = {");

var inEntry = false;
var firstValue = true;

lineReader.on('line', function (line) {
    var startBracket = line.indexOf("[");
    var endBracket = line.indexOf("]");

    if (startBracket >= 0 && endBracket >= 0) {
        firstValue = true;
        if (inEntry) {
            console.log("  },");
        } else {
            inEntry = true;
        }
        console.log("  '" + line.substring(startBracket + 1, endBracket) + "': {");
    } else {
        var values = line.split("=");
        if (values.length == 2) {
            var value = values[1].replace("'", "\\'");
            value = value.replace('"', '\\"');
            console.log(
                (!firstValue ? "    ," : "    ") + values[0].trim() + ": '" + value.trim() + "'");
            firstValue = false;
        }
    }
});

lineReader.on('close', function () {
    if (inEntry) {
        console.log("  }");
    }
    console.log(
        "}\n\n" +
        "export { DATABASE };");
});
