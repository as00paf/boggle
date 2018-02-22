/**
 *
 * <p>Title: Boggle</p>
 * <p>Description: fonction de la grille</p>
 * <p>Copyright: Copyright (c) 2007</p>
 * <p>Company: MEMODATA</p>
 * @author LOUP
 * @version 1.0
 */

// Case style
var CC_NOT_HIGHLIGHTED  = "cel0";
var CC_HIGHLIGHTED      = "cel1";
var CC_HIGHLIGHTED_LAST = "cel2";

// variables globales
var globalGrid        = null;
var currentSelection  = null;
var gridSize          = 0;
var gridSizeCarre     = 0;


// -----------------------------------------------
// Objet TBoggleCase
// -----------------------------------------------

function TBoggleCase( nLetter, nHtmlElement, nIndex )
{
  this.letter         = nLetter;
  this.htmlElement    = nHtmlElement;
  this.index          = nIndex;

  this.bInCurrentWord = false;
  this.neighbours     = new Array();

  this.getNeighbours = TBoggleCase_getNeighbours;
  this.setNeighbours = TBoggleCase_setNeighbours;
  this.isNeighbour   = TBoggleCase_isNeighbour;
  this.highlight     = TBoggleCase_highlight;
  this.equals        = TBoggleCase_equals;
  this.toString      = TBoggleCase_toString;
  this.getNeighboursWithLetter  = TBoggleCase_getNeighboursWithLetter;
}

// - - - - - - - - - - - - - - - - - - - - - - - -

function TBoggleCase_isNeighbour ( nCase )
{
  for ( var i = 0; i < this.neighbours.length; i++ )
    if ( this.neighbours[i].equals(nCase) )
      return true;
  return false;
}

// - - - - - - - - - - - - - - - - - - - - - - - -

function TBoggleCase_equals ( nCase )
{
  return this.index == nCase.index;
}

// - - - - - - - - - - - - - - - - - - - - - - - -

function TBoggleCase_setNeighbours ( nNeighbours )
{
  this.neighbours = nNeighbours;
}

// - - - - - - - - - - - - - - - - - - - - - - - -

function TBoggleCase_getNeighbours()
{
  return this.neighbours;
}

// - - - - - - - - - - - - - - - - - - - - - - - -

function TBoggleCase_toString()
{
  return this.index;
}

// - - - - - - - - - - - - - - - - - - - - - - - -

function TBoggleCase_getNeighboursWithLetter ( nLetter )
{
  var res = new Array();
  for ( var i = 0; i < this.neighbours.length; i++ )
    if ( ( this.neighbours[i].letter == nLetter ) && !this.neighbours[i].bInCurrentWord )
      res.push ( this.neighbours[i] );
  return res;
}

// - - - - - - - - - - - - - - - - - - - - - - - -

// nMode : 0 : normal = pas sélectionné
//       : 1 : sélectionné
//       : 2 : sélectionné dernière lettre  
function TBoggleCase_highlight ( nMode )
{
  if ( nMode == 0 )
  {
    this.htmlElement.setAttribute('class',CC_NOT_HIGHLIGHTED);
    this.htmlElement.setAttribute('className',CC_NOT_HIGHLIGHTED);
  }
  else 
  {
    if ( nMode == 1 )
    {
      this.htmlElement.setAttribute('class',CC_HIGHLIGHTED);
      this.htmlElement.setAttribute('className',CC_HIGHLIGHTED);
    }
    else if ( nMode == 2 )
    {
      this.htmlElement.setAttribute('class',CC_HIGHLIGHTED_LAST);
      this.htmlElement.setAttribute('className',CC_HIGHLIGHTED_LAST);
    }
  }
}

// -----------------------------------------------
// Objet TBoggleGrid
// -----------------------------------------------

function TBoggleGrid ( nSize, nLetters, nWords )
{
  this.bCoded = false;
  this.size   = nSize;
  this.cases  = new Array();
  this.words  = nWords;

  this.searchLetter  = TBoggleGrid_searchLetter;
  this.getLine       = TBoggleGrid_getLine;
  this.getRow        = TBoggleGrid_getRow;
  this.getIndex      = TBoggleGrid_getIndex;
  this.getCase       = TBoggleGrid_getCase;
  this.getNeighbours = TBoggleGrid_getNeighbours;
  this.searchWording = TBoggleGrid_searchWording;
  this.containsWord  = TBoggleGrid_containsWord;
  this.perfectScore  = scoreTools.getWordsListScore(nWords);
  this.codeWord      = TBoggleGrid_codeWord;
  this.decodeWord    = TBoggleGrid_decodeWord;

  for ( var i = 0; i < nLetters.length; i++ )
    this.cases.push ( new TBoggleCase(nLetters[i], document.getElementById("case_"+i), i) );

  for ( var i = 0; i < nLetters.length; i++ )
    this.cases[i].setNeighbours(this.getNeighbours(i)); 
}

