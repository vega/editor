import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {useEffect, useRef, useState, useCallback} from 'react';
import {ExternalLink, GitHub, Grid, HelpCircle, Play, Settings, Share2, Terminal, X} from 'react-feather';
import {PortalWithState} from 'react-portal';
import {useNavigate} from 'react-router';
import Select from 'react-select';
import {useAppDispatch, useAppSelector} from '../../hooks.js';
import * as EditorActions from '../../actions/editor.js';
import {BACKEND_URL, KEYCODES, Mode} from '../../constants/index.js';
import {NAMES} from '../../constants/consts.js';
import {VEGA_LITE_SPECS, VEGA_SPECS} from '../../constants/specs.js';
import {getAuthFromLocalStorage, saveAuthToLocalStorage, clearAuthFromLocalStorage} from '../../utils/browser.js';
import ExportModal from './export-modal/index.js';
import GistModal from './gist-modal/index.js';
import HelpModal from './help-modal/index.js';
import './index.css';
import ShareModal from './share-modal/index.js';

export interface Props {
  showExample: boolean;
}

const formatExampleName = (nameStr: string) =>
  nameStr
    .split(/[_-]/)
    .map((i) => i[0].toUpperCase() + i.substring(1))
    .join(' ');

const Header: React.FC<Props> = ({showExample}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {editorRef, isAuthenticated, lastPosition, manualParse, mode, name, profilePicUrl, settings, vegaSpec} =
    useAppSelector((state) => ({
      editorRef: state.editorRef,
      isAuthenticated: state.isAuthenticated,
      lastPosition: state.lastPosition,
      manualParse: state.manualParse,
      mode: state.mode,
      name: state.name,
      profilePicUrl: state.profilePicUrl,
      settings: state.settings,
      vegaSpec: state.vegaSpec,
    }));

  const examplePortal = useRef<HTMLDivElement>(null);
  const splitButtonRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [scrollPosition, setScrollPos] = useState(0);
  const [showVega, setShowVega] = useState(mode === Mode.Vega);
  const [listenerAttached, setListenerAttached] = useState(false);

  useEffect(() => {
    setShowVega(mode === Mode.Vega);
  }, [mode]);

  useEffect(() => {
    const className = ['profile-img', 'arrow-down', 'profile-container'];
    const handleClick = (e) => {
      const key = 'className';
      if (className.includes(e.target[key])) {
        setOpen(!open);
      } else {
        setOpen(false);
      }
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [open]);

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
          dispatch(EditorActions.receiveCurrentUser(false, '', '', ''));
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
            dispatch(
              EditorActions.receiveCurrentUser(
                tokenData.isAuthenticated,
                tokenData.handle,
                tokenData.name,
                tokenData.profilePicUrl,
              ),
            );
            return;
          }
        }
      }

      const localAuthData = getAuthFromLocalStorage();
      const auth_token = localStorage.getItem('vega_editor_auth_token');

      if (localAuthData && localAuthData.isAuthenticated && localAuthData.authToken) {
        console.log('Using localStorage auth data:', localAuthData.handle);

        try {
          const isValid = await verifyTokenLocally(localAuthData.authToken);
          if (isValid) {
            dispatch(
              EditorActions.receiveCurrentUser(
                localAuthData.isAuthenticated,
                localAuthData.handle,
                localAuthData.name,
                localAuthData.profilePicUrl,
              ),
            );
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
            console.log('Saving new auth token to localStorage');
            saveAuthToLocalStorage({
              isAuthenticated: userData.isAuthenticated,
              handle: userData.handle,
              name: userData.userName,
              profilePicUrl: userData.userProfilePic,
              authToken: userData.authToken,
            });
            dispatch(
              EditorActions.receiveCurrentUser(
                userData.isAuthenticated,
                userData.handle,
                userData.userName,
                userData.userProfilePic,
              ),
            );
            return;
          }
        } catch (error) {
          console.error('Token verification failed:', error);
        }
      }

      clearAuthFromLocalStorage();
      localStorage.removeItem('vega_editor_auth_token');
      dispatch(EditorActions.receiveCurrentUser(false, '', '', ''));
    };

    checkAuthFromHash();

    const handleAuthMessage = async (e) => {
      if (e.data && e.data.type === 'auth') {
        if (e.data.token) {
          console.log('Received auth token from popup:', e.data.token.substring(0, 10) + '...');
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
              dispatch(
                EditorActions.receiveCurrentUser(
                  tokenData.isAuthenticated,
                  tokenData.handle,
                  tokenData.name,
                  tokenData.profilePicUrl,
                ),
              );
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

          dispatch(
            EditorActions.receiveCurrentUser(
              userData.isAuthenticated,
              userData.handle,
              userData.userName,
              userData.userProfilePic,
            ),
          );
        } catch (error) {
          console.error('Authentication check failed:', error);
          dispatch(EditorActions.receiveCurrentUser(false, '', '', ''));
        }
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, [dispatch]);

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
        dispatch(EditorActions.updateVegaSpec(stringify(vegaSpec)));
        onSelectNewVega();
      } else {
        onSelectNewVegaLite();
      }
      dispatch(EditorActions.clearConfig());
    },
    [dispatch, vegaSpec, onSelectNewVega, onSelectNewVegaLite],
  );

  const handleHelpModalToggle = useCallback(
    (event, openPortal, closePortal, isOpen) => {
      if (!listenerAttached) {
        const keyDownHandler = (e) => {
          if (
            (e.keyCode === KEYCODES.SINGLE_QUOTE && e.metaKey && !e.shiftKey) ||
            (e.keyCode === KEYCODES.SLASH && e.ctrlKey && e.shiftKey)
          ) {
            if (!isOpen) {
              openPortal();
            } else {
              closePortal();
            }
          }
        };

        window.addEventListener('keydown', keyDownHandler);
        setListenerAttached(true);

        // No need to return cleanup as this effect is only run once
        // and the component cleanup will handle removing all listeners
      }
    },
    [listenerAttached],
  );

  const handleSettingsClick = useCallback(() => {
    dispatch(EditorActions.setSettingsState(!settings));
  }, [dispatch, settings]);

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

    dispatch(EditorActions.receiveCurrentUser(false, '', '', ''));
  };

  // Render functions
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
      onChange={() => dispatch(EditorActions.toggleAutoParse())}
    />
  );

  const runButton = (
    <div
      className="header-button"
      id="run-button"
      onClick={() => {
        dispatch(EditorActions.parseSpec(true));
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
    <div className="vega">
      {Object.keys(VEGA_SPECS).map((specType, i) => {
        const specs = VEGA_SPECS[specType];
        return (
          <div className="item-group" key={i}>
            <h4 className="spec-type">{specType}</h4>
            <div className="items" onClick={closePortal}>
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
                  <div className="name">{formatExampleName(spec.name)}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderVegaLite = (closePortal) => (
    <div className="vega-Lite">
      {Object.keys(VEGA_LITE_SPECS).map((specGroup, i) => (
        <div key={i}>
          <h3>{specGroup}</h3>
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

  const renderGist = (closePortal) => <GistModal closePortal={() => closePortal()} />;
  const exportContent = <ExportModal />;
  const shareContent = <ShareModal />;

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
          {({openPortal, closePortal, portal}) => [
            <span key="0" onClick={openPortal}>
              {exportButton}
            </span>,
            portal(
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
            ),
          ]}
        </PortalWithState>

        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, portal}) => [
            <span key="0" onClick={openPortal}>
              {shareButton}
            </span>,
            portal(
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
            ),
          ]}
        </PortalWithState>

        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, portal}) => [
            <span key="0" onClick={openPortal}>
              {gistButton}
            </span>,
            portal(
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
            ),
          ]}
        </PortalWithState>

        <PortalWithState
          closeOnEsc
          defaultOpen={showExample}
          onOpen={() => {
            if (examplePortal.current) {
              const node = examplePortal.current;
              node.scrollTop = lastPosition;
              node.addEventListener('scroll', () => {
                setScrollPos(node.scrollTop);
              });
            }
          }}
          onClose={() => {
            dispatch(EditorActions.setScrollPosition(scrollPosition));
          }}
        >
          {({openPortal, closePortal, portal}) => [
            <span key="0" onClick={openPortal}>
              {examplesButton}
            </span>,
            portal(
              <div className="modal-background" onClick={closePortal}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <div className="button-groups">
                      <button
                        className={showVega ? 'selected' : ''}
                        onClick={() => {
                          setShowVega(true);
                          if (examplePortal.current) {
                            examplePortal.current.scrollTop = 0;
                          }
                        }}
                      >
                        Vega
                      </button>
                      <button
                        className={showVega ? '' : 'selected'}
                        onClick={() => {
                          setShowVega(false);
                          if (examplePortal.current) {
                            examplePortal.current.scrollTop = 0;
                          }
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
            ),
          ]}
        </PortalWithState>
      </section>

      <section className="right-section">
        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, isOpen, portal}) => {
            handleHelpModalToggle(null, openPortal, closePortal, isOpen);
            return [
              <span key="0" onClick={openPortal}>
                {HelpButton}
              </span>,
              portal(
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
              ),
            ];
          }}
        </PortalWithState>
        {settingsButton}
        {authButton}
      </section>
    </div>
  );
};

export default Header;
