(function ($) {
	function h(q) {
		return function(c) {c.prependToLeadingLine((new Array(q+1)).join('#')+' ');};
	}
	function wrap() {
		var args = arguments;
		return function(c) {c.wrap.apply(null, args);};
	}
	function replace(x,y) {
		return function(c) {c.replace(x,y)};
	}
	$.markdownEditor = {
		buttons: {
			'h1' : {'name': 'H1', callback: h(1)},
			'h2' : {'name': 'H2', callback: h(2)},
			'h3' : {'name': 'H3', callback: h(3)},
			'h4' : {'name': 'H4', callback: h(4)},
			'h5' : {'name': 'H5', callback: h(5)},
			'h6' : {'name': 'H6', callback: h(6)},
			'bold'  : {'name': 'Bold', callback: wrap('**')},
			'italic': {'name': 'Italic', callback: wrap('*')},
			'code'  : {'name': 'Code', callback: wrap('`')},
			'quote' : {'name': 'Quote', callback: function (caret) {caret.prependToEveryLine('> ');}},
			'hr' : {'name': 'Page Break', callback: replace('*****', true)},
			'link' : {'name': 'Link', callback: function(caret) {caret.wrap('['+caret.text+'](', ')');}},
			'indent' : {'name': 'Indent', callback: function (caret) {caret.prependToEveryLine("    ")}},
			'outdent': {'name': 'Outdent', callback: function (caret) {caret.replaceInSelection(/[ ]{4}(?![ ]{4})/g, "");}}
		},
		toolbars: {
			'default': ['h1','h2','h3','h4','h5','h6','|', 'bold','italic', 'link', '|', 'quote', 'code', 'hr']
		}
	};
	$.fn.markdownEditor = function (opts) {
		return $(this).each(function () {
			var $toolbarLoc = opts.toolbarLoc.addClass('me-toolbar-wrapper')
				, toolbar = opts.toolbar
				, $preview = opts.preview
				, $this = $(this).addClass('me-editor')
				, ui = new $.markdownEditor.ui($toolbarLoc, $this)
				, loop
				, that = this;

			$this.preview = function () {
				$preview.html(markdown.toHTML($this.val()));
			}; $this.preview();

			$this.on('keydown', function(e) {
				var code = e.keyCode ? e.keyCode : e.which;

				clearTimeout(loop);
				loop = setTimeout(function () {
					$this.preview();
				}, 250);

				if(code == 9) {
					$this.caret().replace("    ", true);
					e.stopPropagation();
					return false;
				}
			});

			ui.rebuildToolbar(toolbar);
		});
	}

	$.markdownEditor.ui = function ($bar, $o) {
		this.$bar = $bar;
		this.$textarea = $o;

		return this;
	}
	$.markdownEditor.ui.prototype.rebuildToolbar = function (toolbar) {
		var layout = $.markdownEditor.toolbars[toolbar]
			, i = layout.length
			, bar = $('<ul></ul>').prop('class', 'me-toolbar');

		while(i--) {
			var key = layout[i];

			if(key == "|") {
				$('<li><span></span></li>').find('span').addClass('me-spacer').text(' ').end().prependTo(bar);
			}
			else {
				this.makeButton(key, $.markdownEditor.buttons[key]).prependTo(bar);
			}
		}

		this.$bar.html(bar);
	}
	$.markdownEditor.ui.prototype.makeButton = function(key, obj) {
		return $("<li><button></button></li>").find('button').addClass('me-'+key).addClass('me-button').text(obj.name).click(this.clickHandler(obj.callback)).end();
	}
	$.markdownEditor.ui.prototype.clickHandler = function(callback) {
		var that = this;
		return function (e) { callback.apply(null, [that.$textarea.caret(), that.$textarea]); that.$textarea.preview(); };
	}
})(jQuery);