import * as React from 'react';
import { PortalWithState } from 'react-portal';
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import * as vega from 'vega';
import vegaTooltip from 'vega-tooltip';
import { Mode } from '../../constants';
import addProjections from '../../utils/addProjections';

import './index.css';

// Add additional projections
addProjections(vega.projection);

interface Props {
  vegaSpec?: object;
  vegaLiteSpec?: object;
  renderer?: string;
  mode?: Mode;
  export?: boolean;
  baseURL?: string;
  history?: any;
}

interface State {
  imageURL: string;
  fullscreen: boolean;
}

class Editor extends React.Component<Props, State> {
  public static view: vega.View;
  public static chart: any;

  constructor(props) {
    super(props);
    this.state = {
      fullscreen: false,
      imageURL: '',
    };
  }

  public initilizeView(props) {
    Editor.chart = this.refs.chart as any;
    Editor.chart.style.width = Editor.chart.getBoundingClientRect().width + 'px';

    const runtime = vega.parse(props.vegaSpec);

    const loader = vega.loader();
    const originalLoad = loader.load.bind(loader);
    // Custom Loader
    loader.load = async (url, options) => {
      try {
        if (options) {
          return await originalLoad(url, { ...options, ...{ baseURL: this.props.baseURL } });
        }
        return await originalLoad(url, { baseURL: this.props.baseURL });
      } catch {
        return await originalLoad(url, options);
      }
    };

    Editor.view = new vega.View(runtime, {
      loader,
      logLevel: vega.Warn,
    }).initialize(Editor.chart);
  }
  public renderVega(props) {
    Editor.view
      .renderer(props.renderer)
      .hover()
      .run();
    Editor.chart.style.width = 'auto';

    vegaTooltip(Editor.view as any); // FIXME: remove as any

    if (props.export) {
      const ext = props.renderer === 'canvas' ? 'png' : 'svg';
      if (ext === 'png') {
        const link = document.createElement('a');
        link.setAttribute('href', this.state.imageURL);
        link.setAttribute('target', '_blank');
        link.setAttribute('download', 'export.' + ext);
        link.dispatchEvent(new MouseEvent('click'));
      } else {
        const tab = window.open();
        tab.document.write('<img src="' + this.state.imageURL + '"/>');
      }
    }
    (window as any).VEGA_DEBUG.view = Editor.view;
  }
  public updateImageURL(props) {
    Editor.view
      .toImageURL(props.renderer === 'canvas' ? 'png' : 'svg')
      .then(href => {
        this.setState({
          imageURL: href,
        });
      })
      .catch(err => {
        throw new Error('Error in generating image URL: ' + err);
      });
  }
  public componentDidMount() {
    this.initilizeView(this.props);
    this.renderVega(this.props);
    this.updateImageURL(this.props);

    // Enter fullscreen mode if url ends with /view
    const params = window.location.hash.split('#')[1].split('/');
    params[params.length - 1] === 'view' ? this.setState({ fullscreen: true }) : this.setState({ fullscreen: false });
  }
  public componentDidUpdate(prevProps) {
    if (
      prevProps.vegaSpec !== this.props.vegaSpec ||
      prevProps.vegaLiteSpec !== this.props.vegaLiteSpec ||
      prevProps.baseURL !== this.props.baseURL
    ) {
      this.initilizeView(this.props);
      this.updateImageURL(this.props);
    }
    if (prevProps.renderer !== this.props.renderer) {
      this.updateImageURL(this.props);
    }
    this.renderVega(this.props);

    // Open/Close fullscreen portal
    const portal = this.refs.portal as any;
    this.state.fullscreen ? portal.openPortal() : portal.closePortal();
  }
  public render() {
    // Parsing pathname from URL
    let pathname = window.location.hash.split('#')[1];
    return (
      <div>
        <div className="chart">
          <div ref="chart" />
        </div>
        <PortalWithState closeOnEsc ref="portal">
          {({ openPortal, closePortal, isOpen, portal }) => (
            <React.Fragment>
              <img
                data-tip="Fullscreen"
                className="fullscreen-open"
                onClick={() => {
                  this.setState({ fullscreen: true });
                  if (pathname !== '/' && pathname !== '/edited') {
                    this.props.history.push(pathname + '/view');
                  }
                }}
                src="images/fullscreen.svg"
              />
              {portal(
                <div className="fullscreen-chart">
                  <img
                    className="fullscreen-close"
                    onClick={() => {
                      this.setState({ fullscreen: false });
                      pathname = pathname
                        .split('/')
                        .filter(e => e !== 'view')
                        .join('/');
                      if (pathname !== '/' && pathname !== '/edited') {
                        this.props.history.push(pathname, 'view');
                      }
                    }}
                    src="images/close.svg"
                  />
                  <img src={this.state.imageURL} />
                </div>
              )}
            </React.Fragment>
          )}
        </PortalWithState>
        <ReactTooltip place="left" type="dark" effect="solid" />
      </div>
    );
  }
}
export default withRouter(Editor);
