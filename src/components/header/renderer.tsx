import LZString from 'lz-string';
import * as React from 'react';
import Clipboard from 'react-clipboard.js';
import ReactDOM from 'react-dom';
import {
  Book,
  Code,
  Copy,
  ExternalLink,
  FileText,
  GitHub,
  Grid,
  HelpCircle,
  Image,
  Link,
  Map,
  Play,
  Share2,
  Trash2,
  X,
} from 'react-feather';
import { Portal, PortalWithState } from 'react-portal';
import { withRouter } from 'react-router-dom';
import Select from 'react-select';
import { Mode, View } from '../../constants';
import { NAMES } from '../../constants/consts';
import { VEGA_LITE_SPECS, VEGA_SPECS } from '../../constants/specs';
import HelpModal from '../help-modal/index';
import './index.css';

interface Props {
  editorString?: string;
  history: any;
  lastPosition: number;
  manualParse?: boolean;
  mode: Mode;
  view: View;
  vegaSpec?: object;
  vegaLiteSpec?: object;
  showExample: boolean;
  exportVega: (val: any) => void;
  formatSpec: (val: any) => void;
  parseSpec: (val: any) => void;
  toggleAutoParse: () => void;
  setScrollPosition: (position: number) => void;
}

interface State {
  copied: boolean;
  downloadVegaJSON: boolean;
  fullscreen: boolean;
  generatedURL: string;
  gist: {
    filename: string;
    revision: string;
    type: Mode;
    url: string;
  };
  gistLoadClicked: boolean;
  helpModalOpen: boolean;
  invalidFilename: boolean;
  invalidRevision: boolean;
  invalidUrl: boolean;
  showVega: boolean;
  scrollPosition: number;
}

const formatExampleName = (name: string) => {
  return name
    .split(/[_-]/)
    .map(i => i[0].toUpperCase() + i.substring(1))
    .join(' ');
};

