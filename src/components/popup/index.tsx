import * as React from 'react';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import Tippy, {TippyProps} from '@tippyjs/react';

export function Popup(props: TippyProps) {
  return <Tippy theme="light-border" {...props} />;
}
