import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { ExternalLink, GitHub, Grid, HelpCircle, Play, Share2, Terminal, X } from 'react-feather';
import { PortalWithState } from 'react-portal';
import { withRouter } from 'react-router-dom';
import Select from 'react-select';
import { mapDispatchToProps, mapStateToProps } from '.';
import { KEYCODES, Mode } from '../../constants';
import { NAMES } from '../../constants/consts';
import { VEGA_LITE_SPECS, VEGA_SPECS } from '../../constants/specs';
import ExportModal from './export-modal/index';
import GistModal from './gist-modal/index';
import HelpModal from './help-modal/index';
import './index.css';
import ShareModal from './share-modal/index';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & { history: any; showExample: boolean };

interface State {
  showVega: boolean;
  scrollPosition: number;
}

const formatExampleName = (name: string) => {
  return name
    .split(/[_-]/)
    .map(i => i[0].toUpperCase() + i.substring(1))
    .join(' ');
};

class Header extends React.PureComponent<Props, State> {
  private refGistForm: HTMLFormElement;
  private examplePortal = React.createRef<HTMLDivElement>();
  private listnerAttached: boolean = false;
  constructor(props) {
    super(props);
    this.state = {
      scrollPosition: 0,
      showVega: props.mode === Mode.Vega,
    };
  }

  public onSelectVega(name) {
    this.props.history.push(`/examples/vega/${name}`);
  }

  public onSelectVegaLite(name) {
    this.props.history.push(`/examples/vega-lite/${name}`);
  }

  public onSelectNewVegaLite() {
    this.props.history.push('/custom/vega-lite');
  }

  public onSwitchMode(option) {
    option.value === Mode.Vega ? this.props.updateVegaSpec(stringify(this.props.vegaSpec)) : this.onSelectNewVegaLite();
  }

  public componentWillReceiveProps(nextProps) {
    this.setState({
      showVega: nextProps.mode === Mode.Vega,
    });
  }

  public handleHelpModalToggle(Toggleevent, openPortal, closePortal, isOpen) {
    window.addEventListener('keydown', event => {
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
      this.listnerAttached = true;
    });
  }

  public openCommandPalette() {
    this.props.editorRef.trigger('', 'editor.action.quickCommand');
  }

