function Dictionnary(){
	this.words = [
		
	];
}

Dictionnary.prototype = {
	getWordsCount:function(){		
		return this.words.length;
	},
	
	toString:function(){
		return this.words.length + " words";
	}
}

module.exports = Dictionnary;