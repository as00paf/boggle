/**
 *
 * <p>Title: TWordList </p>
 * <p>Description: La liste des mots</p>
 * <p>Copyright: Copyright (c) 2008</p>
 * <p>Company: MEMODATA</p>
 * @author YP
 * @version 3.0
 * @todo sortir toutes les constantes
 */

function TWordList ( nHtmlElementId )
{
  this.NO_POINTS = "-";
  this.displayZone = document.getElementById(nHtmlElementId);
  this.addWord = TWordList_addWord; 
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Ajout d'un mot à la liste des mots tapés par le joueur
//
function TWordList_addWord ( nWord, nOK, nPoints )
{
  // création du HTML du mot
  var divE =  document.createElement("div");
  divE.setAttribute ( "class", "entree" );
  divE.setAttribute ( "className", "entree" );

  var divW = document.createElement("div");
  if ( nOK )
  {
    divW.setAttribute ( "class", "mot" );
    divW.setAttribute ( "className", "mot" );
  }
  else
  {
    divW.setAttribute ( "class", "motbad" );
    divW.setAttribute ( "className", "motbad" );
  }
  divW.appendChild(document.createTextNode(nWord));

  var divP = document.createElement("div");
  divP.setAttribute ( "class", "valeur" );
  divP.setAttribute ( "className", "valeur" );
  if ( nPoints > 0 )
    divP.appendChild(document.createTextNode(nPoints));
  else
    divP.appendChild(document.createTextNode(this.NO_POINTS));

  divE.appendChild(divW);
  divE.appendChild(divP);
  if ( this.displayZone.childNodes.length == 0 )
    this.displayZone.appendChild(divE); 
  else
    this.displayZone.insertBefore(divE,this.displayZone.firstChild); 
}

