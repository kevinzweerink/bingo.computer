function Bingo(squares, selector) {
	this.squares = squares;
	this.el = document.querySelector(selector);
	this.freeSquare = 'Free Square';
	this.squareTypeNormal = 'normal';
	this.squareTypeFree = 'free';
	this.bingo = false;
	this.winner = document.querySelector('.winner');
	this.winnerX = 0;
	this.winnerY = 0;
	this.winnerVX = Math.random() * 10;
	this.winnerVY = Math.random() * 10;
	this.winnerRV = 1;
	this.winnerRotation = 0;
	this.winnerWidth = this.winner.clientWidth;
	this.winnerHeight = this.winner.clientHeight;

	this.prepareBoardData();
	this.render();
	this.listen();
}

Bingo.prototype.shuffle = function () {
	// Implementation of Fisher-Yates Shuffle
	var currentIndex = this.squares.length, 
			temporaryValue, 
			randomIndex;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = this.squares[currentIndex];
		this.squares[currentIndex] = this.squares[randomIndex];
		this.squares[randomIndex] = temporaryValue;
	}
}

Bingo.prototype.expandModel = function () {
	var bingo = this;

	this.board = this.squares.map(function(square, index) {
		var squareType = (square === bingo.freeSquare) ? bingo.squareTypeFree : bingo.squareTypeNormal;

		return {
			text    : square,
			index   : index + 1,
			type    : squareType,
			checked : false
		}
	});
}

Bingo.prototype.drawBoard = function () {
	var bingo = this;
	this.boardEls = this.board.map(function (square) {
		var el = document.createElement('div');
		var label = document.createElement('label');
		var cb = document.createElement('input');

		el.classList.add('bingo-board-tile');
		label.innerHTML = square.text;
		label.classList.add('bingo-board-label')
		label.htmlFor = 'tile-' + square.index;
		cb.type = 'checkbox';
		cb.id = 'tile-' + square.index;

		if (square.type === bingo.squareTypeFree) {
			el.classList.add('free');
			cb.checked = true;
			bingo.freeTileCheckbox = cb;
		}

		el.appendChild(cb);
		el.appendChild(label);

		bingo.el.appendChild(el);
		return el;
	})
}

Bingo.prototype.verticalComplete = function () {
	for (var i = 0; i < 5; i++) {

		if (!this.board[i].checked) {
			continue;
		}

		var columnIsComplete = true;

		for (var j = 1; j < 5; j++) {
			var currentIndex = i + (j * 5);
			if (!this.board[currentIndex].checked) {
				columnIsComplete = false;
				break;
			}
		}

		if (columnIsComplete) {
			return true;
		}

	}

	return false;
}

Bingo.prototype.diagonalComplete = function () {
	var topLeft = 0,
			topRight = 4,
			LRDiagonalComplete = false,
			RLDiagonalComplete = false;

	// Check TL to BR
	if (this.board[topLeft].checked) {
		LRDiagonalComplete = true;
		for (var i = 1; i < 5; i++) {
			var currentIndex = topLeft + (i * 5) + i;
			if (!this.board[currentIndex].checked) {
				LRDiagonalComplete = false;
				break;
			}
		}
	} else {
		LRDiagonalComplete = false;
	}

	if (this.board[topRight].checked) {
		RLDiagonalComplete = true;
		for (var i = 1; i < 5; i++) {
			var currentIndex = topRight + (i * 5) - i;
			if (!this.board[currentIndex].checked) {
				RLDiagonalComplete = false;
				break;
			}
		}
	} else {
		RLDiagonalComplete = false;
	}

	if (LRDiagonalComplete || RLDiagonalComplete) {
		return true;
	}

	return false;
}

Bingo.prototype.horizontalComplete = function () {
	for (var i = 0; i < 25; i += 5) {
		// Skip this row if the first one isn't checked
		if (!this.board[i].checked) {
			continue;
		}

		// Set this to true, reverse if we find one in the row
		// that isn't checked
		var rowIsComplete = true;
		for (var j = 1; j < 5; j++) {
			if (!this.board[i + j].checked) {
				rowIsComplete = false;
				break;
			}
		}

		// If the row is still complete jump out of everything and return
		if (rowIsComplete) {
			return true;
		}
	}

	return false;

}

Bingo.prototype.isComplete = function () {
	if (this.horizontalComplete() ||
			this.verticalComplete() ||
			this.diagonalComplete() ) {
		return true;
	}

	return false;
}

Bingo.prototype.doWinnerAnimation = function () {
	if (!this.shouldDoWinnerAnimation) {
		return;
	}

	var transformString = 'translate(' + this.winnerX + 'px, ' + this.winnerY + 'px) rotate(' + this.winnerRotation + "deg)";
	this.winner.style.transform = transformString;
	this.winner.style.webkitTransform = transformString;

	var newX = this.winnerVX + this.winnerX;
	var newY = this.winnerVY + this.winnerY;

	this.winnerRotation += this.winnerRV;

	if (newX < 0 || newX > window.innerWidth - this.winnerWidth) {
		this.winnerVX *= -1;
		newX = this.winnerX;
	}

	if (newY < 0 || newY > window.innerHeight - this.winnerHeight) {
		this.winnerVY *= -1;
		newY = this.winnerY;
	}

	this.winnerX = newX;
	this.winnerY = newY;

	window.requestAnimationFrame(this.doWinnerAnimation.bind(this));
}

Bingo.prototype.gatherState = function () {
	var bingo = this;

	this.boardEls.forEach(function (el, index) {
		var checkbox = el.querySelector('input');
		bingo.board[index].checked = checkbox.checked;
	});

	if (this.isComplete()) {
		this.bingo = true;
		this.shouldDoWinnerAnimation = true;
		if (!this.animating) {
			this.doWinnerAnimation();
			this.animating = true;
		}
	} else {
		this.bingo = false;
		this.shouldDoWinnerAnimation = false;
		this.animating = false;
	}
}

Bingo.prototype.renderState = function () {
	if (this.bingo) {
		this.winner.classList.add('active')
		this.winnerWidth = this.winner.clientWidth;
		this.winnerHeight = this.winner.clientHeight;
	} else {
		this.winner.classList.remove('active')
	}
}

Bingo.prototype.render = function () {
	if (!this.boardEls) {
		this.drawBoard();
	}

	this.freeTileCheckbox.checked = true;

	this.gatherState();
	this.renderState();
}

Bingo.prototype.listen = function () {
	this.el.addEventListener('click', this.render.bind(this));
}

Bingo.prototype.prepareBoardData = function () {
	this.shuffle();
	this.squares.splice(24, this.squares.length - 24);
	this.squares.splice(12,0,this.freeSquare);
	this.expandModel();
}