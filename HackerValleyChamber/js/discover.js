let images = document.querySelectorAll('[data-src]');
let increment = 0
let options = {}
options.threshold = [0.1]
options.rootMargin = "0px 0px 0px 0px";

function preloadImage(img){
    const source = img.getAttribute('data-src')
    if(!source){
        return;
    }
    img.removeAttribute('data-src')
    img.src = source
    
}

let io = new IntersectionObserver(
    (entries, io)=>{
        entries.forEach(entry=>{
            if (!entry.isIntersecting){
                return;
            }else{
                preloadImage(entry.target);
                io.unobserve(entry.target);
            }
        })
    }, options
)
images.forEach((image)=>{
    io.observe(image)
})