import 'react-select/dist/react-select.css';
import './index.css';

import LZString from 'lz-string';
import * as React from 'react';
import Clipboard from 'react-clipboard.js';
import {
  Code,
  Copy,
  ExternalLink,
  FileText,
  Github,
  Grid,
  Image,
  Link,
  Map,
  Play,
  Share2,
  Trash2,
  X,
} from 'react-feather';
import { PortalWithState } from 'react-portal';
import { withRouter } from 'react-router-dom';
import Select from 'react-select';
import { Mode, View } from '../../constants';
import { NAME_TO_MODE, NAMES } from '../../constants/consts';
import { VEGA_LITE_SPECS, VEGA_SPECS } from '../../constants/specs';

interface Props {
  autoParse?: boolean;
  editorString?: string;
  history: any;
  mode: Mode;
  view: View;

  exportVega: (val: any) => void;
  formatSpec: (val: any) => void;
  parseSpec: (val: any) => void;
  toggleAutoParse: () => void;
}

interface State {
  copied: boolean;
  fullscreen: boolean;
  generatedURL: string;
  gist: {
    filename: string;
    revision: string;
    type: Mode;
    url: string;
  };
  invalidUrl: boolean;
  showVega: boolean;
}

const formatExampleName = (name: string) => {
  return name
    .split(/[_-]/)
    .map(i => i[0].toUpperCase() + i.substring(1))
    .join(' ');
};

class Header extends React.Component<Props, State> {
  private refGistForm: HTMLFormElement;

  constructor(props) {
    super(props);
    this.state = {
      copied: false,
      fullscreen: false,
      generatedURL: '',
      gist: {
        filename: '',
        revision: '',
        type: props.mode,
        url: '',
      },
      invalidUrl: false,
      showVega: props.mode === Mode.Vega,
    };
  }

  public updateGist(gist) {
    this.setState({
      gist: {
        ...this.state.gist,
        ...gist,
      },
    });
  }

  public updateGistType(event) {
    this.updateGist({ type: event.currentTarget.value });
  }

  public updateGistUrl(event) {
    this.updateGist({ url: event.currentTarget.value });
  }

  public updateGistRevision(event) {
    this.updateGist({ revision: event.currentTarget.value });
  }

  public updateGistFile(event) {
    this.updateGist({ filename: event.currentTarget.value });
  }

  public onSelectVega(name) {
    this.props.history.push('/examples/vega/' + name);
  }

  public onSelectNewVega() {
    this.props.history.push('/custom/vega');
  }

  public onSelectVegaLite(name) {
    this.props.history.push('/examples/vega-lite/' + name);
  }

  public onSelectNewVegaLite() {
    this.props.history.push('/custom/vega-lite');
  }

  public onClear() {
    this.props.mode === Mode.Vega ? this.onSelectNewVega() : this.onSelectNewVegaLite();
  }

  public onSwitch(option) {
    option.value === 'vega' ? this.onSelectNewVega() : this.onSelectNewVegaLite();
  }

  public onSelectRun(option) {
    if (option.value === 'auto') {
      if (!this.props.autoParse) {
        this.props.toggleAutoParse();
      }
    } else {
      if (this.props.autoParse) {
        this.props.toggleAutoParse();
      }
    }
  }

  public onCopy() {
    this.setState({ copied: true });
  }

  public handleCheck(event) {
    this.setState({ fullscreen: event.target.checked });
  }

  public async onSelectGist(closePortal) {
    const type = this.state.gist.type;
    const url = this.state.gist.url.trim().toLowerCase();

    let revision = this.state.gist.revision.trim().toLowerCase();
    let filename = this.state.gist.filename.trim();

    if (url.length === 0) {
      this.refGistForm.reportValidity();

      return;
    }

    const gistUrl = new URL(url, 'https://gist.github.com');
    const [username, gistId] = gistUrl.pathname.split('/').slice(1);

    if (revision.length === 0) {
      const gistCommits = await fetch(`https://api.github.com/gists/${gistId}/commits`).then(r => r.json());

      revision = gistCommits[0].version;
    }

    if (filename.length === 0) {
      const gistData = await fetch(`https://api.github.com/gists/${gistId}`).then(r => r.json());

      filename = Object.keys(gistData.files).find(f => gistData.files[f].language === 'JSON');

      if (filename === undefined) {
        throw Error();
      }
    }

    this.props.history.push(`/gist/${type}/${username}/${gistId}/${revision}/${filename}`);

    this.setState({
      gist: {
        filename: '',
        revision: '',
        type: Mode.Vega,
        url: '',
      },

      invalidUrl: false,
    });

    closePortal(); // Close the gist modal after it gets load
  }

  // Export visualization as SVG/PNG
  public async exportViz(ext: string) {
    const url = await this.props.view.toImageURL(ext);
    if (ext === 'png') {
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('target', '_blank');
      link.setAttribute('download', 'visualization.' + ext);
      link.dispatchEvent(new MouseEvent('click'));
    } else {
      const tab = window.open();
      tab.document.write('<title>SVG</title><img src="' + url + '"/>');
    }
  }

