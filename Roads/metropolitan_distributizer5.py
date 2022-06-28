from PIL import Image
from random import randint, random
# I am putting a few globals here
BLACK = (0,0,0)
LIGHTGREEN = (200,255,200)
"""This program is a mess currently and I need to spend
awhile cleaning up the code. 

I could also spend a while attempting to make it more pretty,
but I would say often this does generate a road network I could
use, and is therefore adequate.

Known bugs:
The program still draws multiple third roads on the same
point.
"""
def main():
    try:
        roads = load_file()
        pixels = roads.load()
    except:
        return "Incorrect file name!"
    WIDTH, HEIGHT = roads.size

    road_points = draw_main_road(WIDTH,HEIGHT,pixels)
    num_roads = randint(4,10)
    secondary_roads = draw_second_roads(WIDTH,HEIGHT,road_points,pixels, num_roads = num_roads)
    connecting_roads = draw_connecting_roads(road_points, secondary_roads, WIDTH, HEIGHT, pixels)
    draw_third_roads(secondary_roads,WIDTH,HEIGHT,pixels,10, connecting_roads)


    roads.show()
    return "Successful!"

def abs(value:float):
    """Returns the absolute value of the input."""
    if value < 0:
        value *= -1
    return value
    
def draw_main_road(WIDTH:int, HEIGHT:int, pixels):
    """Draws the main road.
    """
    BUFFER = 20
    direction = get_direction()
    starting_parameters = get_starting_parameters_for_main_road(WIDTH,HEIGHT,BUFFER,direction)
    #starting_parameters = [start_x, start_y, alignment]
    pos_x = starting_parameters[0]
    pos_y = starting_parameters[1]

    road_points = draw_any_road_point(pos_x,pos_y,direction[0],direction[1],10,pixels,WIDTH,HEIGHT,starting_parameters[2],mode = "until border", BUFFER=20)
    return road_points

def draw_second_roads(WIDTH, HEIGHT, road_points, pixels, num_roads = 6):
    """Draw secondary roads perpendicular to the main one.
    The secondary_roads list is in the format of:
    [[index of branch off main, reverse_y, dir_x, dir_y, list of points[]],[..., ...[]],[..., ...[]]]
    [[index, reverse_y, dir_y, dir_x,[[pos_x, pos_y, dir_x, dir_y], [pos_x, pos_y, dir_x, dir_y], ...]], ...]
    """
    BUFFER = 3+int(0.2*len(road_points))
    ROAD_LENGTH = 7
    secondary_roads = []

    for i in range(num_roads):
        # road_points = [[pos_x, pos_y, dir_x, dir_y],[pos_x, pos_y, dir_x, dir_y],...]
        secondary_road = get_second_road(secondary_roads,road_points,BUFFER)
        road_to_append = secondary_road
        pos_x = road_points[secondary_road[0]][0]
        pos_y = road_points[secondary_road[0]][1]
        next_x = pos_x+secondary_road[2]
        next_y = pos_y+secondary_road[3]
        alignment = get_alignment(pos_x,next_x,pos_y,next_y)

        secondary_road_points = draw_any_road_point(pos_x, pos_y, secondary_road[2], secondary_road[3], 10, pixels, WIDTH, HEIGHT, alignment, repetitions=ROAD_LENGTH)
        road_to_append.append(secondary_road_points)
        secondary_roads.append(road_to_append)
    return secondary_roads

def draw_any_road_point(pos_x, pos_y, direction_x, direction_y, line_width, 
pixels, WIDTH, HEIGHT, alignment, mode = "repeat n times", repetitions = 1, BUFFER = 10, randomness = 1):
    """This will draw a road. The default mode, 'repeat n times' will make the road be of length
    n times the x and y directions. Larger N's with smaller directions will result in the
    road winding more. BUFFER only matters for mode 'until border', and repetitions only matters
    in mode 'repeat n times'. If it is a whole number it will repeat one more time than expected.
    """
    road_points = []
    if mode == "until border":
        next_x = pos_x+direction_x
        next_y = pos_y+direction_y
        while next_x >= BUFFER and next_x <= WIDTH-BUFFER and next_y >= BUFFER and next_y <= HEIGHT-BUFFER:
            try:  
                draw_line(pos_x,pos_y,next_x,next_y,line_width,pixels,WIDTH,HEIGHT,alignment)
                road_points.append([pos_x,pos_y,direction_x,direction_y])
                pos_x += direction_x
                pos_y += direction_y
                for _ in range(randomness):
                    direction_x = update_direction(direction_x)
                    direction_y = update_direction(direction_y)
                next_x = pos_x+direction_x
                next_y = pos_y+direction_y
            except:
                break
        return road_points
    if mode == "repeat n times":
        next_x = pos_x+direction_x
        next_y = pos_y+direction_y
        repetitions = int(repetitions+1)
        for _ in range(repetitions):
            try:
                draw_line(pos_x,pos_y,next_x,next_y,line_width,pixels,WIDTH,HEIGHT,alignment)
                road_points.append([pos_x,pos_y,direction_x,direction_y])
                pos_x += direction_x
                pos_y += direction_y
                for _ in range(randomness):
                    direction_x = update_direction(direction_x)
                    direction_y = update_direction(direction_y)
                next_x = pos_x+direction_x
                next_y = pos_y+direction_y
            except ValueError:
                break
        return road_points

