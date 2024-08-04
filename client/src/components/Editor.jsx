import React, { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "@codemirror/basic-setup";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { ACTIONS } from "../Action";

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const startState = EditorState.create({
      doc: "",
      extensions: [
        basicSetup,
        oneDark,
        javascript(),
        EditorView.updateListener.of((update) => {
          if (update.changes) {
            const code = update.state.doc.toString();
            onCodeChange(code);
            if (update.transactions[0].isUserEvent("input.type")) {
              socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code,
              });
            }
          }
        }),
      ],
    });

    const editor = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    return () => {
      editor.destroy();
    };
  }, [onCodeChange, roomId, socketRef]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          const currentDoc = editorRef.current.editorView.state.doc.toString();
          if (code !== currentDoc) {
            editorRef.current.editorView.dispatch({
              changes: { from: 0, to: currentDoc.length, insert: code },
            });
          }
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef]);

  return <div ref={editorRef} className="h-96 w-full"></div>;
}

export default Editor;
