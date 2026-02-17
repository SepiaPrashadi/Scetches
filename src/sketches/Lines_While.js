let distance = 8;//base distance between lines in a row
let lineLength = 800/5;
let distanceRatio = 1.2;//ratio of distance between lines
let spaceVertical = lineLength;
let linethickness = 400;

function setup() {
    createCanvas(windowWidth, 800);
    strokeCap(SQUARE);
    colorMode (HSB);//Hue/saturation/brightness

}

function draw() {

    let c = color (distance,91,29);
    background (c);


    stroke(distance,80,120);
    let x=distance-32; y=0; spacing = distance; length = lineLength; ratio = distanceRatio;
    while (x<width){
        strokeWeight(linethickness/spacing);
        line(x, y, x, y+length);
        spacing = spacing*ratio;
        x = x+spacing*8;
    }

    let x1=distance-24; y1=spaceVertical; spacing1 = distance; length1 = lineLength; ratio1 = distanceRatio;
    while (x1<width){
        strokeWeight(linethickness/spacing1);
        line(x1, y1, x1, y1+length1);
        spacing1 = spacing1*ratio1;
        x1 = x1+spacing1*5;
    }

    let x2=distance+12; y2=spaceVertical*2; spacing2 = distance; length2 = lineLength; ratio2 = distanceRatio;
    while (x2<width){
        strokeWeight(linethickness/spacing2);
        line(x2, y2, x2, y2+length2);
        spacing2 = spacing2*ratio2;
        x2 = x2+spacing2*3;
    }
    let x3=distance; y3=spaceVertical*3; spacing_3 = distance; length_3 = lineLength; ratio_3 = distanceRatio;
    while (x3<width){
        strokeWeight(linethickness/spacing_3);
        line(x3, y3, x3, y3+length2);
        spacing_3 = spacing_3*ratio_3;
        x3 = x3+spacing_3*2;
    }

    let x4=distance-12; y4=spaceVertical*4; spacing_4 = distance; length_4 = lineLength; ratio_4 = distanceRatio;
    while (x4<width){
        strokeWeight(linethickness/spacing_4);
        line(x4, y4, x4, y4+length2);
        spacing_4 = spacing_4*ratio_4;
        x4 = x4+spacing_4;
    }




}

function mouseClicked(){
    if (distance<228) {
        distance = distance+32;
    }
    else {
        distance = 8;
    }
}