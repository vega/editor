import React, {useState, useEffect, useCallback} from 'react';
import stringify from 'json-stringify-pretty-compact';
import {parse as parseJSONC} from 'jsonc-parser';
import LZString from 'lz-string';
import Clipboard from 'react-clipboard.js';
import {Copy, Link, Save} from 'react-feather';
import {useAppSelector, useAppDispatch} from '../../../hooks.js';
import {receiveCurrentUser} from '../../../slices/authSlice.js';
import {NAMES} from '../../../constants/consts.js';
import GistSelectWidget from '../../gist-select-widget/index.js';
import LoginConditional from '../../login-conditional/index.js';
import {getGithubToken} from '../../../utils/github.js';
import './index.css';

const EDITOR_BASE = window.location.origin + window.location.pathname;

interface ShareModalState {
  copied: boolean;
  creating: boolean;
  createError: boolean;
  updateError: boolean;
  fullScreen: boolean;
  whitespace: boolean;
  generatedURL: string;
  gistFileName: string;
  gistFileNameSelected: string;
  gistPrivate: boolean;
  gistTitle: string;
  gistId: string;
  updating: boolean;
  gistEditorURL: string;
}

const ShareModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const {editorString, mode, isAuthenticated, handle} = useAppSelector((state) => ({
    editorString: state.editorString,
    mode: state.mode,
    isAuthenticated: state.isAuthenticated,
    handle: state.handle,
  }));

  const date = new Date().toDateString();
  const [state, setState] = useState<ShareModalState>({
    copied: false,
    creating: false,
    createError: false,
    updateError: false,
    fullScreen: false,
    whitespace: false,
    generatedURL: '',
    gistFileName: 'spec.json',
    gistFileNameSelected: '',
    gistPrivate: false,
    gistTitle: `${NAMES[mode]} spec from ${date}`,
    gistId: '',
    updating: false,
    gistEditorURL: '',
  });

  const exportURL = useCallback(() => {
    const specString = state.whitespace ? editorString : JSON.stringify(parseJSONC(editorString));

    const serializedSpec = LZString.compressToEncodedURIComponent(specString) + (state.fullScreen ? '/view' : '');

    if (serializedSpec) {
      const url = `${document.location.href.split('#')[0]}#/url/${mode}/${serializedSpec}`;
      setState((prev) => ({...prev, generatedURL: url}));
    }
  }, [editorString, mode, state.whitespace, state.fullScreen]);

  const previewURL = useCallback(() => {
    const win = window.open(state.generatedURL, '_blank');
    if (win) win.focus();
  }, [state.generatedURL]);

  const onCopy = useCallback(() => {
    if (!state.copied) {
      setState((prev) => ({...prev, copied: true}));
      setTimeout(() => {
        setState((prev) => ({...prev, copied: false}));
      }, 2500);
    }
  }, [state.copied]);

  const handleFullscreenCheck = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({...prev, fullScreen: event.target.checked}));
  }, []);

  const handleWhitespaceCheck = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({...prev, whitespace: event.target.checked}));
  }, []);

  const updatePrivacy = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({...prev, gistPrivate: event.target.checked}));
  }, []);

  const fileNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({...prev, gistFileName: event.target.value}));
  }, []);

  const gistFileNameSelectedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({...prev, gistFileNameSelected: event.target.value}));
  }, []);

  const titleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({...prev, gistTitle: event.target.value}));
  }, []);

  const selectGist = useCallback((id: string, fileName: string) => {
    setState((prev) => ({
      ...prev,
      gistFileNameSelected: fileName,
      gistId: id,
    }));
  }, []);

  const createGist = useCallback(async () => {
    setState((prev) => ({...prev, creating: true}));

    const body = {
      content: state.whitespace ? editorString : stringify(parseJSONC(editorString)),
      name: state.gistFileName || 'spec',
      title: state.gistTitle,
      privacy: state.gistPrivate,
    };

    try {
      let githubToken;
      try {
        githubToken = await getGithubToken();
      } catch (error) {
        console.error('Failed to get GitHub token:', error);
        setState((prev) => ({
          ...prev,
          creating: false,
          createError: true,
        }));
        dispatch(receiveCurrentUser({isAuthenticated: false}));
        return;
      }

      const gistBody = {
        description: body.title,
        public: !body.privacy,
        files: {
          [body.name.endsWith('.json') ? body.name : `${body.name}.json`]: {
            content: body.content,
          },
        },
      };

      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${githubToken}`,
        },
        body: JSON.stringify(gistBody),
      });

      if (!res.ok) {
        throw new Error(`Failed to create gist: ${res.status}`);
      }

      const data = await res.json();

      setState((prev) => ({
        ...prev,
        creating: false,
        updating: false,
      }));

      if (!data.id) {
        setState((prev) => ({...prev, createError: true}));
        if (res.status === 401) {
          dispatch(receiveCurrentUser({isAuthenticated: false}));
        }
      } else {
        const fileName = Object.keys(data.files)[0];
        setState((prev) => ({
          ...prev,
          createError: false,
          gistEditorURL: `${EDITOR_BASE}#/gist/${data.id}/${fileName}`,
        }));
      }
    } catch (error) {
      console.error('Error creating gist:', error);
      setState((prev) => ({
        ...prev,
        creating: false,
        createError: true,
      }));
    }
  }, [editorString, state.whitespace, state.gistFileName, state.gistTitle, state.gistPrivate, dispatch]);

  const updateGist = useCallback(async () => {
    setState((prev) => ({...prev, updating: true}));

    const fileName = state.gistFileNameSelected;

    try {
      if (state.gistId) {
        // Get GitHub access token just-in-time
        let githubToken;
        try {
          githubToken = await getGithubToken();
        } catch (error) {
          console.error('Failed to get GitHub token:', error);
          setState((prev) => ({
            ...prev,
            updating: false,
            updateError: true,
          }));
          dispatch(receiveCurrentUser({isAuthenticated: false}));
          return;
        }

        const gistBody = {
          files: {
            [fileName]: {
              content: editorString,
            },
          },
        };
        const res = await fetch(`https://api.github.com/gists/${state.gistId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${githubToken}`,
          },
          body: JSON.stringify(gistBody),
        });

        if (!res.ok) {
          throw new Error(`Failed to update gist: ${res.status}`);
        }

        const data = await res.json();

        if (data.id) {
          setState((prev) => ({
            ...prev,
            gistEditorURL: `${EDITOR_BASE}#/gist/${data.id}/${fileName}`,
            creating: false,
            updating: false,
            updateError: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            creating: false,
            updating: false,
            updateError: true,
          }));
        }
      }
    } catch (error) {
      console.error('Error updating gist:', error);
      setState((prev) => ({
        ...prev,
        creating: false,
        updating: false,
        updateError: true,
      }));
    }
  }, [editorString, state.gistId, state.gistFileNameSelected, dispatch]);

  useEffect(() => {
    exportURL();
  }, [exportURL]);

  useEffect(() => {
    exportURL();
  }, [state.fullScreen, state.whitespace]);

  return (
    <div className="share-modal">
      <h1>Share</h1>
      <h2>Via URL</h2>
      <p>
        We pack the {NAMES[mode]} specification as an encoded string in the URL. We use a LZ-based compression
        algorithm. When whitespaces are not preserved, the editor will automatically format the specification when it is
        loaded.
      </p>
      <div>
        <label className="user-pref">
          <input type="checkbox" checked={state.fullScreen} name="fullscreen" onChange={handleFullscreenCheck} />
          Open visualization in fullscreen
        </label>
        <label className="user-pref">
          <input type="checkbox" checked={state.whitespace} name="whitespace" onChange={handleWhitespaceCheck} />
          Preserve whitespace, comments, and trailing commas
        </label>
      </div>
      <div className="sharing-buttons">
        <button onClick={previewURL}>
          <Link />
          <span>Open Link</span>
        </button>
        <Clipboard className="copy-icon" data-clipboard-text={state.generatedURL} onSuccess={onCopy}>
          <Copy />
          <span>Copy Link to Clipboard</span>
        </Clipboard>
        <Clipboard
          className="copy-icon"
          data-clipboard-text={`[Open the Chart in the Vega Editor](${state.generatedURL})`}
          onSuccess={onCopy}
        >
          <Copy />
          <span>Copy Markdown Link to Clipboard</span>
        </Clipboard>
        <div className={`copied + ${state.copied ? ' visible' : ''}`}>Copied!</div>
      </div>
      Number of characters in the URL: {state.generatedURL.length}{' '}
      <span className="url-warning">
        {state.generatedURL.length > 2083 && (
          <>
            Warning:{' '}
            <a
              href="https://support.microsoft.com/en-us/help/208427/maximum-url-length-is-2-083-characters-in-internet-explorer"
              target="_blank"
              rel="noopener noreferrer"
            >
              URLs over 2083 characters may not be supported in Internet Explorer.
            </a>
          </>
        )}
      </span>
      <div className="spacer"></div>
      <h2>
        Via{' '}
        <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer">
          GitHub Gist
        </a>
      </h2>
      <LoginConditional>
        <p>
          Here, you can save your {NAMES[mode]} specification as a new Gist or update an existing Gist. You can view all
          of your Gists on <a href={`https://gist.github.com/${handle}`}>GitHub</a>.
        </p>
        <div className="share-gist-split">
          <div className="update-gist">
            <h3>Update an existing Gist</h3>
            <p>To update an existing Gist, select it in the list and then click the button below to confirm.</p>
            <GistSelectWidget selectGist={selectGist} />
            {isAuthenticated && (
              <React.Fragment>
                <div className="share-input-container">
                  <label>
                    File name:
                    <input value={state.gistFileNameSelected} onChange={gistFileNameSelectedChange} type="text" />
                    <small>Change the filename to create a new file in the selected Gist</small>
                  </label>
                </div>
              </React.Fragment>
            )}
            <div className="sharing-buttons">
              <button onClick={updateGist} disabled={!state.gistFileNameSelected || state.updating}>
                <Save />
                {state.updating ? 'Updating...' : 'Update'}
              </button>
              {state.gistEditorURL && state.updating !== undefined && (
                <Clipboard className="copy-icon" data-clipboard-text={state.gistEditorURL}>
                  <Copy />
                  <span>Copy Link to Clipboard</span>
                </Clipboard>
              )}
            </div>
            {state.updateError && <div className="error-message share-error">Gist could not be updated.</div>}
          </div>
          <div>
            <h3>Create a new Gist</h3>
            <p>
              Save the current {NAMES[mode]} specification as a Gist. When you save it, you will get a link that you can
              share. You can also load the specification via the Gist loading functionality in the editor.
            </p>
            <div>
              <label className="user-pref">
                <input type="checkbox" checked={state.whitespace} name="whitespace" onChange={handleWhitespaceCheck} />
                Preserve whitespace, comments, and trailing commas
              </label>
            </div>
            <div className="share-input-container">
              <label>
                Title:
                <input value={state.gistTitle} onChange={titleChange} type="text" placeholder="Enter title of gist" />
              </label>
            </div>
            <div className="share-input-container">
              <label>
                File name:
                <input value={state.gistFileName} onChange={fileNameChange} type="text" placeholder="Enter file name" />
              </label>
            </div>
            <div className="share-input-container">
              <label>
                <input
                  type="checkbox"
                  name="private-gist"
                  id="private-gist"
                  value="private-select"
                  checked={state.gistPrivate}
                  onChange={updatePrivacy}
                />
                Create a Private Gist
              </label>
            </div>
            <div className="sharing-buttons">
              <button onClick={createGist} disabled={state.creating}>
                <Save />
                {state.creating ? 'Creating...' : 'Create'}
              </button>
              {state.gistEditorURL && state.creating !== undefined && (
                <Clipboard className="copy-icon" data-clipboard-text={state.gistEditorURL}>
                  <Copy />
                  <span>Copy Link to Clipboard</span>
                </Clipboard>
              )}
              {state.createError && <div className="error-message share-error">Gist could not be created</div>}
            </div>
          </div>
        </div>
      </LoginConditional>
    </div>
  );
};

export default ShareModal;
