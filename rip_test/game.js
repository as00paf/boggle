//Main Boggle Game

this.grid        = null;
this.highlighted = null;
this.wordList    = null;
this.input       = null;
this.enteredWords = new EnteredWords();

this.bEnded = false; //I think this should be hasGameEnded

//Validate word
function Game_addWord(){
  var w = this.getWordFromInput();
  if ( !this.bEnded && ( w.length > 2 ) ){
	var bOK = 0;
	if ( this.grid.containsWord(w) ){
		bOK =  this.score.addWord(w);
	}
	this.wordList.addWord(w, (bOK!=0), bOK );
	this.enteredWords.addWord(w);

	//TODO : update server with new score
  }
  this.clearInput();
  this.highlighted.clear();
}

function Game_onClickGridLetter(gridIndex){
  var c = this.grid.getCase(gridIndex);
  var res = this.highlighted.click(c);
  if ( res == 1 )
	this.input.value = this.input.value+c.letter;
  else if ( res == -1 )
	this.input.value = this.input.value.substring(0,this.input.value.length-1);
}

function Game_highlightWordingFromInput ( e ){
  var k;
  if (!e) e=event;
  if ( e.which ) k = e.which;
  if ( e.keyCode ) k = e.keyCode;
  if ( k == 38 )
    this.input.value = this.enteredWords.getNextWord();
  else if ( k == 40 )
    this.input.value = this.enteredWords.getPreviousWord();
  else if ( k == 27 )
    this.input.value = "";
  var w = this.getWordFromInput();
  var cases = this.grid.searchWording(w);
  this.highlighted.clear();
  this.highlighted.addCases(cases);
}

function Game_highlightWording ( nWord ){
  var cases = this.grid.searchWording(nWord);
  this.highlighted.clear();
  this.highlighted.addCases(cases);
}

function TBoggleGame_endGame(){
  if ( !this.bEnded ){
    this.bEnded = true;
    if ( this.timer )
      this.timer.stop();
    this.clearRunningZones();
    if ( this.scorer )
      this.scorer.stop();
    this.score.endGame();
    this.displayResult();
	//TODO : replace by jquery
    document.getElementById('tit-mots2').innerHTML = document.getElementById('tit-mots2').innerHTML + " ("+this.score.perfect+"pts)";
    if ( this.scoreTimer )
      clearInterval( this.scoreTimer );
    document.getElementById("wordId").focus();
    this.displayResult();
    hideById("saisie");
    try { document.getElementById("wordId").focus(); } catch (e) {}
    if ( this.bMultiPlayerGame ){
      this.nexttimer = new TBoggleNextGameTimerTV5 ( 0, "nextCountdown", this.playerId, this.nextContestId );
      this.nexttimer.start();
    }
  }
}

function Game_clearInput(){
	this.input.value = "";
	this.input.focus();
}

function TBoggleGame_getWordFromInput(){
  return this.input.value.toUpperCase();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// affiche les scores des autres joueurs, le résultat du joueur et le retour à l'index
// fonctions externes : printWording (mise en surbrillance)
function TBoggleGame_displayResult(){
  this.buildWordsListDiv ( this.grid.words, this.score );
}


