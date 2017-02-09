import React from 'react';
import ReactDOM from 'react-dom';
import Portal from 'react-portal';
//import Menu, {SubMenu, MenuItem, ItemGroup} from 'rc-menu';
import { SPECS } from '../../constants';
import 'rc-menu/assets/index.css';
import './index.css';

var req = require.context('../../../spec', true, /^(.*\.(json$))[^.]*$/igm);
req.keys().forEach(req);

const formatExampleName = (name) => {
  return name.split('_').map(i => i[0].toUpperCase() + i.substring(1)).join(' ');
}

export default class Header extends React.Component {
  // static propTypes = {
  //   updateVegaSpec: React.PropTypes.function
  // }
  constructor(props) {
    super(props);
    this.state = {
      showVega: true, // true: showVega example, false: showVegalite
    };
    this.onSelectVega = this.onSelectVega.bind(this);
  }

  onSelectVega (name) {
    const spec = require(`../../../spec/vega/${name}.vg.json`);
    this.props.updateVegaSpec(name, JSON.stringify(spec, null, 2));
  }

  onSelectVegaLite (name) {
    const spec = require(`../../../spec/vega-lite/${name}.vl.json`);
    this.props.updateVegaLiteSpec(name, JSON.stringify(spec, null, 2));
  }

  onSelect (e) {
    var key = e.target.value;
    if (key.startsWith('vega-lite-')) {
      this.onSelectVegaLite(key.substr(10));
    } else if (key.startsWith('vega-')) {
      this.onSelectVega(key.substr(5));
    } else if (key === 'custom-vega') {
      this.props.updateVegaSpec('{}');
    } else if (key === 'custom-vega-lite') {
      this.props.updateVegaLiteSpec('{}');
    }
    this.setState({
      isOpened: false
    });
  }

  render () {
    const button = (
      <button className='exampleButton'
        onClick={(e) => {
          const bodyRect = document.body.getBoundingClientRect();
          this.setState({
            isOpened: true
          });
          console.log(this.state);
        }}
      >
        {'Examples'}
      </button>
    );

    const vega = (
      <div className="vega">
        <p>Vega Examples</p>
        {
            Object.keys(SPECS.Vega).map((specType) => {
              const specs = SPECS.Vega[specType];
              return (
                <div className='itemGroup' value={`vega-${specType}`}>
                  <div className='specType'>{specType}</div>
                  <div className='items'>
                    {
                      specs.map((spec) => {
                        return (
                          <button className='item' value={`vega-${spec.name}`} onClick={this.onSelect.bind(this)}>{formatExampleName(spec.name)}</button>
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
        <p>Vega-Lite Examples</p>
        {
          Object.keys(SPECS.VegaLite).map((specType) => {
            const specs = SPECS.VegaLite[specType];
            return (
              <div className='itemGroup' value={`vega-${specType}`}>
                <div className='specType'>{specType}</div>
                <div className='items'>
                  {
                    specs.map((spec) => {
                      return (
                        <button className='item' value={`vega-lite-${spec.name}`} onClick={this.onSelect.bind(this)}>{spec.title}</button>
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
        <img height={57} alt="IDL Logo" src="https://vega.github.io/images/idl-logo.png" /> 
        {button}
        <Portal className='portal'
          closeOnOutsideClick
          isOpened={this.state.isOpened}
          onClose={() => { this.setState({ isOpened: false });}}
        >
          <div className='modal-background'>
            <div className='modal'>
              <div className='button-groups'>
                <button onClick={() => { this.setState({ showVega: true });}}>{'Vega'}</button>
                <button onClick={() => { this.setState({ showVega: false });}}>{'Vega Lite'}</button>
              </div>

              <button className='close-button' onClick={() => { this.setState({ isOpened: false });}}>X</button>
              { this.state.showVega ? vega : vegalite }
            </div>
          </div>
        </Portal>
      </div>
    );
  };
};



// render () {
//     return (
//       <div className='header'> 
//         <img height={57} alt="IDL Logo" src="https://vega.github.io/images/idl-logo.png" />
//         <Menu onSelect={this.onSelect.bind(this)} mode="horizontal" defaultActiveFirst={true}>
//           <SubMenu title="Vega Examples">
//             {
//               Object.keys(SPECS.Vega).map((specType) => {
//                 const specs = SPECS.Vega[specType];
//                 return (
//                   <ItemGroup key={`vega-${specType}`} title={specType}>
//                     {
//                       specs.map((spec) => {
//                         return (
//                           <MenuItem key={`vega-${spec.name}`}>{formatExampleName(spec.name)}</MenuItem>
//                         )
//                       })
//                     }
//                   </ItemGroup>
//                 );
//               })
//             }
//           </SubMenu>
//           <SubMenu title="Vega-Lite Examples" >
//             {
//               Object.keys(SPECS.VegaLite).map((specType) => {
//                 const specs = SPECS.VegaLite[specType];
//                 return (
//                   <ItemGroup key={`vega-${specType}`} title={specType}>
//                   {
//                     specs.map((spec) => {
//                       return (
//                         <MenuItem key={`vega-lite-${spec.name}`}>{spec.title}</MenuItem>
//                       )
//                     })
//                   }
//                   </ItemGroup>
//                 )
//               })
//             }
//           </SubMenu>
//           <SubMenu title="Custom">
//             <MenuItem key={`custom-vega`}>{'Vega'}</MenuItem>
//             <MenuItem key={`custom-vega-lite`}>{'Vega-Lite'}</MenuItem>
//           </SubMenu>
//         </Menu>
//       </div>
//     );
//   };
