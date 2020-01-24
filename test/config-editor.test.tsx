import React from 'react';
import renderer from 'react-test-renderer';
import ConfigEditor from '../src/components/config-editor';

test('config editor', () => {
  const tree = renderer.create(<ConfigEditor />).toJSON();
  expect(tree).toMatchSnapshot();
});
