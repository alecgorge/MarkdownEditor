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
			'h1' : {'name': 'H1', 'icon':'', callback: h(1)},
			'h2' : {'name': 'H2', 'icon':'', callback: h(2)},
			'h3' : {'name': 'H3', 'icon':'', callback: h(3)},
			'h4' : {'name': 'H4', 'icon':'', callback: h(4)},
			'h5' : {'name': 'H5', 'icon':'', callback: h(5)},
			'h6' : {'name': 'H6', 'icon':'', callback: h(6)},
			'bold'  : {'name': 'Bold', 'icon':'bold', callback: wrap('**')},
			'italic': {'name': 'Italic', 'icon':'italic', callback: wrap('*')},
			'code'  : {'name': 'Code', 'icon':'barcode', callback: wrap('`')},
			'quote' : {'name': 'Quote', 'icon':'comment', callback: function (caret) {caret.prependToEveryLine('> ');}},
			'hr' : {'name': 'Page Break', 'icon':'resize-horizontal', callback: replace('*****', true)},
			'link' : {'name': 'Link', 'icon':'share', callback: function(caret) {caret.wrap('['+caret.text+'](', ')');}},
			'indent' : {'name': 'Indent', 'icon':'indent-left', callback: function (caret) {caret.prependToEveryLine("    ")}},
			'outdent': {'name': 'Outdent', 'icon':'indent-right', callback: function (caret) {caret.replaceInSelection(/[ ]{4}(?![ ]{4})/g, "");}}
		},
		toolbars: {
			'default': [['h1','h2','h3','h4','h5','h6'], ['bold','italic'], ['link'], ['quote', 'code'], ['hr']]
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
			, bar = $('<div></div>').prop('class', 'btn-toolbar');

		for (var i = 0; i < layout.length; i++){
			var group = layout[i];
			var out = $("<div></div>").addClass('btn-group');

			for (var j = 0; j < group.length; j++){
			    var key = group[j];
				this.makeButton(key, $.markdownEditor.buttons[key]).appendTo(out);
			}
			out.appendTo(bar);
		}

		this.$bar.html(bar);
	}
	$.markdownEditor.ui.prototype.makeButton = function(key, obj) {
        var button = $("<button></button>").addClass('me-'+key).addClass('btn').attr('alt', obj.name).click(this.clickHandler(obj.callback));
        if (obj.icon == '') {
		    button.html(obj.name)
		} else {
		    var icon = $("<i></i>").addClass('icon-'+obj.icon);
		    button.append(icon);
            button.attr('rel', 'tooltip');
            button.attr('title', obj.name);
            button.tooltip({"placement": "bottom"})
        }
        return button

	}
	$.markdownEditor.ui.prototype.clickHandler = function(callback) {
		var that = this;
		return function (e) { callback.apply(null, [that.$textarea.caret(), that.$textarea]); that.$textarea.preview(); };
	}
})(jQuery);