def get_second_road(secondary_roads, road_points, BUFFER):
    """Returns the needed information to build a secondary road
    in the format of [index of the point in road_points the road
    is built from, which half of the perpendicular line is being drawn,
    direction_x, direction_y]"""
    continue_loop = True
    while continue_loop:
        index = randint(BUFFER,len(road_points)-BUFFER)
        if random() > 0.5:
            reverse_y = False
        else:
            reverse_y = True
        continue_loop = False
        for road in secondary_roads:
            if road[0] >= index-1 and road[0] <= index+1 and road[1] == reverse_y:
                continue_loop = True
                continue
        dir_x = road_points[index][3]
        dir_y = road_points[index][2]
        if reverse_y:
            dir_y *= -1
        else:
            dir_x *= -1
    return [index,reverse_y,dir_x,dir_y]

def get_perpendicular_directions(dir_x, dir_y):
    """This gets the directions needed to make a perpendicular line.
    it will randomly give one of the two options.
    """
    temp = dir_x
    dir_x = dir_y
    dir_y = temp
    if random() > 0.5:
        dir_y *= -1
    else:
        dir_x *= -1

    return [dir_x,dir_y]

def draw_connecting_roads(road_points, secondary_roads, WIDTH, HEIGHT, pixels):
    """This draws the secondary connecting roads.
    """
    connecting_roads = []
    for _ in range(2):
        if random() > 0.5:
            connecting_roads.append(draw_connecting_road1(secondary_roads, WIDTH, HEIGHT, pixels))
        if random() > 0.5:
            connecting_roads.append(draw_connecting_road2(road_points, secondary_roads, 
            WIDTH, HEIGHT, pixels))
    return connecting_roads


def draw_connecting_road2(road_points, secondary_roads, WIDTH, HEIGHT, pixels):
    """This draws a connecting road that will either get close to or cross the
    main road.
    """
    index = randint(0,len(secondary_roads)-1)
    LINE_WIDTH = 7
    last_road_point = secondary_roads[index][4][len(secondary_roads[index][4])-1]
    if random() < 0.5:
        road_point = road_points[0]
    else:
        road_point = road_points[len(road_points)-1]

    next_x = road_point[0]
    next_y = road_point[1]

    pos_x = last_road_point[0]
    pos_y = last_road_point[1]

    directions = get_direction_from_points(pos_x,pos_y,next_x,next_y)
    alignment = get_alignment(pos_x,next_x,pos_y,next_y)

    return draw_any_road_point(pos_x,pos_y,directions[0],directions[1],LINE_WIDTH,
    pixels,WIDTH,HEIGHT,alignment,mode = "until border")

def draw_connecting_road1(secondary_roads, WIDTH, HEIGHT, pixels):
    """This draws a road in between two secondary roads that extends to a
    border of the screen.
    """
    LINE_WIDTH = 10
    index = randint(0,len(secondary_roads)-1)
    last_road_point = secondary_roads[index][4][len(secondary_roads[index][4])-1]
    pos_x = last_road_point[0]+last_road_point[2]
    pos_y = last_road_point[1]+last_road_point[3]

    new_index = index
    num_attempts = 0
    while new_index == index or secondary_roads[index][1] != secondary_roads[new_index][1] and num_attempts < 20:
        new_index = randint(0,len(secondary_roads)-1)
        num_attempts += 1
    last_road_point = secondary_roads[new_index][4][len(secondary_roads[new_index][4])-1]
    next_x = last_road_point[0]+last_road_point[2]
    next_y = last_road_point[1]+last_road_point[3]

    directions = get_direction_from_points(pos_x,pos_y,next_x,next_y)
    alignment = get_alignment(pos_x,next_x,pos_y,next_y)

    points_to_append = draw_any_road_point(pos_x,pos_y,directions[0],directions[1],LINE_WIDTH,pixels,WIDTH,HEIGHT,alignment,
     repetitions=directions[2], BUFFER=20, randomness=0)

    draw_any_road_point(next_x,next_y,directions[0],directions[1],LINE_WIDTH//2,pixels,WIDTH,HEIGHT,alignment,
     mode = "until border", BUFFER=20)

    return points_to_append


