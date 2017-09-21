tinymce.PluginManager.add('scriptguard', function (editor) {
  var route = false;

  var onPreInit = function(e,o) {
    var parser = editor.parser;
    // HINT dev:L34211 htmlParser.addNodeFilter('script,style', function (nodes, name) {
    parser.addNodeFilter('script', function (nodes) {
      var i = nodes.length, node, type, value;

      // HINT tinymce.core.html.Serializer 
      while (i--) {
        node = nodes[i];
        if (!node.parent) {
          continue;
        }

        var container = { name: node.name, attr: new Array(), value: '' };
        container.value = node.firstChild ? node.firstChild.value : null;

        for (var j = 0; j < node.attributes.length; j++) {
          container.attr[j] = {
            name: node.attributes[j].name,
            value: node.attributes[j].value,
          };
        }

        var realElm = editor.editorManager.html.Node.create("span", 1);
        realElm.attr({
            class: 'mce-object',
            contentEditable: 'false',
            style: 'display:block;',
            'data-mce-script-guard-object': JSON.stringify(container),
        });
        var innerNode = editor.editorManager.html.Node.create('#text', 3);
        innerNode.value = "<script> tag element";
        realElm.append(innerNode);

        // HINT plugin/media L1706
        node.replace(realElm);
      }
    });

    // HINT plugin/media L1641
    editor.serializer.addAttributeFilter('data-mce-script-guard-object', function (nodes, name) {
      var i = nodes.length;
      var node;
      var realElm;
      var innerHtml;
      var innerNode;
      var realElmName;

      while (i--) {
        node = nodes[i];
        if (!node.parent) {
          continue;
        }

        // HINT
        // 34239  node.attr('type', type == 'mce-no/type' ? null : type.replace(/^mce\-/, ''));
        // 34235  // Remove mce- prefix from script elements and remove default type since the user specified
        // 34236  // a script element without type attribute

        var object = JSON.parse(node.attr('data-mce-script-guard-object'));
        realElm = new editor.editorManager.html.Node.create(object.name, 1);
        for (var j = 0; j < object.attr.length; j++) {
            var p = object.attr[j];
            realElm.attr(p.name, p.value);
        }

        if (realElm.attr('type')) realElm.attr('type', realElm.attr('type').replace(/^mce\-/, '') );
        if (realElm.attr('type') === 'no/type') realElm.attr('type', null);

        // Inject innerhtml
        innerHtml = object.value;
        if (innerHtml) {
          innerNode = new editor.editorManager.html.Node.create('#text', 3);
          innerNode.raw = true;
          innerNode.value = innerHtml;
          realElm.append(innerNode);
        }
        node.replace(realElm);
      }
    });
  };
  editor.on('PreInit', onPreInit);
  editor.on('BeforeSetContent', onPreInit);
});
