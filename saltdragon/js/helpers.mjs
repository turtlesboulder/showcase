export function degToRad(degrees) {
    return degrees * Math.PI / 180;
  }
  export function computeDistance(x1, y1, x2, y2){
    // Used in the camera
    return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2))
}
export function isSamePoint(point1, point2){
  return (point1.x == point2.x && point1.y == point2.y);
}

export function arrayContains(ar, cell){
  // This is a function i need for finding the viable spaces to move to
  let x = cell.x;
  let y = cell.y;
  for (let i = 0; i < ar.length; i++){
    if (ar[i].x == x && ar[i].y == y){
      return true;
    }
  }
  return false;
}
export function makeli(text, title=null, selectable=false){
  let li = document.createElement("li");
  if (title != null){
    li.title = title;
  }
  if(selectable){
    li.classList.add("selectable");
  }
  li.textContent = text;
  return li;
}

export function getDistance(x, y, x2, y2){
  // Used on the grid
  return Math.abs(x-x2) + Math.abs(y-y2);
}

// This doesn't really work, but whatever, it doesn't brick the program either
// Mabey I can figure out how to get this to go properly later
export async function loadAll(images, callback) {
  await Promise.all(images.map(image => 
    new Promise(resolve => image.addEventListener("load", resolve))
  ));
  callback();
}