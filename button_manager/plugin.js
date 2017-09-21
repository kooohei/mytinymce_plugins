/*jshint unused:false */
/*global tinymce:true */

tinymce.PluginManager.add('button_manager', function(editor, url) {

    function ParseToolbarsAttribute() {
        var attr = editor.targetElm.getAttribute('data-toolbars'),
        construct = JSON.parse(attr), rows = new Array;

        construct.forEach(function(RowText) {
            var row = new Array, i = 0, inGroup = false;
            var buttons = RowText.trim().split(' ');
            buttons.forEach(function(k) {
                if (k === '|') { // separater.
                    if (!row[i]) return true;
                    inGroup = false;
                    i++;
                    return true;
                }
                if (!inGroup) {
                    row.push([]);
                    inGroup = true;
                }
                row[i].push(k);
            });
            rows.push(row);
        });
        return rows;
    };

    function RenewToolbar(items, row, _parent) {
        var _factory = tinyMCE.ui.Factory.create;

        var Toolbar = new Array;
/*
var editor = tinymce.activeEditor;
var bg = editor.theme.panel.find('toolbar');
var row = 1;
console.log(bg);

bg[row].items().remove();

var button = editor.buttons['italic'];
button.type = 'button';
var np = tinyMCE.ui.Factory.create({ layout: 'flow', type: 'buttongroup', items: [
tinyMCE.ui.Factory.create(button), tinyMCE.ui.Factory.create(button), ]
});

np.parent( bg[row] );
bg[row].add(np);
np.renderTo( bg[row].getEl('body') ).reflow()
*/

        items.forEach(function(buttons) {
            var sets = new Array;
            buttons.forEach(function(button) {
                var _button = editor.buttons[button];
                _button = typeof _button === 'function' ? _button() : _button;

                _button.type = _button.type ? _button.type : 'button';
                sets.push(_factory(_button));
            });

            var ButtonGroup = _factory({
                layout: 'flow',
                type: 'buttongroup',
                items: sets,
            });
                
            Toolbar.push(ButtonGroup);
        });

        var ToolbarObject = _factory({
            layout: 'flow',
            role: "toolbar",
            type: "toolbar",
            items: Toolbar,
        });

        _parent.add(ToolbarObject);
        ToolbarObject.parent(_parent);
        ToolbarObject.renderTo(_parent.getEl('body'));
    }

    function RenewToolbars() {
        var rows = ParseToolbarsAttribute();
        var ToolbarsParent = editor.theme.panel.find('toolbar')[0].parent();
        ToolbarsParent.items().remove(); // clean up

        rows.forEach(function(i,j) {
            RenewToolbar(i, j, ToolbarsParent);
        });
    }

    editor.on('Init',function(e,o) {
        RenewToolbars();
    });

	editor.addButton('button_manager', {
		text: 'Button Manager',
		tooltip: 'Button Manager',
		icon: false,
		onclick: function() {
			editor.windowManager.open({
				title: 'Button Manager',
				url: url + '/dialog.html',
				width: 800,
				height: 500,
				buttons: [
					{
						text: 'Apply',
						onclick: function() {
							var win = editor.windowManager.getWindows()[0];
                            var attr = JSON.stringify(win.getContentWindow().app.aggregate());
							editor.targetElm.setAttribute('data-toolbars', attr);
							win.close();
                            RenewToolbars();
						}
					},
					{text: 'Close', onclick: 'close'}
				]
			});
		}
	});
});

tinymce.PluginManager.requireLangPack('button_manager');

