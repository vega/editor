import * as React from 'react';
import {AlertCircle} from 'react-feather';
import {useNavigate} from 'react-router';
import {useAppContext} from '../../../context/app-context.js';
import GistSelectWidget from '../../gist-select-widget/index.js';
import './index.css';
import {parse as parseJSONC} from 'jsonc-parser';
import {useRef, useState, useCallback} from 'react';

export type Props = {
  closePortal: () => void;
};

export default function GistModal({closePortal}: Props) {
  const {state} = useAppContext();
  const {handle} = state;

  const refGistForm = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  const [gist, setGist] = useState({
    filename: '',
    image: '',
    imageStyle: {
      bottom: 0,
    },
    revision: '',
    url: '',
  });

  const [gistLoadClicked, setGistLoadClicked] = useState(false);
  const [invalidFilename, setInvalidFilename] = useState(false);
  const [invalidUrl, setInvalidUrl] = useState(false);
  const [invalidRevision, setInvalidRevision] = useState(false);
  const [syntaxError, setSyntaxError] = useState(false);

  const updateGist = useCallback((newGist) => {
    setGist((g) => ({...g, ...newGist}));
  }, []);

  const onSelectGist = async () => {
    const url = gist.url.trim().toLowerCase();
    if (url.length === 0) {
      refGistForm.current?.reportValidity();
      return;
    }
    setGistLoadClicked(true);

    let gistUrl: URL;

    try {
      gistUrl = new URL(url);
    } catch (e) {
      setInvalidUrl(true);
      setGistLoadClicked(false);
      return;
    }

    const pathParts = gistUrl.pathname.split('/');
    const gistId = pathParts[2];
    const revision = gist.revision.trim().toLowerCase() || undefined;
    let filename = gist.filename.trim();

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const githubToken = localStorage.getItem('vega_editor_github_token');
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      const gistSummaryResponse = await fetch(
        `https://api.github.com/gists/${gistId}${revision ? `/${revision}` : ''}`,
        {
          headers,
        },
      );

      if (!gistSummaryResponse.ok) {
        setInvalidUrl(true);
        setGistLoadClicked(false);
        return;
      }

      const gistSummary = await gistSummaryResponse.json();

      if (!filename) {
        const jsonFiles = Object.keys(gistSummary.files).filter((file) => file.endsWith('.json'));
        if (jsonFiles.length === 0) {
          setInvalidUrl(true);
          setGistLoadClicked(false);
          return;
        }
        filename = jsonFiles[0];
      }

      if (!gistSummary.files[filename]) {
        setInvalidFilename(true);
        setGistLoadClicked(false);
        return;
      }

      const content = await fetchGistContent(gistSummary, filename);
      const errors = [];
      parseJSONC(content, errors);
      if (errors.length > 0) {
        setSyntaxError(true);
        setGistLoadClicked(false);
        return;
      }

      navigate(`/gist/${gistId}${revision ? `/${revision}` : ''}/${filename}`);
      closePortal();
    } catch (error) {
      console.error('Error loading gist:', error);
      setGistLoadClicked(false);
    }
  };

  const fetchGistContent = async (gistSummary, filename) => {
    const file = gistSummary.files[filename];
    if (file.truncated) {
      const response = await fetch(file.raw_url);
      return await response.text();
    }
    return file.content;
  };

  const preview = (id, file, image) => {
    if (id) {
      updateGist({
        url: `https://gist.github.com/${handle}/${id}`,
        filename: file || '',
        image: image || '',
        imageStyle: {
          bottom: 0,
        },
      });
    }
  };

  const slideImage = (event) => {
    updateGist({imageStyle: {bottom: gist.imageStyle.bottom + event.deltaY}});
  };

  const slideImageBack = () => {
    updateGist({image: '', imageStyle: {bottom: 0}});
  };

  return (
    <div>
      <h1>
        Load{' '}
        <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer">
          GitHub Gist
        </a>
      </h1>
      <div className="gist-split">
        <div className="personal-gist">
          <h3>Your gists</h3>
          <p>
            To load a gist, select it in the list below or specify its details on the right. View all your Gists on{' '}
            <a href={`https://gist.github.com/${handle}`}>GitHub</a>.
          </p>
          <GistSelectWidget selectGist={preview} />
        </div>
        <div className="load-gist">
          <h3>Load gists</h3>
          <form ref={refGistForm}>
            <div className="gist-input-container">
              <label>
                Gist URL
                <div style={{marginTop: '2px'}}>
                  <small>
                    Example:{' '}
                    <span
                      className="gist-url"
                      onClick={() =>
                        updateGist({
                          filename: '',
                          image: '',
                          revision: '',
                          url: 'https://gist.github.com/domoritz/455e1c7872c4b38a58b90df0c3d7b1b9',
                        })
                      }
                    >
                      {'https://gist.github.com/domoritz/455e1c7872c4b38a58b90df0c3d7b1b9'}
                    </span>
                  </small>
                </div>
                <input
                  required
                  className="gist-input"
                  type="text"
                  placeholder="Enter URL"
                  value={gist.url}
                  onChange={(e) => updateGist({url: e.target.value, invalidUrl: false})}
                />
              </label>
              <div className="error-message">{invalidUrl && <span>Please enter a valid URL.</span>}</div>
            </div>
            <div className="gist-optional">
              <div className="gist-input-container gist-optional-input-container">
                <label>
                  Revision (optional)
                  <input
                    className="gist-input"
                    type="text"
                    placeholder="Enter revision"
                    value={gist.revision}
                    onChange={(e) => updateGist({revision: e.target.value, invalidRevision: false})}
                  />
                </label>
                <div className="error-message">{invalidRevision && <span>Please enter a valid revision.</span>}</div>
              </div>
              <div className="gist-input-container gist-optional-input-container">
                <label>
                  Filename (optional)
                  <input
                    className="gist-input"
                    type="text"
                    placeholder="Enter filename"
                    value={gist.filename}
                    onChange={(e) => updateGist({filename: e.target.value, invalidFilename: false})}
                  />
                </label>
                <div className="error-message">
                  {invalidFilename ? (
                    <span>Please enter a valid JSON file</span>
                  ) : (
                    syntaxError && <span>JSON is syntactically incorrect</span>
                  )}
                </div>
              </div>
            </div>
            {gist.url && gist.filename ? (
              gist.image ? (
                <div className="preview-container">
                  <div className="preview-text">Preview:</div>
                  <div className="preview-image-container">
                    <div className="preview-image-wrapper">
                      <img
                        src={gist.image}
                        onMouseOver={slideImage}
                        onMouseOut={slideImageBack}
                        style={{
                          transform: `translateY(-${gist.imageStyle.bottom}px)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="preview-error-message-container">
                  <div className="preview-error-message">
                    <AlertCircle className="preview-error-icon" />
                    <span>No preview available for this gist file.</span>
                  </div>
                  <span className="preview-error-fix">
                    Upload an image file with name {gist.filename.replace(/\.json/i, '.(png/jpg)')}.
                  </span>
                </div>
              )
            ) : (
              <></>
            )}
            <button type="button" onClick={onSelectGist}>
              {gistLoadClicked ? 'Loading..' : 'Load'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
