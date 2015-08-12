function BingoBuilder() {
	this.el = document.createElement('div');
	this.el.classList.add('bingo-builder')
	this.input = document.createElement('input');
	this.input.type = 'text';
	this.input.placeholder = 'Add at least 25 bingo tiles separated by commas';
	this.items;

	this.el.appendChild(this.input);
	document.body.appendChild(this.el);

	this.listen();
}

BingoBuilder.prototype.checkValue = function () {
	var val = this.input.value;
	if (val.indexOf(',') >= 0) {
		var items = val.split(',');
		var bingo = this;

		this.items = items;
		var els = items.map(function(item, index) {
			if (item.length == 0) {
				return;
			}

			var itemEl = document.createElement('div');
			itemEl.classList.add('bingo-item');
			itemEl.innerHTML = item;
			bingo.el.insertBefore(itemEl, bingo.input);

			return itemEl;
		});

		this.input.value = '';
	}
}

BingoBuilder.prototype.handleBackspace = function () {
	if (this.input.value.length == 0) {
		var items = document.querySelectorAll('.bingo-item');
		var lastItem = items[items.length - 1];
		var lastItemText = lastItem.innerHTML;

		this.el.removeChild(lastItem)
		this.input.value = lastItemText;
	}
}

BingoBuilder.prototype.selfDestruct = function () {
	document.body.removeChild(this.el);
	var newBoard = document.createElement('div');
	newBoard.classList.add('board');
	document.body.appendChild(newBoard);
	window.location.hash = '#' + encodeURI(this.items.join(','));
	var bingo = new Bingo(this.items, '.board');
}

BingoBuilder.prototype.beginGame = function () {
	this.selfDestruct();
}

BingoBuilder.prototype.listen = function () {
	var bingo = this;
	this.input.addEventListener('keyup', function(e) {
		if (e.keyCode == 13) {
			bingo.beginGame();
		} else if (e.keyCode == 8) {
			bingo.handleBackspace(e);
		} else {
			bingo.checkValue();
		}
	});

	this.input.focus();


}