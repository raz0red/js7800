import css from '../css/leaderboard.css'
import messageCss from '../../../src/css/common/message-common.css'
import restartImgSrc from '../images/restart.svg'
import gamepadImgSrc from '../images/gamepad-square.svg'
import * as Message from '../../../src/js/common/message-common.js'
import * as Util from '../../../src/js/common/util-common.js'

var REFRESH_INTERVAL = 60 * 1000;

var topPlayers10El = null;
var topPlayersEl = null;
var recentScoresEl = null;
var competitiveGamesEl = null;
var gameSelectEl = null;
var scoresTableEl = null;
var scoresTableTableEl = null;
var tableBodyEl = null;
var loaderContainerEl = null;
var currentScores = null;
var filterSelectEl = null;
var currentDigest = null;
var currentCart = null;
var currentFilter = null;
var playEl = null;
var cartHashes = {};

var NO_CACHE_PARAM_NAME = "noCache";
var noCacheParam = Util.getRequestParameter(NO_CACHE_PARAM_NAME);
var noCacheValue = noCacheParam && (noCacheParam == "1" || noCacheParam == "true"); 
var SUMMARY_URL = noCacheValue ? "/scoreboard-summary.php" : "/scoreboard-summary-cached.php"

function errorHandler(message) {
  Message.showErrorMessage(message);
  console.error(message);
}

function read(url, fSuccess, fFailure) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function () {
    try {
      if (xhr.status >= 300 || xhr.stats < 200) {
        throw xhr.status + ": " + xhr.statusText;
      } else {
        fSuccess(JSON.parse(xhr.responseText));
      }
    } catch (e) {
      fFailure(e);
    }
  };
  xhr.onerror = function() {
    fFailure('Error during read attempt: ' + url + "<br>(See console log for details)");
  }
  xhr.send();
}

function updateTopPlayers(scores, isLimit10) {
  var el = isLimit10 ? topPlayers10El : topPlayersEl;
  while (el.firstChild) el.removeChild(el.firstChild);
  for (var i = 0; i < scores.length; i++) {
    var row = scores[i];
    if (i > 0) {
      var sep = document.createElement('div');
      sep.className = 'infobox-entry-separator';
      el.appendChild(sep);
    }
    var entry = document.createElement('div');
    entry.className = 'infobox-entry';

    var flex = document.createElement('div');
    flex.className = 'infobox-entry-flex';
    var player = document.createElement('div');
    player.className = 'infobox-entry-callout infobox-entry-initials';
    player.innerHTML = row.initials_str;
    flex.appendChild(player);
    var points = document.createElement('div');
    points.className = 'infobox-entry-normal';    
    points.appendChild(document.createTextNode(
      (isLimit10 ? row.topScores : row.total) + " points"));
    flex.appendChild(points);
    entry.appendChild(flex);
    el.appendChild(entry);
  }
}

function updateRecentScores(scores) {
  var el = recentScoresEl;
  while (el.firstChild) el.removeChild(el.firstChild);
  for (var i = 0; i < scores.length; i++) {
    var ii = i;
    (function () {
      var row = scores[ii];
      if (i > 0) {
        var sep = document.createElement('div');
        sep.className = 'infobox-entry-separator';
        el.appendChild(sep);
      }
      var entry = document.createElement('div');
      entry.className = 'infobox-entry infobox-entry-select';
      entry.onclick = function() {
        loadScoresAndPushHistory(row.digest, row.giddid);
      }

      var player = document.createElement('div');
      player.className = 'infobox-entry-callout';
      player.innerHTML = row.initials_str + " &bull; " + row.score;

      var game = document.createElement('div');
      game.className = 'infobox-entry-normal';
      game.appendChild(document.createTextNode(row.game));    

      var diff = document.createElement('div');
      diff.className = 'infobox-entry-normal';
      diff.appendChild(document.createTextNode(row.diff));    

      var time = document.createElement('div');
      time.className = 'infobox-entry-normal';
      var d = new Date(row.epoch * 1000);        
      time.appendChild(document.createTextNode(d.toLocaleString()));    

      entry.appendChild(player);
      entry.appendChild(game);
      entry.appendChild(diff);
      entry.appendChild(time);

      el.appendChild(entry);
    })();
  }  
}

