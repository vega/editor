import React from 'react';
import {File, Lock} from 'react-feather';
import ReactPaginate from 'react-paginate';
import {mapDispatchToProps, mapStateToProps} from './index.js';
import {BACKEND_URL, GistPrivacy} from '../../constants/index.js';
import LoginConditional from '../login-conditional/index.js';
import './index.css';
import {getAuthFromLocalStorage} from '../../utils/browser.js';
import {getGithubToken} from '../../utils/github.js';

interface State {
  currentPage: number;
  loaded: boolean;
  personalGist: {
    name: string;
    isPublic: boolean;
    title: string;
    spec: {
      name: string;
      previewUrl: string;
    }[];
    id?: string;
    url?: string;
    owner?: string;
  }[];
  pages: Record<string, unknown>;
  loading: boolean;
  selected: {
    gist: string;
    file: string;
  };
}

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    selectGist: (id?: string, file?: string, image?: string) => void;
  };

class GistSelectWidget extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      loaded: false,
      personalGist: [],
      pages: {},
      loading: true,
      selected: {
        gist: null,
        file: null,
      },
    };
  }
  public componentDidMount() {
    this.handlePageChange({selected: 0});
  }
  public componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated) {
      this.setState(
        {
          currentPage: 0,
          loading: true,
        },
        () => {
          this.handlePageChange({selected: this.state.currentPage});
        },
      );
    }
    if (this.props.private !== prevProps.private) {
      this.setState(
        {
          currentPage: 0,
          loading: true,
        },
        () => {
          this.handlePageChange({selected: this.state.currentPage});
        },
      );
    }
  }
  public async handlePageChange(page) {
    if (this.state.loading) {
      this.setState(
        {
          loading: false,
        },
        async () => {
          try {
            let githubToken;
            try {
              githubToken = await getGithubToken();
            } catch (error) {
              console.error('Failed to get GitHub token:', error);
              this.props.receiveCurrentUser(false);
              return;
            }

            const privacy = this.props.private ? 'all' : 'public';
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

            const pages = {};
            for (let i = 0; i < pageCount; i++) {
              pages[i] = i + 1;
            }

            const filteredGists = gists.filter((gist) => {
              return Object.keys(gist.files || {}).some((filename) => filename.endsWith('.json'));
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

            this.setState({
              currentPage: page.selected,
              loaded: true,
              pages: pages,
              loading: true,
              personalGist: formattedGists,
            });
          } catch (error) {
            console.error('Error fetching gists:', error);
            this.props.receiveCurrentUser(false);
          }
        },
      );
    }
  }

  public render() {
    return (
      <LoginConditional>
        {this.state.loaded ? (
          <>
            <div className="privacy-toggle">
              <input
                type="checkbox"
                name="privacy"
                id="privacy"
                checked={this.props.private === GistPrivacy.ALL}
                onChange={this.props.toggleGistPrivacy}
              />
              <label htmlFor="privacy">Show private gists</label>
            </div>
            {this.state.personalGist.length > 0 ? (
              <>
                {Object.keys(this.state.pages).length > 1 && (
                  <ReactPaginate
                    previousLabel={'<'}
                    nextLabel={'>'}
                    breakClassName={'break'}
                    containerClassName={'pagination'}
                    activeClassName={'active'}
                    pageCount={Object.keys(this.state.pages).length}
                    onPageChange={this.handlePageChange.bind(this)}
                    forcePage={this.state.currentPage}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={2}
                  />
                )}
                <div className={`gist-wrapper ${!this.state.loading && 'loading'}`}>
                  {this.state.personalGist.map((gist) => (
                    <div
                      key={gist.id || gist.name}
                      className={`gist-container ${this.state.selected.gist === gist.name && 'gist-active'}`}
                    >
                      <div className="personal-gist-description">
                        {gist.isPublic ? (
                          <File width="14" height="14" />
                        ) : (
                          <Lock width="14" height="14" fill="#FDD300" />
                        )}
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
                                  this.state.selected.file === spec.name &&
                                  this.state.selected.gist === gist.name &&
                                  'file-active'
                                }`}
                                onClick={() => {
                                  this.props.selectGist(gist.name, spec.name, spec.previewUrl);
                                  this.setState({
                                    selected: {
                                      gist: gist.name,
                                      file: spec.name,
                                    },
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
  }
}

export default GistSelectWidget;
