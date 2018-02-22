/**
 *
 * <p>Title: Boggle</p>
 * <p>Description: Le score d'un joueur pendant une partie</p>
 * <p>Copyright: Copyright (c) 2007</p>
 * <p>Company: MEMODATA</p>
 * @author LOUP & YP
 * @version 2.0
 */

var scoreTools = new TScorer();

function TScore ( nPlayerId, nScore )
{
  this.playerId = nPlayerId;
  this.score    = nScore;
}

// ---------------------------------------------------------
// Le score d'un joueur 
//  - le score courant
//  - la liste des mots trouvés

// Initialisation
//   @param nPerfect : le score de la grille
//   @param nScoreHtmlElementId : l'élément HTML d'affichage du score
//   @todo : virer perfect
function TPlayerScore ( nPerfect, nScoreHtmlElementId, nCountHtmlElementId )
{
  this.score                  = 0; 
  this.perfect                = nPerfect;
  this.scoreHtmlElement       = document.getElementById(nScoreHtmlElementId);
  this.foundHtmlElement       = document.getElementById(nCountHtmlElementId);
  this.wordsFound             = new Array();

  this.addWord = TPlayerScore_addWord;
  this.displayScore = TPlayerScore_displayScore;
  this.alreadyFound = TPlayerScore_alreadyFound;
  this.endGame = TPlayerScore_endGame;
}

// ---------------------------------------------------------
// PUBLIC
// ---------------------------------------------------------

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Mise à jour du score + Affichage du nouveau score
// @return le score du mot si le mot n'a pas déjà été trouvé, 0 sinon
function TPlayerScore_addWord ( nWord )
{
  if ( !this.alreadyFound(nWord) )
  {
    var s = scoreTools.getWordScore( nWord )
    this.score += s;
    this.wordsFound.push(nWord);
    this.displayScore();
    return s;
  }
  else
    return 0;
}

// ---------------------------------------------------------
// PRIVE
// ---------------------------------------------------------

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Indique si un mot à déjà été trouvé
//
function TPlayerScore_alreadyFound(nWord)
{
  for ( var i = 0 ; i < this.wordsFound.length ; i++ )
  {
    if ( nWord == this.wordsFound[i] )
      return true;
  }
  return false;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Affichage du score
//  - la valeur du score
//  - le nombre de mots trouvés
//
function TPlayerScore_displayScore()
{
  // affichage du score
  if ( this.scoreHtmlElement )
    this.scoreHtmlElement.innerHTML = ""+this.score;
  if ( this.foundHtmlElement )
    this.foundHtmlElement.innerHTML = ""+this.wordsFound.length;
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function TPlayerScore_endGame()
{
  if ( this.scoreHtmlElement )
    this.scoreHtmlElement.innerHTML = ""+this.score;
}

// *********************************************************
// TScorer
// *********************************************************

function TScorer()
{
  // R1 : SCORE_BY_WORD_LENGTH[i] = score d'un mot de longueur i
  // R2 : les mots plus longs (ici > 15 lettres) ont le score donné pour le mot le plus long (ici 79)
  this.SCORE_BY_WORD_LENGTH = [0,0,0,1,2,4,7,11,16,16,16,16,16,16,16,16];
  this.maxLength            = this.SCORE_BY_WORD_LENGTH.length;

  this.getWordsListScore = TScorer_getWordsListScore;
  this.getWordScore      = TScorer_getWordScore;
}

// ---------------------------------------------------------
// PUBLIC
// ---------------------------------------------------------

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Donne le score d'une liste de mots
//
function TScorer_getWordsListScore ( nWordsList )
{	
  res = 0;
  for ( i=0; i<nWordsList.length; i++ )
  {
    if (nWordsList[i].length < this.maxLength )
      res += this.SCORE_BY_WORD_LENGTH[nWordsList[i].length];
    else 
      res += this.SCORE_BY_WORD_LENGTH[this.maxLength-1];
  }
  return res;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Donne le score d'un mot
//
function TScorer_getWordScore ( nWord )
{
  var res = 0;
  if (nWord.length < this.maxLength)
    res = this.SCORE_BY_WORD_LENGTH[nWord.length];
  else
    res = this.SCORE_BY_WORD_LENGTH[this.maxLength-1];

  return res;
}



