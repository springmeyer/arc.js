from PIL import Image
import math

# http://stackoverflow.com/questions/3515909/question-about-the-implementation-of-bezier-curves

#   draws a single point on our image
def drawPoint( img, loc, size=5, color=(0,0,0) ):
    px = img.load()
    for x in range(size):
        for y in range(size):
            xloc = loc[0] + x - size/2
            yloc = loc[1] + y - size/2
            px[ xloc, yloc ] = color


#   draws a simple bezier curve with 4 points
def drawCurve( img, points ):

    steps = 20
    for i in range(steps):

        t = i / float(steps)

        xloc = math.pow(1-t,3) * points[0][0] \
             + 3*t*math.pow(1-t,2) * points[1][0] \
             + 3*(1-t)*math.pow(t,2) * points[2][0] \
             + math.pow(t,3) * points[3][0]
        yloc = math.pow(1-t,3) * points[0][1] \
             + 3*t*math.pow(1-t,2) * points[1][1] \
             + 3*(1-t)*math.pow(t,2) * points[2][1] \
             + math.pow(t,3) * points[3][1]

        drawPoint( img, (xloc,yloc), size=2 )


#   draws a bezier curve with any number of points
def drawBezier( img, points ):

    for i in range(0,len(points),3):
        if( i+4 < len(points) ):
            drawCurve( img, points[i:i+4] )


#   draws a smooth bezier curve by adding points that
#   force smoothness
def drawSmoothBezier( img, points ):

    newpoints = []

    for i in range(len(points)):

        # add the next point (and draw it)
        newpoints.append(points[i])
        drawPoint( img, points[i], color=(255,0,0) )

        if( i % 2 == 0 and i>0 and i+1<len(points) ):

            # calculate the midpoint
            xloc = (points[i][0] + points[i+1][0]) / 2.0
            yloc = (points[i][1] + points[i+1][1]) / 2.0

            # add the new point (and draw it)
            newpoints.append( (xloc, yloc) )
            drawPoint( img, (xloc, yloc), color=(0,255,0) )

    drawBezier( img, newpoints )



#   Create the image
myImage = Image.new("RGB",(627,271),(255,255,255))

#   Create the points
points = [  (54,172),
            (121,60),
            (220,204),
            (284,56),
            (376,159),
            (444,40),
            (515,228),
            (595,72) ]

#   Draw the curve
drawSmoothBezier( myImage, points )

#   Save the image
myImage.save("myfile.png","PNG")
