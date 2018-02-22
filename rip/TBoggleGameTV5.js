//
// <p>Title: Boggle</p>
// <p>Description: Une partie </p>
// <p>Copyright: Copyright (c) 2008</p>
// <p>Company: MEMODATA</p>
// @author YP
// @version 3.0

// parametre externe : playerId

var FOUND_WORD_COLOR           = "green";
var FOUND_BY_OTHERS_WORD_COLOR = "red";

function TBoggleGame ( nCurrentContestId, nNextContestId, nDisplayLanguage, nResultsHtmlElementId, nPlayerId, nMultiPlayerGame )
{
  this.displayLanguage      = nDisplayLanguage;
  this.playerId             = nPlayerId;
  this.resultsHtmlElementId = nResultsHtmlElementId;
  this.bMultiPlayerGame     = nMultiPlayerGame;
  this.currentContestId     = nCurrentContestId;
  this.nextContestId        = nNextContestId;
  this.bCountToNext         = false;

  this.gridLanguage = "fr";
  this.grid        = null;
  this.highlighted = null;
  this.wordList    = null;
  this.input       = null;
  this.historic = new TBoggleHistoric();
  this.definition = document.getElementById("iframeRes");

  this.bEnded = false;

  this.click = TBoggleGame_click;
  this.addWord = TBoggleGame_addWord;
  this.getWord = TBoggleGame_getWordFromInput;
  this.clearInput = TBoggleGame_clearInput;
  this.highlightWordingFromInput = TBoggleGame_highlightWordingFromInput;
  this.highlightWording = TBoggleGame_highlightWording;
  this.getWordFromInput = TBoggleGame_getWordFromInput;
  this.displayResult = TBoggleGame_displayResult;
  this.endGame = TBoggleGame_endGame;
  this.clearRunningZones = TBoggleGame_clearRunningZones;

  this.buildWordLink = TBoggleGame_buildWordLink;
  this.buildWordsListDiv = TBoggleGame_buildWordsListDiv;
  this.showDefinition = TBoggleGame_showDefinition;
}

