import * as React from 'react';
import { Book, Code, Image, Map } from 'react-feather';
import { withRouter } from 'react-router-dom';
import { mergeDeep } from 'vega-lite/build/src/util';
import { mapStateToProps } from '.';
import './index.css';

type Props = ReturnType<typeof mapStateToProps>;

interface State {
  downloadVegaJSON: boolean;
  includeConfig: boolean;
}

class ExportModal extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      downloadVegaJSON: false,
      includeConfig: true,
    };
  }

  public async downloadViz(ext: string) {
    const url = await this.props.view.toImageURL(ext);
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

  public updateIncludeConfig(e) {
    this.setState({
      includeConfig: e.target.checked,
    });
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
    let content = this.state.downloadVegaJSON ? this.props.vegaSpec : this.props.vegaLiteSpec;
    const filename = this.state.downloadVegaJSON ? `visualization.vg.json` : `visualization.vl.json`;

    if (this.state.includeConfig && this.props.config) {
      content = { ...content };
      content.config = mergeDeep({}, this.props.config, content.config);
    }

    const blob = new Blob([JSON.stringify(content, null, 2)], {
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
    this.setState({ downloadVegaJSON: event.currentTarget.value === 'vega' });
  }

  public render() {
    return (
      <div className="export-content">
        <h2>Export</h2>
        <div className="export-buttons">
          <button className="export-button" onClick={() => this.downloadViz('png')}>
            <div className="header-text">
              <Image />
              <span>Download PNG</span>
            </div>
            <p>
              PNG is a bitmap image format which is made up of a fixed number of pixels. They have a fixed resolution
              and cannot be scaled.
            </p>
          </button>
          <button className="export-button" onClick={() => this.downloadViz('svg')}>
            <div className="header-text">
              <Map />
              <span>Download SVG</span>
            </div>
            <p>
              SVG is a vector image format which uses geometric forms to represent different parts as discrete objects
              and are infinitely scalable.
            </p>
          </button>
          <button className="export-button" onClick={() => this.openViz('svg')}>
            <div className="header-text">
              <Map />
              <span>Open SVG</span>
            </div>
            <p>Open the SVG in your browser instead of downloading it.</p>
          </button>
          <button className="export-button" onClick={() => this.downloadPDF()} ref="downloadPDF">
            <div className="header-text">
              <Book />
              <span>Download PDF</span>
            </div>
            <p>
              <strong>Experimental!</strong>
              <br /> PDF is a vector format usually used for documents. This might take a few seconds. Please be
              patient. Your chart is sent to an <a href="https://cloudconvert.com/">external service</a> for processing.
            </p>
          </button>
          <button className="export-button" onClick={e => this.downloadJSON(e)}>
            <div className="header-text">
              <Code />
              <span>Download JSON</span>
            </div>
            <p>JSON is a lightweight data-interchange format.</p>
            <div className="input-container">
              Type:
              <label>
                <input
                  type="radio"
                  name="json-type"
                  id="json-type[vega]"
                  value="vega"
                  checked={this.state.downloadVegaJSON}
                  onChange={this.updateDownloadJSONType.bind(this)}
                />{' '}
                Vega
              </label>
              <label htmlFor="json-type[vega-lite]">
                <input
                  type="radio"
                  name="json-type"
                  id="json-type[vega-lite]"
                  value="vega-lite"
                  checked={!this.state.downloadVegaJSON}
                  onChange={this.updateDownloadJSONType.bind(this)}
                />
                Vega Lite
              </label>
            </div>
            <div className="input-container">
              <label>
                Include config:
                <input
                  type="checkbox"
                  name="config-include"
                  id="config-include"
                  value="config-select"
                  checked={this.state.includeConfig}
                  onChange={this.updateIncludeConfig.bind(this)}
                />
              </label>
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
  }
}

export default withRouter(ExportModal);
