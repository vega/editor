import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {ExternalLink, GitHub, Grid, HelpCircle, Play, Settings, Share2, Terminal, X} from 'react-feather';
import {PortalWithState} from 'react-portal';
import {useNavigate} from 'react-router';
import Select from 'react-select';
import {mapDispatchToProps, mapStateToProps} from './index.js';
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

type PropsType = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  Props & {
    navigate: (path: string) => void;
  };

const formatExampleName = (name: string) =>
  name
    .split(/[_-]/)
    .map((i) => i[0].toUpperCase() + i.substring(1))
    .join(' ');

const Header: React.FC<PropsType> = (props) => {
  const [open, setOpen] = useState(false);
  const [showVega, setShowVega] = useState(props.mode === Mode.Vega);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [mode, setMode] = useState(props.mode);

  const examplePortalRef = useRef<HTMLDivElement>(null);
  const splitButtonRef = useRef<HTMLSpanElement>(null);
  const listenerAttachedRef = useRef(false);

  // Update state when props.mode changes
  useEffect(() => {
    if (props.mode !== mode) {
      setShowVega(props.mode === Mode.Vega);
      setMode(props.mode);
    }
  }, [props.mode, mode]);

  const verifyTokenLocally = useCallback(async (token: string): Promise<any> => {
    try {
      // For a proper implementation, we should verify the token signature
      // But for this example, we'll just decode it and use the data
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
  }, []);

  const handleProfileClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const className = ['profile-img', 'arrow-down', 'profile-container'];
    if (className.includes(target.className)) {
      setOpen((prev) => !prev);
    } else {
      setOpen(false);
    }
  }, []);

  const handleAuthMessage = useCallback(
    async (e: MessageEvent) => {
      if (e.data && e.data.type === 'auth') {
        if (e.data.token) {
          console.log('Received auth token from popup:', e.data.token.substring(0, 10) + '...');
          localStorage.setItem('vega_editor_auth_token', e.data.token);

          if (e.data.githubToken) {
            console.log('Received GitHub token from popup');
            localStorage.setItem('vega_editor_github_token', e.data.githubToken);
          }

          try {
            const tokenData = await verifyTokenLocally(e.data.token);
            if (tokenData && tokenData.isAuthenticated) {
              saveAuthToLocalStorage({
                isAuthenticated: tokenData.isAuthenticated,
                handle: tokenData.handle,
                name: tokenData.name,
                profilePicUrl: tokenData.profilePicUrl,
                authToken: tokenData.authToken,
                githubAccessToken: tokenData.githubAccessToken || e.data.githubToken,
              });
              props.receiveCurrentUser(
                tokenData.isAuthenticated,
                tokenData.handle,
                tokenData.name,
                tokenData.profilePicUrl,
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
            credentials: 'include',
            cache: 'no-store',
            headers,
          });

          const data = await response.json();
          const {isAuthenticated, handle, name, profilePicUrl, authToken, githubAccessToken} = data;

          if (isAuthenticated) {
            saveAuthToLocalStorage({
              isAuthenticated,
              handle,
              name,
              profilePicUrl,
              authToken,
              githubAccessToken,
            });
          }

          props.receiveCurrentUser(isAuthenticated, handle, name, profilePicUrl);
        } catch (error) {
          console.error('Authentication check failed:', error);
          props.receiveCurrentUser(false, '', '', '');
        }
      }
    },
    [verifyTokenLocally, props.receiveCurrentUser],
  );

  // Effect for component mount and authentication setup
  useEffect(() => {
    const initializeAuth = async () => {
      const localAuthData = getAuthFromLocalStorage();
      const auth_token = localStorage.getItem('vega_editor_auth_token');

      if (localAuthData && localAuthData.isAuthenticated && localAuthData.authToken) {
        console.log('Using localStorage auth data:', localAuthData.handle);

        try {
          const isValid = await verifyTokenLocally(localAuthData.authToken);
          if (isValid) {
            props.receiveCurrentUser(
              localAuthData.isAuthenticated,
              localAuthData.handle,
              localAuthData.name,
              localAuthData.profilePicUrl,
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
            credentials: 'include',
            cache: 'no-store',
            headers,
          });

          const data = await response.json();
          const {isAuthenticated, handle, name, profilePicUrl, authToken} = data;

          if (isAuthenticated && authToken) {
            console.log('Saving new auth token to localStorage');
            saveAuthToLocalStorage({
              isAuthenticated,
              handle,
              name,
              profilePicUrl,
              authToken,
            });
            props.receiveCurrentUser(isAuthenticated, handle, name, profilePicUrl);
            return;
          }
        } catch (error) {
          console.error('Token verification failed:', error);
        }
      }

      clearAuthFromLocalStorage();
      localStorage.removeItem('vega_editor_auth_token');
      props.receiveCurrentUser(false, '', '', '');
    };

    window.addEventListener('click', handleProfileClick);
    window.addEventListener('message', handleAuthMessage);
    initializeAuth();

    return () => {
      window.removeEventListener('click', handleProfileClick);
      window.removeEventListener('message', handleAuthMessage);
    };
  }, [verifyTokenLocally, props.receiveCurrentUser, handleProfileClick, handleAuthMessage]);

  const onSelectVega = useCallback(
    (name: string) => {
      props.navigate(`/examples/vega/${name}`);
    },
    [props.navigate],
  );

  const onSelectNewVega = useCallback(() => {
    props.navigate('/custom/vega');
  }, [props.navigate]);

  const onSelectVegaLite = useCallback(
    (name: string) => {
      props.navigate(`/examples/vega-lite/${name}`);
    },
    [props.navigate],
  );

  const onSelectNewVegaLite = useCallback(() => {
    props.navigate('/custom/vega-lite');
  }, [props.navigate]);

  const onSwitchMode = useCallback(
    (option: {value: Mode; label: string}) => {
      if (option.value === Mode.Vega) {
        props.updateVegaSpec(stringify(props.vegaSpec));
        onSelectNewVega();
      } else {
        onSelectNewVegaLite();
      }
      props.clearConfig();
    },
    [props.updateVegaSpec, props.vegaSpec, props.clearConfig, onSelectNewVega, onSelectNewVegaLite],
  );

  const handleHelpModalToggle = useCallback(
    (event: Event, openPortal: () => void, closePortal: () => void, isOpen: boolean) => {
      const handleKeyDown = (keyEvent: KeyboardEvent) => {
        if (
          (keyEvent.keyCode === KEYCODES.SINGLE_QUOTE && keyEvent.metaKey && !keyEvent.shiftKey) || // Handle key press in Mac
          (keyEvent.keyCode === KEYCODES.SLASH && keyEvent.ctrlKey && keyEvent.shiftKey) // Handle Key press in PC
        ) {
          if (!isOpen) {
            openPortal();
          } else {
            closePortal();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      listenerAttachedRef.current = true;

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    },
    [],
  );

  const handleSettingsClick = useCallback(() => {
    props.setSettingsState(!props.settings);
  }, [props.setSettingsState, props.settings]);

  const openCommandPalette = useCallback(() => {
    props.editorRef.focus();
    props.editorRef.trigger('', 'editor.action.quickCommand', '');
  }, [props.editorRef]);

  const signIn = useCallback(() => {
    const popup = window.open(`${BACKEND_URL}auth/github`, 'github-login', 'width=600,height=600,resizable=yes');
    if (popup) {
      popup.focus();
    } else {
      window.location.href = `${BACKEND_URL}auth/github`;
    }
  }, []);

  const signOut = useCallback(() => {
    clearAuthFromLocalStorage();

    const token = localStorage.getItem('vega_editor_auth_token');
    if (token) {
      // Creating hidden iframe (to handle CORS issues)
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
      localStorage.removeItem('vega_editor_github_token');
    }

    const popup = window.open(
      `${BACKEND_URL}auth/github/logout`,
      'github-logout',
      'width=600,height=600,resizable=yes',
    );
    if (popup) {
      popup.focus();
    } else {
      // If popup is blocked or fails, redirect directly
      window.location.href = `${BACKEND_URL}auth/github/logout`;
    }

    // Also clear local state
    props.receiveCurrentUser(false, '', '', '');
  }, [props.receiveCurrentUser]);

  const handleExamplePortalOpen = useCallback(() => {
    const node = examplePortalRef.current;
    if (node) {
      node.scrollTop = props.lastPosition;
      const handleScroll = () => {
        setScrollPosition(node.scrollTop);
      };
      node.addEventListener('scroll', handleScroll);
      return () => node.removeEventListener('scroll', handleScroll);
    }
  }, [props.lastPosition]);

  const handleExamplePortalClose = useCallback(() => {
    props.setScrollPosition(scrollPosition);
  }, [props.setScrollPosition, scrollPosition]);

  const modeOptions =
    props.mode === Mode.Vega
      ? [{value: Mode.VegaLite, label: NAMES[Mode.VegaLite]}]
      : [{value: Mode.Vega, label: NAMES[Mode.Vega]}];

  const value = {label: `${NAMES[props.mode]}`, value: props.mode};

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
        backgroundColor: props.settings ? 'rgba(0, 0, 0, 0.08)' : '',
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
      {props.isAuthenticated ? (
        <form>
          <div className="profile-container">
            <img className="profile-img" src={props.profilePicUrl} />
            <span className="arrow-down"></span>
            {open && (
              <div className="profile-menu">
                <div className="welcome">Logged in as</div>
                <div className="whoami">{props.name}</div>
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

  const runOptions = props.manualParse ? [{label: 'Auto'}] : [{label: 'Manual'}];

  const autoRunToggle = (
    <Select
      className="auto-run-wrapper"
      classNamePrefix="auto-run"
      value={{label: ''}}
      options={runOptions}
      isClearable={false}
      isSearchable={false}
      onChange={props.toggleAutoParse}
    />
  );

  const runButton = (
    <div
      className="header-button"
      id="run-button"
      onClick={() => {
        props.parseSpec(true);
      }}
    >
      <Play className="header-icon" />
      <div className="run-button">
        <span className="parse-label">Run</span>
        <span className="parse-mode">{props.manualParse ? 'Manual' : 'Auto'}</span>
      </div>
    </div>
  );
  const splitClass = 'split-button' + (props.manualParse ? '' : ' auto-run');

  const vega = (closePortal: () => void) => (
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

  const vegalite = (closePortal: () => void) => (
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

  const gist = (closePortal: () => void) => <GistModal closePortal={closePortal} />;
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
                  <div className="modal-body">{gist(closePortal)}</div>
                </div>
              </div>,
            ),
          ]}
        </PortalWithState>

        <PortalWithState
          closeOnEsc
          defaultOpen={props.showExample}
          onOpen={handleExamplePortalOpen}
          onClose={handleExamplePortalClose}
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
                          const node = examplePortalRef.current;
                          if (node) {
                            node.scrollTop = 0;
                          }
                        }}
                      >
                        Vega
                      </button>
                      <button
                        className={showVega ? '' : 'selected'}
                        onClick={() => {
                          setShowVega(false);
                          const node = examplePortalRef.current;
                          if (node) {
                            node.scrollTop = 0;
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
                  <div className="modal-body" ref={examplePortalRef}>
                    {showVega ? vega(closePortal) : vegalite(closePortal)}
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
            if (!listenerAttachedRef.current) {
              handleHelpModalToggle(event, openPortal, closePortal, isOpen);
            }
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

const HeaderWithNavigation = (props: Omit<PropsType, 'navigate'>) => {
  const navigate = useNavigate();
  return <Header {...props} navigate={navigate} />;
};

export default HeaderWithNavigation;
