from flask import Flask, request, redirect, render_template, jsonify, url_for, session, flash
import json
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'LoungeOps'


@app.route("/")
def home():
    return render_template("lounge_options.html", user=session.get("user_id"))


@app.route("/signup/<tier>")
def signup_login(tier):
    return render_template("signup.html", user=session.get("user_id"), tier=tier)


@app.route("/create-user/<tier>", methods=["POST"])
def create_user(tier):
    tier = int(tier)
    with open("./database/database.json", "r") as data:
        database = json.load(data)
    membership = database["membership"][tier]
    for user in database["users"]:
        if user["email"] == request.form.get("email"):
            flash('Email already exists', 'error')
            return redirect("/login")

    if len(database["users"]) > 0:
        user_id = 0
        for i in database["users"]:
            if i["id"] >= user_id:
                user_id += 1
    else:
        user_id = 0

    f_name = request.form.get("fname")
    l_name = request.form.get("lname")
    email = request.form.get("email")
    password = generate_password_hash(request.form.get("password"))
    c_number = request.form.get("c_number")
    cvc = request.form.get("cvc")
    e_date = request.form.get("e_date")
    attributes = [f_name, l_name, email, password, cvc, c_number, e_date]
    if "" in attributes:
        flash("Fill in all inputs!", "error")
        return redirect("/signup")
    c_number = generate_password_hash(c_number, salt_length=10)
    cvc = generate_password_hash(cvc)
    e_date = generate_password_hash(e_date)
    user = {"id": user_id, "fname": f_name, "lname": l_name, "email": email, "password": password,
            "card_number": c_number, "cvc": cvc, "expiry_date": e_date, "membership_status": membership,
            "bookings": [], "booking_lounges": []}
    database["users"].append(user)
    session["user_id"] = user_id
    with open("./database/database.json", "w") as file:
        json.dump(database, file)
    return redirect('/dashboard')


@app.route('/logout')
def logout():
    session["user_id"] = None
    return redirect("/")


@app.route("/login")
def login():
    return render_template("login.html", user=session.get("user_id"))


@app.route("/login-user", methods=["POST"])
def login_user():
    if request.method == "POST":
        with open("./database/database.json", "r") as data:
            database = json.load(data)
        for user in database["users"]:
            if user["email"] == request.form.get("email"):
                if check_password_hash(user["password"], request.form.get("password")):
                    session["user_id"] = user["id"]
                else:
                    flash("Incorrect password!", "error")
                    return redirect("/login")
                return redirect("/dashboard")
        flash("Email does not exist!", "error")
        flash(f'If you do not have an account', "warning")
        return redirect("/login")


@app.route("/book-tickets")
def book_tickets():
    with open("./database/database.json", "r") as data:
        database = json.load(data)
    if session.get('user_id') is not None:
        return render_template("booking.html", database=database, user_id=session.get('user_id'))
    else:
        return redirect("/signup")


@app.route("/search-data", methods=["POST"])
def search():
    query = request.json
    start_city = query["start_city"]
    destination_city = query["destination_city"]
    return_flight = query["return_flight"]
    print(query)
    with open("./database/database.json", "r") as data:
        database = json.load(data)
    results = []
    for available_flight in database["available_flights"]:
        print(available_flight)
        database_start_city = available_flight["start_city"]
        database_destination_city = available_flight["destination_city"]
        database_return_flight = available_flight["return_flight"]
        if start_city == database_start_city and destination_city == database_destination_city and return_flight == database_return_flight:
            results.append(available_flight)

    return jsonify({"results": results})


@app.route("/api/airlines")
def get_airlines():
    with open("./database/database.json", "r") as database_:
        data = json.load(database_)
    return jsonify(data)


@app.route("/book", methods=["POST"])
def book():
    with open("./database/database.json", "r") as data:
        database = json.load(data)
    for user in database["users"]:
        if user['id'] == session["user_id"]:
            if len(user["bookings"]) > 0:
                sorted_bookings = sorted(user["bookings"], key=lambda x: x["id"])
                booking_id = sorted_bookings[len(sorted_bookings) - 1]["id"] + 1
            else:
                booking_id = 0
            print(request.json)
            city1 = request.json.get("city1")
            city2 = request.json.get("city2")
            return_flight = request.json.get("return_flight")

            booking_date = request.json.get("date")
            booking = {"id": booking_id, "start_city": city1, "destination_city": city2,
                       "booking_date": booking_date, "return_flight": return_flight}
            print(booking)
            database["users"][user['id']]["bookings"].append(booking)
    with open("database/database.json", "w") as database_:
        json.dump(database, database_)

    return jsonify({"success": True})


