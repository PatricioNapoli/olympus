import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('javascript', js);

const code = (props) => {
    return(
        <SyntaxHighlighter language="javascript" style={dracula} showLineNumbers>
            {props.data}
        </SyntaxHighlighter>
    )
};

export default code;
