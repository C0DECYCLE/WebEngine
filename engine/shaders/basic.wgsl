/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

struct VertexUniforms {
    modelViewProjectionMatrix : mat4x4<f32>,
}

@binding(0) @group(0) var<uniform> vertexUniforms : VertexUniforms;

struct VertexInput {
    @location(0) position: vec4<f32>,
    @location(1) uv : vec2<f32>
};

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>,
}

@vertex
fn vertexMain(v: VertexInput) -> VertexOutput {
    var output : VertexOutput;
    output.Position = VertexUniforms.modelViewProjectionMatrix * v.position;
    output.fragUV = v.uv;
    output.fragPosition = 0.5 * (v.position + vec4(1.0, 1.0, 1.0, 1.0));
    return output;
}

@fragment
fn fragmentMain(v: VertexOutput) -> @location(0) vec4<f32> {
    return v.fragPosition;
}