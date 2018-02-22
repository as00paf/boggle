//Entered Words
function EnteredWords(){
	this.MAX_ELEMENTS = 10;
	this.words = new Array ();
	this.index = -1;

	this.addWord = EnteredWords_addWord;
	this.getPreviousWord = EnteredWords_getPreviousWord;
	this.getNextWord = EnteredWords_getNextWord;
}

function EnteredWords_addWord ( nWord )
{
  if ( this.words.length == this.MAX_ELEMENTS )
    this.words.pop();
  if ( this.words.unshift )
    this.words.unshift(nWord);
  else
  {
    for ( i = MAX_ELEMENTS; i > 0; i++ )
      this.words[i] = this.words[i-1];
    this.words[0]=nWord;
  }
  this.index = -1;
}

function EnteredWords_getPreviousWord ()
{
  if ( this.index != -1 )
    this.index--;
  if ( ( this.index >= 0 ) && ( this.index < this.words.length ) )
    return this.words[this.index];
  return "";
}

function EnteredWords_getNextWord ()
{
  this.index++;
  if ( this.index < this.words.length )
    return this.words[this.index];
  return "";
}
