import * as React from 'react';
import {AlertCircle} from 'react-feather';
import {useNavigate} from 'react-router';
import {useSelector} from 'react-redux';
import {mapStateToProps} from './index.js';
import GistSelectWidget from '../../gist-select-widget/index.js';
import {State} from '../../../constants/default-state.js';
import './index.css';
import {parse as parseJSONC} from 'jsonc-parser';
import {useRef, useState} from 'react';

export type Props = {
  closePortal: () => void;
};

export default function GistModal({closePortal}: Props) {
  const props = useSelector((state: State) => mapStateToProps(state));
  const refGistForm = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  const [gist, setGist] = useState({
    filename: '',
    image: '',
    imageStyle: {
      bottom: 0,
    },
    revision: '',
    type: props.mode,
    url: '',
  });

  const [gistLoadClicked, setGistLoadClicked] = useState(false);
  const [invalidFilename, setInvalidFilename] = useState(false);
  const [invalidRevision, setInvalidRevision] = useState(false);
  const [invalidUrl, setInvalidUrl] = useState(false);
  const [latestRevision, setLatestRevision] = useState(false);
  const [syntaxError, setSyntaxError] = useState(false);

  const updateGist = (newGist) => {
    setGist({
      ...gist,
      ...newGist,
    });
  };

  const updateGistUrl = (event) => {
    updateGist({url: event.currentTarget.value});
    setInvalidUrl(false);
  };

  const updateGistRevision = (event) => {
    updateGist({revision: event.currentTarget.value});
    setInvalidRevision(false);
  };

  const updateGistFile = (event) => {
    updateGist({filename: event.currentTarget.value});
    setInvalidFilename(false);
  };

  const onSelectGist = async () => {
    const url = gist.url.trim().toLowerCase();

    setGist({
      ...gist,
      filename: gist.filename.trim(),
      revision: gist.revision.trim().toLowerCase(),
    });

    if (url.length === 0) {
      refGistForm.current?.reportValidity();
      return;
    }
    setGistLoadClicked(true);

    let gistUrl: URL;

    if (url.match(/gist\.githubusercontent\.com/)) {
      gistUrl = new URL(url, 'https://gist.githubusercontent.com');
      const [revision, filename] = gistUrl.pathname.split('/').slice(4);
      setGist({
        ...gist,
        filename,
        revision,
      });
    } else if (url.match(/gist\.github\.com/)) {
      gistUrl = new URL(url, 'https://gist.github.com');
    }

    const gistId = gistUrl.pathname.split('/')[2];

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const githubToken = localStorage.getItem('vega_editor_github_token');
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      const gistCommitsResponse = await fetch(`https://api.github.com/gists/${gistId}/commits`, {
        headers,
      });

      setInvalidUrl(!gistCommitsResponse.ok);

      if (!gistCommitsResponse.ok) {
        setGistLoadClicked(false);
        throw new Error(`Failed to fetch gist commits: ${gistCommitsResponse.status}`);
      }

      const gistCommits = await gistCommitsResponse.json();

      if (!gist.revision && !invalidUrl) {
        setGist({
          ...gist,
          revision: gistCommits[0].version,
        });
      } else if (invalidUrl) {
        setGistLoadClicked(false);
        throw new Error('Invalid Gist URL');
      }

      if (gistCommits[0].version === gist.revision) {
        setLatestRevision(true);
      }

      const gistSummaryResponse = await fetch(`https://api.github.com/gists/${gistId}/${gist.revision}`, {
        headers,
      });

      setInvalidRevision(!gistSummaryResponse.ok);

      if (!gistSummaryResponse.ok) {
        setGistLoadClicked(false);
        throw new Error(`Failed to fetch gist summary: ${gistSummaryResponse.status}`);
      }

      const gistSummary = await gistSummaryResponse.json();

      if (invalidRevision) {
        setGistLoadClicked(false);
        throw new Error('Invalid Revision');
      } else if (!invalidRevision && gist.filename === '') {
        const jsonFiles = Object.keys(gistSummary.files).filter((file) => {
          if (file.split('.').slice(-1)[0] === 'json') {
            return true;
          }
        });
        if (jsonFiles.length === 0) {
          setGistLoadClicked(false);
          setInvalidUrl(true);
          throw new Error('No JSON file exists in the gist');
        } else {
          setGist({
            ...gist,
            filename: jsonFiles[0],
          });
          const {revision, filename} = gist;
          parseJSONC(gistSummary.files[jsonFiles[0]].content);
          if (latestRevision) {
            navigate(`/gist/${gistId}/${filename}`);
          } else {
            navigate(`/gist/${gistId}/${revision}/${filename}`);
          }
          closePortal();
        }
      } else {
        if (gistSummary.files[gist.filename] === undefined) {
          setGistLoadClicked(false);
          setInvalidFilename(true);
          throw new Error('Invalid file name');
        }

        try {
          const content = await fetchGistContent(gistSummary, gist.filename);

          const errors = [];
          parseJSONC(content, errors);
          if (errors.length > 0) throw SyntaxError; // check if the loaded file is a JSON

          const {revision, filename} = gist;
          if (latestRevision) {
            navigate(`/gist/${gistId}/${filename}`);
          } else {
            navigate(`/gist/${gistId}/${revision}/${filename}`);
          }
          closePortal();
        } catch (error) {
          if (error instanceof SyntaxError) {
            setGistLoadClicked(false);
            setSyntaxError(true);
          }
        }
      }
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
      setGist({
        ...gist,
        url: `https://gist.github.com/${id}`,
        filename: file || '',
        image: image || '',
        imageStyle: {
          bottom: 0,
        },
      });
    }
  };

  const slideImage = (event) => {
    const imageStyle = gist.imageStyle;
    imageStyle.bottom = imageStyle.bottom + event.deltaY;
    setGist({
      ...gist,
      imageStyle,
    });
  };

  const slideImageBack = () => {
    setGist({
      ...gist,
      image: '',
      imageStyle: {
        bottom: 0,
      },
    });
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
            <a href={`https://gist.github.com/${props.handle}`}>GitHub</a>.
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
                        setGist({
                          ...gist,
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
                  onChange={updateGistUrl}
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
                    onChange={updateGistRevision}
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
                    onChange={updateGistFile}
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
            <button type="button" onClick={() => onSelectGist()}>
              {gistLoadClicked ? 'Loading..' : 'Load'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