  public exportURL() {
    const serializedSpec =
      LZString.compressToEncodedURIComponent(this.props.editorString) + (this.state.fullscreen ? '/view' : '');
    const exportedURL = this.refs.exportedURL as any;
    if (exportedURL && serializedSpec) {
      const url =
        document.location.href.split('#')[0] + '#/url/' + NAME_TO_MODE[this.props.mode] + '/' + serializedSpec;
      exportedURL.innerHTML = url;
      this.setState({ generatedURL: url });
      // Visual Feedback
      exportedURL.classList.add('pressed');
      setTimeout(() => {
        exportedURL.classList.remove('pressed');
      }, 250);
    }
  }

  public previewURL() {
    const win = window.open(this.state.generatedURL, '_blank');
    win.focus();
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.state.copied) {
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2500);
    }
    if (prevState.fullscreen !== this.state.fullscreen) {
      this.exportURL();
    }
    // Use ... when URL overflows the container
    const wrapperURL = this.refs.wrapperURL as any;
    if (wrapperURL && wrapperURL.offsetWidth < wrapperURL.scrollWidth) {
      const url = this.state.generatedURL;
      const max = (url.length / wrapperURL.scrollWidth) * wrapperURL.offsetWidth * 0.9;
      (this.refs.exportedURL as any).innerHTML =
        url.slice(0, (2 * max) / 3) + '...' + url.slice(url.length - max / 3, url.length);
    }
  }

  public componentWillReceiveProps(nextProps) {
    this.setState({
      gist: {
        filename: '',
        revision: '',
        type: nextProps.mode,
        url: '',
      },
      showVega: nextProps.mode === Mode.Vega,
    });
  }

  public render() {
    const modeOptions =
      this.props.mode === Mode.Vega
        ? [{ value: Mode.VegaLite, label: NAMES[Mode.VegaLite] }]
        : [{ value: Mode.Vega, label: NAMES[Mode.Vega] }];

    const modeSwitcher = (
      <Select
        className="mode-switcher"
        value={{ label: `${NAMES[this.props.mode]}` }}
        options={modeOptions}
        clearable={false}
        searchable={false}
        onChange={this.onSwitch.bind(this)}
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
        <Github className="header-icon" />
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

    const docsLink = (
      <a
        className="docs-link"
        href={`https://vega.github.io/${this.props.mode}/docs/`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FileText className="header-icon" />
        {NAMES[this.props.mode]} Docs
      </a>
    );

    const clearButton = (
      <div className="header-button" onClick={() => this.onClear()}>
        <Trash2 className="header-icon" />
        {'Clear'}
      </div>
    );

    const formatButton = (
      <div className="header-button" onClick={() => this.props.formatSpec(true)}>
        <Code className="header-icon" />
        {'Format'}
      </div>
    );

    const runButton = (
      <div className="header-button" onClick={() => this.props.parseSpec(true)}>
        <Play className="header-icon" />
        {'Run'}
        <span className="parse-mode">{this.props.autoParse ? 'Auto' : 'Manual'}</span>
      </div>
    );

    const runOptions = this.props.autoParse
      ? [{ value: 'manual', label: 'Manual' }]
      : [{ value: 'auto', label: 'Auto' }];

    const autoRunToggle = (
      <Select
        className="auto-run-toggle"
        value={{ label: '' }}
        options={runOptions}
        clearable={false}
        searchable={false}
        onChange={this.onSelectRun.bind(this)}
      />
    );

    const splitClass = 'split-button' + (this.props.autoParse ? ' auto-run' : '');

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

    const gist = closePortal => (
      <div className="gist-content">
        <h2>Load Gist</h2>
        <form ref={form => (this.refGistForm = form)}>
          <div className="gist-input-container">
            Gist Type:
            <input
              type="radio"
              name="gist-type"
              id="gist-type[vega]"
              value="vega"
              checked={this.state.gist.type === Mode.Vega}
              onChange={this.updateGistType.bind(this)}
            />
            <label htmlFor="gist-type[vega]">Vega</label>
            <input
              type="radio"
              name="gist-type"
              id="gist-type[vega-lite]"
              value="vega-lite"
              checked={this.state.gist.type === Mode.VegaLite}
              onChange={this.updateGistType.bind(this)}
            />
            <label htmlFor="gist-type[vega-lite]">Vega Lite</label>
          </div>
          <div className="gist-input-container">
            <label>
              Gist URL
              <div>
                <small>
                  Example:{' '}
                  <span className="gist-url">
                    {'https://gist.github.com/domoritz/455e1c7872c4b38a58b90df0c3d7b1b9'}
                  </span>
                </small>
              </div>
              <input
                required
                className="gist-input"
                type="text"
                placeholder="Enter URL"
                value={this.state.gist.url}
                onChange={this.updateGistUrl.bind(this)}
              />
            </label>
          </div>
          <div className="gist-optional">
            <div className="gist-input-container gist-optional-input-container">
              <label>
                Revision (<small>optional</small>)
                <input
                  className="gist-input"
                  type="text"
                  placeholder="Enter revision"
                  value={this.state.gist.revision}
                  onChange={this.updateGistRevision.bind(this)}
                />
              </label>
            </div>
            <div className="gist-input-container gist-optional-input-container">
              <label>
                Filename (<small>optional</small>)
                <input
                  className="gist-input"
                  type="text"
                  placeholder="Enter filename"
                  value={this.state.gist.filename}
                  onChange={this.updateGistFile.bind(this)}
                />
              </label>
            </div>
          </div>
          <div className="error-message">{this.state.invalidUrl && <span>Please enter a valid URL.</span>}</div>
          <button type="button" className="gist-button" onClick={() => this.onSelectGist(closePortal)}>
            Load
          </button>
        </form>
      </div>
    );

    const exportContent = (
      <div className="export-content">
        <h2>Export</h2>
        <div className="export-buttons">
          <button className="export-button" onClick={() => this.exportViz('png')}>
            <div>
              <Image />
              <span>Download PNG</span>
            </div>
            <p>
              PNG is a bitmap image format which is made up of a fixed number of pixels. They have a fixed resolution
              and cannot be scaled.
            </p>
          </button>
          <button className="export-button" onClick={() => this.exportViz('svg')}>
            <div>
              <Map />
              <span>Open SVG</span>
            </div>
            <p>
              SVG is a vector image format which uses geometric forms to represent different parts as discrete objects
              and are infinitely scalable.
            </p>
          </button>
        </div>
        <div className="user-notes">
          <p>
            <strong>Note:</strong> To get a PDF, export SVG which you can save as PDF from the print window of your
            browser.
          </p>
        </div>
      </div>
    );

    const shareContent = (
      <div className="share-content">
        <h2>Share</h2>
        <p>We pack the Vega or Vega-Lite specification and an encoded string in the URL.</p>
        <p>We use LZ-based compression algorithm and preserve indentation, newlines, and other whitespace.</p>
        <div className="user-pref">
          <label>
            Link opens visualization in fullscreen:
            <input
              type="checkbox"
              defaultChecked={this.state.fullscreen}
              name="fullscreen"
              onChange={this.handleCheck.bind(this)}
            />
          </label>
        </div>
        <div className="exported-url">
          <span ref="wrapperURL">
            <a ref="exportedURL" href={this.state.generatedURL} target="_blank">
              {this.state.generatedURL}
            </a>
          </span>
        </div>
        <div className="share-buttons">
          <button className="share-button" onClick={() => this.previewURL()}>
            <Link />
            <span>Open Link</span>
          </button>
          <Clipboard
            className="share-button copy-icon"
            data-clipboard-text={this.state.generatedURL}
            onSuccess={this.onCopy.bind(this)}
          >
            <span>
              <Copy />
              Copy to Clipboard
            </span>
          </Clipboard>
          <div className={`copied + ${this.state.copied ? ' visible' : ''}`}>Copied!</div>
        </div>
        <div className="byte-counter">
          Characters Count: {this.state.generatedURL.length}{' '}
          <span className="warning">
            {this.state.generatedURL.length > 2083 ? (
              <span>
                Warning:{' '}
                <a
                  href="https://support.microsoft.com/en-us/help/208427/maximum-url-length-is-2-083-characters-in-internet-explorer"
                  target="_blank"
                >
                  URLs over 2083 characters may not be supported in Internet Explorer.
                </a>
              </span>
            ) : (
              ''
            )}
          </span>
        </div>
      </div>
    );

    return (
      <div className="header">
        <section className="left-section">
          <span>{modeSwitcher}</span>
          <span>{clearButton}</span>
          <span>{formatButton}</span>
          <span ref="splitButton" className={splitClass}>
            {runButton}
            {autoRunToggle}
          </span>

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

          <PortalWithState closeOnEsc onOpen={this.exportURL.bind(this)}>
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
        </section>
        <section className="right-section">
          <PortalWithState closeOnEsc>
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
                          onClick={() => this.setState({ showVega: true })}
                        >
                          Vega
                        </button>
                        <button
                          className={this.state.showVega ? '' : 'selected'}
                          onClick={() => this.setState({ showVega: false })}
                        >
                          Vega-Lite
                        </button>
                      </div>
                      <button className="close-button" onClick={closePortal}>
                        <X />
                      </button>
                    </div>
                    <div className="modal-body">{this.state.showVega ? vega(closePortal) : vegalite(closePortal)}</div>
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

          <span>{docsLink}</span>

          <a className="idl-logo" href="https://idl.cs.washington.edu/" target="_blank" rel="noopener noreferrer">
            <img height={32} alt="IDL Logo" src="https://vega.github.io/images/idl-logo.png" />
          </a>
        </section>
      </div>
    );
  }
}

export default withRouter(Header);
