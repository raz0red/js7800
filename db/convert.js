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

  if (!line.trim().startsWith("#")) {
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
        var key = values[0].trim();
        if (key == 'controller1') 
          key = 'c1';
        else if (key == 'controller2') 
          key = 'c2';
        else if (key == 'pokey') 
          key = 'p';
        else if (key == 'pokey450') 
          key = 'p4';
        else if (key == 'title') 
          key = 't';
        else if (key == 'type') 
          key = 'ty';
        else if (key == 'region') 
          key = 'r';
        else if (key == 'swapbuttons')
          key = 'sb';                    
        else if (key == 'hsc')
          key = 'hs';                    
        var value = values[1].replace("'", "\\'");
        value = value.replace('"', '\\"');
        if (value == 'true')
          value = 't';
        else if (value == 'false')
          value = 'f';

        if (key != 't') {
          console.log(
            (!firstValue ? "    ," : "    ") + key + ": '" + value.trim() + "'");
          firstValue = false;
        }
      }
    }
  }
});

lineReader.on('close', function () {
  if (inEntry) {
    console.log("  }");
  }
  console.log(
    "}\n\n" +
    "export { DATABASE }");
});
