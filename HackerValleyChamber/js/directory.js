async function load_buisiness(){
    let requestURL = "js/data.json";
    let result = await fetch(requestURL);
    if (result.ok){
        let json = await result.json();
        const buisinesses = json["buisinesses"];
        build_site(buisinesses);
    }
}

function build_site(buisinesses){
    build_cards(buisinesses);
    build_table_rows(buisinesses);
    if (window.innerWidth > 900){
        document.querySelector("#directory_table").classList.add("hide")
    }
    else{
        document.querySelector("#directory_cards").classList.add("hide")
    }
}

function build_cards(buisinesses){
    const cards_container = document.querySelector("#directory_cards")
    let build_card = (buisiness)=>{
        //Code
        let card_node = document.createElement("div");
        let name = document.createElement("p");
        let address = document.createElement("p");
        let phone = document.createElement("p");
        let website = document.createElement("a");
        let description = document.createElement("p");
        let logo = document.createElement("img");

        name.textContent = buisiness.name;
        address.textContent = buisiness.address;
        phone.textContent = buisiness.phone;
        website.href = "https://www.byui.edu/";
        website.textContent = buisiness.website;
        description.textContent = buisiness.description;
        logo.src = `images/${buisiness.logo}`;
        logo.alt = buisiness.description;

        card_node.appendChild(logo);
        card_node.appendChild(name);
        card_node.appendChild(address);
        card_node.appendChild(phone);
        card_node.appendChild(website);
        card_node.appendChild(description);

        cards_container.appendChild(card_node);
    }
    buisinesses.forEach(build_card)
}

function build_table_rows(buisinesses){
    const table_container = document.querySelector("#directory_table")
    let build_row = (buisiness) =>{
        // Code
        let row_node = document.createElement("tr");
        let name = document.createElement("td");
        let address = document.createElement("td");
        let phone = document.createElement("td");
        let website = document.createElement("td");
        let description = document.createElement("td");

        name.textContent = buisiness.name;
        address.textContent = buisiness.address;
        phone.innerHTML = `${buisiness.phone}`;
        website.href = "https://www.byui.edu/";
        website.innerHTML = `<a href="https://www.byui.edu/">${buisiness.website}</a>`;
        description.textContent = buisiness.description;

        row_node.appendChild(name);
        row_node.appendChild(address);
        row_node.appendChild(phone);
        row_node.appendChild(website);
        row_node.appendChild(description);

        table_container.appendChild(row_node);
    }
    buisinesses.forEach(build_row)
}
function add_button_functionality(){
    let swap = ()=>{
        document.querySelector("#directory_cards").classList.toggle("hide");
        document.querySelector("#directory_table").classList.toggle("hide");
    }
    const show_cards = document.querySelector("#show_cards");
    const show_table = document.querySelector("#show_table");

    show_cards.addEventListener('click', ()=>{
        if (document.querySelector("#directory_cards").classList.contains("hide")){
            swap()
        }
    })

    show_table.addEventListener('click', ()=>{
        if (document.querySelector("#directory_table").classList.contains("hide")){
            swap()
        }
    })
}

load_buisiness();
add_button_functionality();