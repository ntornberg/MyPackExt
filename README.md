# MyPack Course Picker Extension

**MyPack Course Picker** is a browser extension that enhances the course selection experience for NCSU students. It integrates historical grade data and RateMyProfessor ratings directly into the MyPack Portal, making it easier to choose courses and instructors.

## Features
Injected tooltips to show rate my prof info and grade data
Dialog to search by course and by data



## Notes to developers 
This project is a bit of a mess. It is probably around 20k lines of code and I am the only developer. It was pretty rushed so there are parts of the code that could really use some refactoring.
Over the course of the project I had made substantial changes in design and implementation that resulted in a lot of hacky code. This is my first time using typescript or doing any form of front end development so.

### Dead code
There is quite a bit of dead code scattered around the project. Unused ts and tsx files in particular. 


### Scattered CSS injections
When I first started this project I had a few issues overriding the native tocart table in mypack. So there is just a lot of floating CSS that I used to inject into the page to override the mypack styles.
I still haven't gotten around to organizing the styles in any meaningful way. 

### Way too many data types
When I started the project I had to gather data from a bunch of different sources and I really never sat down and formulated an abstracton for this data (The format of the data has changed quite a bit since I started)
^ this is huge one that needs fixing 

### Inconsistent front end search functionalities
Particularly in the GEP search and the Plan search a large amount of data needs to be displayed. The data itself isn't really an issue but the MUI and react elements **are**. I tried a couple of different ways to reduce the performance impact of these displays but eventually I just said screw it and put it in a tree. I suspect a lot of unnessecery code is left from my other unsucessful attemmpts to remedy the issue.

### File names and organiziation
As you probably will come to see the file names and organization are just all over the place. There is really no proper structure for a lot of this. like index.ts for example just holds data types for the supabase api response I think.

I will work on reorganizing the files so it is easier to use. A lot of work needs to be done

One major todo is to make it so that the add to cart works for labs. since I recently made it so that labs are grouped with their section, the to cart button needs to be refactored ( if it ever worked for lab sections to begin with)
I need to investigate how the tocart button functions when adding labs. I am not sure if the course id should be tied to the lab or what. later problem.
