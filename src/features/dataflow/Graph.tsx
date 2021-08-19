import * as React from 'react';

export function Graph() {
  const cytoscape = React.useMemo(() => <div />, []);
  return (
    <div className="graph">
      <Overlay />
      {cytoscape}
    </div>
  );
}

function Overlay() {
  //   const dataflowLoading = useAppSelector((state) => state.dataflowLoading);
  const dataflowLoading = true;
  return <div className={dataflowLoading ? 'overlay' : 'display-none'}>Laying out graph...</div>;
}
