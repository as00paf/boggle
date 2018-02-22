// --------------------------------------
// L'historique des mots entrés
//

function TBoggleHistoric() 
{
  this.MAX_ELEMENTS = 10;
  this.words = new Array ();
  this.index = -1;

  this.addWord = TBoggleHistoric_addWord;
  this.getPreviousWord = TBoggleHistoric_getPreviousWord;
  this.getNextWord = TBoggleHistoric_getNextWord;
}

function TBoggleHistoric_addWord ( nWord )
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

function TBoggleHistoric_getPreviousWord ()
{
  if ( this.index != -1 )
    this.index--;
  if ( ( this.index >= 0 ) && ( this.index < this.words.length ) )
    return this.words[this.index];
  return "";
}

function TBoggleHistoric_getNextWord ()
{
  this.index++;
  if ( this.index < this.words.length )
    return this.words[this.index];
  return "";
}