function updateMostCompetitive(games) {
  var el = competitiveGamesEl;
  while (el.firstChild) el.removeChild(el.firstChild);
  for (var i = 0; i < games.length; i++) {
    var ii = i;
    (function () {
      var row = games[ii];
      if (i > 0) {
        var sep = document.createElement('div');
        sep.className = 'infobox-entry-separator';
        el.appendChild(sep);
      }
      var entry = document.createElement('div');
      entry.className = 'infobox-entry infobox-entry-select';
      entry.onclick = function() {
        loadScoresAndPushHistory(row.digest, row.giddid);
      }
      var game = document.createElement('div');
      game.className = 'infobox-entry-callout';
      game.appendChild(document.createTextNode(row.game));    
  
      var diff = document.createElement('div');
      diff.className = 'infobox-entry-normal';
      diff.appendChild(document.createTextNode(row.diff));    
  
      var scores = document.createElement('div');
      scores.className = 'infobox-entry-normal';
      scores.appendChild(document.createTextNode(
        row.count + " scores " + " / " + row.players + " players"));    
  
      entry.appendChild(game);
      entry.appendChild(diff);
      entry.appendChild(scores);
  
      el.appendChild(entry);  
    })();
  }
}

function refreshSummary() {
  read(Util.getUrlPrefix() + SUMMARY_URL, function(summary) {
    //console.log(summary);
    updateTopPlayers(summary.topScoresByPlayer, true);
    updateTopPlayers(summary.totalPointsByPlayer, false);
    updateRecentScores(summary.recentScores);
    updateMostCompetitive(summary.competitiveGames);

    document.getElementById('top-players-top-10-box').style.visibility = 'visible';
    document.getElementById('top-players-box').style.visibility = 'visible';
    document.getElementById('recent-scores-box').style.visibility = 'visible';
    document.getElementById('most-competitive-box').style.visibility = 'visible';
  }, errorHandler); 
  setTimeout(refreshSummary, REFRESH_INTERVAL);
}

function updateScoresTable(filter) {  
  var scores = currentScores;
  var newBody = document.createElement('tbody');
  var lastDiff = "";

  var foundFilter = false;
  if (filter !== undefined) {
    for (var i = 0; i < filterSelectEl.length; i++){
      var option = filterSelectEl.options[i];
      if (option.value == filter) {
        filterSelectEl.value = filter;
        foundFilter = true;
        break;
      }
    }  
  }

  if (!foundFilter) {
    filter = null;
  }
  currentFilter = filter;

  if (scores.length == 0) {
    var row = document.createElement("tr");
    td = document.createElement("td");
    td.className =  'noscores';
    td.appendChild(document.createTextNode("No scores currently exist for this game."));
    td.setAttribute("colspan", "5");
    row.appendChild(td);
    newBody.appendChild(row);
  } else {    
    for(var i = 0; i < scores.length; i++) {      
      var s = scores[i];
      if ((filter === undefined) ||
          (filter === null) ||
          (filter === 'all') ||
          (filter == s.did.toString())) {
        var row = document.createElement("tr");
        if (s.rank == 1) {
          row.className = 'firstPlace';
        }
        var td = document.createElement("td");
        var diff = s.diff;      
        td.appendChild(document.createTextNode(lastDiff == diff ? '' : diff));
        lastDiff = diff;
        row.appendChild(td);
        td = document.createElement("td");
        td.className =  'rank';
        td.appendChild(document.createTextNode(s.rank + "."));
        row.appendChild(td);
        td = document.createElement("td");
        td.appendChild(document.createTextNode(s.initials_str));
        td.className =  'callout player';
        row.appendChild(td);
        td = document.createElement("td");
        td.appendChild(document.createTextNode(s.score));
        row.appendChild(td);
        td = document.createElement("td");
        var d = new Date(s.epoch * 1000);        
        td.appendChild(document.createTextNode(d.toLocaleString()));
        row.appendChild(td);

        newBody.appendChild(row);
      }
    }    
  }
  tableBodyEl.parentNode.replaceChild(newBody, tableBodyEl);
  tableBodyEl = newBody;
}

function updateSettingsList() {
  var scores = currentScores;

  var len = filterSelectEl.options.length;
  for (var i = len; i; i--) {
    var par = filterSelectEl.options[i - 1].parentNode;
    par.removeChild(filterSelectEl.options[i - 1]);
  }

  var option = document.createElement("option");
  option.text = '(All)';
  option.value = 'all'
  filterSelectEl.add(option);

  var dids = {};
  var settings = [];
  for(var i = 0; i < scores.length; i++) {
    var s = scores[i];
    var did = s.did;    
    var didStr = did.toString();
    var d = dids[didStr];
    if (d === undefined) {
      settings.push({"did": didStr, "diff": s.diff});
      dids[didStr] = true;
    }
  }

  // settings.sort(function(a, b) {
  //   var da = a.diff.toUpperCase();
  //   var db = b.diff.toUpperCase();
  //   if (da < db) {
  //     return -1;
  //   }
  //   if (da > db) {
  //     return 1;
  //   }
  //   return 0;
  // });

  for(var i = 0; i < settings.length; i++) {
    var s = settings[i];
    var option = document.createElement("option");
    option.text = s.diff;
    option.value = s.did;
    filterSelectEl.add(option);
  }  
}