class Header extends React.Component<Props, State> {
  private refGistForm: HTMLFormElement;
  private examplePortal = React.createRef<HTMLDivElement>();
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
      downloadVegaJSON: false,
      fullscreen: false,
      generatedURL: '',
      gist: {
        filename: '',
        revision: '',
        type: props.mode,
        url: '',
      },
      gistLoadClicked: false,
      helpModalOpen: false,
      invalidFilename: false,
      invalidRevision: false,
      invalidUrl: false,
      scrollPosition: 0,
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
    this.setState({
      invalidUrl: false,
    });
  }

  public updateGistRevision(event) {
    this.updateGist({ revision: event.currentTarget.value });
    this.setState({
      invalidRevision: false,
    });
  }

  public updateGistFile(event) {
    this.updateGist({ filename: event.currentTarget.value });
    this.setState({
      invalidFilename: false,
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

  public onClear() {
    this.props.mode === Mode.Vega ? this.onSelectNewVega() : this.onSelectNewVegaLite();
  }

  public onSwitchMode(option) {
    option.value === Mode.Vega ? this.onSelectNewVega() : this.onSelectNewVegaLite();
  }

  public onCopy() {
    this.setState({ copied: true });
  }

  public handleCheck(event) {
    this.setState({ fullscreen: event.target.checked }, () => {
      this.exportURL();
    });
  }

  public handleHelpModalOpen(event) {
    if (
      (event.keyCode === 222 && event.metaKey && !event.shiftKey) || // Handle key press in Mac
      (event.keyCode === 191 && event.ctrlKey && event.shiftKey) // Handle Key press in PC
    ) {
      this.setState({
        helpModalOpen: true,
      });
    }
  }

  public handleHelpModalCloseClick() {
    this.setState({
      helpModalOpen: false,
    });
  }

  public handleHelpModalCloseEsc(event) {
    if (event.keyCode === 27) {
      this.setState({
        helpModalOpen: false,
      });
    }
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
    this.setState({
      gistLoadClicked: true,
    });

    const gistUrl = new URL(url, 'https://gist.github.com');
    const [username, gistId] = gistUrl.pathname.split('/').slice(1);
    const gistCommits = await fetch(`https://api.github.com/gists/${gistId}/commits`);
    this.setState({
      gistLoadClicked: gistCommits.ok,
      invalidUrl: !gistCommits.ok,
    });
    const responseGistCommits = await gistCommits.json();
    if (revision.length === 0) {
      // the url is invalid so we don't want to show errors for the revisiton and filename
      this.setState({
        invalidFilename: false,
        invalidRevision: false,
      });
      revision = responseGistCommits[0].version;
    } else {
      const revGistCommits = await fetch(`https://api.github.com/gists/${gistId}/${revision}`);
      this.setState({
        gistLoadClicked: revGistCommits.ok || this.state.invalidUrl,
        invalidFilename: !this.state.invalidUrl,
        invalidRevision: !(revGistCommits.ok || this.state.invalidUrl),
      });
    }

    const gistData = await fetch(`https://api.github.com/gists/${gistId}`).then(r => r.json());
    if (filename.length === 0) {
      filename = Object.keys(gistData.files).find(f => gistData.files[f].language === 'JSON');

      if (filename === undefined) {
        this.setState({
          gistLoadClicked: false,
          invalidUrl: true,
        });
        throw Error();
      }
      this.setState({
        invalidFilename: false,
      });
    } else {
      const gistFilename = Object.keys(gistData.files).find(f => gistData.files[f].language === 'JSON');
      if (this.state.gist.filename !== gistFilename && !this.state.invalidUrl) {
        this.setState({
          gistLoadClicked: false,
          invalidFilename: true,
        });
      } else {
        this.setState({
          invalidFilename: false,
        });
      }
    }
    if (!(this.state.invalidUrl || this.state.invalidFilename || this.state.invalidRevision)) {
      this.props.history.push(`/gist/${type}/${username}/${gistId}/${revision}/${filename}`);
      this.setState({
        gist: {
          filename: '',
          revision: '',
          type: Mode.Vega,
          url: '',
        },
        gistLoadClicked: true,
        invalidFilename: false,
        invalidRevision: false,
        invalidUrl: false,
      });

      closePortal(); // Close the gist modal after it gets load
    }
  }

  public updateDownloadJSONType(event) {
    this.setState({ downloadVegaJSON: event.currentTarget.value === 'vega' });
  }

  public async openViz(ext: string) {
    const url = await this.props.view.toImageURL(ext);
    const tab = window.open('about:blank', '_blank');
    tab.document.write(`<title>Chart</title><img src="${url}" />`);
    tab.document.close();
  }

  public async downloadViz(ext: string) {
    const url = await this.props.view.toImageURL(ext);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.setAttribute('download', `visualization.${ext}`);
    link.dispatchEvent(new MouseEvent('click'));
  }

  public async downloadPDF() {
    // show that we are working
    const dlButton = this.refs.downloadPDF as any;
    dlButton.classList.add('disabled');

    const svg = await this.props.view.toSVG();

    const pdf = await fetch('https://api.cloudconvert.com/convert', {
      body: JSON.stringify({
        apikey: '7ZSKlPLjDB4RUaq5dvEvAQMG5GGwEeHH3qa7ixAr0KZtPxfwsKv81sc1SqFhlh7d',
        file: svg,
        filename: 'chart.svg',
        input: 'raw',
        inputformat: 'svg',
        outputformat: 'pdf',
      }),
      headers: {
        'content-type': 'application/json; chartset=UTF-8',
      },
      method: 'post',
    });

    const blob = await pdf.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.setAttribute('download', `visualization.pdf`);
    link.dispatchEvent(new MouseEvent('click'));

    dlButton.classList.remove('disabled');
  }

  public downloadJSON(event) {
    if (
      event.target &&
      (event.target.matches(`input`) ||
        event.target.matches(`label`) ||
        event.target.matches(`div.type-input-container`))
    ) {
      return;
    }
    const content = this.state.downloadVegaJSON ? this.props.vegaSpec : this.props.vegaLiteSpec;
    const filename = this.state.downloadVegaJSON ? `visualization.vg.json` : `visualization.vl.json`;

    const blob = new Blob([JSON.stringify(content, null, 2)], { type: `application/json` });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement(`a`);
    link.setAttribute(`href`, url);
    link.setAttribute(`target`, `_blank`);
    link.setAttribute(`download`, filename);
    link.dispatchEvent(new MouseEvent(`click`));
  }

  public exportURL() {
    const serializedSpec =
      LZString.compressToEncodedURIComponent(this.props.editorString) + (this.state.fullscreen ? '/view' : '');
    if (serializedSpec) {
      const url = `${document.location.href.split('#')[0]}#/url/${this.props.mode}/${serializedSpec}`;
      this.setState({ generatedURL: url });
    }
  }

  public previewURL() {
    const win = window.open(this.state.generatedURL, '_blank');
    win.focus();
  }

  public componentDidMount() {
    document.addEventListener('keydown', this.handleHelpModalOpen.bind(this));
    document.addEventListener('keyup', this.handleHelpModalCloseEsc.bind(this));
    document.addEventListener('keydown', e => {
      // keycode for F key is 70
      if (e.altKey && e.shiftKey && e.keyCode === 70) {
        this.props.formatSpec(true);
        const formatButton = document.querySelector('.format-button');
        formatButton.classList.add('dark-background');
        setTimeout(() => {
          formatButton.classList.remove('dark-background');
        }, 200);
      }
    });
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.state.copied) {
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2500);
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
      <div className="header-button" onClick={() => this.setState(current => ({ ...current, helpModalOpen: true }))}>
        <HelpCircle className="header-icon" />
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
      <div className="header-button format-button" onClick={() => this.props.formatSpec(true)}>
        <Code className="header-icon" />
        {'Format'}
      </div>
    );

    const runButton = (
      <div className="header-button" onClick={() => this.props.parseSpec(true)}>
        <Play className="header-icon" />
        {'Run'}
        <span className="parse-mode">{this.props.manualParse ? 'Manual' : 'Auto'}</span>
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
              <div style={{ marginTop: '2px' }}>
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
            <div className="error-message">{this.state.invalidUrl && <span>Please enter a valid URL.</span>}</div>
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
              <div className="error-message">
                {this.state.invalidRevision && <span>Please enter a valid revision.</span>}
              </div>
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
              <div className="error-message">
                {this.state.invalidFilename && <span>Please enter a valid filename.</span>}
              </div>
            </div>
          </div>
          <button type="button" className="gist-button" onClick={() => this.onSelectGist(closePortal)}>
            {this.state.gistLoadClicked ? 'Loading..' : 'Load'}
          </button>
        </form>
      </div>
    );

    const exportContent = (
      <div className="export-content">
        <h2>Export</h2>
        <div className="export-buttons">
          <button className="export-button" onClick={() => this.downloadViz('png')}>
            <div>
              <Image />
              <span>Download PNG</span>
            </div>
            <p>
              PNG is a bitmap image format which is made up of a fixed number of pixels. They have a fixed resolution
              and cannot be scaled.
            </p>
          </button>
          <button className="export-button" onClick={() => this.downloadViz('svg')}>
            <div>
              <Map />
              <span>Download SVG</span>
            </div>
            <p>
              SVG is a vector image format which uses geometric forms to represent different parts as discrete objects
              and are infinitely scalable.
            </p>
          </button>
          <button className="export-button" onClick={() => this.openViz('svg')}>
            <div>
              <Map />
              <span>Open SVG</span>
            </div>
            <p>Open the SVG in your browser instead of downloading it.</p>
          </button>
          <button className="export-button" onClick={() => this.downloadPDF()} ref="downloadPDF">
            <div>
              <Book />
              <span>Download PDF</span>
            </div>
            <p>
              <strong>Experimental!</strong>
              <br /> PDF is a vector format usually used for documents. This might take a few seconds. Please be
              patient.
            </p>
          </button>
          <button className="export-button" onClick={e => this.downloadJSON(e)}>
            <div>
              <Code />
              <span>Download JSON</span>
            </div>
            <p>JSON is a lightweight data-interchange format.</p>
            <div className="type-input-container">
              Type:
              <input
                type="radio"
                name="json-type"
                id="json-type[vega]"
                value="vega"
                checked={this.state.downloadVegaJSON}
                onChange={this.updateDownloadJSONType.bind(this)}
              />
              <label htmlFor="json-type[vega]">Vega</label>
              <input
                type="radio"
                name="json-type"
                id="json-type[vega-lite]"
                value="vega-lite"
                checked={!this.state.downloadVegaJSON}
                onChange={this.updateDownloadJSONType.bind(this)}
              />
              <label htmlFor="json-type[vega-lite]">Vega Lite</label>
            </div>
          </button>
        </div>
        <div className="user-notes">
          <p>
            <strong>Note:</strong> To get a PDF, open the SVG which you can print as a PDF from your browser.
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
          Number of charaters in the URL: {this.state.generatedURL.length}{' '}
          <span className="url-warning">
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

    const helpModal = <HelpModal />;

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
          {HelpButton}
        </section>
        <section className="right-section">
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

          <PortalWithState
            closeOnEsc
            onClose={() => {
              this.setState({
                gistLoadClicked: false,
              });
            }}
          >
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

          {this.state.helpModalOpen && (
            <Portal>
              <div className="modal-background" onClick={this.handleHelpModalCloseClick.bind(this)}>
                <div className="modal modal-top" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <button className="close-button" onClick={this.handleHelpModalCloseClick.bind(this)}>
                      <X />
                    </button>
                  </div>
                  <div className="modal-body">{helpModal}</div>
                  <div className="modal-footer" />
                </div>
              </div>
            </Portal>
          )}

          <span>{docsLink}</span>

          <a className="idl-logo" href="https://idl.cs.washington.edu/" target="_blank" rel="noopener noreferrer">
            <img height={32} alt="IDL Logo" src="idl-logo.png" />
          </a>
        </section>
      </div>
    );
  }
}

export default withRouter(Header);
