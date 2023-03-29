#version 300 es

/*
    Palto Studio
    Developed by Noah Bussinger
    2023
*/

precision highp float;

#include fragmentVariables
#include fragmentMethods

void main() {
    #include fragmentPre

    specularIntensity = 1.0;
    alpha = 0.75;

    #include fragmentPost
}
