//https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83

function _mod289Float( x ) { return x - Math.floor( x * (1.0 / 289.0) ) * 289.0; };
function _mod289Vec4( vec4 ) { return [ _mod289Float(vec4[0]), _mod289Float(vec4[1]), _mod289Float(vec4[2]), _mod289Float(vec4[3]) ]; };
function _perm( vec4 ) { return _mod289Vec4( [ ((vec4[0] * 34.0) + 1.0) * vec4[0], ((vec4[1] * 34.0) + 1.0) * vec4[1], ((vec4[2] * 34.0) + 1.0) * vec4[2], ((vec4[3] * 34.0) + 1.0) * vec4[3]] ); };
function _fractFloat( x ) { return x - Math.floor( x ); };
function _fractVec4( vec4 ) { return [ _fractFloat(vec4[0]), _fractFloat(vec4[1]), _fractFloat(vec4[2]), _fractFloat(vec4[3]) ]; };

function genericNoise3d( x, y, z ) {
    let p = [ x, y, z ];

    let a = [ Math.floor(p[0]), Math.floor(p[1]), Math.floor(p[2]) ];
    let d = [ p[0] - a[0], p[1] - a[1], p[2] - a[2] ];
    d = [ d[0] * d[0] * (3.0 - 2.0 * d[0]), d[1] * d[1] * (3.0 - 2.0 * d[1]), d[2] * d[2] * (3.0 - 2.0 * d[2]) ];

    let b = [ a[0] + 0.0, a[0] + 1.0, a[1] + 0.0, a[1] + 1.0 ];
    let k1 = _perm( [ b[0], b[1], b[0], b[1] ] );
    let k2 = _perm( [ k1[0] + b[2], k1[1] + b[2], k1[0] + b[3], k1[1] + b[3] ] );

    let c = [ k2[0] + a[2], k2[1] + a[2], k2[2] + a[2], k2[3] + a[2] ];
    let k3 = _perm( c );
    let k4 = _perm( [ c[0] + 1.0, c[1] + 1.0, c[2] + 1.0, c[3] + 1.0 ] );

    let o1 = _fractVec4( [ k3[0] * (1.0 / 41.0), k3[1] * (1.0 / 41.0), k3[2] * (1.0 / 41.0), k3[3] * (1.0 / 41.0) ] );
    let o2 = _fractVec4( [ k4[0] * (1.0 / 41.0), k4[1] * (1.0 / 41.0), k4[2] * (1.0 / 41.0), k4[3] * (1.0 / 41.0) ] );

    let o3 = [ o2[0] * d[2] + o1[0] * (1.0 - d[2]), o2[1] * d[2] + o1[1] * (1.0 - d[2]), o2[2] * d[2] + o1[2] * (1.0 - d[2]), o2[3] * d[2] + o1[3] * (1.0 - d[2]) ];
    let o4 = [ o3[1] * d[0] + o3[0] * (1.0 - d[0]), o3[3] * d[0] + o3[2] * (1.0 - d[0]) ];

    return o4[1] * d[1] + o4[0] * (1.0 - d[1]);
}