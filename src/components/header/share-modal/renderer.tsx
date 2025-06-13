import stringify from 'json-stringify-pretty-compact';
import {parse as parseJSONC} from 'jsonc-parser';
import LZString from 'lz-string';
import * as React from 'react';
import Clipboard from 'react-clipboard.js';
import {Copy, Link, Save} from 'react-feather';
import {useDispatch, useSelector} from 'react-redux';
import {mapDispatchToProps, mapStateToProps} from './index.js';
import {NAMES} from '../../../constants/consts.js';
import {getAuthFromLocalStorage} from '../../../utils/browser.js';
import GistSelectWidget from '../../gist-select-widget/index.js';
import LoginConditional from '../../login-conditional/index.js';
import './index.css';
import {State} from '../../../constants/default-state.js';
import {useEffect, useState} from 'react';

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

export default function ShareModal() {
  const props = useSelector((state: State) => ({...mapStateToProps(state)}));
  const dispatch = useDispatch();
  const boundActions = mapDispatchToProps(dispatch);

  const [whitespace, setWhitespace] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [generatedURL, setGeneratedURL] = useState('');
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(undefined);
  const [createError, setCreateError] = useState(false);
  const [gistPrivate, setGistPrivate] = useState(false);
  const [gistFileName, setGistFileName] = useState('spec.json');
  const [gistFileNameSelected, setGistFileNameSelected] = useState('');
  const [gistTitle, setGistTitle] = useState(`${NAMES[props.mode]} spec from ${new Date().toLocaleDateString()}`);
  const [gistId, setGistId] = useState('');
  const [updating, setUpdating] = useState(undefined);
  const [gistEditorURL, setGistEditorURL] = useState('');
  const [updateError, setUpdateError] = useState(false);

  const exportURL = () => {
    const specString = whitespace ? props.editorString : JSON.stringify(parseJSONC(props.editorString));

    const serializedSpec = LZString.compressToEncodedURIComponent(specString) + (fullScreen ? '/view' : '');

    if (serializedSpec) {
      const url = `${document.location.href.split('#')[0]}#/url/${props.mode}/${serializedSpec}`;
      setGeneratedURL(url);
    }
  };

  const previewURL = () => {
    const win = window.open(generatedURL, '_blank');
    win.focus();
  };

  const onCopy = () => {
    if (!copied) {
      setCopied(true);
    }
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };
  const handleFullscreenCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFullScreen(event.target.checked);
    exportURL();
  };

  const handleWhitespaceCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWhitespace(event.target.checked);
    exportURL();
  };

  useEffect(() => {
    exportURL();
  }, []);

  const updatePrivacy = (event) => {
    setGistPrivate(event.target.checked);
  };

  const fileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGistFileName(event.target.value);
  };

  const gistFileNameSelectedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGistFileNameSelected(event.target.value);
  };

  const titleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGistTitle(event.target.value);
  };

  const createGist = async () => {
    setCreating(true);
    const body = {
      content: whitespace ? props.editorString : stringify(parseJSONC(props.editorString)),
      name: gistFileName || 'spec',
      title: gistTitle,
      privacy: gistPrivate,
    };

    try {
      // Get GitHub access token from localStorage
      const authData = getAuthFromLocalStorage();
      const githubToken = authData?.githubAccessToken || localStorage.getItem('vega_editor_github_token');

      if (!githubToken) {
        setCreating(false);
        setCreateError(true);
        boundActions.receiveCurrentUser(false);
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

      setCreating(false);
      setUpdating(undefined);

      if (!data.id) {
        setCreateError(true);
        if (res.status === 401) {
          boundActions.receiveCurrentUser(false);
        }
      } else {
        const fileName = Object.keys(data.files)[0];
        setCreateError(false);
        setGistEditorURL(`${EDITOR_BASE}#/gist/${data.id}/${fileName}`);
      }
    } catch (error) {
      console.error('Error creating gist:', error);
      setCreating(false);
      setCreateError(true);
    }
  };

  const selectGist = (id: string, fileName: string) => {
    setGistFileNameSelected(fileName);
    setGistId(id);
  };

  const updateGist = async () => {
    setUpdating(true);

    const fileName = gistFileNameSelected;

    try {
      if (gistId) {
        const authData = getAuthFromLocalStorage();
        const githubToken = authData?.githubAccessToken || localStorage.getItem('vega_editor_github_token');

        if (!githubToken) {
          setUpdating(false);
          setUpdateError(true);

          boundActions.receiveCurrentUser(false);
          return;
        }

        const gistBody = {
          description: gistTitle,
          files: {
            [fileName]: {
              content: whitespace ? props.editorString : stringify(parseJSONC(props.editorString)),
            },
          },
        };

        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
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

        setUpdating(false);
        setUpdateError(false);

        if (res.status === 401) {
          boundActions.receiveCurrentUser(false);
        } else {
          setGistEditorURL(`${EDITOR_BASE}#/gist/${data.id}/${fileName}`);
        }
      }
    } catch (error) {
      console.error('Error updating gist:', error);
      setUpdateError(true);
      setUpdating(false);
    }
  };
  return (
    <div className="share-modal">
      <h1>Share</h1>
      <h2>Via URL</h2>
      <p>
        We pack the {NAMES[props.mode]} specification as an encoded string in the URL. We use a LZ-based compression
        algorithm. When whitespaces are not preserved, the editor will automatically format the specification when it is
        loaded.
      </p>
      <div>
        <label className="user-pref">
          <input type="checkbox" defaultChecked={fullScreen} name="fullscreen" onChange={handleFullscreenCheck} />
          Open visualization in fullscreen
        </label>
        <label className="user-pref">
          <input type="checkbox" defaultChecked={whitespace} name="whitespace" onChange={handleWhitespaceCheck} />
          Preserve whitespace, comments, and trailing commas
        </label>
      </div>
      <div className="sharing-buttons">
        <button onClick={() => previewURL()}>
          <Link />
          <span>Open Link</span>
        </button>
        <Clipboard className="copy-icon" data-clipboard-text={generatedURL} onSuccess={onCopy}>
          <Copy />
          <span>Copy Link to Clipboard</span>
        </Clipboard>
        <Clipboard
          className="copy-icon"
          data-clipboard-text={`[Open the Chart in the Vega Editor](${generatedURL})`}
          onSuccess={onCopy}
        >
          <Copy />
          <span>Copy Markdown Link to Clipboard</span>
        </Clipboard>
        <div className={`copied + ${copied ? ' visible' : ''}`}>Copied!</div>
      </div>
      Number of characters in the URL: {generatedURL.length}{' '}
      <span className="url-warning">
        {generatedURL.length > 2083 && (
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
          Here, you can save your {NAMES[props.mode]} specification as a new Gist or update an existing Gist. You can
          view all of your Gists on <a href={`https://gist.github.com/${props.handle}`}>GitHub</a>.
        </p>
        <div className="share-gist-split">
          <div className="update-gist">
            <h3>Update an existing Gist</h3>
            <p>To update an existing Gist, select it in the list and then click the button below to confirm.</p>
            <GistSelectWidget selectGist={selectGist} />
            {props.isAuthenticated && (
              <React.Fragment>
                <div className="share-input-container">
                  <label>
                    File name:
                    <input value={gistFileNameSelected} onChange={gistFileNameSelectedChange} type="text" />
                    <small>Change the filename to create a new file in the selected Gist</small>
                  </label>
                </div>
              </React.Fragment>
            )}
            <div className="sharing-buttons">
              <button onClick={updateGist} disabled={!gistFileNameSelected || updating}>
                <Save />
                {updating ? 'Updating...' : 'Update'}
              </button>
              {gistEditorURL && updating !== undefined && (
                <Clipboard className="copy-icon" data-clipboard-text={gistEditorURL}>
                  <Copy />
                  <span>Copy Link to Clipboard</span>
                </Clipboard>
              )}
            </div>
            {updateError && <div className="error-message share-error">Gist could not be updated.</div>}
          </div>
          <div>
            <h3>Create a new Gist</h3>
            <p>
              Save the current {NAMES[props.mode]} specification as a Gist. When you save it, you will get a link that
              you can share. You can also load the specification via the Gist loading functionality in the editor.
            </p>
            <div>
              <label className="user-pref">
                <input type="checkbox" defaultChecked={whitespace} name="whitespace" onChange={handleWhitespaceCheck} />
                Preserve whitespace, comments, and trailing commas
              </label>
            </div>
            <div className="share-input-container">
              <label>
                Title:
                <input value={gistTitle} onChange={titleChange} type="text" placeholder="Enter title of gist" />
              </label>
            </div>
            <div className="share-input-container">
              <label>
                File name:
                <input value={gistFileName} onChange={fileNameChange} type="text" placeholder="Enter file name" />
              </label>
            </div>
            <div className="share-input-container">
              <label>
                <input
                  type="checkbox"
                  name="private-gist"
                  id="private-gist"
                  value="private-select"
                  checked={gistPrivate}
                  onChange={updatePrivacy}
                />
                Create a Private Gist
              </label>
            </div>
            <div className="sharing-buttons">
              <button onClick={createGist} disabled={creating}>
                <Save />
                {creating ? 'Creating...' : 'Create'}
              </button>
              {gistEditorURL && creating !== undefined && (
                <Clipboard className="copy-icon" data-clipboard-text={gistEditorURL}>
                  <Copy />
                  <span>Copy Link to Clipboard</span>
                </Clipboard>
              )}
              {createError && <div className="error-message share-error">Gist could not be created</div>}
            </div>
          </div>
        </div>
      </LoginConditional>
    </div>
  );
}