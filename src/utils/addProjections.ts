import * as d3 from 'd3-geo-projection';

export default function(vegaProjections: any) {
  for (const p of [
    'airy',
    'aitoff',
    'armadillo',
    'august',
    'baker',
    'berghaus',
    'bertin1953',
    'boggs',
    'bonne',
    'bottomley',
    'bromley',
    'chamberlinAfrica',
    'collignon',
    'craig',
    'craster',
    'cylindricalEqualArea',
    'cylindricalStereographic',
    'eckert1',
    'eckert2',
    'eckert3',
    'eckert4',
    'eckert5',
    'eckert6',
    'eisenlohr',
    'fahey',
    'foucaut',
    'foucautSinusoidal',
    'gilbert',
    'gingery',
    'ginzburg4',
    'ginzburg5',
    'ginzburg6',
    'ginzburg8',
    'ginzburg9',
    'gringorten',
    'guyou',
    'hammer',
    'hammerRetroazimuthal',
    'healpix',
    'hill',
    'homolosine',
    'hufnagel',
    'hyperElliptical',
    'interruptedBoggs',
    'interruptedHomolosine',
    'interruptedMollweide',
    'interruptedMollweideHemispheres',
    'interruptedSinuMollweide',
    'interruptedSinusoidal',
    'interruptedQuarticAuthalic',
    'kavrayskiy7',
    'lagrange',
    'larrivee',
    'laskowski',
    'littrow',
    'loximuthal',
    'miller',
    'modifiedStereographicAlaska',
    'modifiedStereographicGs48',
    'modifiedStereographicGs50',
    'modifiedStereographicMiller',
    'modifiedStereographicLee',
    // 'mollweide', // included in vega-projection
    'mtFlatPolarParabolic',
    'mtFlatPolarQuartic',
    'mtFlatPolarSinusoidal',
    'naturalEarth2',
    'nellHammer',
    'nicolosi',
    'patterson',
    'polyconic',
    'polyhedralButterfly',
    'polyhedralCollignon',
    'polyhedralWaterman',
    'gringortenQuincuncial',
    'peirceQuincuncial',
    'rectangularPolyconic',
    'robinson',
    'satellite',
    'sinuMollweide',
    'sinusoidal',
    'times',
    'twoPointAzimuthalUsa',
    'twoPointEquidistantUsa',
    'vanDerGrinten',
    'vanDerGrinten2',
    'vanDerGrinten3',
    'vanDerGrinten4',
    'wagner',
    'wagner4',
    'wagner6',
    'wagner7',
    'wiechel',
    'winkel3'
  ]) {
    vegaProjections(p, d3['geo' + p[0].toUpperCase() + p.slice(1)]);
  }
}
