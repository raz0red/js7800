import { unzip } from "./zip-site.js"
import * as Util from "./util.js"
import * as Events from "./events.js"
import * as Message from "./message.js"

var js7800 = null;
var ntscEnabled = false;
var ntscUrl = "";
var palEnabled = false;
var palUrl = "";
var palBios = null;
var ntscBios = null;

function setNtscEnabled(v) {
  ntscEnabled = v;
}

function isNtscEnabled() {
  return ntscEnabled;
}

function setPalEnabled(v) {
  palEnabled = v;
}

function isPalEnabled() {
  return palEnabled;
}

function setNtscUrl(v) {
  if (v !== ntscUrl) {
    ntscBios = null;
  }
  ntscUrl = v;
}

function getNtscUrl() {
  return ntscUrl;
}

function setPalUrl(v) {
  if (v !== palUrl) {
    palBios = null;
  }
  palUrl = v;
}

function getPalUrl() {
  return palUrl;
}

function handleError(cb, message) {
  console.error(message);  
  Message.showErrorMessage(message);
  setTimeout(cb, 1000); // Wait a bit and then run cart (after error)
}

function loadBios(js7800) {
  var Bios = js7800.Bios;  
  js7800.Main.setLoadBiosCallback(function (isNtsc, cb) {    
    //console.log("Load BIOS: isNtsc=" + isNtsc);
    var enabled = isNtsc ? ntscEnabled : palEnabled;
    //console.log("  Enabled: " + enabled);      

    // Disable BIOS
    Bios.SetEnabled(false);

    if (enabled) {
      var url = isNtsc ? ntscUrl : palUrl;
      var bios = isNtsc ? ntscBios : palBios;      
      //console.log("  URL: " + url);      
      //console.log("  Cached: " + (bios != null ? "true" : "false"));

      if (bios == null) {
        var biosName = isNtsc ? "NTSC" : "PAL";
        
        var loadingMessageId = Message.showMessage("Loading " + biosName  + " BIOS.");
        var loadMessageTimeout = 750;
        
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.open('GET', Util.addRomUrlPrefix(url));
        xhr.onload = function () {
          try {
            if (xhr.status >= 300 || xhr.status < 200) {
              throw xhr.status + ": " + xhr.statusText;
            } else {
              Message.hideMessage(loadingMessageId, loadMessageTimeout);
              unzip(xhr.response,
                function (file) {
                  var reader = new FileReader();
                  reader.readAsBinaryString(file);
                  reader.onloadend = function () {
                    var result = reader.result;
                    var len = result.length;
                    var cart = new Array(len);
                    for (var i = 0; i < len; i++) {
                      cart[i] = result.charCodeAt(i);
                    }
                    Bios.SetEnabled(true);
                    Bios.SetBios(cart);

                    // Cache BIOS
                    if (isNtsc) {
                      ntscBios = cart;
                    } else {
                      palBios = cart;
                    }

                    cb(); // Run with BIOS
                  }
                },
                function(msg) { handleError(cb, msg); }
              );            
            }                                    
          } catch (e) {
            handleError(cb,
              "An error occurred during the " +  biosName + 
              " BIOS load attempt.<br>(" + e + ")<br> (see console log for details)");
          }                    
        }
        xhr.onerror = function () {
          handleError(cb,
            "An error occurred during the " + biosName + 
            "BIOS load attempt.<br>(see console log for details)");
        };          
        xhr.send();        
      } else {        
        Bios.SetEnabled(true);
        Bios.SetBios(bios);
        cb(); // Cached BIOS
      }
    } else {      
      cb(); // BIOS is disabled
    }
  });
}

Events.addListener(new Events.Listener("siteInit",
  function (event) {
    loadBios(event.js7800);
  }
));

export {
  setNtscEnabled,
  isNtscEnabled,
  setPalEnabled,
  isPalEnabled,
  setNtscUrl,
  getNtscUrl,
  setPalUrl,
  getPalUrl
}
