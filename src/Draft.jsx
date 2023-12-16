import React from 'react';
import { Editor, EditorState, convertToRaw, Modifier, RichUtils, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
const styleMap = {
    'TEXT_HEADER': {
        fontSize: '50px',
        fontWeight: 'bold'
    },
    'TEXT_FONT_WEIGHT': {
        fontWeight: 'bold'
    },
    'TEXT_REDLINE': {
        color: 'red',
    },
    'TEXT_CODE': {
        fontFamily: 'monospace',
        backgroundColor: 'lightgray',
    },
    'TEXT_UNDERLINE': {
        textDecoration: 'underline'
    }
};

class MyEditor extends React.Component {
    constructor(props) {
        super(props);
        const contentStore = localStorage.getItem('content');
        if (contentStore) {
            this.state = { 
                editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(contentStore))) 
            };
        } else {
            this.state = { 
                editorState: EditorState.createEmpty() 
            };
        }
        this.onChange = editorState => {
            const currentSelection = editorState.getSelection();
            const currentKey = currentSelection.getStartKey();
            const currentContent = editorState.getCurrentContent();
            const currentBlock = currentContent.getBlockForKey(currentKey);
            let updatedEditorState = '';
            let style = 'unstyled'
            const replacement = this.textReplacement(currentContent, currentBlock, currentBlock.text.length)
            const newState = EditorState.push(editorState, replacement);
            switch (currentBlock.text) {
                case '# ':
                    updatedEditorState = this.preserveStyle(newState, "TEXT_HEADER");
                    break;
                case '* ':
                    updatedEditorState = this.preserveStyle(newState, "TEXT_FONT_WEIGHT");
                    break;
                case '** ':
                    updatedEditorState = this.preserveStyle(newState, "TEXT_REDLINE");
                    break;
                case '*** ':
                    updatedEditorState = this.preserveStyle(newState, "TEXT_UNDERLINE");
                    break;
                case '``` ':
                    updatedEditorState = this.preserveStyle(newState, "TEXT_CODE");
                    break;
                default:
                    updatedEditorState = RichUtils.toggleInlineStyle(editorState, style);
                    break;
            }
            this.setState({ 
                editorState: updatedEditorState 
            })
        };

        this.handleStorage = this.handleStorage.bind(this);
        this.textReplacement = this.textReplacement.bind(this);
        this.preserveStyle = this.preserveStyle.bind(this);
    }

    /* Preserves the input style and toggles the currently applied styles */
    preserveStyle(state, toPreserve) {
        let styles = Object.assign({}, styleMap);
        delete styles[toPreserve];
        Object.keys(styles).map(d => {
            if(state.getCurrentInlineStyle().has(d))
                state = RichUtils.toggleInlineStyle(state, d);
        })
        state = RichUtils.toggleInlineStyle(state, toPreserve);
        return state;
    }

    /* Slices of beginning text command format */
    textReplacement(currentContent, currentBlock, sliceValue) {
        return Modifier.replaceText(
            currentContent,
            this.state.editorState.getSelection().merge({
                anchorOffset: 0,
                focusOffset: currentBlock.text.length
            }),
            currentBlock.text.slice(sliceValue)
        );
    }

    /* Saves the current content of the editor into localstorage */
    handleStorage() {
        const contentState = this.state.editorState.getCurrentContent();
        localStorage.setItem('content', JSON.stringify(convertToRaw(contentState)));
        this.setState({
            editorState: this.state.editorState,
        });
    }

    render() {
        return (
            <>
                <div class="save-button-div">
                    <p>Demo Editor by Pushpam Matah</p>
                    <button class="save-button" role="button" onClick={this.handleStorage}>Save</button>
                </div>
                <Editor
                    customStyleMap={styleMap}
                    editorState={this.state.editorState}
                    onChange={this.onChange}
                />
            </>
        );
    }
}

export default MyEditor;