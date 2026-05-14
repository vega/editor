import React from 'react';
import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';

import ReactPaginateModuleDataViewer from 'react-paginate';

function unwrap(mod: any) {
  return mod?.default ?? mod;
}

describe('react-paginate default import unwrapping (issue #1591)', () => {
  it('resolves to a renderable React component', () => {
    const ReactPaginate = unwrap(ReactPaginateModuleDataViewer);
    const isValidComponent =
      typeof ReactPaginate === 'function' ||
      (ReactPaginate && typeof ReactPaginate === 'object' && '$$typeof' in ReactPaginate);
    expect(isValidComponent).toBe(true);
  });

  it('renders pagination markup without crashing', () => {
    const ReactPaginate = unwrap(ReactPaginateModuleDataViewer);
    const {container} = render(
      <ReactPaginate
        previousLabel="<"
        nextLabel=">"
        pageCount={5}
        marginPagesDisplayed={1}
        pageRangeDisplayed={3}
        onPageChange={() => {}}
        containerClassName="pagination"
        activeClassName="active"
      />,
    );
    expect(container.querySelector('.pagination')).toBeInTheDocument();
  });
});
