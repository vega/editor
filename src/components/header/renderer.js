import React from 'react';
import Portal from 'react-portal';
import { MODES, SPECS } from '../../constants';
import './index.css';

var req = require.context('../../../spec', true, /^(.*\.(json$))[^.]*$/igm);
req.keys().forEach(req);

const formatExampleName = (name) => {
  return name.split('_').map(i => i[0].toUpperCase() + i.substring(1)).join(' ');
}

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showVega: props.mode === MODES.Vega
    };
    this.onSelectVega = this.onSelectVega.bind(this);
  }

  onSelectVega (name) {
    const spec = require(`../../../spec/vega/${name}.vg.json`);
    this.props.updateVegaSpec(name, JSON.stringify(spec, null, 2));
    this.setState({
      isOpened: false
    });
  }

  onSelectVegaLite (name) {
    const spec = require(`../../../spec/vega-lite/${name}.vl.json`);
    this.props.updateVegaLiteSpec(name, JSON.stringify(spec, null, 2));
    this.setState({
      isOpened: false
    });
  }

  render () {
    const button = (
      <div className='button'
        onClick={(e) => {
          this.setState({
            isOpened: true
          });
        }}
      >
        {'Examples'}
      </div>
    );

    const vega = (
      <div className="vega">
        {
            Object.keys(SPECS.Vega).map((specType) => {
              const specs = SPECS.Vega[specType];
              return (
                <div className='itemGroup'>
                  <div className='specType'>{specType}</div>
                  <div className='items'>
                    {
                      specs.map((spec) => {
                        return (
                          <div onClick={() => this.onSelectVega(spec.name)} className='item'>
                            <div style={{backgroundImage: `url(images/examples/vega/${spec.name}.vg.png)` }} className='img' />
                            <div className='name'>{formatExampleName(spec.name)}</div>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              );
            })
        }
      </div>
    );

    const vegalite = (
      <div className="vega-Lite">
        {
          Object.keys(SPECS.VegaLite).map((specType) => {
            const specs = SPECS.VegaLite[specType];
            return (
              <div className='itemGroup'>
                <div className='specType'>{specType}</div>
                <div className='items'>
                  {
                    specs.map((spec) => {
                      return (
                        <div onClick={() => this.onSelectVegaLite(spec.name)} className='item'>
                          <div style={{backgroundImage: `url(images/examples/vl/${spec.name}.vl.png)` }} className='img' />
                          <div className='name'>{spec.title}</div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            );
          })
        }
      </div>
    );

    return (
      <div className='header'>
        <img height={37} style={{margin: 10}} alt="IDL Logo" src="https://vega.github.io/images/idl-logo.png" />
        {button}
        <Portal className='portal'
          closeOnOutsideClick={true}
          isOpened={this.state.isOpened}
          onClose={() => { this.setState({ isOpened: false });}}
        >
          <div className='modal-background'>
            <div className='modal-header'>
              <div className='button-groups'>
                <button className={this.state.showVega ? 'selected' : ''} onClick={() => { this.setState({ showVega: true });}}>{'Vega'}</button>
                <button className={this.state.showVega ? '' : 'selected'} onClick={() => { this.setState({ showVega: false });}}>{'Vega Lite'}</button>
              </div>

              <button className='close-button' onClick={() => { this.setState({ isOpened: false });}}>✖</button>
            </div>
            <div className='modal-area'>
              <div className='modal'>
                { this.state.showVega ? vega : vegalite }
              </div>
            </div>
          </div>
        </Portal>
      </div>
    );
  };
};
