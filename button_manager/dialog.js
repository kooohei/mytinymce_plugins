/*
 *
 */

// https://jsfiddle.net/dede89/32ao2rpm/
// https://github.com/SortableJS/Vue.Draggable
var app = new Vue({
    el: '#app-buttonmanager',
    data: {
        drag: false,
        buttons: [],
        toolbar0: [],
        toolbar1: [],
        toolbar2: [],
        toolbar3: [],
        toolbar4: [],
    },
    methods: {
        remove: function(element, index, source) {
            this[source].splice(index, 1);
        },
        aggregate: function() {
            var self = this;
            var slot = [ 0,1,2,3,4 ], toolbar = new Array;
            slot.forEach(function(num){
                var attr = 'toolbar' + num;
                if ( self[attr].length > 0 ) {
                    var concat = '', separator = false;
                    for (var i = 0; i < self[attr].length; i++) {
                        if (self[attr][i].name === '|' && separator === true) {
                            // skip: double separator
                        } else {
                            concat += self[attr][i].name + ' ';
                        }
                        separator = (self[attr][i].name === '|') ? true : false;
                    }
                    toolbar.push(concat);
                }
            });
            return toolbar;
        }
    }
});

(function(){

//http://stackoverflow.com/questions/983586/how-can-you-determine-if-a-css-class-exists-with-javascript

function selectorInStyleSheet(styleSheetName, selector) {
    /*
     * Get the index of 'styleSheetName' from the document.styleSheets object
     */
    for (var i = 0; i < document.styleSheets.length; i++) {
        var thisStyleSheet = document.styleSheets[i].href ? document.styleSheets[i].href.replace(/^.*[\\\/]/, '') : '';
        if (thisStyleSheet == styleSheetName) { var idx = i; break; }
    }
    if (!idx) return false; // We can't find the specified stylesheet

    /*
     * Check the stylesheet for the specified selector
     */
    var styleSheet = document.styleSheets[idx];
    var cssRules = styleSheet.rules ? styleSheet.rules : styleSheet.cssRules;
    for (var i = 0; i < cssRules.length; ++i) {
        if(cssRules[i].selectorText == selector) return true;
    }
    return false;
}

var editor = top.tinymce.activeEditor;

var attr = editor.targetElm.getAttribute('data-toolbars'),
buttons = editor.buttons,
construct = JSON.parse(attr);

function add_buttons (target, name) {
    var hasStyle = selectorInStyleSheet('skin.min.css', '.mce-i-' + name + '::before');
    var _button = (typeof editor.buttons[name] === 'function') ?
        editor.buttons[name]() :
        editor.buttons[name];

    app[target].push({
        display_name: (name === '|' ?
            '|' :
            (
                _button.tooltip !== editor.translate(_button.tooltip) &&
                editor.translate(_button.tooltip).length > 0
            ) ?
                editor.translate(_button.tooltip) :
                name
        ),

        name: name,
        icon_class: (hasStyle ? 'mce-ico mce-i-' + name : '')
    });
}

for (var name in buttons) {
    if (buttons.hasOwnProperty(name)) {
        add_buttons('buttons', name);
    }
}

app.buttons.push({name: '|', icon_class: '', display_name: '|' });


construct.forEach(function(RowText, Row) {
    var items = RowText.trim().split(/\s+/), target = 'toolbar' + Row;
    items.forEach(function(name) {
        add_buttons(target, name);
    });
});

}());


