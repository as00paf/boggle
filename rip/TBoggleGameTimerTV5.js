var _TBoggleGameTimerTV5;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// 
// Le timer peut commencer en cours
function TBoggleGameTimerTV5 ( nDurationInMS, nDisplayElementId, nGame ) 
{
  _TBoggleGameTimerTV5 = this;

  this.start = TBoggleGameTimerTV5_start;
  this.stop = TBoggleGameTimerTV5_stop;
  this.displayCountdown = TBoggleGameTimerTV5_displayCountdown;
  this.currentTimeMillis = TBoggleGameTimerTV5_currentTimeMillis;
  this.setRemainingTime = TBoggleGameTimerTV5_setRemainingTime;

  this.INTERVAL = 20;
  this.setRemainingTime(nDurationInMS);
  this.displayElementId = nDisplayElementId;
  this.game = nGame;

  this.displayElt = document.getElementById(this.displayElementId);
  this.bStopped = true;
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function TBoggleGameTimerTV5_start()
{
  this.bStopped = false;
  this.timerID = setInterval("displayCountdown()",this.INTERVAL);
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function TBoggleGameTimerTV5_setRemainingTime(nDurationInMS)
{
  this.endTime = this.currentTimeMillis() + nDurationInMS;
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function TBoggleGameTimerTV5_stop()
{
  this.bStopped = true;
  if ( !this.displayElt )
    this.displayElt = document.getElementById(this.displayElementId);
  this.displayElt.innerHTML = "00:00";
  clearInterval(this.timerID);
  this.game.endGame();
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Affichage du temps restant
//
function TBoggleGameTimerTV5_displayCountdown()
{
  if ( !this.bStopped )
  {
    // Si le compte à rebours a fini on arrète le chrono
    var da = new Date().getTime();
    var remainingTime = Math.floor(this.endTime-da);
    if ( remainingTime < 0 )
      this.stop();
    else
    {
      var d = new Date(remainingTime);
      var m = d.getMinutes();
      var s = d.getSeconds();
      var res = ( m<10 ? "0" : ":" ) + m + ( s<10 ? ":0" : ":" ) + s;
      // affichage du temps
      if ( !this.displayElt )
        this.displayElt = document.getElementById(this.displayElementId);
      this.displayElt.innerHTML = res;
    }
  }
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function TBoggleGameTimerTV5_currentTimeMillis()
{
  return new Date().getTime();
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// fonction appelée par le timer
function displayCountdown()
{
  _TBoggleGameTimerTV5.displayCountdown();
}