@app.route("/dashboard")
def dashboard():
    if session.get("user_id") is not None:
        with open("./database/database.json", "r") as data:
            database = json.load(data)
        user = database["users"][session["user_id"]]
        lounges = database["lounges"]
        return render_template("dashboard.html", user=user, len=len, lounges=lounges, int=int, enumerate=enumerate)

    return redirect("/")


@app.route("/cancel-booking/<id>", methods=["POST"])
def cancel_booking(id):
    if session.get("user_id") is not None:
        with open("./database/database.json", "r") as data:
            database = json.load(data)
        for user in database["users"]:
            for idx, booking in enumerate(user["bookings"]):
                if booking["id"] == int(id):
                    del database["users"][user["id"]]["bookings"][idx]
                    with open("./database/database.json", "w") as database_:
                        json.dump(database, database_)
                    return redirect("/dashboard")
    return redirect("/")


@app.route("/occupancy")
def occupancy():
    with open("./database/database.json", "r") as database:
        data = json.load(database)
    cities = data["lounges"]
    city_name = data["lounge_locations"]
    return render_template("occupancy.html", enumerate=enumerate, cities=cities, city_name=city_name)


@app.route("/api/occupiedSeats/<airport>", methods=["GET"])
def get_occupied_seats(airport):
    with open("./database/occupiedSeats.json", "r") as data:
        allOccupiedSeats = json.load(data)
    occupiedSeats = allOccupiedSeats.get(airport, [])
    return jsonify({'occupiedSeats': occupiedSeats})


@app.route('/api/bookSeats/<lounge>', methods=['POST'])
def update_occupied_seats(lounge):
    new_occupied_seats = request.json['occupiedSeats']

    with open("./database/occupiedSeats.json", "r") as data:
        all_occupied_seats = json.load(data)

    existing_occupied_seats = all_occupied_seats.get(lounge, [])
    updated_occupied_seats = existing_occupied_seats + new_occupied_seats

    all_occupied_seats[lounge] = updated_occupied_seats

    with open("./database/occupiedSeats.json", "w") as data:
        json.dump(all_occupied_seats, data)

    return jsonify({'success': True})


@app.route("/lounge-details/<_id>")
def lounge_details(_id):
    user_id = session.get("user_id")
    with open("./database/database.json", "r") as database:
        data = json.load(database)
    try:
        lounge = data["lounges"][int(_id)]
        discount = data["users"][user_id]["membership_status"]["discount"]
    except IndexError:
        return redirect("/")
    return render_template("lounge-details.html", lounge=lounge, discount=discount, float=float)


@app.route("/book-lounge/<_id>", methods=["POST"])
def book_lounge(_id):
    _id = int(_id)
    date = request.form.get("date")
    with open("./database/database.json", "r") as database:
        data = json.load(database)

    max_cap = data["lounges"][_id]["max_cap"]
    cur_cap = data["lounges"][_id]["cur_cap"]
    if max_cap > cur_cap:
        data["users"][int(session.get("user_id"))]["booking_lounges"].append({"lounge_id": _id, "date": date})
        data["lounges"][_id]["cur_cap"] += 1
        with open("./database/database.json", "w") as new_db:
            json.dump(data, new_db)
    else:
        flash("Full Capacity!")
        return redirect("/occupancy")

    return redirect("/dashboard")


@app.route("/cancel-lounge/<_id>", methods=["POST"])
def cancel_lounge(_id):
    _id = int(_id)
    user = session.get("user_id")
    if user is not None:
        with open("./database/database.json", "r") as database:
            data = json.load(database)
        del data["users"][user]["booking_lounges"][_id]
        with open("./database/database.json", "w") as database:
            json.dump(data, database)
    else:
        return redirect("/")
    return redirect("/dashboard")


@app.route("/search-lounges", methods=["POST"])
def search_lounges():
    sent_data = request.json
    print(sent_data)
    with open("./database/database.json", "r") as database:
        data = json.load(database)
    items = []

    for lounge in data["lounges"]:
        if (lounge["city"] == sent_data["location"]) and (lounge["max_cap"] > lounge["cur_cap"]):
            items.append(lounge)

    return jsonify({"data": items})


@app.route("/api/membership-details")
def get_member():
    user = session.get("user_id")
    with open("./database/database.json", "r") as database:
        data = json.load(database)
    membership_info = data["users"][user]["membership_status"]
    print(membership_info)
    return jsonify(membership_info)


if __name__ == "__main__":
    app.run(port=5050, debug=True, host="0.0.0.0")
