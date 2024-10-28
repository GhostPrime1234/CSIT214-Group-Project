function get_data(){
    return fetch("/api/membership-details")
        .then(response => response.json())
        .then(data => {
            let discount = Number(data["discount"]);
            return discount;
        })}



function searchLounges(){
    let location = document.getElementById('city').value
    let sent_data = {
        "location": location,
    };

    fetch("/search-lounges", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sent_data),
    }).then(response => {
        if(response.ok){
            console.log("Success");
            return response.json();
        } else {
            throw new Error("Error");
        }
    }).then(data => {
        let lounges = data["data"];
        document.getElementById("main_page").innerHTML = ""
        get_data().then(discount => {
        for (let lounge of lounges){
            document.getElementById("main_page").innerHTML +=
                `<div class="col-sm-12" style="padding-bottom: 30px; display: flex;
                  justify-content: center;
                  align-items: center;
                  color: white;">
                <div class="card option" style="width: 50rem;">
                    <img src="${lounge['image']}" class="card-img-top" alt="...">
                    <div class="card-body">
                      <h5 class="card-title">${lounge["name"]}</h5>
                      <p class="card-text">${lounge["city"]}</p>
                      <ul class="list-group list-group-flush custom-list-group">
                      <li class="list-group-item"><span><h8>Max capacity </h8><span style="padding-left: 10px; padding-right: 5px;">${lounge["max_cap"]}</span><i class="fa-solid fa-users"></i></span></li>
                      <li class="list-group-item"><span><h8>Current capacity </h8><span style="padding-left: 10px; padding-right: 5px;">${lounge["cur_cap"]}</span><i class="fa-solid fa-users"></i></span></li>
                      <li class="list-group-item"><span>$</span><span>${Number(lounge["price"]) - (Number(lounge["price"])*Number(discount))}</span></li>
                      </ul>
                      <a href="/lounge-details/${lounge['id']}" class="btn btn-dark">More Info</a>
                    </div>
                </div>
            </div>`
        }
    })

    })
}