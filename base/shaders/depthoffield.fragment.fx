#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;

#define MAX_BLUR 16.0

//uniforms
uniform float focusDistance;
uniform float blurCoefficient;
uniform float PPM;
uniform vec2 depthRange;
uniform vec2 resolution;

uniform vec2 texelOffset;

uniform sampler2D color;
uniform sampler2D depth;

out vec4 fragColor;

void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    ivec2 resolution = ivec2(resolution) - 1;

    // Convert to linear depth
    float ndc = 2.0 * texelFetch(depth, fragCoord, 0).r - 1.0;
    float depth = -(2.0 * depthRange.y * depthRange.x) / (ndc * (depthRange.y - depthRange.x) - depthRange.y - depthRange.x);
    float deltaDepth = abs(focusDistance - depth);

    // Blur more quickly in the foreground.
    float xdd = depth < focusDistance ? abs(focusDistance - deltaDepth) : abs(focusDistance + deltaDepth);
    float blurRadius = min(floor(blurCoefficient * (deltaDepth / xdd) * PPM), MAX_BLUR);

    vec4 finalColor = vec4(0.0);
    if (blurRadius > 1.0) {
        float halfBlur = blurRadius * 0.5;
        float count = 0.0;
        for (float i = 0.0; i <= MAX_BLUR; ++i) {
            if (i > blurRadius) {
                break;
            }
            // texelFetch outside texture gives vec4(0.0) (undefined in ES 3)
            ivec2 sampleCoord = clamp(fragCoord + ivec2(((i - halfBlur) * texelOffset)), ivec2(0), resolution);
            finalColor += texelFetch(color, sampleCoord, 0);
            ++count;
        }
        finalColor /= count;
    } else {
        finalColor = texelFetch(color, fragCoord, 0);
    }

    fragColor = finalColor;
}
