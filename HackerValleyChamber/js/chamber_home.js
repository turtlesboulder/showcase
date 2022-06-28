function updateDate(){
    let currentDate = new Date();
    let date_container = document.querySelector("#current_date_header")
    let month = currentDate.getMonth()
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    month = months[month]

    let weekday = currentDate.getDay()
    let weekdays = ["Sunday", "Monday", "Teusday", "Wednesday", "Thursday", "Friday", "Saturday"]
    weekday = weekdays[weekday];

    if (weekday == "Monday" || weekday == "Teusday"){
        let banner_node = document.querySelector("#notification_banner");
        banner_node.removeAttribute("class");
    }

    let year = currentDate.getFullYear()
    let day = currentDate.getDate()
    let date_string = `The current date is ${weekday}, ${day} ${month} ${year}`
    date_container.textContent = date_string;
}
function do_hamburger_functionality(){
    let button = document.querySelector("#hamburger_button");
    let menu = document.querySelector("nav");
    menu.cla
    let main = document.querySelector("body");
    button.addEventListener("click", () => {menu.classList.toggle("hamburger_show")})
    function remove_hamburger_menu_on_body_click(event){
        let menu = document.querySelector("#nav");
        if ((event.target.closest("nav") != document.querySelector("nav")) && event.target.closest("button") != document.querySelector("#hamburger_button")){
            menu.classList = ""
        }
    }
    main.addEventListener("click", remove_hamburger_menu_on_body_click, true);
}

function do_footer(){
    // localstorage
    let now_date = new Date()
    let old_date = new Date(localStorage.getItem("lastVisited"));
    localStorage.setItem('lastVisited', now_date)
    if (old_date.getTime() != 0){
        let time_elapsed = now_date.getTime() - old_date.getTime();
        let days_elapsed = Math.round(time_elapsed/(1000 * 60 * 60 * 24))
        let message = ""
        if (days_elapsed == 1){
            message = "Day ago"
        }
        else{
            message = "Days ago"
        }
        document.querySelector(".visited").textContent = "Last Visited: " + (days_elapsed) + " " + message
    }
    else{
        document.querySelector(".visited").textContent = "Welcome newcomer!"
    }

    let modified_date = new Date(document.lastModified);
    let text_container = document.querySelector("#footer_text")
    let month = modified_date.getMonth()
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    month = months[month]
    let year = modified_date.getFullYear()
    let day = modified_date.getDate()
    let hour = modified_date.getHours()
    let minutes = modified_date.getMinutes()
    text_container.innerHTML = `© ${year} Hacker Valley Chamber by Landon Lee. | WDD 230 Project | Last modified ${month} ${day}, ${year} at ${hour}:${minutes}.`
}

function init(){
    updateDate();
    do_hamburger_functionality();
    do_footer();
}
init()