def draw_third_roads(secondary_roads, WIDTH, HEIGHT, pixels, num_roads, connecting_roads):
    """This will call other functions to draw all the tertiary roads.
    """
    third_roads = []
    third_roads2 = []
    for _ in range(num_roads):
        third_roads.append(draw_third_road(secondary_roads, third_roads, WIDTH, HEIGHT, pixels))
    for _ in range(5):
        third_roads2.append(draw_third_roads_on_connectors(connecting_roads,third_roads2,WIDTH,HEIGHT,pixels))

    pass

def draw_third_road(secondary_roads, third_roads, WIDTH, HEIGHT, pixels):
    """This function is a mess and needs to be cleaned up. It however,
    mostly works. It draws a tertiary road on the secondary branches from the primary road.
    It attempts to not draw multiple roads from the same location, but
    apparently that code doesn't work.
    """
    iterations = 0
    exit = False
    while not exit:
        iterations += 1
        try:
            road_base_index = randint(0,len(secondary_roads)-1)
            road_base = secondary_roads[road_base_index]
            point_base_index = randint(2,len(road_base[4][len(road_base[4])-2]))
            point_base = road_base[4][point_base_index]
            exit = True
        except:
            continue
        for road in third_roads:
            if road[0] == road_base_index and road[1] >= road_base_index-2 and road[1] <= road_base_index+2:
                exit = False
                break
        if iterations > 10:
            exit = True
                
    directions = get_perpendicular_directions(point_base[2],point_base[3])
    directions[0] *= (random()*0.5)+0.75
    directions[1] *= (random()*0.5)+0.75
    length = randint(1,3)
    if abs(directions[0]) > abs(directions[1]):
        alignment = False
    else:
        alignment = True
    # For some reason the get_alignment function doesnt work, and I can't figure out why.
    # That stupid thing has been giving be nothing but trouble!
    # alignment = get_alignment(point_base[0],point_base[0]+directions[0],point_base[1],directions[1])
    draw_any_road_point(point_base[0],point_base[1],directions[0],directions[1],7,
    pixels,WIDTH,HEIGHT,alignment,repetitions=length)

    return [road_base_index,point_base_index]

def draw_third_roads_on_connectors(connecting_roads, third_roads, WIDTH, HEIGHT, pixels):
    """This function is a mess and needs to be cleaned up. It however, mostly works.
    It draws a tertiary road on the connecting secondary roads.
    """
    if len(connecting_roads) > 0:
        road_index = randint(0,len(connecting_roads)-1)
        exit = False
        iterations = 0
        while not exit:
            iterations += 1
            point_index = randint(2,len(connecting_roads[road_index])-2)
            exit = True
            for road in third_roads:
                if road[0] == road_index and road[1]-1 <= point_index and road[1]+1 >= point_index:
                    exit = False
                    break
            if iterations > 10:
                exit = True

        point_index = randint(0,len(connecting_roads[road_index]))
        road_point = connecting_roads[road_index][point_index]
        directions = get_perpendicular_directions(road_point[2],road_point[3])
        directions[0] *= (random()*0.5)+0.75
        directions[1] *= (random()*0.5)+0.75

        length = randint(1,3)
        if abs(directions[0]) > abs(directions[1]):
            alignment = False
        else:
            alignment = True
        
        draw_any_road_point(road_point[0],road_point[1],directions[0],directions[1],
        7,pixels,WIDTH,HEIGHT,alignment,repetitions=length)
        return [road_index,point_index]

def draw_line(x1:int, y1:int, x2:int, y2:int, width:int, pixels, WIDTH, HEIGHT, alignment:bool = 'None'):
    """This calls one of 3 functions to draw a line.
     Known bug: the width will not stay consistent if a line curves a lot and this
     function ends up calling draw_vertical_line or draw_horizontal_line.
     """
    #if is_in_bounds(x1,WIDTH) and is_in_bounds(x2,WIDTH) and is_in_bounds(y1,HEIGHT) and is_in_bounds(y2,HEIGHT):
    if x1 == x2:
        draw_vertical_line(y1,y2,x1,width,pixels)
    elif y1 == y2:
        draw_horizontal_line(x1,x2,y1,width,pixels)
    else:
        if alignment == 'None':
            alignment = get_alignment(x1,x2,y1,y2)
        create_sloped_line(x1,y1,x2,y2,width,pixels, alignment)

