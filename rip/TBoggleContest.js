// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// affiche le resultat, les scores des joueurs 
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// ----------------------------------------------
// Demande des scores des différents joueurs
//
function askMultiPlayerGameResults ()
{
  var nManagerId = game.contest.managerId;
  var nContestId = game.contest.contestId;

  var xhr = null;
  if (window.XMLHttpRequest) 
    xhr = new XMLHttpRequest();
  else if (window.ActiveXObject) 
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  xhr.onreadystatechange = function() { getMultiPlayerGameResults(xhr); };
  xhr.open("POST", "ajax-get-ranking.jsp?mid="+nManagerId+"&cid="+nContestId , true);
  xhr.send(null);      
}


// ----------------------------------------------
// Récupération des scores des différents joueurs
//
function getMultiPlayerGameResults (nXhr)
{    
  if ( (nXhr.readyState == 4) && (nXhr.status == 200) )
  {
    var res  = nXhr.responseText;
    res = res.trim();
    var p = res.indexOf('\t');
    document.getElementById("liste-joueurs").innerHTML = res.substring(0,p);
    document.getElementById("rang-joueur").innerHTML = res.substring(p+1);
  }
}

