import css from '../css/leaderboard.css'
import messageCss from '../../../src/css/common/message-common.css'
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
    var row = scores[i];
    if (i > 0) {
      var sep = document.createElement('div');
      sep.className = 'infobox-entry-separator';
      el.appendChild(sep);
    }
    var entry = document.createElement('div');
    entry.className = 'infobox-entry';

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
  }  
}

function updateMostCompetitive(games) {
  var el = competitiveGamesEl;
  while (el.firstChild) el.removeChild(el.firstChild);
  for (var i = 0; i < games.length; i++) {
    var row = games[i];
    if (i > 0) {
      var sep = document.createElement('div');
      sep.className = 'infobox-entry-separator';
      el.appendChild(sep);
    }
    var entry = document.createElement('div');
    entry.className = 'infobox-entry';

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
  }
}

function refreshSummary() {
  read(Util.getUrlPrefix() + "/scoreboard-summary.php", function(summary) {
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

function loadScores(digest, push) {
  var style = window.getComputedStyle(scoresTableEl, null);
  loaderContainerEl.style.width = style.getPropertyValue("width");
  loaderContainerEl.style.height = style.getPropertyValue("height");
  loaderContainerEl.style.visibility = 'visible';
  if (push) {
    window.history.pushState({"d": digest}, "", "?d=" + digest);   
  }
  gameSelectEl.value = digest;
  gameSelectEl.disabled = true;  
  setTimeout(function() {
    read(Util.getUrlPrefix() + "/scoreboard-scores.php?d=" + digest, function(scores) {
      var newBody = document.createElement('tbody');
      var lastDiff = "";
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
      tableBodyEl.parentNode.replaceChild(newBody, tableBodyEl);
      tableBodyEl = newBody;

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
  if (!digest && gameSelectEl.options.length > 0) {
    digest = gameSelectEl.options[0].value;
  }
  if (digest) {
    loadScores(digest, false);
  }
}

function loadGamesList() {
  read(Util.getUrlPrefix() + "/scoreboard-games.php", function(games) {
    gameSelectEl.onchange = function() {      
      loadScores(this.value, true);   
    };
    for(var g in games) {
      var option = document.createElement("option");
      option.text = g;
      option.value = games[g];
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
  tableBodyEl = document.createElement('tbody');  
  scoresTableTableEl.appendChild(tableBodyEl);

  window.addEventListener('popstate', function(event) {
    var state = event.state;
    if (state && state.d) {
      loadScores(state.d, false);
    } else {      
      selectDefaultItem();      
    }
  });  

  loadGamesList();
  refreshSummary();
}

export { start }