// ---------------------------------------------------------
// PUBLIC
// ---------------------------------------------------------

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Réponse à ENTER/VALIDER -> ajout d'un mot 
//
function TBoggleGame_addWord()
{
  var w = this.getWordFromInput();
  if ( !this.bEnded && ( w.length > 2 ) )
  {
    var bOK = 0;
    if ( this.grid.containsWord(w) ) 
      bOK =  this.score.addWord(w);
    this.wordList.addWord(w, (bOK!=0), bOK );
    this.historic.addWord(w);

    // on signale au serveur le nouveau score du joueur (pour la mise à jour du score du meilleur joueur) 
    if ( bOK && this.bMultiPlayerGame ) 
    {
      var xhr = null;
      var url = "ajax-add-wording.jsp?pid="+this.playerId+"&score="+this.score.score+"&w="+w+"&cid="+this.currentContestId;
      if (window.XMLHttpRequest)  
        xhr = new XMLHttpRequest();
      else if (window.ActiveXObject) 
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      xhr.open("POST", url , true);
      xhr.send(null);
    }

  }
  this.clearInput();
  this.highlighted.clear();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Réponse au clic sur une case
//
function TBoggleGame_click(nCaseIndex)
{
  var c = this.grid.getCase(nCaseIndex);
  var res = this.highlighted.click(c);
  if ( res == 1 )
    this.input.value = this.input.value+c.letter;
  else if ( res == -1 )
    this.input.value = this.input.value.substring(0,this.input.value.length-1);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Réponse à la frappe d'une touche dans l'input
//
function TBoggleGame_highlightWordingFromInput ( e )
{
  var k;
  if (!e) e=event;
  if ( e.which ) k = e.which;
  if ( e.keyCode ) k = e.keyCode;
  if ( k == 38 )
    this.input.value = this.historic.getNextWord();
  else if ( k == 40 )
    this.input.value = this.historic.getPreviousWord();
  else if ( k == 27 )
    this.input.value = "";
  var w = this.getWordFromInput();
  var cases = this.grid.searchWording(w);
  this.highlighted.clear();
  this.highlighted.addCases(cases);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Réponse à la frappe d'une touche dans l'input
//
function TBoggleGame_highlightWording ( nWord )
{
  var cases = this.grid.searchWording(nWord);
  this.highlighted.clear();
  this.highlighted.addCases(cases);
}

// ---------------------------------------------------------
// PRIVE
// ---------------------------------------------------------

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Fin de partie 
//
function TBoggleGame_endGame() 
{
  if ( !this.bEnded )
  {
    this.bEnded = true;
    if ( this.timer )
      this.timer.stop();
    this.clearRunningZones();
    if ( this.scorer )
      this.scorer.stop();
    this.score.endGame();
    this.displayResult();
    document.getElementById('tit-mots2').innerHTML = document.getElementById('tit-mots2').innerHTML + " ("+this.score.perfect+"pts)";
    if ( this.scoreTimer )
      clearInterval( this.scoreTimer );
    document.getElementById("wordId").focus();
    this.displayResult();
    hideById("saisie");
    try { document.getElementById("wordId").focus(); } catch (e) {}
//    if ( this.bMultiPlayerGame && ( this.bCountToNext || ( this.score.score > 0 ) ) )
    if ( this.bMultiPlayerGame )
    {
      this.nexttimer = new TBoggleNextGameTimerTV5 ( 0, "nextCountdown", this.playerId, this.nextContestId );
      this.nexttimer.start();
    }
//    else
//      alert ( this.bMultiPlayerGame + " - " + this.bCountToNext + " - " + this.score.score );
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// On efface l'input
//
function TBoggleGame_clearInput()
{
  this.input.value = "";
  this.input.focus();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// On récupère le mot dans l'input
//
function TBoggleGame_getWordFromInput()
{
  return this.input.value.toUpperCase();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// affiche les scores des autres joueurs, le résultat du joueur et le retour à l'index
// fonctions externes : printWording (mise en surbrillance)
function TBoggleGame_displayResult()
{
  this.buildWordsListDiv ( this.grid.words, this.score );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// On efface les éléments du jeu pour afficher le résultat
//  - bouton STOP
//  - input et bouton VALIDER
function TBoggleGame_clearRunningZones ( )
{
  try { 
    hideById("btnStop");
    showById("btnRejouer");
  } catch (e) {}

  hideById("temps");
  hideById("ok2");
  hideById("tit-mots");
  showById("tit-mots2");
  showById("fin-partie");
  showById("definition");
  showById("txt-finjeu");
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Génère le HTML de la div des mots de la grille
// @todo : nFoundByOthers
function TBoggleGame_buildWordsListDiv ( nGridWords, nPlayerResult )
{
  var res = document.getElementById(this.resultsHtmlElementId);
  if (res)
  {
    while ( res.firstChild )
      res.removeChild(res.firstChild);

    var byLength = new Array();
    for ( i = 0;i < 16;i++)
      byLength[i] = new Array();
    for ( i = 0;i < nGridWords.length;i++)
      byLength[nGridWords[i].length].push(nGridWords[i]);

    for ( i = this.grid.cases.length-1; i > 0; i-- )
    {
      if ( byLength[i].length > 0 )
      {
        var ldiv = document.createElement("div");
        ldiv.setAttribute ( "class", "result" );
        ldiv.setAttribute ( "className", "result" );
        for ( j = 0; j < byLength[i].length; j++ )
        {
          w = this.grid.bCoded?this.grid.decodeWord(byLength[i][j]):byLength[i][j];
          ldiv.appendChild(this.buildWordLink ( w, nPlayerResult.alreadyFound(w), false, (j==byLength[i].length-1) ));      
          ldiv.appendChild(document.createTextNode(" "));
        }
        res.appendChild(ldiv);
      }
    }
  }
  else
    alert ( "[TBoggleGame] buildWordsListDiv() : " + this.resultsHtmlElementId  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Génère le HTML du lien pour un mot du résultat de la grille
//
function TBoggleGame_buildWordLink ( nWord, nFound, nFoundByOthers, nLast )
{
  var res = document.createElement("span");

  var link   =   document.createElement("a");
  if ( this.displayLanguage == 'fr' )
    link.setAttribute("href","javascript:game.showDefinition('"+nWord+"');void 0;");
  link.onmouseover= function () { game.highlightWording(nWord) };
  link.onmouseout= function () { game.highlightWording("") };
  if ( nFound )
    setClass(link,"found");
//  else if ( nFoundByOthers )
//    link.style.color = FOUND_BY_OTHERS_WORD_COLOR;
  link.appendChild(document.createTextNode(nWord));

  res.appendChild(link);
      
  res.appendChild(document.createTextNode(' '));
  return res;
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function TBoggleGame_showDefinition ( nWording )
{
//  this.definition.src="http://www.sensagent.com/alexandria-popup/getDataAlexandria.jsp?w="+nWording+"&sl="+this.gridLanguage+"&dl="+this.displayLanguage+"&s=mixmot";
  this.definition.src="http://service.sensagent.com/services/html/tv5-zigmo/getHtml.TV5.jsp?w="+nWording+"&sl="+this.gridLanguage+"&dl="+this.displayLanguage+"&s=mixmot";
}
