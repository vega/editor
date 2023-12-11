import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {Book, BookOpen, Code, Image, Map} from 'react-feather';
import {withRouter} from 'react-router-dom';
import {mergeConfig, version as VG_VERSION} from 'vega';
import {version as VE_VERSION} from 'vega-embed';
import {version as VL_VERSION} from 'vega-lite';
import {mapStateToProps} from '.';
import {Mode} from '../../../constants/consts';
import './index.css';

type Props = ReturnType<typeof mapStateToProps>;

interface State {
  downloadVegaJSON: boolean;
  includeConfig: boolean;
  loadingPDF: boolean;
  errorLoadingPdf: string;
}

class ExportModal extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      downloadVegaJSON: false,
      includeConfig: true,
      loadingPDF: false,
      errorLoadingPdf: null,
    };
  }

  public async downloadViz(ext: string) {
    const url = await this.props.view.toImageURL(ext, 2);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.setAttribute('download', `visualization.${ext}`);
    link.dispatchEvent(new MouseEvent('click'));
  }

  public async openViz(ext: string) {
    const url = await this.props.view.toImageURL(ext);
    const tab = window.open('about:blank', '_blank');
    tab.document.write(`<title>Chart</title><img src="${url}" />`);
    tab.document.close();
  }

  public async downloadPDF() {
    this.setState({loadingPDF: true});

    const isVega = this.props.mode === Mode.Vega;
    const spec = isVega ? this.props.vegaSpec : this.props.vegaLiteSpec;

    const pdf = await fetch(
      `https://vl-convert-service.vercel.app/api/${isVega ? 'vg' : 'vl'}2pdf/?baseURL=${this.props.baseURL}`,
      {
        body: JSON.stringify(spec),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
        },
        method: 'post',
        mode: 'cors',
      },
    );
    if (!pdf.ok) {
      console.error('Error loading PDF', pdf);
      this.setState({loadingPDF: false, errorLoadingPdf: pdf.statusText || `Unknown error (code ${pdf.status})`});
      return;
    }
    this.setState({loadingPDF: false, errorLoadingPdf: null});
    const blob = await pdf.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.setAttribute('download', `visualization.pdf`);
    link.dispatchEvent(new MouseEvent('click'));
  }

  public updateIncludeConfig(e) {
    this.setState({
      includeConfig: e.target.checked,
    });
  }

  public downloadJSON(event) {
    if (
      event.target?.matches(`input`) ||
      event.target?.matches(`label`) ||
      event.target?.matches(`div.type-input-container`)
    ) {
      return;
    }
    let content;
    let filename: string;
    if (this.props.mode === Mode.Vega) {
      content = this.props.vegaSpec;
      filename = `visualization.vg.json`;
    } else {
      content = this.state.downloadVegaJSON ? this.props.vegaSpec : this.props.vegaLiteSpec;
      filename = this.state.downloadVegaJSON ? `visualization.vg.json` : `visualization.vl.json`;
    }

    if (this.state.includeConfig && this.props.config) {
      content = {...content};
      content.config = mergeConfig({}, this.props.config, content.config);
    }

    const blob = new Blob([stringify(content)], {
      type: `application/json`,
    });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement(`a`);
    link.setAttribute(`href`, url);
    link.setAttribute(`target`, `_blank`);
    link.setAttribute(`download`, filename);
    link.dispatchEvent(new MouseEvent(`click`));
  }

  public updateDownloadJSONType(event) {
    this.setState({downloadVegaJSON: event.currentTarget.value === 'vega'});
  }

  public downloadHTML() {
    const {mode, vegaSpec, vegaLiteSpec, config} = this.props;
    let content = mode === Mode.Vega ? vegaSpec : vegaLiteSpec;
    if (config) {
      content = {...content};
      content.config = mergeConfig({}, config, content.config);
    }
    const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/vega@${VG_VERSION}"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-lite@${VL_VERSION}"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-embed@${VE_VERSION}"></script>
</head>
<body>
  <div id="vis"/>
  <script>
    const spec = ${stringify(content)};
    vegaEmbed("#vis", spec, {mode: "${mode}"}).then(console.log).catch(console.warn);
  </script>
</body>
</html>`;

    const blob = new Blob([htmlTemplate], {type: `text/html;charset=utf-8`});
    const link = document.createElement(`a`);
    link.setAttribute(`href`, window.URL.createObjectURL(blob));
    link.setAttribute(`target`, `_blank`);
    link.setAttribute(`download`, 'visualization.html');
    link.dispatchEvent(new MouseEvent(`click`));
  }

  public render() {
    return (
      <>
        <h1>Export</h1>
        <div className="exports">
          <div className="export-container">
            <div className="header-text">
              <Image />
              <span>PNG</span>
            </div>
            <p>PNG is a bitmap image format which is made up of a fixed number of pixels.</p>
            <button onClick={() => this.downloadViz('png')}>Download </button>
          </div>

          <div className="export-container">
            <div className="header-text">
              <Code />
              <span>JSON</span>
            </div>
            <p>JSON is a lightweight data-interchange format.</p>
            {this.props.mode === Mode.VegaLite && (
              <div className="input-container">
                <label>
                  <input
                    type="radio"
                    name="json-type"
                    id="json-type[vega]"
                    value="vega"
                    checked={this.state.downloadVegaJSON}
                    onChange={this.updateDownloadJSONType.bind(this)}
                  />{' '}
                  Compiled Vega
                </label>
                <label htmlFor="json-type[vega-lite]" className="vl-label">
                  <input
                    type="radio"
                    name="json-type"
                    id="json-type[vega-lite]"
                    value="vega-lite"
                    checked={!this.state.downloadVegaJSON}
                    onChange={this.updateDownloadJSONType.bind(this)}
                  />
                  Vega-Lite
                </label>
              </div>
            )}
            <div className="input-container">
              {this.state.downloadVegaJSON ? (
                <p>The compiled Vega includes the config and is formatted.</p>
              ) : (
                <div>
                  <label>
                    <input
                      type="checkbox"
                      name="config-include"
                      id="config-include"
                      value="config-select"
                      checked={this.state.includeConfig}
                      onChange={this.updateIncludeConfig.bind(this)}
                    />
                    Include config
                  </label>
                  {this.state.includeConfig && <p>The downloaded spec will be formatted. </p>}
                </div>
              )}
            </div>
            <button onClick={(e) => this.downloadJSON(e)}>Download</button>
          </div>
          <div className="export-container">
            <div className="header-text">
              <Map />
              <span>SVG</span>
            </div>
            <p>
              SVG is a vector image format which uses geometric forms to represent different parts as discrete objects
              and are infinitely scalable.
            </p>
            <button onClick={() => this.openViz('svg')}>Open</button>
            <button onClick={() => this.downloadViz('svg')} className="export-button download">
              Download
            </button>
          </div>
          <div className="export-container">
            <div className="header-text">
              <Book />
              <span>PDF</span>
            </div>
            <p>
              <br /> PDF is a vector format usually used for documents. This might take a few seconds. Please be
              patient. Use absolute URLs to data or <a href="https://github.com/vega/vega-datasets">Vega datasets</a> at{' '}
              <code>/data/...</code>. Your chart is sent to{' '}
              <a href="https://github.com/vega/vl-convert-service" target="_blank" rel="noopener noreferrer">
                vl-convert-service.vercel.app
              </a>{' '}
              for rendering.
            </p>
            <button onClick={() => this.downloadPDF()} disabled={this.state.loadingPDF}>
              {this.state.loadingPDF ? 'Downloading...' : 'Download'}
            </button>
            {this.state.errorLoadingPdf && (
              <p style={{color: 'red'}}>Render service failed with error: {this.state.errorLoadingPdf}.</p>
            )}
          </div>
          <div className="export-container">
            <div className="header-text">
              <BookOpen />
              <span>HTML</span>
            </div>
            <p>
              <br /> HTML is a document format to be displayed in a browser. Your chart is embedded in the downloaded
              html file. Use absolute URLs to ensure that the data is loaded correctly.
            </p>
            <button onClick={() => this.downloadHTML()}>Download</button>
          </div>
        </div>
        <div className="user-notes">
          <p>
            <strong>Note:</strong> To get a PDF, open the SVG which you can print as a PDF from your browser.
          </p>
        </div>
      </>
    );
  }
}

export default withRouter(ExportModal);
