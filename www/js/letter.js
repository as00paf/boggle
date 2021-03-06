function Letter(index, letter, isInCurrentWord){
	this.index = index;
	this.letter = letter;
	this.isInCurrentWord = isInCurrentWord;
	this.neighbours = Array();
}

Letter.prototype = {
	getNeighboursWithLetter:function(nLetter){
		nLetter = nLetter.toUpperCase();
		
		var res = new Array();
		for ( var i = 0; i < this.neighbours.length; i++ ){
			if ( ( this.neighbours[i].letter == nLetter ) && !this.neighbours[i].isInCurrentWord ){
				res.push ( this.neighbours[i] );
			}	
		}
		
		//console.log(res);
		
		return res;
	},
	
	toString:function(){
		return this.letter;
	}
}