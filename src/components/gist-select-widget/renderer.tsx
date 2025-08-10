import React, {useState, useEffect, useCallback} from 'react';
import {File, Lock} from 'react-feather';
import ReactPaginate from 'react-paginate';

import {GistPrivacy} from '../../constants/consts.js';
import {getGithubToken} from '../../utils/github.js';
import LoginConditional from '../login-conditional/index.js';
import './index.css';

interface Props {
  isAuthenticated: boolean;
  private: GistPrivacy;
  receiveCurrentUser: (isAuthenticated: boolean, handle?: string, name?: string, profilePicUrl?: string) => void;
  toggleGistPrivacy: () => void;
  selectGist: (id?: string, file?: string, image?: string) => void;
}

const GistSelectWidget: React.FC<Props> = ({
  isAuthenticated,
  private: isPrivate,
  receiveCurrentUser,
  toggleGistPrivacy,
  selectGist,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [personalGist, setPersonalGist] = useState([]);
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({gist: null, file: null});

  const handlePageChange = useCallback(
    async (page) => {
      if (loading) {
        setLoading(false);
        try {
          let githubToken;
          try {
            githubToken = await getGithubToken();
          } catch (error) {
            console.error('Failed to get GitHub token:', error);
            receiveCurrentUser(false);
            return;
          }

          const response = await fetch(`https://api.github.com/gists?per_page=30&page=${page.selected + 1}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `token ${githubToken}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch gists: ${response.status}`);
          }

          const gists = await response.json();

          let pageCount = 1;
          const linkHeader = response.headers.get('Link');
          if (linkHeader) {
            const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
            if (lastPageMatch && lastPageMatch[1]) {
              pageCount = parseInt(lastPageMatch[1], 10);
            }
          }

          const pageMap = {};
          for (let i = 0; i < pageCount; i++) {
            pageMap[i] = i + 1;
          }

          const filteredGists = gists.filter((gist) => {
            const hasJsonFiles = Object.keys(gist.files || {}).some((filename) => filename.endsWith('.json'));
            const isPublicGist = gist.public;
            const shouldShowPrivate = isPrivate === GistPrivacy.ALL;

            return hasJsonFiles && (isPublicGist || shouldShowPrivate);
          });

          const formattedGists = filteredGists.map((gist) => {
            const jsonFiles = Object.keys(gist.files || {})
              .filter((filename) => filename.endsWith('.json'))
              .map((filename) => ({
                name: filename,
                previewUrl: '',
              }));

            return {
              name: gist.id,
              isPublic: gist.public,
              title: gist.description || '',
              spec: jsonFiles,
              id: gist.id,
              url: gist.html_url,
              owner: gist.owner?.login || '',
            };
          });

          setCurrentPage(page.selected);
          setLoaded(true);
          setPages(pageMap);
          setLoading(true);
          setPersonalGist(formattedGists);
        } catch (error) {
          console.error('Error fetching gists:', error);
          receiveCurrentUser(false);
        }
      }
    },
    [loading, receiveCurrentUser],
  );

  useEffect(() => {
    handlePageChange({selected: 0});
  }, [isAuthenticated, isPrivate]);

  return (
    <LoginConditional>
      {loaded ? (
        <>
          <div className="privacy-toggle">
            <input
              type="checkbox"
              name="privacy"
              id="privacy"
              checked={isPrivate === GistPrivacy.ALL}
              onChange={toggleGistPrivacy}
            />
            <label htmlFor="privacy">Show private gists</label>
          </div>
          {personalGist.length > 0 ? (
            <>
              {Object.keys(pages).length > 1 && (
                <ReactPaginate
                  previousLabel={'<'}
                  nextLabel={'>'}
                  breakClassName={'break'}
                  containerClassName={'pagination'}
                  activeClassName={'active'}
                  pageCount={Object.keys(pages).length}
                  onPageChange={handlePageChange}
                  forcePage={currentPage}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={2}
                />
              )}
              <div className={`gist-wrapper ${!loading && 'loading'}`}>
                {personalGist.map((gist) => (
                  <div
                    key={gist.id || gist.name}
                    className={`gist-container ${selected.gist === gist.name && 'gist-active'}`}
                  >
                    <div className="personal-gist-description">
                      {gist.isPublic ? <File width="14" height="14" /> : <Lock width="14" height="14" fill="#FDD300" />}
                      <span className={`text ${gist.title ? '' : 'play-down'}`}>
                        {gist.title || 'No description provided'}
                      </span>
                    </div>
                    <div className="personal-gist-files">
                      {gist.spec && gist.spec.length > 0 ? (
                        gist.spec.map((spec, index) => (
                          <div key={index} className="file">
                            <div className="arrow"></div>
                            <div
                              className={`filename ${
                                selected.file === spec.name && selected.gist === gist.name && 'file-active'
                              }`}
                              onClick={() => {
                                selectGist(gist.name, spec.name);
                                setSelected({
                                  gist: gist.name,
                                  file: spec.name,
                                });
                              }}
                            >
                              {spec.name}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-files">No JSON files found</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-gists">You have no Vega or Vega-Lite compatible gists.</div>
          )}
        </>
      ) : (
        <div className="loader-container">
          <span>Loading your GISTS...</span>
        </div>
      )}
    </LoginConditional>
  );
};

export default GistSelectWidget;