  public componentWillUnmount() {
    window.removeEventListener('keydown', () => {
      return;
    });
    this.listnerAttached = false;
  }
  public render() {
    const modeOptions =
      this.props.mode === Mode.Vega
        ? [{ value: Mode.VegaLite, label: NAMES[Mode.VegaLite] }]
        : [{ value: Mode.Vega, label: NAMES[Mode.Vega] }];

    const modeSwitcher = (
      <Select
        className="mode-switcher-wrapper"
        classNamePrefix="mode-switcher"
        value={{ label: `${NAMES[this.props.mode]}` }}
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
      <div className="header-button help" onClick={() => this.setState(current => ({ ...current }))}>
        <HelpCircle className="header-icon" />
        {'Help'}
      </div>
    );

    const runButton = (
      <div className="header-button" onClick={() => this.props.parseSpec(true)}>
        <Play className="header-icon" />
        {'Run'}
        <span className="parse-mode">{this.props.manualParse ? 'Manual' : 'Auto'}</span>
      </div>
    );

    const optionsButton = (
      <div className="header-button" onClick={this.openCommandPalette.bind(this)}>
        <Terminal className="header-icon" />
        {'Commands'}
      </div>
    );

    const runOptions = this.props.manualParse ? [{ label: 'Auto' }] : [{ label: 'Manual' }];

    const autoRunToggle = (
      <Select
        className="auto-run-wrapper"
        classNamePrefix="auto-run"
        value={{ label: '' }}
        options={runOptions}
        isClearable={false}
        isSearchable={false}
        onChange={this.props.toggleAutoParse}
      />
    );

    const splitClass = 'split-button' + (this.props.manualParse ? '' : ' auto-run');

    const vega = closePortal => (
      <div className="vega">
        {Object.keys(VEGA_SPECS).map((specType, i) => {
          const specs = VEGA_SPECS[specType];
          return (
            <div className="itemGroup" key={i}>
              <div className="specType">{specType}</div>
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
                      <div style={{ backgroundImage: `url(images/examples/vg/${spec.name}.vg.png)` }} className="img" />
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

    const vegalite = closePortal => (
      <div className="vega-Lite">
        {Object.keys(VEGA_LITE_SPECS).map((specGroup, i) => {
          return (
            <div key={i}>
              <h3>{specGroup}</h3>
              {Object.keys(VEGA_LITE_SPECS[specGroup]).map((specType, j) => {
                const specs = VEGA_LITE_SPECS[specGroup][specType];
                return (
                  <div className="itemGroup" key={j}>
                    <div className="specType">{specType}</div>
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
                              style={{ backgroundImage: `url(images/examples/vl/${spec.name}.vl.png)` }}
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

    const gist = closePortal => <GistModal closePortal={() => closePortal()} />;
    const exportContent = <ExportModal />;
    const shareContent = <ShareModal />;
    const helpModal = <HelpModal />;

    return (
      <div className="header">
        <section className="left-section">
          <span>{modeSwitcher}</span>
          <span ref="splitButton" className={splitClass}>
            {runButton}
            {autoRunToggle}
          </span>
          <span>{optionsButton}</span>

          <PortalWithState closeOnEsc>
            {({ openPortal, closePortal, isOpen, portal }) => [
              <span key="0" onClick={openPortal}>
                {exportButton}
              </span>,
              portal(
                <div className="modal-background" onClick={closePortal}>
                  <div className="modal modal-top" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <button className="close-button" onClick={closePortal}>
                        <X />
                      </button>
                    </div>
                    <div className="modal-body">{exportContent}</div>
                    <div className="modal-footer" />
                  </div>
                </div>
              ),
            ]}
          </PortalWithState>

          <PortalWithState closeOnEsc>
            {({ openPortal, closePortal, onOpen, portal }) => [
              <span key="0" onClick={openPortal}>
                {shareButton}
              </span>,
              portal(
                <div className="modal-background" onClick={closePortal}>
                  <div className="modal modal-top" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <button className="close-button" onClick={closePortal}>
                        <X />
                      </button>
                    </div>
                    <div className="modal-body modal-hidden">{shareContent}</div>
                    <div className="modal-footer" />
                  </div>
                </div>
              ),
            ]}
          </PortalWithState>

          <PortalWithState closeOnEsc>
            {({ openPortal, closePortal, isOpen, portal }) => [
              <span key="0" onClick={openPortal}>
                {gistButton}
              </span>,
              portal(
                <div className="modal-background" onClick={closePortal}>
                  <div className="modal modal-top" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <button className="close-button" onClick={closePortal}>
                        <X />
                      </button>
                    </div>
                    <div className="modal-body">{gist(closePortal)}</div>
                    <div className="modal-footer" />
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
            {({ openPortal, closePortal, isOpen, portal }) => [
              <span key="0" onClick={openPortal}>
                {examplesButton}
              </span>,
              portal(
                <div className="modal-background" onClick={closePortal}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <div className="button-groups">
                        <button
                          className={this.state.showVega ? 'selected' : ''}
                          onClick={() => {
                            this.setState({ showVega: true });
                            const node = ReactDOM.findDOMNode(this.examplePortal.current);
                            node.scrollTop = 0;
                          }}
                        >
                          Vega
                        </button>
                        <button
                          className={this.state.showVega ? '' : 'selected'}
                          onClick={() => {
                            this.setState({ showVega: false });
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
                    <div className="modal-footer" />
                  </div>
                </div>
              ),
            ]}
          </PortalWithState>
        </section>

        <section className="right-section">
          <PortalWithState closeOnEsc>
            {({ openPortal, closePortal, isOpen, portal }) => {
              if (!this.listnerAttached) {
                this.handleHelpModalToggle(event, openPortal, closePortal, isOpen);
              }
              return [
                <span key="0" onClick={openPortal}>
                  {HelpButton}
                </span>,
                portal(
                  <div className="modal-background" onClick={closePortal}>
                    <div className="modal modal-top" onClick={e => e.stopPropagation()}>
                      <div className="modal-header">
                        <button className="close-button" onClick={closePortal}>
                          <X />
                        </button>
                      </div>
                      <div className="modal-body">
                        <HelpModal />
                      </div>
                      <div className="modal-footer" />
                    </div>
                  </div>
                ),
              ];
            }}
          </PortalWithState>
        </section>
      </div>
    );
  }
}

export default withRouter(Header);
