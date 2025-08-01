import * as React from 'react';
import {Routes, Route} from 'react-router';

import App from './app.js';
import Reset from './reset.js';

export default function AppShell() {
  return (
    <>
      <Routes>
        <Route path="/" element={<App showExample={false} />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/edited" element={<App showExample={false} />} />
        <Route path="/gist/:id/:filename" element={<App showExample={false} />} />
        <Route path="/gist/:id/:filename/view" element={<App showExample={false} />} />
        <Route path="/gist/:id/:revision/:filename" element={<App showExample={false} />} />
        <Route path="/examples/:mode/:example_name" element={<App showExample={false} />} />
        <Route path="/examples/:mode/:example_name/view" element={<App showExample={false} />} />
        <Route path="/examples/:mode" element={<App showExample={true} />} />
        <Route path="/examples" element={<App showExample={true} />} />
        <Route path="/custom/:mode" element={<App showExample={false} />} />
        <Route path="/url/:mode/:compressed/*" element={<App showExample={false} />} />
      </Routes>
    </>
  );
}
