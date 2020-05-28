import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import ReactDOM from 'react-dom';
import {ExternalLink, GitHub, Grid, HelpCircle, Play, Settings, Share2, Terminal, X} from 'react-feather';
import {PortalWithState} from 'react-portal';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import Select from 'react-select';
import {mapDispatchToProps, mapStateToProps} from '.';
import {BACKEND_URL, KEYCODES, Mode} from '../../constants';
import {NAMES} from '../../constants/consts';
import {VEGA_LITE_SPECS, VEGA_SPECS} from '../../constants/specs';
import ExportModal from './export-modal/index';
import GistModal from './gist-modal/index';
import HelpModal from './help-modal/index';
import './index.css';
import ShareModal from './share-modal/index';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    showExample: () => void;
  } & RouteComponentProps;

interface State {
  open: boolean;
  showVega: boolean;
  scrollPosition: number;
  mode: string;
}

const formatExampleName = (name: string) => {
  return name
    .split(/[_-]/)
    .map((i) => i[0].toUpperCase() + i.substring(1))
    .join(' ');
};

class Header extends React.PureComponent<Props, State> {
  private examplePortal = React.createRef<HTMLDivElement>();
  private listenerAttached = false;

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      scrollPosition: 0,
      showVega: props.mode === Mode.Vega,
      mode: props.mode,
    };
  }

  public async componentDidMount() {
    const className = ['profile-img', 'arrow-down', 'profile-container'];
    window.addEventListener('click', (e) => {
      const key = 'className';
      if (className.includes(e.target[key])) {
        this.setState({
          open: !this.state.open,
        });
      } else {
        this.setState({
          open: false,
        });
      }
    });

    try {
      const response = await fetch(`${BACKEND_URL}auth/github/check`, {
        credentials: 'include',
      });
      const data = await response.json();
      const {isAuthenticated, handle, name, profilePicUrl} = data;
      this.props.receiveCurrentUser(isAuthenticated, handle, name, profilePicUrl);
    } catch (error) {
      console.error(error);
    }

    window.addEventListener('message', async (e) => {
      if (e.data.type === 'auth') {
        try {
          const response = await fetch(`${BACKEND_URL}auth/github/check`, {
            credentials: 'include',
          });
          const data = await response.json();
          const {isAuthenticated, handle, name, profilePicUrl} = data;
          this.props.receiveCurrentUser(isAuthenticated, handle, name, profilePicUrl);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }

  public onSelectVega(name) {
    this.props.history.push(`/examples/vega/${name}`);
  }

  public onSelectNewVega() {
    this.props.history.push('/custom/vega');
  }

  public onSelectVegaLite(name) {
    this.props.history.push(`/examples/vega-lite/${name}`);
  }

  public onSelectNewVegaLite() {
    this.props.history.push('/custom/vega-lite');
  }

  public onSwitchMode(option) {
    if (option.value === Mode.Vega) {
      this.props.updateVegaSpec(stringify(this.props.vegaSpec));
      this.onSelectNewVega();
    } else {
      this.onSelectNewVegaLite();
    }
    this.props.clearConfig();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.mode !== prevState.mode) {
      return {
        showVega: nextProps.mode === Mode.Vega,
        mode: nextProps.mode,
      };
    } else return null;
  }

  public handleHelpModalToggle(Toggleevent, openPortal, closePortal, isOpen) {
    window.addEventListener('keydown', (event) => {
      if (
        (event.keyCode === KEYCODES.SINGLE_QUOTE && event.metaKey && !event.shiftKey) || // Handle key press in Mac
        (event.keyCode === KEYCODES.SLASH && event.ctrlKey && event.shiftKey) // Handle Key press in PC
      ) {
        if (!isOpen) {
          openPortal();
        } else {
          closePortal();
        }
      }
      this.listenerAttached = true;
    });
  }

  public handleSettingsClick() {
    this.props.setSettingsState(!this.props.settings);
  }
  public openCommandPalette() {
    this.props.editorRef.trigger('', 'editor.action.quickCommand', '');
  }

  public componentWillUnmount() {
    window.removeEventListener('keydown', () => {
      return;
    });
    this.listenerAttached = false;
  }
  public signIn() {
    window.open(`${BACKEND_URL}auth/github`, '_blank');
  }
  public signOut() {
    window.open(`${BACKEND_URL}auth/github/logout`, '_blank');
  }

  public render() {
    const modeOptions =
      this.props.mode === Mode.Vega
        ? [{value: Mode.VegaLite, label: NAMES[Mode.VegaLite]}]
        : [{value: Mode.Vega, label: NAMES[Mode.Vega]}];

    const modeSwitcher = (
      <Select
        className="mode-switcher-wrapper"
        classNamePrefix="mode-switcher"
        value={{label: `${NAMES[this.props.mode]}`}}
        options={modeOptions}
        isClearable={false}
        isSearchable={false}
        onChange={this.onSwitchMode.bind(this)}
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
          backgroundColor: this.props.settings ? 'rgba(0, 0, 0, 0.08)' : '',
        }}
        onClick={() => this.props.setSettingsState(!this.props.settings)}
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
      <div className="header-button help" onClick={() => this.setState((current) => ({...current}))}>
        <HelpCircle className="header-icon" />
        {'Help'}
      </div>
    );

    const optionsButton = (
      <div className="header-button" onClick={this.openCommandPalette.bind(this)}>
        <Terminal className="header-icon" />
        {'Commands'}
      </div>
    );

    const authButton = (
      <div className="auth-button-container">
        {this.props.isAuthenticated ? (
          <form>
            <div className="profile-container">
              <img className="profile-img" src={this.props.profilePicUrl} />
              <span className="arrow-down"></span>
              {this.state.open && (
                <div className="profile-menu">
                  <div className="welcome">Logged in as</div>
                  <div className="whoami">{this.props.name}</div>
                  <div>
                    <input className="sign-out" type="submit" value="Sign out" onClick={this.signOut.bind(this)} />
                  </div>
                </div>
              )}
            </div>
          </form>
        ) : (
          <form>
            <button className="sign-in" type="submit" onClick={this.signIn.bind(this)}>
              <span className="sign-in-text" aria-label="Sign in with GitHub">
                Sign in with
              </span>
              <GitHub />
            </button>
          </form>
        )}
      </div>
    );

    const runOptions = this.props.manualParse ? [{label: 'Auto'}] : [{label: 'Manual'}];

    const autoRunToggle = (
      <Select
        className="auto-run-wrapper"
        classNamePrefix="auto-run"
        value={{label: ''}}
        options={runOptions}
        isClearable={false}
        isSearchable={false}
        onChange={this.props.toggleAutoParse}
      />
    );

    const runButton = (
      <div
        className="header-button"
        id="run-button"
        onClick={() => {
          this.props.parseSpec(true);
        }}
      >
        <Play className="header-icon" />
        <div className="run-button">
          <span className="parse-label">Run</span>
          <span className="parse-mode">{this.props.manualParse ? 'Manual' : 'Auto'}</span>
        </div>
      </div>
    );
    const splitClass = 'split-button' + (this.props.manualParse ? '' : ' auto-run');

    const vega = (closePortal) => (
      <div className="vega">
        {Object.keys(VEGA_SPECS).map((specType, i) => {
          const specs = VEGA_SPECS[specType];
          return (
            <div className="item-group" key={i}>
              <h4 className="spec-type">{specType}</h4>
              <div className="items" onClick={closePortal}>
                {specs.map((spec, j) => {
                  return (
                    <div
                      key={j}
                      onClick={() => {
                        this.onSelectVega(spec.name);
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
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );

    const vegalite = (closePortal) => (
      <div className="vega-Lite">
        {Object.keys(VEGA_LITE_SPECS).map((specGroup, i) => {
          return (
            <div key={i}>
              <h3>{specGroup}</h3>
              {Object.keys(VEGA_LITE_SPECS[specGroup]).map((specType, j) => {
                const specs = VEGA_LITE_SPECS[specGroup][specType];
                return (
                  <div className="item-group" key={j}>
                    <h4 className="spec-type">{specType}</h4>
                    <div className="items">
                      {specs.map((spec, k) => {
                        return (
                          <div
                            key={k}
                            onClick={() => {
                              this.onSelectVegaLite(spec.name);
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
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );

    const gist = (closePortal) => <GistModal closePortal={() => closePortal()} />;
    const exportContent = <ExportModal />;
    const shareContent = <ShareModal />;

    return (
      <div className="header" role="banner">
        <section className="left-section">
          {modeSwitcher}
          <span ref="splitButton" className={splitClass}>
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
                </div>
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
                </div>
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
                </div>
              ),
            ]}
          </PortalWithState>

          <PortalWithState
            closeOnEsc
            defaultOpen={this.props.showExample}
            onOpen={() => {
              const node = ReactDOM.findDOMNode(this.examplePortal.current);
              node.scrollTop = this.props.lastPosition;
              node.addEventListener('scroll', () => {
                this.setState({
                  scrollPosition: node.scrollTop,
                });
              });
            }}
            onClose={() => {
              this.props.setScrollPosition(this.state.scrollPosition);
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
                          className={this.state.showVega ? 'selected' : ''}
                          onClick={() => {
                            this.setState({showVega: true});
                            const node = ReactDOM.findDOMNode(this.examplePortal.current);
                            node.scrollTop = 0;
                          }}
                        >
                          Vega
                        </button>
                        <button
                          className={this.state.showVega ? '' : 'selected'}
                          onClick={() => {
                            this.setState({showVega: false});
                            const node = ReactDOM.findDOMNode(this.examplePortal.current);
                            node.scrollTop = 0;
                          }}
                        >
                          Vega-Lite
                        </button>
                      </div>
                      <button className="close-button" onClick={closePortal}>
                        <X />
                      </button>
                    </div>
                    <div className="modal-body" ref={this.examplePortal}>
                      {this.state.showVega ? vega(closePortal) : vegalite(closePortal)}
                    </div>
                  </div>
                </div>
              ),
            ]}
          </PortalWithState>
        </section>

        <section className="right-section">
          <PortalWithState closeOnEsc>
            {({openPortal, closePortal, isOpen, portal}) => {
              if (!this.listenerAttached) {
                this.handleHelpModalToggle(event, openPortal, closePortal, isOpen);
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
                  </div>
                ),
              ];
            }}
          </PortalWithState>
          {settingsButton}
          {authButton}
        </section>
      </div>
    );
  }
}

export default withRouter(Header);
