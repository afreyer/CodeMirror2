// This mode is used for indent guides in python-based languages

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    CodeMirror.defineMode("indentguides", function(conf, parserConf) {

        var CLS = "indentguide-" + (parserConf.cls || "");
        var INDENT_CLASSES = parserConf.indentClasses || 1;

        return {
            startState: function(basecolumn) {
                return {
                    scopes: [{offset: basecolumn || 0}]
                };
            },
            token: function(stream, state) {
                var scopeOffset = state.scopes[0].offset;
                var lineOffset = stream.indentation();

                while (lineOffset < scopeOffset) {
                    state.scopes.shift();
                    scopeOffset = state.scopes[0].offset;
                }

                if (stream.peek().match(/\s/)) {
                    var column = CodeMirror.countColumn(stream.string, stream.pos, stream.tabSize);
                    if (column < scopeOffset) {
                        var offsets = Ext.Array.pluck(state.scopes, 'offset');
                        var currentOffset = offsets.indexOf(column);

                        if (currentOffset != -1) {
                            stream.next();
                            var indentLevel = (offsets.length - 1 - currentOffset) % INDENT_CLASSES;
                            return CLS + indentLevel;
                        } else {
                            do {
                                stream.next();
                                column = CodeMirror.countColumn(stream.string, stream.pos, stream.tabSize);
                            } while (offsets.indexOf(column) == -1)
                            return CLS + "separator";
                        }
                    } else {
                        if (lineOffset - 1 > scopeOffset) {
                            state.scopes.unshift({
                                offset: lineOffset
                            });
                            return null;
                        }
                    }

                }

                stream.skipToEnd();
                return null;
            }
        };
    });

});