// - - - - - - - - - - - - - - - - - - - - - - - -
function TBoggleGrid_codeWord ( nWord )
{
  var res = ""
  for ( var i = 0; i < nWord.length; i++ )
    res += String.fromCharCode(nWord.charCodeAt(i)+1) ;
  return res;
}
// - - - - - - - - - - - - - - - - - - - - - - - -
function TBoggleGrid_decodeWord ( nWord )
{
  var res = ""
  for ( var i = 0; i < nWord.length; i++ )
    res += String.fromCharCode(nWord.charCodeAt(i)-1) ;
  return res;
}
// - - - - - - - - - - - - - - - - - - - - - - - -

// @todo : dichotomie
function TBoggleGrid_containsWord ( nWord )
{
  var searchedWord = this.bCoded?this.codeWord(nWord):nWord;
  var s = 0;
  var e = this.words.length;
  var m = 0;
  while ( s < e )
  {
    m = Math.floor((s+e)/2);
    w = this.words[m];
    if ( searchedWord == this.words[m] )
      return true;
    if ( searchedWord < this.words[m] )
      e = m-1;
    else
      s = m+1;
  }
  return searchedWord == this.words[s];
}

// - - - - - - - - - - - - - - - - - - - - - - - -

// @todo : stocker le résultat dans la case pour ne pas le recalculer
function TBoggleGrid_getNeighbours ( nCaseIndex )
{
  var res  = new Array();
  var line = this.getLine(nCaseIndex );
  var row  = this.getRow(nCaseIndex );
  
  var left   = row-1;
  var right  = row+1;
  var top    = line-1;
  var bottom = line+1;

  if ( row == 0 )
    left = row;
  if ( row == this.size-1 )
    right = row;
  if ( line == 0 )
    top = line;
  if ( line == this.size-1 )
    bottom = line;

  for ( var l = top; l <= bottom; l++ )
    for ( var r = left; r <= right; r++ )
    if ( l != line || r != row )
      {
        var ndx = this.getIndex(l,r);
        res.push ( this.cases[ndx] );
      }

  return res;
}

// - - - - - - - - - - - - - - - - - - - - - - - -

function TBoggleGrid_getLine ( nCaseIndex )
{
  return Math.floor ( nCaseIndex / this.size );
}

// - - - - - - - - - - - - - - - - - - - - - - - -

function TBoggleGrid_getRow ( nCaseIndex )
{
  return nCaseIndex % this.size;
}

// - - - - - - - - - - - - - - - - - - - - - - - -

function TBoggleGrid_getIndex ( nLine, nRow )
{
  return ( nLine * this.size ) + nRow;
}

// - - - - - - - - - - - - - - - - - - - - - - - -

function TBoggleGrid_getCase ( nCaseIndex )
{
  return this.cases[nCaseIndex];
}

// - - - - - - - - - - - - - - - - - - - - - - - -
// Renvoie la position des lettres du mot données, null sinon 
//
function TBoggleGrid_searchWording ( nWording )
{
  if ( ( nWording == null ) || ( nWording.length == 0 ) )
    return;
  for (var i = 0;  i < this.cases.length; i++ )  
    this.cases[i].bInCurrentWord=false;

  var currentRes         = new Array();
  var currentLetterIndex = 0;
  currentRes[0] = this.searchLetter ( nWording.substring(0,1) );

  while (   ( currentLetterIndex >= 0 ) 
         && ( currentLetterIndex < nWording.length ) )
  {
    if ( currentRes[currentLetterIndex].length > 0 )
    {
      var currentCase = currentRes[currentLetterIndex][0];
      currentCase.bInCurrentWord = true;
      currentLetterIndex++;
      if ( currentLetterIndex < nWording.length )
        currentRes[currentLetterIndex] = currentCase.getNeighboursWithLetter(nWording.substring(currentLetterIndex,currentLetterIndex+1));
    }
    else
    {  
      currentLetterIndex--;
      if ( currentLetterIndex >= 0 )
      {
        currentRes[currentLetterIndex][0].bInCurrentWord = false;
        currentRes[currentLetterIndex].shift();
      }
    }
  }
  if ( currentLetterIndex <= 0 )
    return null; 
  else
  {
    var sRes = new Array();
    for ( i = 0; i < currentRes.length; i++ )
      sRes[i] = currentRes[i][0];
    return sRes;
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - -
// renvoie toutes les cases qui contiennent une lettre donnée
//
function TBoggleGrid_searchLetter ( nLetter )
{
  var res = new Array();
  for ( var i = 0; i < this.cases.length; i++ )
    if ( this.cases[i].letter == nLetter )
      res.push(this.cases[i]);
  return res;
}