def is_in_bounds(value,size):
    """Checks if value is lower and size and bigger than a buffer.
    """
    BUFFER = 10
    return (value > BUFFER and value < size-BUFFER)

def get_alignment(x1, x2, y1, y2):
    """A true value indicates it aligns with the x-axis.
    """
    if abs(x1-x2) >= abs(y1-y2):
        return False
    else:
        return True

def get_direction_from_points(x1,y1,x2,y2, max = 20):
    """This will convert two sets of points into 'directions' so that
    the road can be drawn in steps. Will return a list in the form of
    [dir_x, dir_y, repetitions to reach (x2,y2]
    """
    div_by = 1
    dir_x = (x2 - x1)
    dir_y = (y2 - y1)
    if abs(dir_x) > abs(dir_y):
        if abs(dir_x) > max:
            div_by = abs(dir_x)/max
    else:
        if abs(dir_y) > max:
            div_by = abs(dir_y)/max
    dir_x //= div_by
    dir_y //= div_by
    
    return [dir_x, dir_y, div_by]

def get_direction():
    """This helps set up the main_road function.
    """
    mult = 20
    if random() > 0.5:
        if random() > 0.5:
            direction = [randint(-2*mult,-1*mult),randint(-2*mult,mult)]
        else:
            direction = [randint(mult,2*mult),randint(-2*mult,2*mult)]
    else:
        if random() > 0.5:
            direction = [randint(-2*mult,2*mult),randint(-2*mult,-1*mult)]
        else:
            direction = [randint(-2*mult,2*mult),randint(mult,2*mult)]
    return direction

def get_starting_parameters_for_main_road(width, height, BUFFER, direction):
    """This helps set up the main_road function.
    """
    if abs(direction[0]) >= abs(direction[1]):
        alignment = False
        start_y = int((height/2)+-1*(direction[1]*(height))/(abs(direction[0])*2.2))
        if direction[0] < 0:
            start_x = width-BUFFER
        else:
            start_x = BUFFER
    else:
        alignment = True
        start_x = int((width/2)+-1*(direction[0]*(width))/(abs(direction[1])*2.2))
        if direction[1] < 0:
            start_y = height-BUFFER
        else:
            start_y = BUFFER
    starting_parameters = [start_x,start_y,alignment]
    return starting_parameters

def update_direction(velocity):
    """This randomizes directions.
    """
    num_ran = random()
    if num_ran > 0.7:
        velocity += 1
        if num_ran > 0.95:
            velocity += 1
    if num_ran < 0.3:
        velocity -= 1
        if num_ran < 0.05:
            velocity -= 1
    return velocity

def draw_horizontal_line(x1, x2, y, width, pixels):
    """Draws a horizontal line.
    """
    if x1-x2 > 0:
        xt = x1
        x1 = x2
        x2 = xt
    posx = x1
    while posx < x2:
        for i in range(width):
            pixels[posx,y+i] = BLACK
        posx += 1

def draw_vertical_line(y1, y2, x, width, pixels):
    """Draws a vertical line.
    """
    if y1-y2 > 0:
        yt = y1
        y1 = y2
        y2 = yt
    posy = y1
    while posy < y2:
        for i in range(width):
            pixels[x+i,posy] = BLACK
        posy += 1

def create_sloped_line(x1, y1, x2, y2, width, pixels, alignment:str):
    """This will draw a sloped line. The line will align itself
    with a particular axis specified by 'Alignment'.
    Will throw an error if called instead of draw_vertical_line.
    This function sets up parameters for draw_sloped_line.
    """
    slope = (y1-y2)/(x1-x2)
    if (x1-x2) > 0:
        xt = x1
        yt = y1
        x1 = x2
        y1 = y2
        x2 = xt
        y2 = yt

    x_step = 1
    y_step = slope
    sign = 1
    if y_step < 0:
        sign = -1
    if y_step > 1 or y_step < -1:
        x_step = sign/y_step
        y_step = 1*sign

    draw_sloped_line(x1,y1,x2,x_step,y_step,alignment,width,pixels)

def draw_sloped_line(pos_x, pos_y, end_x, x_step, y_step, align_x, width, pixels):
    """This actually does the drawing.
    """
    while pos_x < end_x:
        if(align_x):
            for i in range(width):
                pixels[pos_x+i,pos_y] = BLACK
        else:
            for i in range(width):
                pixels[pos_x,pos_y+i] = BLACK
        pos_x += x_step
        pos_y += y_step

def load_file():
    FILE_NAME = "Roads/input.jpg"
    roads = Image.open(FILE_NAME)
    return roads


if __name__ == "__main__":
    print(main())
