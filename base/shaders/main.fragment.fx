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
    #include fragmentShade
    #include fragmentPost
}
