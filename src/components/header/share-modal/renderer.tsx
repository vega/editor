import stringify from 'json-stringify-pretty-compact';
import {parse as parseJSONC} from 'jsonc-parser';
import LZString from 'lz-string';
import * as React from 'react';
import {useState, useEffect} from 'react';
import Clipboard from 'react-clipboard.js';
import {Copy, Link, Save} from 'react-feather';
import {useAppDispatch, useAppSelector} from '../../../hooks.js';
import * as EditorActions from '../../../actions/editor.js';
import {NAMES} from '../../../constants/consts.js';
import GistSelectWidget from '../../gist-select-widget/index.js';
import LoginConditional from '../../login-conditional/index.js';
import './index.css';
import {getGithubToken} from '../../../utils/github.js';

const EDITOR_BASE = window.location.origin + window.location.pathname;

export default function ShareModal() {
  const dispatch = useAppDispatch();

  const {editorString, isAuthenticated, mode, handle} = useAppSelector((state) => ({
    editorString: state.editorString,
    isAuthenticated: state.isAuthenticated,
    mode: state.mode,
    handle: state.handle,
  }));

  const date = new Date().toDateString();

  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(undefined);
  const [createError, setCreateError] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [whitespace, setWhitespace] = useState(false);
  const [generatedURL, setGeneratedURL] = useState('');
  const [gistFileName, setGistFileName] = useState('spec.json');
  const [gistFileNameSelected, setGistFileNameSelected] = useState('');
  const [gistPrivate, setGistPrivate] = useState(false);
  const [gistTitle, setGistTitle] = useState(`${NAMES[mode]} spec from ${date}`);
  const [gistId, setGistId] = useState('');
  const [updating, setUpdating] = useState(undefined);
  const [gistEditorURL, setGistEditorURL] = useState('');

  const exportURL = () => {
    const specString = whitespace ? editorString : JSON.stringify(parseJSONC(editorString));

    const serializedSpec = LZString.compressToEncodedURIComponent(specString) + (fullScreen ? '/view' : '');

    if (serializedSpec) {
      const url = `${document.location.href.split('#')[0]}#/url/${mode}/${serializedSpec}`;
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
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    }
  };

  const handleFullScreenCheck = (event) => {
    setFullScreen(event.target.checked);
  };

  const handleWhitespaceCheck = (event) => {
    setWhitespace(event.target.checked);
  };

  useEffect(() => {
    exportURL();
  }, [fullScreen, whitespace, editorString, mode]);

  const updatePrivacy = (event) => {
    setGistPrivate(event.target.checked);
  };

  const fileNameChange = (event) => {
    setGistFileName(event.target.value);
  };

  const titleChange = (event) => {
    setGistTitle(event.target.value);
  };

  const createGist = async () => {
    setCreating(true);

    const body = {
      content: whitespace ? editorString : stringify(parseJSONC(editorString)),
      name: gistFileName || 'spec',
      title: gistTitle,
      privacy: gistPrivate,
    };

    try {
      // Get GitHub access token just-in-time
      let githubToken;
      try {
        githubToken = await getGithubToken();
      } catch (error) {
        console.error('Failed to get GitHub token:', error);
        setCreating(false);
        setCreateError(true);
        dispatch(EditorActions.receiveCurrentUser(false));
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

      // Direct API call to GitHub
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
          dispatch(EditorActions.receiveCurrentUser(false));
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

  const selectGist = (id, fileName) => {
    setGistFileNameSelected(fileName);
    setGistId(id);
  };

  const updateGist = async () => {
    setUpdating(true);

    const fileName = gistFileNameSelected;

    try {
      if (gistId) {
        // Get GitHub access token just-in-time
        let githubToken;
        try {
          githubToken = await getGithubToken();
        } catch (error) {
          console.error('Failed to get GitHub token:', error);
          setUpdating(false);
          setUpdateError(true);
          return;
        }

        const updateBody = {
          files: {
            [fileName]: {
              content: whitespace ? editorString : stringify(parseJSONC(editorString)),
            },
          },
        };

        // Direct API call to GitHub
        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${githubToken}`,
          },
          body: JSON.stringify(updateBody),
        });

        if (!res.ok) {
          throw new Error(`Failed to update gist: ${res.status}`);
        }

        const data = await res.json();

        setUpdating(false);
        setCreating(undefined);

        if (!data.id) {
          setUpdateError(true);
          if (res.status === 401) {
            dispatch(EditorActions.receiveCurrentUser(false));
          }
        } else {
          setUpdateError(false);
          setGistEditorURL(`${EDITOR_BASE}#/gist/${data.id}/${fileName}`);
        }
      }
    } catch (error) {
      console.error('Error updating gist:', error);
      setUpdating(false);
      setUpdateError(true);
    }
  };

  return (
    <>
      <h1>Share</h1>
      <div className="share-modal">
        <div className="share-container url">
          <div className="header-text">
            <Link />
            <span>URL</span>
          </div>
          <p>
            <em>Share a URL that opens the editor with your chart</em>
          </p>
          <div className="input-container">
            <label>
              <input type="checkbox" checked={fullScreen} onChange={handleFullScreenCheck} />
              Fullscreen
            </label>

            <label>
              <input type="checkbox" checked={whitespace} onChange={handleWhitespaceCheck} />
              Preserve whitespace
            </label>
          </div>
          <div className="share">
            <input className="share-url" type="text" value={generatedURL} readOnly />
            <Clipboard className="copy" data-clipboard-text={generatedURL} onSuccess={onCopy}>
              <Copy></Copy>
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </Clipboard>
          </div>
          <button className="preview" onClick={previewURL}>
            Preview URL
          </button>
        </div>
        <LoginConditional>
          <div className="share-container gists">
            <div className="header-text">
              <Save />
              <span>GitHub Gist</span>
            </div>
            <p>
              <em>Create or update a GitHub gist with your chart</em>
            </p>

            <div className="new-gist">
              <h3>Create New Gist</h3>
              <div className="gist-input">
                <label htmlFor="fileName">File Name</label>
                <input
                  type="text"
                  id="fileName"
                  value={gistFileName}
                  onChange={fileNameChange}
                  placeholder="spec.json"
                />
              </div>
              <div className="gist-input">
                <label htmlFor="gistTitle">Gist Title</label>
                <input
                  type="text"
                  id="gistTitle"
                  value={gistTitle}
                  onChange={titleChange}
                  placeholder={`${NAMES[mode]} spec from ${date}`}
                />
              </div>

              <div className="gist-input privacy">
                <label>
                  <input type="checkbox" checked={gistPrivate} onChange={updatePrivacy} />
                  Private
                </label>
              </div>
              <div className="gist-submit">
                {creating === true && <p className="info">Creating gist...</p>}
                {creating === false && createError === false && (
                  <div className="gist-url-container">
                    <p className="info success">
                      <a href={gistEditorURL} target="_blank" rel="noopener noreferrer">
                        {gistEditorURL}
                      </a>
                    </p>
                  </div>
                )}

                {createError === true && <p className="info error">Failed to create gist!</p>}

                <button disabled={creating || !isAuthenticated} onClick={createGist}>
                  Create Gist
                </button>
              </div>
            </div>
            <div className="update-gist">
              <h3>Update Existing Gist</h3>
              <p>
                <em>
                  Select a gist from below to update it with the current specification. Only gists created by{' '}
                  <strong>@{handle}</strong> with a{' '}
                  <span style={{color: '#42b3f4'}}>.json or .vg.json or .vl.json</span> file are shown. This only
                  updates the selected file - other files in the gist will be preserved.
                </em>
              </p>
              <div className="gist-select-container">
                <GistSelectWidget selectGist={selectGist} />
              </div>
              <div className="gist-submit gist-update">
                <button disabled={!gistId || updating} onClick={updateGist}>
                  Update Gist
                </button>
                <div>
                  {updating === true && <p className="info update-status">Updating gist...</p>}
                  {updating === false && updateError === false && (
                    <div className="gist-url-container">
                      <p className="info update-status success">
                        <a href={gistEditorURL} target="_blank" rel="noopener noreferrer">
                          {gistEditorURL}
                        </a>
                      </p>
                    </div>
                  )}
                  {updateError === true && <p className="info update-status error">Failed to update gist!</p>}
                </div>
              </div>
            </div>
          </div>
        </LoginConditional>
      </div>
    </>
  );
}
