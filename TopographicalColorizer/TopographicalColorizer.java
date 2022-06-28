package topographicalcolorizer;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;

public class TopographicalColorizer {
    public static void main(String[] args) {
        File myFile = new File("input.png");
        try{
            BufferedImage myImage = ImageIO.read(myFile);
            write(myImage);
         }
        catch(IOException e){
            System.out.println("INCORRECT FILE LOCATION");
        }
    }
    public static void write(BufferedImage myImage){
        double ran;
        File f = new File("newImage.png");
        final int RED = -65536;         //tall mountain
        final int PINK = -19276;        //med mountain
        final int ORANGE = -19456;      //small mountain
        final int YELLOW = -256;        //flat med elevation
        final int BROWN = -7576576;     //flat high elevation
        final int MAGENTA = -65336;     //great plateau
        final int LIGHTGRAY = -4144960; //hills med elevation
        final int GREEN = -10158236;    //flat close to sea level
        final int DARKGREEN = -16746496;//hills low elevation
        final int CYAN = -16711681;     //standalone tall
        final int GRAY = -6250336;      //hills high elevation
        final int BLUE = -16776961;     //Ocean
        
        int [] [] xyheight = new int [myImage.getWidth()][myImage.getHeight()];
        int [] [] xybaseheight = new int [myImage.getWidth()][myImage.getHeight()];
        int[][] base = new int [myImage.getWidth()][myImage.getHeight()];
        int[] bigran = new int [(int)(Math.ceil(myImage.getWidth()/200)*Math.ceil(myImage.getHeight()/200))*20];
        int[] medran = new int [(int)(Math.ceil(myImage.getWidth()/50)*Math.ceil(myImage.getHeight()/50))*20];
        int[] smallran = new int [(int)(Math.ceil(myImage.getWidth()/20)*Math.ceil(myImage.getHeight()/20))*20];
        int cal;
        int ranx;
        int rany;
        boolean mountain; boolean hill;
        // Height in feet above sea level
        for(int i = 0; i < bigran.length; i++){
            bigran[i] = (int)(Math.random()*500)-250;
        }
        for(int i = 0; i < medran.length; i++){
            medran[i] = (int)(Math.random()*300)-150;
        }
        for(int i = 0; i < smallran.length; i++){
            smallran[i] = (int)(Math.random()*150)-75;
        }
        for(int x = 1; x< myImage.getWidth()-1; x++){
            for(int y = 1; y< myImage.getHeight()-1; y++){
                if(myImage.getRGB(x, y)!= BLUE)
                xyheight[x][y] = 5;
            }
        }
           
        for(int x = 1; x< myImage.getWidth()-1; x++){
            for(int y = 1; y< myImage.getHeight()-1; y++){
                mountain = false;
                ran = Math.random();
                switch(myImage.getRGB(x, y)){
                    case RED:                                                   //RED
                    xybaseheight[x][y] = 2000;
                    if(ran>0.999){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*10000)+8000;
                        mountain = true;
                        break;
                    }
                    if(ran>0.99){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*6000)+4000;
                        mountain = true;
                        break;
                    }
                    if(ran>0.95){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*3700)+1700;
                        mountain = true;
                        break;
                    }
                    if(ran>0.8){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*2000)+1;
                        mountain = true;
                        break;
                    }
                    break;
                    case PINK:                                                   //PINK
                    xybaseheight[x][y] = 1000;
                    if(ran>0.999){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*6000)+5000;
                        mountain = true;
                        break;
                    }
                    if(ran>0.99){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*3700)+2700;
                        mountain = true;
                        break;
                    }
                    if(ran>0.95){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*2000)+1000;
                        mountain = true;
                        break;
                    }
                    if(ran>0.8){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*1100)+100;
                        mountain = true;
                        break;
                    }
                    break;
                    case ORANGE:                                                //ORANGE
                    xybaseheight[x][y] = 500;
                    if(ran>0.999){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*3700)+3200;
                        mountain = true;
                        break;
                    }
                    if(ran>0.99){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*2000)+1500;
                        mountain = true;
                        break;
                    }
                    if(ran>0.95){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*1100)+600;
                        mountain = true;
                        break;
                    }
                    if(ran>0.8){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*550)+50;
                        mountain = true;
                        break;
                    }
                    break;
                    case GREEN:                                                  //GREEN
                    xybaseheight[x][y] = 200;
                    break;
                    case YELLOW:                                                //YELLOW
                    xybaseheight[x][y] = 2000;
                    break;
                    case BROWN:                                                 //BROWN
                    xybaseheight[x][y] = 5000;
                    break;
                    case BLUE: xyheight[x][y] = 0;                              //BLUE
                    xybaseheight[x][y] = 0;
                    break;
                    case -16777216:                                                //BLACK
                    xybaseheight[x][y] = 100;
                    break;
                    case -1: xyheight[x][y] = xyheight[x-1][y];                 //WHITE
                    xybaseheight[x][y] = xybaseheight[x-1][y];
                    break;
                    case MAGENTA:                                                 //MAGENTA
                    xybaseheight[x][y] = 10000;
                    if(ran>0.98){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*2000)+1000;
                        mountain = true;
                        break;
                    }
                    if(ran>0.9){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*1000)+1;
                        mountain = true;
                        break;
                    }
                    break;
                    case DARKGREEN:                                              //DARKGREEN
                    xybaseheight[x][y] = 200;
                    if(ran>0.98){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*550)+200;
                        mountain = true;
                        break;
                    }
                    if(ran>0.9){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*400)+1;
                        mountain = true;
                        break;
                    }
                    break;
                    case LIGHTGRAY:                                             //LIGHTGRAY
                    xybaseheight[x][y] = 2000;
                    if(ran>0.98){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*700)+300;
                        mountain = true;
                        break;
                    }
                    if(ran>0.9){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*500)+1;
                        mountain = true;
                        break;
                    }
                    break;
                    case GRAY:                                                    //GRAY
                    xybaseheight[x][y] = 5000;
                    if(ran>0.98){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*800)+400;
                        mountain = true;
                        break;
                    }
                    if(ran>0.9){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*600)+1;
                        mountain = true;
                        break;
                    }
                    break; 
                    case CYAN:                                                  //CYAN
                    xybaseheight[x][y] = 10000;
                    if(ran>0.98){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*14000)+4000;
                        mountain = true;
                        break;
                    }
                    if(ran>0.9){
                        ran=Math.random();
                        xyheight[x][y] = (int)(ran*10000)+1;
                        mountain = true;
                        break;
                    }
                    break;
                }
                ran = Math.random();
                xyheight[x][y] *= 2;
                
                if(x > 20 && x < myImage.getWidth()-20 && y > 20 && y < myImage.getHeight()-20){
                    ranx = x; rany = y;
                    ranx += (int)(Math.random()*40)-20;
                    rany += (int)(Math.random()*40)-20;
                cal = (int)((((int)(rany/200))*Math.ceil(myImage.getWidth()/50))+((int)Math.ceil(ranx/200)));
                xybaseheight[x][y] += bigran[cal];
                cal = (int)(((int)(rany/50))*Math.ceil(myImage.getWidth()/20))+((int)Math.ceil(ranx/50));
                xybaseheight[x][y] += medran[cal];
                cal = (int)(((int)(rany/20))*Math.ceil(myImage.getWidth()/5))+((int)Math.ceil(ranx/20));
                xybaseheight[x][y] += smallran[cal];
                xybaseheight[x][y] += (int)((Math.random()*60)-30);
                }
                
            }
        }
        for(int x = 51; x < myImage.getWidth()-50; x++){
            for(int y = 51; y < myImage.getHeight()-50; y++){
        if(myImage.getRGB(x, y)==GREEN ||myImage.getRGB(x, y)==YELLOW || myImage.getRGB(x, y)==BROWN ){
                    ranx = x+((int)(Math.random()*100)-50);
                    rany = y+((int)(Math.random()*100)-50);
                    xybaseheight[x][y] = xybaseheight[ranx][rany];
                }}}
        for(int i = 0; i < 60; i++){                                             //spread
        System.arraycopy(xybaseheight, 0, base, 0, base.length);
        for(int x = 1; x<myImage.getWidth()-1; x++){
            for(int y = 1; y<myImage.getHeight()-1; y++){
                if(xybaseheight[x][y] != 0){
                    xybaseheight[x][y] = (int)((base[x-1][y] + base[x+1][y] + base[x][y-1] + base[x][y+1]+base[x][y])/5);
                }
            }
        }}
        for(int x = 0; x<myImage.getWidth(); x++){
            for(int y = 0; y<myImage.getHeight(); y++){
                if(xyheight[x][y] != 0)
                xyheight[x][y] += xybaseheight[x][y];
            }
        }
        for(int i = 0; i < 2; i++){                                             //spread
        System.arraycopy(xyheight, 0, base, 0, base.length);
        for(int x = 1; x<myImage.getWidth()-1; x++){
            for(int y = 1; y<myImage.getHeight()-1; y++){
                if(xyheight[x][y] != 0){
                    xyheight[x][y] = (int)((base[x-1][y] + base[x+1][y] + base[x][y-1] + base[x][y+1]+(base[x][y]*4))/8);
                }
            }
        }}
        for(int i = 0; i < 2; i++){                                             //hill&mountainspread
        System.arraycopy(xyheight, 0, base, 0, base.length);
        for(int x = 1; x<myImage.getWidth()-1; x++){
            for(int y = 1; y<myImage.getHeight()-1; y++){
                if(xyheight[x][y] != 0){
                    xyheight[x][y] = (int)((base[x-1][y] + base[x+1][y] + base[x][y-1] + base[x][y+1]+(base[x][y]*4))/8);
                }
            }
        }}
        for(int i = 0; i < 4; i++){                                             //hillspread
        System.arraycopy(xyheight, 0, base, 0, base.length);
        for(int x = 1; x<myImage.getWidth()-1; x++){
            for(int y = 1; y<myImage.getHeight()-1; y++){
                hill = false;
                if(myImage.getRGB(x, y) == DARKGREEN || myImage.getRGB(x, y) == LIGHTGRAY || myImage.getRGB(x, y) == GRAY)
                    hill = true;
                if(hill){
                    xyheight[x][y] = (int)((base[x-1][y] + base[x+1][y] + base[x][y-1] + base[x][y+1]+(base[x][y]*4))/8);
                }
            }
        }}
        
        for(int x = 0; x<myImage.getWidth(); x++){
            for(int y = 0; y<myImage.getHeight(); y++){
                if(myImage.getRGB(x, y)!= -16776961){
                    if(xyheight[x][y] < -500){
                        myImage.setRGB(x,y,-16751616);
                        continue;
                    }
                    if(xyheight[x][y] < -400){
                        myImage.setRGB(x,y,-16745216);
                        continue;
                    }
                    if(xyheight[x][y] < -300){
                        myImage.setRGB(x,y,-16738816);
                        continue;
                    }
                    if(xyheight[x][y] < -200){
                        myImage.setRGB(x,y,-16732416);
                        continue;
                    }
                    if(xyheight[x][y] < -100){
                        myImage.setRGB(x,y,-16726016);
                        continue;
                    }
                    if(xyheight[x][y] < 0){
                        myImage.setRGB(x,y,-16719616);
                        continue;
                    }
                    if(xyheight[x][y] < 50){
                        myImage.setRGB(x,y,-16711936);
                        continue;
                    }
                    if(xyheight[x][y] < 100){
                        myImage.setRGB(x,y,-10158336);
                        continue;
                    }
                    if(xyheight[x][y] < 150){
                        myImage.setRGB(x,y,-6881536);
                        continue;
                    }
                    if(xyheight[x][y] < 200){
                        myImage.setRGB(x,y,-3604736);
                        continue;
                    }
                    if(xyheight[x][y] < 250){
                        myImage.setRGB(x,y,-256);
                        continue;
                    }
                    if(xyheight[x][y] < 300){
                        myImage.setRGB(x,y,-4096);
                        continue;
                    }
                    if(xyheight[x][y] < 350){
                        myImage.setRGB(x,y,-7936);
                        continue;
                    }
                    if(xyheight[x][y] < 400){
                        myImage.setRGB(x,y,-11776);
                        continue;
                    }
                    if(xyheight[x][y] < 450){
                        myImage.setRGB(x,y,-15616);
                        continue;
                    }
                    if(xyheight[x][y] < 500){
                        myImage.setRGB(x,y,-19456);
                        continue;
                    }
                    if(xyheight[x][y] < 550){
                        myImage.setRGB(x,y,-23296);
                        continue;
                    }
                    if(xyheight[x][y] < 600){
                        myImage.setRGB(x,y,-27136);
                        continue;
                    }
                    if(xyheight[x][y] < 650){
                        myImage.setRGB(x,y,-33536);
                        continue;
                    }
                    if(xyheight[x][y] < 700){
                        myImage.setRGB(x,y,-39936);
                        continue;
                    }
                    if(xyheight[x][y] < 800){
                        myImage.setRGB(x,y,-46336);
                        continue;
                    }
                    if(xyheight[x][y] < 900){
                        myImage.setRGB(x,y,-52736);
                        continue;
                    }
                    if(xyheight[x][y] < 1000){
                        myImage.setRGB(x,y,-65536);
                        continue;
                    }
                    if(xyheight[x][y] < 1200){
                        myImage.setRGB(x,y,-65461);
                        continue;
                    }
                    if(xyheight[x][y] < 1400){
                        myImage.setRGB(x,y,-65436);
                        continue;
                    }
                    if(xyheight[x][y] < 1600){
                        myImage.setRGB(x,y,-65411);
                        continue;
                    }
                    if(xyheight[x][y] < 1800){
                        myImage.setRGB(x,y,-65386);
                        continue;
                    }
                    if(xyheight[x][y] < 2000){
                        myImage.setRGB(x,y,-65361);
                        continue;
                    }
                    if(xyheight[x][y] < 2200){
                        myImage.setRGB(x,y,-65336);
                        continue;
                    }
                    if(xyheight[x][y] < 2400){
                        myImage.setRGB(x,y,-65311);
                        continue;
                    }
                    if(xyheight[x][y] < 2600){
                        myImage.setRGB(x,y,-65281);
                        continue;
                    }
                    if(xyheight[x][y] < 2800){
                        myImage.setRGB(x,y,-3669761);
                        continue;
                    }
                    if(xyheight[x][y] < 3000){
                        myImage.setRGB(x,y,-5308161);
                        continue;
                    }
                    if(xyheight[x][y] < 3300){
                        myImage.setRGB(x,y,-6946561);
                        continue;
                    }
                    if(xyheight[x][y] < 3600){
                        myImage.setRGB(x,y,-7929601);
                        continue;
                    }
                    if(xyheight[x][y] < 3900){
                        myImage.setRGB(x,y,-8912641);
                        continue;
                    }
                    if(xyheight[x][y] < 4200){
                        myImage.setRGB(x,y,-9895681);
                        continue;
                    }
                    if(xyheight[x][y] < 4500){
                        myImage.setRGB(x,y,-11534081);
                        continue;
                    }
                    if(xyheight[x][y] < 5000){
                        myImage.setRGB(x,y,-14155521);
                        continue;
                    }
                    if(xyheight[x][y] < 5500){
                        myImage.setRGB(x,y,-16776961);
                        continue;
                    }
                    if(xyheight[x][y] < 6000){
                        myImage.setRGB(x,y,-16764161);
                        continue;
                    }
                    if(xyheight[x][y] < 6500){
                        myImage.setRGB(x,y,-16757761);
                        continue;
                    }
                    if(xyheight[x][y] < 7000){
                        myImage.setRGB(x,y,-16751361);
                        continue;
                    }
                    if(xyheight[x][y] < 7500){
                        myImage.setRGB(x,y,-16747521);
                        continue;
                    }
                    if(xyheight[x][y] < 8000){
                        myImage.setRGB(x,y,-16743681);
                        continue;
                    }
                    if(xyheight[x][y] < 9000){
                        myImage.setRGB(x,y,-16739841);
                        continue;
                    }
                    if(xyheight[x][y] < 10000){
                        myImage.setRGB(x,y,-16736001);
                        continue;
                    }
                    if(xyheight[x][y] < 12000){
                        myImage.setRGB(x,y,-16732161);
                        continue;
                    }
                    if(xyheight[x][y] < 14000){
                        myImage.setRGB(x,y,-16728321);
                        continue;
                    }
                    if(xyheight[x][y] < 16000){
                        myImage.setRGB(x,y,-16723201);
                        continue;
                    }
                    if(xyheight[x][y] < 18000){
                        myImage.setRGB(x,y,-16718081);
                        continue;
                    }
                    else{
                        myImage.setRGB(x,y,-16711681);
                        continue;
                    }
                    
                }
            }
        }

        try{
            ImageIO.write(myImage,"png", f);
            System.out.println("Image written succesfully");
        }catch(IOException e){
            System.out.println("Some unexpected error");
        }
    }
}