function loadScores(digest, filter) {
  currentDigest = digest;
  loaderContainerEl.style.visibility = 'visible';
  gameSelectEl.value = digest;
  gameSelectEl.disabled = true;  
  setTimeout(function() {
    read(Util.getUrlPrefix() + "/scoreboard-scores.php?d=" + digest, function(scores) {
      currentScores = scores.scores;
      currentCart = null;
      if (scores.cart) {
        currentCart = scores.cart;
        playEl.style.display = 'inline-block';
      } else {
        playEl.style.display = 'none';
      }
      updateSettingsList();
      updateScoresTable(filter);      

      loaderContainerEl.style.visibility = 'hidden';
      gameSelectEl.disabled = false;
      gameSelectEl.blur();
    }, function(error) {
      loaderContainerEl.style.visibility = 'hidden';
      gameSelectEl.disabled = false;
      errorHandler(error);
    }); 
  }, 300);
}

function selectDefaultItem() {
  var digest = Util.getRequestParameter("d");
  var filter = Util.getRequestParameter("f");
  if (digest && !cartHashes[digest]) {
    console.log(cartHashes);
    digest = null;
    console.log('set to null');
  }
  if (!digest && gameSelectEl.options.length > 0) {
    digest = gameSelectEl.options[0].value;
  }
  if (digest) {
    loadScores(digest, filter);
  }
}

function pushHistory(digest, filter) {
  var state = {"d": digest};
  var url = "?d=" + digest;
  if (filter !== undefined) {
    state.f = filter;
    url += "&f=" + filter;
  }
  if (noCacheValue) {
    url += "&" + NO_CACHE_PARAM_NAME + "=true";
  }
  window.history.pushState(state, "", url);
}

function loadScoresAndPushHistory(digest, filter) {
  pushHistory(digest, filter);
  loadScores(digest, filter);   
}

function loadGamesList() {
  read(Util.getUrlPrefix() + "/scoreboard-games.php", function(games) {
    gameSelectEl.onchange = function() {      
      loadScoresAndPushHistory(this.value);
    };
    for(var g in games) {
      var option = document.createElement("option");
      option.text = g;
      var value = games[g];
      cartHashes[value] = value;
      option.value = value;
      gameSelectEl.add(option);
    }  
    selectDefaultItem();
  }, errorHandler); 
}

function start() {
  Message.init('leaderboard-content');  
  topPlayers10El = document.getElementById('top-players-top-10');
  topPlayersEl = document.getElementById('top-players');
  recentScoresEl = document.getElementById('recent-scores');
  competitiveGamesEl = document.getElementById('most-competitive');
  gameSelectEl = document.getElementById('games-select-select');  
  scoresTableEl = document.getElementById('scores-table');
  scoresTableTableEl = document.getElementById('scores-table-table');
  loaderContainerEl = document.getElementById("loader-container");
  filterSelectEl = document.getElementById("games-select-filter");
  tableBodyEl = document.createElement('tbody');  
  scoresTableTableEl.appendChild(tableBodyEl);

  // Restart button
  var restartEl = document.getElementById("restart-button");
  restartEl.onclick = function() {
    loadScores(currentDigest, currentFilter)
  }; 
  var img = document.createElement("img");  
  img.className = "button-image";
  img.src = restartImgSrc;
  img.setAttribute("title", "Refresh");
  restartEl.appendChild(img);

  // Play button
  playEl = document.getElementById("play-button");
  playEl.onclick = function() {
    if (currentCart) {
      window.open('../?cart=' + currentCart, '_blank' /*, 'noopener'*/); 
    }
  }
  var img = document.createElement("img");  
  img.className = "button-image";
  img.setAttribute("title", "Play");
  img.src = gamepadImgSrc;
  playEl.appendChild(img);

  filterSelectEl.onchange = function() {      
    pushHistory(currentDigest, this.value);
    updateScoresTable(this.value);   
  };

  window.addEventListener('popstate', function(event) {
    var state = event.state;
    if (state && state.d) {
      loadScores(state.d, state.f);
    } else {      
      selectDefaultItem();      
    }
  });  

  loadGamesList();
  refreshSummary();
}

export { start }
