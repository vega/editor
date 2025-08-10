import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {useEffect, useRef, useState, useCallback} from 'react';
import {ExternalLink, GitHub, Grid, HelpCircle, Play, Settings, Share2, Terminal, X} from 'react-feather';
import {useNavigate} from 'react-router';
import Select from 'react-select';
import {useAppContext} from '../../context/app-context.js';
import {BACKEND_URL, KEYCODES, Mode} from '../../constants/index.js';
import {NAMES} from '../../constants/consts.js';
import {VEGA_LITE_SPECS, VEGA_SPECS} from '../../constants/specs.js';
import {getAuthFromLocalStorage, saveAuthToLocalStorage, clearAuthFromLocalStorage} from '../../utils/browser.js';
import ExportModal from './export-modal/renderer.js';
import GistModal from './gist-modal/renderer.js';
import HelpModal from './help-modal/index.js';
import './index.css';
import ShareModal from './share-modal/index.js';
import {PortalWithState} from 'react-portal';

export interface Props {
  showExample: boolean;
}

const Header: React.FC<Props> = ({showExample}) => {
  const {state, setState} = useAppContext();
  const navigate = useNavigate();

  const {editorRef, isAuthenticated, lastPosition, manualParse, mode, name, profilePicUrl, settings, vegaSpec} = state;

  const examplePortal = useRef<HTMLDivElement>(null);
  const splitButtonRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [scrollPosition, setScrollPos] = useState(0);
  const [showVega, setShowVega] = useState(mode === Mode.Vega);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [gistModalOpen, setGistModalOpen] = useState(false);
  const [examplesModalOpen, setExamplesModalOpen] = useState(showExample);

  const scrollHandlers = useRef(new WeakMap());

  useEffect(() => {
    setShowVega(mode === Mode.Vega);
  }, [mode]);

  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.closest('.profile-container')) {
        setOpen((prev) => !prev);
      } else {
        setOpen(false);
      }
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const checkAuthFromHash = async () => {
      if (window.location.hash.includes('auth_token=') || window.location.hash.includes('logout=')) {
        let hashContent = window.location.hash.substring(1);
        if (hashContent.startsWith('/')) {
          hashContent = hashContent.substring(1);
        }

        const hashParams = new URLSearchParams(hashContent);
        const tokenFromHash = hashParams.get('auth_token');
        const logoutFlag = hashParams.get('logout');

        window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/');

        if (logoutFlag === 'true') {
          clearAuthFromLocalStorage();
          localStorage.removeItem('vega_editor_auth_token');
          setState((s) => ({...s, isAuthenticated: false, name: '', profilePicUrl: ''}));
          return;
        }

        if (tokenFromHash) {
          localStorage.setItem('vega_editor_auth_token', tokenFromHash);

          const tokenData = await verifyTokenLocally(tokenFromHash);
          if (tokenData && tokenData.isAuthenticated) {
            saveAuthToLocalStorage({
              isAuthenticated: tokenData.isAuthenticated,
              handle: tokenData.handle,
              name: tokenData.name,
              profilePicUrl: tokenData.profilePicUrl,
              authToken: tokenData.authToken,
            });
            setState((s) => ({
              ...s,
              isAuthenticated: tokenData.isAuthenticated,
              handle: tokenData.handle,
              name: tokenData.name,
              profilePicUrl: tokenData.profilePicUrl,
            }));
            return;
          }
        }
      }

      const localAuthData = getAuthFromLocalStorage();
      const auth_token = localStorage.getItem('vega_editor_auth_token');

      if (localAuthData && localAuthData.isAuthenticated && localAuthData.authToken) {
        try {
          const isValid = await verifyTokenLocally(localAuthData.authToken);
          if (isValid) {
            setState((s) => ({
              ...s,
              isAuthenticated: localAuthData.isAuthenticated,
              handle: localAuthData.handle,
              name: localAuthData.name,
              profilePicUrl: localAuthData.profilePicUrl,
            }));
            return;
          }
        } catch (error) {
          console.error('Error verifying stored token:', error);
        }
      }

      if (auth_token) {
        try {
          const headers: HeadersInit = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
            'X-Auth-Token': auth_token,
          };

          const response = await fetch(`${BACKEND_URL}auth/github/check`, {
            cache: 'no-store',
            headers,
          });

          const data = await response.json();
          const userData = {
            isAuthenticated: data.isAuthenticated,
            handle: data.handle,
            userName: data.name,
            userProfilePic: data.profilePicUrl,
            authToken: data.authToken,
          };

          if (userData.isAuthenticated && userData.authToken) {
            saveAuthToLocalStorage({
              isAuthenticated: userData.isAuthenticated,
              handle: userData.handle,
              name: userData.userName,
              profilePicUrl: userData.userProfilePic,
              authToken: userData.authToken,
            });
            setState((s) => ({
              ...s,
              isAuthenticated: userData.isAuthenticated,
              handle: userData.handle,
              name: userData.userName,
              profilePicUrl: userData.userProfilePic,
            }));
            return;
          }
        } catch (error) {
          console.error('Token verification failed:', error);
        }
      }

      clearAuthFromLocalStorage();
      localStorage.removeItem('vega_editor_auth_token');
      setState((s) => ({...s, isAuthenticated: false, name: '', profilePicUrl: ''}));
    };

    checkAuthFromHash();

    const handleAuthMessage = async (e) => {
      if (e.data && e.data.type === 'auth') {
        if (e.data.token) {
          localStorage.setItem('vega_editor_auth_token', e.data.token);

          try {
            const tokenData = await verifyTokenLocally(e.data.token);
            if (tokenData && tokenData.isAuthenticated) {
              saveAuthToLocalStorage({
                isAuthenticated: tokenData.isAuthenticated,
                handle: tokenData.handle,
                name: tokenData.name,
                profilePicUrl: tokenData.profilePicUrl,
                authToken: tokenData.authToken,
              });
              setState((s) => ({
                ...s,
                isAuthenticated: tokenData.isAuthenticated,
                handle: tokenData.handle,
                name: tokenData.name,
                profilePicUrl: tokenData.profilePicUrl,
              }));
              return;
            }
          } catch (error) {
            console.error('Error verifying token locally:', error);
          }
        }

        try {
          const headers: HeadersInit = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          };

          const token = e.data.token || localStorage.getItem('vega_editor_auth_token');
          if (token) {
            headers['X-Auth-Token'] = token;
          }

          const response = await fetch(`${BACKEND_URL}auth/github/check`, {
            headers,
            cache: 'no-store',
          });
          const data = await response.json();
          const userData = {
            isAuthenticated: data.isAuthenticated,
            handle: data.handle,
            userName: data.name,
            userProfilePic: data.profilePicUrl,
            authToken: data.authToken,
          };

          if (userData.isAuthenticated) {
            saveAuthToLocalStorage({
              isAuthenticated: userData.isAuthenticated,
              handle: userData.handle,
              name: userData.userName,
              profilePicUrl: userData.userProfilePic,
              authToken: userData.authToken,
            });
          }

          setState((s) => ({
            ...s,
            isAuthenticated: userData.isAuthenticated,
            handle: userData.handle,
            name: userData.userName,
            profilePicUrl: userData.userProfilePic,
          }));
        } catch (error) {
          console.error('Authentication check failed:', error);
          setState((s) => ({...s, isAuthenticated: false, name: '', profilePicUrl: ''}));
        }
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, [setState]);

  useEffect(() => {
    const keyDownHandler = (e) => {
      if (
        (e.keyCode === KEYCODES.SINGLE_QUOTE && e.metaKey && !e.shiftKey) ||
        (e.keyCode === KEYCODES.SLASH && e.ctrlKey && e.shiftKey)
      ) {
        setHelpModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', keyDownHandler);

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, []);

  const onSelectVega = useCallback(
    (specName) => {
      navigate(`/examples/vega/${specName}`);
    },
    [navigate],
  );

  const onSelectNewVega = useCallback(() => {
    navigate('/custom/vega');
  }, [navigate]);

  const onSelectVegaLite = useCallback(
    (specName) => {
      navigate(`/examples/vega-lite/${specName}`);
    },
    [navigate],
  );

  const onSelectNewVegaLite = useCallback(() => {
    navigate('/custom/vega-lite');
  }, [navigate]);

  const onSwitchMode = useCallback(
    (option) => {
      if (option.value === Mode.Vega) {
        const newEditorString =
          vegaSpec && Object.keys(vegaSpec).length > 0
            ? stringify(vegaSpec)
            : `{
  "$schema": "https://vega.github.io/schema/vega/v5.json"
}`;
        setState((s) => ({
          ...s,
          editorString: newEditorString,
          mode: Mode.Vega,
          config: {},
          parse: true,
        }));
        onSelectNewVega();
      } else {
        const newEditorString = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json"
}`;
        setState((s) => ({
          ...s,
          editorString: newEditorString,
          mode: Mode.VegaLite,
          config: {},
          parse: true,
        }));
        onSelectNewVegaLite();
      }
    },
    [setState, vegaSpec, onSelectNewVega, onSelectNewVegaLite],
  );

  const handleSettingsClick = useCallback(() => {
    setState((s) => ({...s, settings: !settings}));
  }, [setState, settings]);

  const openCommandPalette = useCallback(() => {
    if (editorRef) {
      editorRef.focus();
      editorRef.trigger('', 'editor.action.quickCommand', '');
    }
  }, [editorRef]);

  const verifyTokenLocally = async (token: string): Promise<any> => {
    try {
      const decoded = atob(token);
      const tokenData = JSON.parse(decoded);

      if (tokenData && tokenData.data) {
        const userData = JSON.parse(tokenData.data);
        return {
          isAuthenticated: true,
          handle: userData.login,
          name: userData.name,
          profilePicUrl: userData.avatar_url,
          authToken: token,
        };
      }
      return null;
    } catch (error) {
      console.error('Error verifying token locally:', error);
      return null;
    }
  };

  const signIn = () => {
    const popup = window.open(`${BACKEND_URL}auth/github`, 'github-login', 'width=600,height=600,resizable=yes');
    if (popup) {
      popup.focus();
    } else {
      window.location.href = `${BACKEND_URL}auth/github`;
    }
  };

  const signOut = () => {
    clearAuthFromLocalStorage();

    const token = localStorage.getItem('vega_editor_auth_token');
    if (token) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `${BACKEND_URL}auth/github/logout?token=${encodeURIComponent(token)}`;
      document.body.appendChild(iframe);

      iframe.onload = iframe.onerror = () => {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 500);
      };

      localStorage.removeItem('vega_editor_auth_token');
    }

    const popup = window.open(
      `${BACKEND_URL}auth/github/logout`,
      'github-logout',
      'width=600,height=600,resizable=yes',
    );
    if (popup) {
      popup.focus();
    } else {
      window.location.href = `${BACKEND_URL}auth/github/logout`;
    }

    setState((s) => ({...s, isAuthenticated: false, name: '', profilePicUrl: ''}));
  };

  const modeOptions =
    mode === Mode.Vega
      ? [{value: Mode.VegaLite, label: NAMES[Mode.VegaLite]}]
      : [{value: Mode.Vega, label: NAMES[Mode.Vega]}];

  const value = {label: `${NAMES[mode]}`, value: mode};

  const modeSwitcher = (
    <Select
      className="mode-switcher-wrapper"
      classNamePrefix="mode-switcher"
      value={value}
      options={modeOptions}
      isClearable={false}
      isSearchable={false}
      onChange={onSwitchMode}
    />
  );

  const examplesButton = (
    <div className="header-button">
      <Grid className="header-icon" />
      {'Examples'}
    </div>
  );

  const gistButton = (
    <div className="header-button">
      <GitHub className="header-icon" />
      {'Gist'}
    </div>
  );

  const settingsButton = (
    <div
      className="header-button settings-button"
      style={{
        backgroundColor: settings ? 'rgba(0, 0, 0, 0.08)' : '',
      }}
      onClick={handleSettingsClick}
    >
      <Settings className="header-icon" />
      {'Settings'}
    </div>
  );

  const exportButton = (
    <div className="header-button">
      <ExternalLink className="header-icon" />
      {'Export'}
    </div>
  );

  const shareButton = (
    <div className="header-button">
      <Share2 className="header-icon" />
      {'Share'}
    </div>
  );

  const HelpButton = (
    <div className="header-button help">
      <HelpCircle className="header-icon" />
      {'Help'}
    </div>
  );

  const optionsButton = (
    <div className="header-button" onClick={openCommandPalette}>
      <Terminal className="header-icon" />
      {'Commands'}
    </div>
  );

  const authButton = (
    <div className="auth-button-container">
      {isAuthenticated ? (
        <form>
          <div className="profile-container">
            <img className="profile-img" src={profilePicUrl} alt="Profile" />
            <span className="arrow-down"></span>
            {open && (
              <div className="profile-menu">
                <div className="welcome">Logged in as</div>
                <div className="whoami">{name}</div>
                <div>
                  <input className="sign-out" type="submit" value="Sign out" onClick={signOut} />
                </div>
              </div>
            )}
          </div>
        </form>
      ) : (
        <form>
          <button className="sign-in" type="submit" onClick={signIn}>
            <span className="sign-in-text" aria-label="Sign in with GitHub">
              Sign in with
            </span>
            <GitHub />
          </button>
        </form>
      )}
    </div>
  );

  const runOptions = manualParse ? [{label: 'Auto'}] : [{label: 'Manual'}];

  const autoRunToggle = (
    <Select
      className="auto-run-wrapper"
      classNamePrefix="auto-run"
      value={{label: ''}}
      options={runOptions}
      isClearable={false}
      isSearchable={false}
      onChange={() => setState((s) => ({...s, manualParse: !manualParse}))}
    />
  );

  const runButton = (
    <div
      className="header-button"
      id="run-button"
      onClick={() => {
        setState((s) => ({...s, parse: true}));
      }}
    >
      <Play className="header-icon" />
      <div className="run-button">
        <span className="parse-label">Run</span>
        <span className="parse-mode">{manualParse ? 'Manual' : 'Auto'}</span>
      </div>
    </div>
  );

  const splitClass = 'split-button' + (manualParse ? '' : ' auto-run');

  const renderVega = (closePortal) => (
    <div className="vega-specs">
      {Object.keys(VEGA_SPECS).map((specType, i) => {
        const specs = VEGA_SPECS[specType];
        return (
          <div className="item-group" key={i}>
            <h4 className="spec-type">{specType}</h4>
            <div className="items">
              {specs.map((spec, j) => (
                <div
                  key={j}
                  onClick={() => {
                    onSelectVega(spec.name);
                    closePortal();
                  }}
                  className="item"
                >
                  <div
                    style={{
                      backgroundImage: `url(images/examples/vg/${spec.name}.vg.png)`,
                    }}
                    className="img"
                  />
                  <div className="name">{spec.title}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderVegaLite = (closePortal) => (
    <div className="vega-specs">
      {Object.keys(VEGA_LITE_SPECS).map((specGroup, i) => (
        <div key={i}>
          {Object.keys(VEGA_LITE_SPECS[specGroup]).map((specType, j) => {
            const specs = VEGA_LITE_SPECS[specGroup][specType];
            return (
              <div className="item-group" key={j}>
                <h4 className="spec-type">{specType}</h4>
                <div className="items">
                  {specs.map((spec, k) => (
                    <div
                      key={k}
                      onClick={() => {
                        onSelectVegaLite(spec.name);
                        closePortal();
                      }}
                      className="item"
                    >
                      <div
                        style={{
                          backgroundImage: `url(images/examples/vl/${spec.name}.vl.png)`,
                        }}
                        className="img"
                      />
                      <div className="name">{spec.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  const renderGist = (closePortal) => <GistModal closePortal={closePortal} />;
  const exportContent = <ExportModal />;
  const shareContent = <ShareModal />;

  const handleExamplesModalOpen = useCallback(() => {
    setExamplesModalOpen(true);

    setTimeout(() => {
      if (examplePortal.current) {
        const node = examplePortal.current;
        node.scrollTop = lastPosition;

        const handleScroll = () => setScrollPos(node.scrollTop);

        const existingHandler = scrollHandlers.current.get(node);
        if (existingHandler) {
          node.removeEventListener('scroll', existingHandler);
        }

        node.addEventListener('scroll', handleScroll);
        scrollHandlers.current.set(node, handleScroll);
      }
    }, 0);
  }, [lastPosition]);

  const handleExamplesModalClose = useCallback(() => {
    setExamplesModalOpen(false);

    if (examplePortal.current) {
      const handler = scrollHandlers.current.get(examplePortal.current);
      if (handler) {
        examplePortal.current.removeEventListener('scroll', handler);
        scrollHandlers.current.delete(examplePortal.current);
      }
    }

    setState((s) => ({...s, lastPosition: scrollPosition}));
  }, [setState, scrollPosition]);

  const handleVegaToggle = useCallback((isVega) => {
    setShowVega(isVega);
  }, []);

  const handleExportModalOpen = () => setExportModalOpen(true);
  const handleExportModalClose = () => setExportModalOpen(false);

  const handleShareModalOpen = () => setShareModalOpen(true);
  const handleShareModalClose = () => setShareModalOpen(false);

  const handleGistModalOpen = () => setGistModalOpen(true);
  const handleGistModalClose = () => setGistModalOpen(false);

  const handleHelpModalOpen = () => setHelpModalOpen(true);
  const handleHelpModalClose = () => setHelpModalOpen(false);

  useEffect(() => {
    if (showExample !== examplesModalOpen) {
      setExamplesModalOpen(showExample);
    }
  }, [showExample]);

  useEffect(() => {
    return () => {
      if (examplePortal.current) {
        const handler = scrollHandlers.current.get(examplePortal.current);
        if (handler) {
          examplePortal.current.removeEventListener('scroll', handler);
          scrollHandlers.current.delete(examplePortal.current);
        }
      }
    };
  }, []);

  return (
    <div className="app-header" role="banner">
      <section className="left-section">
        {modeSwitcher}
        <span ref={splitButtonRef} className={splitClass}>
          {runButton}
          {autoRunToggle}
        </span>
        {optionsButton}

        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, isOpen, portal}) => (
            <>
              <span onClick={openPortal}>{exportButton}</span>
              {portal(
                <div className="modal-background" onClick={closePortal}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <button className="close-button" onClick={closePortal}>
                        <X />
                      </button>
                    </div>
                    <div className="modal-body">{exportContent}</div>
                  </div>
                </div>,
              )}
            </>
          )}
        </PortalWithState>

        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, isOpen, portal}) => (
            <>
              <span onClick={openPortal}>{shareButton}</span>
              {portal(
                <div className="modal-background" onClick={closePortal}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <button className="close-button" onClick={closePortal}>
                        <X />
                      </button>
                    </div>
                    <div className="modal-body">{shareContent}</div>
                  </div>
                </div>,
              )}
            </>
          )}
        </PortalWithState>

        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, isOpen, portal}) => (
            <>
              <span onClick={openPortal}>{gistButton}</span>
              {portal(
                <div className="modal-background" onClick={closePortal}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <button className="close-button" onClick={closePortal}>
                        <X />
                      </button>
                    </div>
                    <div className="modal-body">{renderGist(closePortal)}</div>
                  </div>
                </div>,
              )}
            </>
          )}
        </PortalWithState>

        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, isOpen, portal}) => (
            <>
              <span onClick={openPortal}>{examplesButton}</span>
              {portal(
                <div className="modal-background" onClick={closePortal}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <div className="button-groups">
                        <button
                          className={showVega ? 'selected' : ''}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVegaToggle(true);
                          }}
                        >
                          Vega
                        </button>
                        <button
                          className={showVega ? '' : 'selected'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVegaToggle(false);
                          }}
                        >
                          Vega-Lite
                        </button>
                      </div>
                      <button className="close-button" onClick={closePortal}>
                        <X />
                      </button>
                    </div>
                    <div className="modal-body" ref={examplePortal}>
                      {showVega ? renderVega(closePortal) : renderVegaLite(closePortal)}
                    </div>
                  </div>
                </div>,
              )}
            </>
          )}
        </PortalWithState>
      </section>

      <section className="right-section">
        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, isOpen, portal}) => (
            <>
              <span onClick={openPortal}>{HelpButton}</span>
              {portal(
                <div className="modal-background" onClick={closePortal}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <button className="close-button" onClick={closePortal}>
                        <X />
                      </button>
                    </div>
                    <div className="modal-body">
                      <HelpModal />
                    </div>
                  </div>
                </div>,
              )}
            </>
          )}
        </PortalWithState>
        {settingsButton}
        {authButton}
      </section>
    </div>
  );
};

export default Header;
