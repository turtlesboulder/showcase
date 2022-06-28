package lexicalautonomizer;
import java.io.*;
import java.util.ArrayList;
public class LexicalAutonomizer {
    
    public static void main(String[] args) {
        PrintWriter pen = null;
        lexicon lex = new lexicon();
        try{
            System.out.println("Writing file...");
            pen = new PrintWriter(new FileWriter("OutFile.txt"));
            String [] lexicon = lex.makeLexicon(10000); //Number of words to make goes here
            for(String word : lexicon){
                pen.println(word);
            }
        }
        catch(IndexOutOfBoundsException e){
            System.err.println("IndexOutOfBoundsException: "+e.getMessage());
        }catch(IOException e){
            System.err.println("Caught IOException: "+e.getMessage());
        }
        finally{
            if(pen != null){
                System.out.println("Printwriter was opened! Closing it now");
                pen.close();
            } else{
                System.out.println("Uh oh! Printwriter never opened!");
            }
        }
    }
    /*
    For example, the word create has 3 vowel sounds. The first is i, then e,
    then ɪ. Acorn is eI. All the "long vowel" sounds are combinations of vowels.
    The ch sound is made by tʃ.
    The tr sound is made by tr.
    Long I as in lIkE or drIvE is aɪ
    Hard j as in oriGin is dʒ
    æ-      As in scrAmble or trAck or fAd
    u-      As in lOOm or shOE or blUE
    ɪ-      As in Evaluate or mIlk or Elect
    i-      As in shEEp or DonkEY or verb lEAd
    ɔ-      As in Origin or swOrd or fOrm or //wAter or cAll
    ʌ-      As in lUnch or chUnk or hUnger
    ɛ-      As in exprEss or whEther or lEngth
    ɜ-      As in pErson
    œ-      Same as ɛ but with lips rounded
    ə-      As in hungEr or persOn or Obscure or humAn or Allow
    ʊ-      As in hOOd or pUt
    y-      like i, but with lips 'rounded' like you do to cooo
    ä-      As in fAther, Arm
    ɒ       As in hOt or rOck or tAlk
    ---
    ʃ       As in SHeep or SHoe
    g-      As in Garage or doG
    d-      As in Donkey or faD
    k-      As in Catch or Cannon
    n-      As in Noodle or persoN
    f-      As in Fad or laUGH
    s-      As in State
    p-      As in Person
    h-      As in Hood or Hunger
    l-      As in pLain
    θ-      As in lengTH or THeater
    z-      As is laSagna
    ɽ-      As in theaTer or waTer (technically its the rolling r but only one tap but this sounds close)
    ɹ-      As in Red or tRy
    t-      As in sTop or Tap
    ʒ-      As in viSIon or pleaSure
    ð-      As in THis or moTHer
    ŋ-      As in siNg or fiNger
    w-      As in Window or Wake
    r-      Rolling r "Burrito"
    b-      As in Bed or laB
    Cre'ate
    x-      its a velar fricitive, isn't it?
    ɣ-      x but with voice
    ʔ-      Glottal stop, sorta like what t does
    ǃ-      The click used to imitate trotting of a horse
    ʘ-      Like a kissing sound
    ʍ-      w and h at the same tiem but voiceless
    ʈ-      t but with tounge curled back
    ɖ-      d but with tounge curled back like in harDer
    ɸ-      f but without the teeth
    β-      v but without the teeth
    v-      Vat, eVacuate
    j-      As in Yes, its the y consonant sound    
    */
}
class lexicon{
    static int sizeV = 8; 
    static int sizeC = 18;
    static letters l = new letters(sizeV,sizeC);

    static String [] vowels = {"u","œ","ə","æ","ʌ","ʊ","i","ɪ"};
    static String [] consonants = {"w","ɣ","t","n","ɽ","d","ʒ","v","l","wh","c","ʔ","s","dʒ","x","g","p","k"};
    static int [] vowelFrequency = {100,50,33,25,20,17,14,12};
    static int [] consonantFrequency = {66,33,24,18,15,14,13,12,11,10,9,8,8,7,7,6,6,6};
    static int weightTotalV = 0;
    static int weightTotalC = 0;
    static String lastLetter = "";
    static double cvRatio;
    static boolean cCalledLast;
    static boolean hasVowel;
    static boolean hasConsonant;
    
