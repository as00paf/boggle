//------------------------------------------------------------------- 
// Trim functions 
// Returns string with whitespace trimmed 
//------------------------------------------------------------------- 
function LTrim(str)
{ if (str==null){return null;} for(var i=0;str.charAt(i)==" ";i++); return str.substring(i,str.length); } 
function RTrim(str)
{ if (str==null){return null;} for(var i=str.length-1;str.charAt(i)==" ";i--); return str.substring(0,i+1); } 
function Trim(str)
{return LTrim(RTrim(str));} 
function LTrimAll(str) 
{ if (str==null){return str;} for (var i=0; str.charAt(i)==" " || str.charAt(i)=="\r" || str.charAt(i)=="\n" || str.charAt(i)=="\t"; i++); return str.substring(i,str.length); } 
function RTrimAll(str) 
{ if (str==null){return str;} for (var i=str.length-1; str.charAt(i)==" " || str.charAt(i)=="\r" || str.charAt(i)=="\n" || str.charAt(i)=="\t"; i--); return str.substring(0,i+1); } 
function TrimAll(str) 
{ return LTrimAll(RTrimAll(str)); } 

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// la date courante en ms
//
function currentTimeMillis()
{
  var now = new Date();
  return now.getTime();
}

var DAY_IN_MILLIS  = 24*60*60*1000;
var HOUR_IN_MILLIS = 60*60*1000;
var MIN_IN_MILLIS  = 60*1000;
function getDays ( nTime )
{
  return Math.floor ( nTime / DAY_IN_MILLIS );
}

function getHours ( nTime )
{
  return Math.floor ( nTime / HOUR_IN_MILLIS );
}

function getMinutes ( nTime )
{
  return Math.floor( (nTime % HOUR_IN_MILLIS) / MIN_IN_MILLIS ) ;
}

// -----------------------------------------------
// class
// -----------------------------------------------
function setClass ( nElement, nClassname )
{
  nElement.setAttribute("class",nClassname);
  nElement.setAttribute("className",nClassname);
}
// -----------------------------------------------
// show / hide
// -----------------------------------------------
function show ( nElement )
{
  nElement.style.display="block";
  nElement.style.visibility = "visible";
}
// - - - - - - - - - - - - - - - - - - - - - - - -
function showById ( nId )
{
  try
  {
    show ( document.getElementById(nId) );
  }
  catch (e) { 
// alert ( "showById() : " + nId ); 
  }
}
// - - - - - - - - - - - - - - - - - - - - - - - -
function hide ( nElement )
{
  nElement.style.display="none";
  nElement.style.visibility = "hidden";
}
// - - - - - - - - - - - - - - - - - - - - - - - -
function hideById ( nId )
{
  try
  {
    hide ( document.getElementById(nId) );
  }
  catch (e) {
// alert ( "hideById() : " + nId ); 
  }
}
// -----------------------------------------------
// move
// -----------------------------------------------
function moveTo ( nElement, nX, nY, nUnit )
{
  nElement.style.left= nX+nUnit;
  nElement.style.top = nY+nUnit;
}
// - - - - - - - - - - - - - - - - - - - - - - - -
function moveToById ( nId, nX, nY, nUnit )
{
  moveTo ( document.getElementById(nId), nX, nY, nUnit );
}
// -----------------------------------------------
// AJAX
// -----------------------------------------------
function getXHR()
{
  var res = null;
  try { res = new ActiveXObject("Msxml2.XMLHTTP"); }
  catch (e1)
  {
    try { res = new ActiveXObject("Microsoft.XMLHTTP"); }
    catch (e2)
    {
      res = false;
    }
  }
  if ( !res && typeof XMLHttpRequest != 'undefined' )
    res = new XMLHttpRequest();
  return res;
}
// -----------------------------------------------
// cookies
// -----------------------------------------------
function deleteCookie (nName, nDomain, nPath ) 
{
  var nExpires = new Date(1);
  var curCookie = nName + "="  + ((nExpires) ? "; expires=" + nExpires.toGMTString() : "") + ((nPath) ? "; path=" + nPath : "") + ((nDomain) ? "; domain=" + nDomain : ""); 
  document.cookie = curCookie; 
}
// - - - - - - - - - - - - - - - - - - - - - - - -
function setCookie (nName, nValue, nExpires, nPath, nDomain, nSecure) 
{ 
  deleteCookie ( nName, nDomain, nPath ); 
  var curCookie = nName + "=" + escape(nValue) + ((nExpires) ? "; expires=" + nExpires.toGMTString() : "") + ((nPath) ? "; path=" + nPath : "") + ((nDomain) ? "; domain=" + nDomain : "") + ((nSecure) ? "; secure" : ""); 
  document.cookie = curCookie; 
} 
// - - - - - - - - - - - - - - - - - - - - - - - -
function getCookie(nName) 
{ 
  var dc = document.cookie; 
  var prefix = nName + "="; 
  var begin = dc.indexOf("; " + prefix); 
  if (begin == -1) 
  { 
    begin = dc.indexOf(prefix); 
    if (begin != 0) 
      return null; 
  } 
  else 
    begin += 2; 
  var end = document.cookie.indexOf(";", begin); 
  if (end == -1) 
    end = dc.length; 
  return unescape(dc.substring(begin + prefix.length, end)); 
} 

// -----------------------------------------------


/***********************************************
* Bookmark site script- © Dynamic Drive DHTML code library (www.dynamicdrive.com)
* This notice MUST stay intact for legal use
* Visit Dynamic Drive at http://www.dynamicdrive.com/ for full source code
***********************************************/

function bookmarksite(nTitle, nUrl)
{
  if (document.all)
    window.external.AddFavorite(nUrl, nTitle);
  else if (window.sidebar)
    window.sidebar.addPanel(nTitle, nUrl, "");
}

function bookmarksite(nTitle)
{
  if (document.all)
    window.external.AddFavorite(document.location, nTitle);
  else if (window.sidebar)
    window.sidebar.addPanel(nTitle, document.location, "");
}

function openMailToWindow()
{
  if ( parameters && parameters.displayLanguage == "fr" )
    window.open("http://193.251.2.91/courriel/send-to-a-friend.jsp?title=Boggle%20en%20ligne&url="+document.location,
                "",
                "directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,width=400,height=500" );
  else
    window.open("http://193.251.2.91/courriel/send-to-a-friend.jsp?title=Online%20Boggle&url="+document.location,
                "",
                "directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,width=400,height=500" );
}  



