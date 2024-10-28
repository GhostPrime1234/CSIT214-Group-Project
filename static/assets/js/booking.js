
        let return_flight = false;

    // Accessing dropdowns
        var city1Dropdown = document.getElementById("city1");
        var city2Dropdown = document.getElementById("city2");
        let result;

        function get_data(){
            return fetch("/api/membership-details")
                .then(response => response.json())
                .then(data => {
                    let discount = Number(data["discount"]);
                    console.log("Discount: ", discount);
                    return discount;
                });
}


        function check_return(){
            if (document.getElementById("return_flight").checked){
                document.getElementById("price").innerText = 2*Number(document.getElementById("price").innerText);
                document.getElementById("old-price").innerText = 2*Number(document.getElementById("old-price").innerText)
                return_flight = true;
            }
            else{
                return_flight = false;
                document.getElementById("price").innerText = (Number(document.getElementById("price").innerText)/2).toFixed(2)
                document.getElementById("old-price").innerText = (Number(document.getElementById("old-price").innerText)/2).toFixed(2)
            }
        }



function priceConvert(selectedCity1, selectedCity2, return_flight = false) {
    let basePrice = 100 * (1 + distance(selectedCity1, selectedCity2) / 10);
    let finalPrice;
    let discountedPrice;

    return fetch("/api/membership-details")
        .then(response => response.json())
        .then(data => {
            let discount = Number(data["discount"]);
            console.log("Discount: ", discount)
            console.log(discount);

            if (return_flight) {
                finalPrice = 2 * basePrice;
                console.log(finalPrice);
            } else {
                finalPrice = basePrice;
                console.log(finalPrice);
            }

            if (discount) {
                console.log(discount);
                console.log(finalPrice);

                discountedPrice = finalPrice - (finalPrice * discount);
                console.log(discountedPrice);
                return [discountedPrice.toFixed(2), finalPrice.toFixed(2)];
            }

            else {
                return [finalPrice.toFixed(2), null];
            }

        });
}




        fetch('/api/airlines')
            .then(response => response.json())
            .then(data => {
                result = data["airport_lines"];
            })
            .catch(error => console.error('Error:', error));
        // Adding event listener to city1 dropdown
        city1Dropdown.addEventListener("change", function() {
            var selectedCity1 = city1Dropdown.value;
            if (city2Dropdown.value !== "Empty"){

                if (!document.getElementById("return_flight").checked) {
                    priceConvert(result[selectedCity1], result[city2Dropdown.value]).then(output => {
                        document.getElementById("price").innerText = output[0]
                    });
                    priceConvert(result[selectedCity1], result[city2Dropdown.value]).then(output => {
                        document.getElementById("old-price").innerText = output[1]

                    });
                }
                else{
                    priceConvert(result[selectedCity1], result[city2Dropdown.value], true).then(output => {
                        console.log(output[1])
                        document.getElementById("price").innerText = output[0]

                    });
                    priceConvert(result[selectedCity1], result[city2Dropdown.value], true).then(output => {
                        console.log(output[1])
                        document.getElementById("old-price").innerText = output[1]
                    });

                }
            }
            console.log("City 1 selected:", selectedCity1);
            updateDropdownOptions(city2Dropdown, selectedCity1);
            removeOption(city1Dropdown, "Empty");
        });

        // Adding event listener to city2 dropdown
        city2Dropdown.addEventListener("change", function() {
            var selectedCity2 = city2Dropdown.value;
            if (city1Dropdown.value !== "Empty"){
                if (!document.getElementById("return_flight").checked) {
                    priceConvert(result[selectedCity2], result[city2Dropdown.value]).then(output => {
                        document.getElementById("price").innerText = output[0]
                    });
                    priceConvert(result[selectedCity2], result[city2Dropdown.value]).then(output => {
                        document.getElementById("old-price").innerText = output[1]
                    });
                }else{
                    priceConvert(result[selectedCity2], result[city1Dropdown.value], true).then(output => {
                        console.log(output[1])
                        document.getElementById("price").innerText = output[0]

                    });
                    priceConvert(result[selectedCity2], result[city1Dropdown.value], true).then(output => {
                        console.log(output[1])
                        document.getElementById("old-price").innerText = output[1]
                    });
                }
            }
            console.log("City 2 selected:", selectedCity2);

            updateDropdownOptions(city1Dropdown, selectedCity2);
            removeOption(city2Dropdown, "Empty");
        });

        // Function to update dropdown options
        function updateDropdownOptions(dropdown, selectedCity) {
            var options = dropdown.options;
            for (var i = 0; i < options.length; i++) {
                if (options[i].value === selectedCity) {
                    options[i].disabled = true; // Disable the selected option
                } else {
                    options[i].disabled = false; // Enable other options
                }
            }
        }

        function removeOption(dropdown, optionToRemove) {
            var options = dropdown.options;
            for (var i = 0; i < options.length; i++) {
                if (options[i].value === optionToRemove) {
                    options[i].remove();
                    break;
                }
            }
        }

        function distance(point1, point2){

            let total_sum = 0;
            for (let i = 0; i < 2; i++){
                total_sum += (Number(point1[i]) - Number(point2[i]))**2;
            }
            return Math.sqrt(total_sum);
        }

        function sendData(){
            let booking_date = document.getElementById("date_selection").value;

            const data = {
              start_city: city1Dropdown.value,
              destination_city: city2Dropdown.value,
              booking_date: booking_date,
              return_flight: return_flight
            }
            fetch("/search-data", {
              method: "POST",
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data),
            }).then(response => {
                if (response.ok) {
                // Parse the JSON response
                return response.json();}
                else {
                    throw new Error("Network Error");
                }

            }).then(data => {

                let result_element = document.getElementById('results');
                result_element.innerHTML = '';
                if (data["results"].length !== 0){
                    for (let i = 0; i < data["results"].length; i++){
                        let city1 = data["results"][i]["start_city"];
                        let city2 = data["results"][i]["destination_city"];
                        let return_flight = data["results"][i]["return_flight"];
                        let date = data["results"][i]["booking_date"];

                        result_element.innerHTML += `<div class="container mt-4">
                                                          <div class="card" style="background: #2c2c2c !important;">
                                                                <div class="card-body" style="color: #EDEAD0">
                                                  
                                                              <h5 class="card-title">${city1} <span style="padding-left: 5px; padding-right: 5px"><i class="fa-solid fa-plane-departure fa-lg"></i></span> ${city2}</h5>
                                                              <p class="card-text">Departure Date: ${date}</p>
                                                              <p class="card-text">Return Flight: ${return_flight}</p>
                                                              <button class="btn btn-light" onclick="bookFlight('${city1}', '${city2}', ${return_flight}, '${date}')">Book</button>
                                                            </div>
                                                          </div>
                                                        </div>
                                                        `;
                    }
                }
                else{
                    result_element.innerHTML = `<h2 style="color: white">No Results</h2>`;
                }
            }).catch(error => {
              console.log("Error: ", error)
            });
          }


        function bookFlight(city1, city2, return_flight, date){

            const data = {
                city1: city1,
                city2: city2,
                return_flight: return_flight,
                date: date
            }
            console.log(JSON.stringify(data));

            fetch("/book", {
                method: "POST",
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            }).then( response => {
                if (response.ok){
                    console.log("Success!");
                    window.location.href = "/dashboard";
                }
                }).catch(error => {
                console.log("Error: ", error);
            })
        }