    lexicon(){
        for(int i: vowelFrequency){
            weightTotalV += i;
        }
        for(int i: consonantFrequency){
            weightTotalC += i;
        }
        cvRatio = 0.5+(Math.random()*0.4);
        cCalledLast = false;
        hasVowel = false;
        hasConsonant = false;
    }
    private String genWord(int size){
        String word = "";
        String last = "";
        int stress = ((int)(Math.random()*size))+1;
        for(int i=1;i<=size;i++){
            if(i==stress)
                word +="'";
            word += getSyllable(last);
            last = word.substring(word.length()-1);
            word += ".";
        }
        return word;
    }
    private String getSyllable(String last){
        lastLetter = last;
        cCalledLast = false;
        hasVowel = false;
        hasConsonant = false;
        String syl = "";
        String temp;
        while(true){
            temp = getLetter();
            if(temp.equals("End of Syllable.")){
                break;
            }
            syl += temp;
        }
        return syl;
    }
    private String getLetter(){
        boolean placeC;
        placeC = Math.random()>cvRatio;
        if(placeC && lastLetter.equals("")){
            return getConsonant();
        }
        if(!placeC && lastLetter.equals("")){
            return getVowel();
        }
        
        if(lastLetter.equals("ɹ")&&placeC){
            if(Math.random()<cvRatio){
                return getConsonant();
            }
        }
        if(!hasVowel){
            return getVowel();
        }
        if(!hasConsonant && Math.random()>0.3){
            return getConsonant();
        }
        if(lastLetter.equals("ʔ")|| lastLetter.equals("t")){
            return "End of Syllable.";
        }
        if(cCalledLast){
            return "End of Syllable.";
        }
        if(!placeC){
            if(Math.random()>cvRatio){
                return getVowel();
            }
            return "End of Syllable.";
        }
        return "End of Syllable.";
    }
    private String getConsonant(){
        String c = "";
        int subtotal = 0;
        int ran;
        ran = (int)(Math.random()*weightTotalC);
        for(int i=0;i<sizeC;i++){
            subtotal += consonantFrequency[i];
            if(ran<subtotal){
                if(lastLetter.equals("") && consonants[i].equals("ʔ")){
                    i = -1;
                    ran = (int)(Math.random()*weightTotalC);
                    subtotal = 0;
                    continue;
                }
                if(lastLetter.equals(consonants[i])){
                    i = -1;
                    ran = (int)(Math.random()*weightTotalC);
                    subtotal = 0;
                    continue;
                }
                c=consonants[i];
                break;
            }
        }
        lastLetter = c;
        cCalledLast = true;
        hasConsonant = true;
        return c;
    }
    private String getVowel(){
        String v = "";
        int subtotal = 0;
        int ran;
        ran = (int)(Math.random()*weightTotalV);
        for(int i=0;i<sizeV;i++){
            subtotal += vowelFrequency[i];
            if(ran<subtotal){
                if(lastLetter.equals(vowels[i])){
                    i = -1;
                    ran = (int)(Math.random()*weightTotalV);
                    subtotal = 0;
                    continue;
                }
                v=vowels[i];
                break;
            }
        }
        cCalledLast = false;
        lastLetter = v;
        hasVowel = true;
        return v;
    }
    String[] makeLexicon(int size){
        String[] answer = new String[size];
        int k;
        for(int i=0;i<size;i++){
            k = (int)((Math.random()*3)+2.5);
            answer[i]=genWord(k);
        }
        return answer;
    }
    
    /*private int subtotal(int num, int [] array){
        int subtotal = 0;
        for(int i=0;i<num;i++){
            subtotal += array[i];
        }
        return subtotal;
    }*/
}
class letters{
    String [] vowels = {"i","y","u","ɪ","ʊ","ə","ɛ","œ","ʌ","ɔ","æ","ä","ɒ"};
    String [] consonants = {"p","b","t","d","ʈ","ɖ","k","g","ʔ","m","n","ŋ",
    "r","ɽ","ɸ","β","f","v","θ","ð","s","z","ʃ","ʒ","x","ɣ","h","l","ç",
    "ʍ","w","t͡s","t͡ʃ","d͡z","d͡ʒ","ʝ"};
    String myVowels[];
    String myConsonants[];
    
    letters(int size, int size2){
        ArrayList<Integer> wall = new ArrayList<>();
        int ran;
        myVowels = new String[size];
        myConsonants = new String[size2];
        for(int i=0;i<myVowels.length;i++){
           ran = (int)(Math.random()*vowels.length);
           if(!wall.contains(ran)){
            myVowels[i]=vowels[ran];
            wall.add(ran);
           }
           else{
            i--;
           }
        }
        wall.clear();
        for(int i=0;i<myConsonants.length;i++){
           ran = (int)(Math.random()*consonants.length);
           if(!wall.contains(ran)){
            myConsonants[i]=consonants[ran];
            wall.add(ran);
           }
           else{
            i--;
           }
        }
       
        
    }
    String [] getVowels(){
        return myVowels;
    }
    String [] getConsonants(){
        return myConsonants;
    }
}