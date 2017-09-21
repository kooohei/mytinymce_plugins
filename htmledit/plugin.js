tinymce.PluginManager.add('htmledit', function (editor) {
  var route = false;
  var altTextarea;
  var fitEditorPos = function(e,o) {
    var element = (e.type === 'resizeeditor') ? e.target.iframeElement : e.iframeElement;
    var size = tinymce.DOM.getRect(editor.getContainer());
    altTextarea.style.top = size.y + 'px';
    altTextarea.style.left = size.x + 'px';
    altTextarea.style.width = size.w  + 'px';
    altTextarea.style.height = size.h  + 'px';
  };

  var handleTextarea = function() {
    var id = 'altTextarea_'+editor.id;
    if (!document.getElementById(id)) {
      altTextarea = document.createElement('textarea');
      altTextarea.setAttribute('id', id);
      var c = editor.container;
      c.parentNode.insertBefore(altTextarea, c.nextSibling);
      altTextarea.style.resize = 'none';
      altTextarea.style.position = 'fixed';
      altTextarea.style.borderWidth = 0;
      altTextarea.style.backgroundColor = '#f9f9f9';
      fitEditorPos(editor);
      editor.on('ResizeWindow ResizeEditor', fitEditorPos);
    }
    return altTextarea || document.getElementById(id);
  };

  var onSave = function(e,o) {
    if (route) e.content = handleTextarea().value;
  };
  editor.on('SaveContent', onSave);

  var toggleHtmlEdit = function() {
    route = !route;
    var toolbars = tinymce.dom.DomQuery(editor.getContainer()).find('.mce-toolbar-grp');
    if (route) {
      // tinymce -> textarea
      toolbars.hide();
      var textarea = handleTextarea();
      textarea.value = editor.getContent();
      textarea.style.display = '';
      fitEditorPos(editor);
    } else {
      // textarea -> tinymce
      toolbars.show();
      var textarea = handleTextarea();
      editor.setContent(textarea.value);
      textarea.style.display = 'none';
    }
//  console.log(handleTextarea().value);
    editor.on('whenToggleHtmlEdit', route);
    return route;
  };

  editor.addCommand('toggleHtmlEdit', toggleHtmlEdit);

  editor.addButton('htmledit', {
    text: 'HTMLEDIT',
    tooltip: 'edit on HTML',
    onclick: function() {
      toggleHtmlEdit();
    },
    onpostrender: function() {
      var btn = this;
      editor.on('whenToggleHtmlEdit', function(state) {
        btn.active(state);
      });
    }
  });
});

