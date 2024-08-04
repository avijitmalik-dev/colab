import React, { useEffect, useRef } from "react";
import io from "socket.io-client";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "@codemirror/basic-setup";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

// Ensure the socket URL matches your server setup
const socket = io('http://localhost:8000');

const Editor = ({ roomId }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: "",
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            socket.emit('CODE_CHANGE', { roomId, code: update.state.doc.toString() });
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    socket.on('CODE_CHANGE', ({ code }) => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: code },
      });
    });

    return () => {
      view.destroy();
      socket.off('CODE_CHANGE');
    };
  }, [roomId]);

  return <div ref={editorRef} style={{ height: "100%" }}></div>;
};

export default Editor;
