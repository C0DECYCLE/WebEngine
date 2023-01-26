/*
    Palto Studio
    Developed by Noah Bussinger
    2022
*/

float mod289( float x ) { return x - floor( x * (1.0 / 289.0) ) * 289.0; }
vec4 mod289( vec4 x ) { return x - floor( x * (1.0 / 289.0) ) * 289.0; }
vec4 perm( vec4 x ) { return mod289( ((x * 34.0) + 1.0) * x ); }

float noise( vec3 p ){ //sync with JS version in PlanetShared
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);
    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);
    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);
    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));
    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float roundf( float x, float a ) {
    x *= a;
    float d = floor( x );
    if ( x - d < 0.5 ) {
        return d / a;
    } else {
        return ( d + 1.0 ) / a;
    }
}

vec3 rotateX( vec3 v, float angle ) {
    return mat3( 1.0, 0.0, 0.0, 0.0, cos(angle), sin(angle), 0.0, -sin(angle), cos(angle) ) * v;
}

vec3 rotateY( vec3 v, float angle ) {
    return mat3( cos(angle), 0.0, -sin(angle), 0.0, 1.0, 0.0, sin(angle), 0.0, cos(angle) ) * v;
}

vec3 rotateZ( vec3 v, float angle ) {
    return mat3( cos(angle), sin(angle), 0.0, -sin(angle), cos(angle), 0.0, 0.0, 0.0, 1.0 ) * v;
}

vec3 rotate( vec3 target, vec3 angles ) {
    return rotateZ( rotateY( rotateX( target, angles.x ), angles.y ), angles.z );
}

float raySphereIntersect( vec3 rayOrigin, vec3 rayDirection, vec3 sphereCenter, float sphereRadius ) {
    float a = dot(rayDirection, rayDirection);
    vec3 s0_r0 = rayOrigin - sphereCenter;
    float b = 2.0 * dot(rayDirection, s0_r0);
    float c = dot(s0_r0, s0_r0) - (sphereRadius * sphereRadius);
    if (b*b - 4.0*a*c < 0.0) { // No intersect
        return -1.0;
    }
    float t0 = (-b + sqrt((b*b) - 4.0*a*c))/(2.0*a);
    float t1 = (-b - sqrt((b*b) - 4.0*a*c))/(2.0*a);
    if (t0 > t1) { 
        float swap = t0;
        t0 = t1;
        t1 = swap;
    }
    if (t0 < 0.0) { 
        t0 = t1;
        if (t0 < 0.0) { // No intersect
            return -1.0;
        }
    } 
    // Intersect
    return t0; //t0 first intersection and t1 second (ray = origin + direction * t)
}