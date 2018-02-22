// -----------------------------------------------
// Objet THighligtedWording
// -----------------------------------------------

//@todo : est-ce que addCases() est utilise ?

function THighligtedWording ()
{
  this.cases = new Array(); 
  this.last  = null; 
  this.removeLastCase   = THighligtedWording_removeLastCase;
  this.addCase          = THighligtedWording_addCase;
  this.addCases         = THighligtedWording_addCases;
  this.clear            = THighligtedWording_clear;
  this.click            = THighligtedWording_click;
}

// -----------------------------------------------

function THighligtedWording_removeLastCase ()
{
  if ( this.cases.length > 0 )
  {
    this.last.highlight(0);
    this.last.bInCurrentWord = false;
    this.cases.pop();
  }

  if ( this.cases.length > 0 )
  {
    this.last = this.cases[this.cases.length-1];
    this.last.highlight(2);
  }
  else
    this.last = null;
}

// -----------------------------------------------

// nCases : ArrayList(TBoggleCase)
function THighligtedWording_addCases ( nCases )
{
  if ( nCases != null )   
  {
    for ( var i = 0; i < nCases.length; i++ )
      this.addCase ( nCases[i] , true  );
  }
}

// -----------------------------------------------
function THighligtedWording_addCase ( nCase , nTape )
{
  if ( this.last != null )
    this.last.highlight(1);

  this.cases.push(nCase);
  this.last = nCase;
  this.last.highlight(2);
  this.last.bInCurrentWord = true;
}

// -----------------------------------------------

function THighligtedWording_clear()
{
  for ( var i = 0; i< this.cases.length; i++)
  {
    this.cases[i].bInCurrentWord = false;
    this.cases[i].highlight(0)
  }
  
  this.cases = new Array();
  this.last = null;
}

// -----------------------------------------------

function THighligtedWording_click ( nCase )
{
  if ( this.cases.length == 0 )
  {
    this.addCase ( nCase );
    return 1;
  }
  else if ( this.last.index == nCase.index )
  {
    this.removeLastCase();
    return -1;
  }
  else if ( !nCase .bInCurrentWord && this.last.isNeighbour(nCase) )
  {
    this.addCase ( nCase );
    return 1;
  }
  return 0;
}


