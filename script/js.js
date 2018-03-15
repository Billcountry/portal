/**
 * Created by Zuhura on 4/10/2017.
 */

var timer;

var position = 0;

function change_password() {
    var old = document.querySelector("#old_pass").value;
    var newp = document.querySelector("#new_pass").value;
    var conf = document.querySelector("#conf_pass").value;
    if (newp.length >= 8) {
        if (newp === conf) {
            $.ajax({
                url: "api/?action=change_password",
                type: "POST",
                data: {
                    old_password: old,
                    new_password: newp
                },
                dataType: "json",
                success: function (response) {
                    if (response.success) {
                        $('#password_modal').modal('hide');
                        Toast(response.message, TOAST_LONG);
                    } else {
                        Add_error(response.error, "pass_change_errors", false);
                    }
                },
                error: function (error) {
                    console.log(error);
                    Add_error("An unkown error occurred", "pass_change_errors", false);
                }
            });
        } else {
            Add_error("Passwords do not match", "pass_change_errors", false);
        }
    } else {
        Add_error("Password too short", "pass_change_errors", false);
    }
}

function Toast(message, length) {
    if(length === undefined)
        length = 6;
    clearTimeout(timer);
    document.getElementById("message").innerHTML = message;
    document.getElementById("toast").style.display = "block";
    timer = setInterval(function () {
        document.getElementById("message").innerHTML = "";
        document.getElementById("toast").style.display = "none";
        clearTimeout(timer);
    }, (length * 1000));
    var a = {a: 1, b: 2};
}

function Add_error(error, location, append) {
    var close = document.createElement("button");
    close.setAttribute("type", "button");
    close.setAttribute("class", "close");
    close.setAttribute("data-dismiss", "alert");
    close.setAttribute("aria-label", "Close");
    var span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");
    span.setAttribute("class", "material material-close-circle");
    close.appendChild(span);

    var div = document.createElement("div");
    var text = document.createTextNode(error);
    div.appendChild(close);
    div.appendChild(text);
    div.setAttribute("class", "alert alert-danger alert-dismissible fade show");
    div.setAttribute("role", "alert");

    location = document.querySelector("#" + location);
    if (append) {

        location.appendChild(div);
    } else {
        while (location.hasChildNodes()) {
            location.removeChild(location.lastChild);
        }
        location.appendChild(div);
    }
}

function Add_success(message, location, append) {
    var close = document.createElement("button");
    close.setAttribute("type", "button");
    close.setAttribute("class", "close");
    close.setAttribute("data-dismiss", "alert");
    close.setAttribute("aria-label", "Close");
    var span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");
    span.setAttribute("class", "material material-close-circle");
    close.appendChild(span);

    var div = document.createElement("div");
    var text = document.createTextNode(message);
    div.appendChild(close);
    div.appendChild(text);
    div.setAttribute("class", "alert alert-success alert-dismissible fade show");
    div.setAttribute("role", "alert");

    location = document.querySelector("#" + location);
    if (append) {

        location.appendChild(div);
    } else {
        while (location.hasChildNodes()) {
            location.removeChild(location.lastChild);
        }
        location.appendChild(div);
    }
}

function Clear(location) {
    while (location.hasChildNodes()) {
        location.removeChild(location.lastChild);
    }
}

function addUser() {
    try {
        var form = document.forms.sign_up_form;
        var pass = form.Password.value;
        var pass_conf = form.confirmation_pw.value;
        var terms = form.accept_terms.checked;
        var data = new FormData(form);
        data.append('action', 'register');
        if (terms) {
            if (pass === pass_conf) {
                $.ajax({
                    type: "POST",
                    url: "api/",
                    data: data,
                    processData: false,
                    contentType: false,
                    dataType: "json",
                    success: function (response) {
                        if (response.success) {
                            Toast(response.message, TOAST_SHORT);
                            // Redirect the user to login
                            sessionStorage.setItem('state', 'guest');
                            member();
                        } else {
                            Add_error(response.error, "sign_up_errors", false);
                        }
                    },
                    error: function (error) {
                        Add_error("Unknown error occurred", "sign_up_errors", true);
                    }
                });
            } else {
                Add_error("Passwords do not match", "sign_up_errors", true);
            }
        } else {
            Add_error("You must accept the terms and conditions before you continue", "sign_up_errors", false);
        }
    } catch (e) {
        window.open("http://stackoverflow.com/search?q=[js]+" + e.message, '_blank');
    }
}

function login() {
    var form = document.forms.login_form;
    // Convert the form to multipart formdata for submission
    var data = new FormData(form);
    data.append('action', 'login');
    var user_type = form.UserType.value;
    member();
    $.ajax({
        type: "POST",
        url: "api/",
        data: data,
        processData: false,
        contentType: false,
        dataType: "json",
        success: function (response) {
            if (response.success) {
                sessionStorage.setItem('state', 'normal');
                sessionStorage.setItem('user_type', user_type);
                var profile = response.user.profile;
                var dash_form = document.forms.user_dash;
                for (var key in profile) {
                    // Save the profile sent as part of the browser's data
                    sessionStorage.setItem(key, profile[key]);
                    // Check whether they key is part of the profile form then fill it accordingly
                    if (dash_form[key] !== undefined) {
                        dash_form[key].value = profile[key];
                    }
                }
                member();
            } else {
                Add_error(response.error, "sign_in_errors", false);
            }
        },
        error: function (error) {
            Add_error("Unknown error occurred", "sign_in_errors", false);
            console.log(error);
        }
    });
}

function NumbersOnly(evt) {
    evt = (evt) ? evt : window.event;
    var charcode = (evt.which) ? evt.which : evt.keyCode;
    return !(charcode > 31 && (charcode < 48 || charcode > 57));
}

function logout() {
    $.ajax({
        url: "api/",
        type: "POST",
        data: {
            action: "logout"
        },
        dataType: "json",
        success: function (response) {
            if (response.success) {
                sessionStorage.clear();
                Toast(response.message, 6);
                sessionStorage.setItem('state', 'guest');
                member();
            } else {
                Toast(response.error, 6);
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}

var TOAST_LONG = 10;
var TOAST_SHORT = 5;

function update_profile(field, value) {
    $.ajax({
        url: "api/",
        type: "POST",
        data: {
            action: 'update_details',
            field: field,
            value: value
        },
        dataType: "json",
        success: function (response) {
            var form = document.forms.user_dash;
            if (response.success) {
                Toast(response.message, TOAST_SHORT);
                sessionStorage.setItem(field, value);
            } else {
                Toast(response.error, TOAST_SHORT);
                // reset to old value
                form[field].value = sessionStorage.getItem(field);
            }

            personal_profile();
        },
        error: function (error) {
            console.log(error.responseText);
        }
    });
}

function personal_profile() {
    var id = sessionStorage.getItem('ID');
    if (id !== null && id !== undefined) {
        // Update the profile form
        var form = document.forms.user_dash;
        var fields = ['First_Name', 'Last_Name', 'UserName', 'Email', 'Address', 'KRA_PIN'];
        for (var i in fields) {
            var key = fields[i];
            form[key].value = sessionStorage.getItem(key);
        }
    } else {
        // User is not logged in
        sessionStorage.setItem('state', 'guest');
        member();
    }
}

function hide_all() {
    document.querySelector("#member").style.display = "none";
    document.querySelector("#plots").style.display = "none";
    document.querySelector("#houses").style.display = "none";
}

function reserve_house(house_id, amount){
    document.querySelector('#house_id').value = house_id;
    document.querySelector('#to_pay').innerHTML = amount;
    $('#booking_modal').modal('show')
}

function submit_booking() {
    var form = document.forms.booking_form;
    // Convert the form to multipart formdata for submission
    var data = new FormData(form);
    $.ajax({
        type: "POST",
        url: "api/",
        data: data,
        processData: false,
        contentType: false,
        dataType: "json",
        success: function (response) {
            if (response.success) {
                Toast(response.message, 20);
            } else {
                Add_error(response.error, "booking_errors", false);
            }
        },
        error: function (error) {
            Add_error("Unknown error occurred", "booking_errors", false);
            console.log(error);
        }
    });
}

function change_status(house_id, status){
    $.ajax({
        url: "api/",
        type: "POST",
        data: {
            action: 'update_status',
            house_id: house_id,
            status: status
        },
        dataType: "json",
        success: function (response) {
            if (response.success) {
                Toast(response.message, TOAST_SHORT);
            } else {
                Toast(response.error, TOAST_SHORT);
            }
        },
        error: function (error) {
            Toast("Unknown error occurred updating status", TOAST_SHORT);
            console.log(error.responseText);
        }
    });
}

function open_plot(plot_id) {
    var plot = loaded_plots[plot_id];
    document.getElementById("plot_name").innerHTML = plot['name'];
    document.getElementById("plot_id").value = plot['ID'];
    document.getElementById("plot_description").innerHTML = plot['description'];
    console.log(plot['name']);
    $.ajax({
        url: 'api/',
        type: 'POST',
        data: {action:'houses',plot: plot['ID']},
        dataType: 'json',
        success: function (response) {
            if(response.success){
                var houses = response.houses;
                hide_all();
                document.querySelector("#houses").style.display = "block";
                var houses_list = document.querySelector('#all_houses');
                Clear(houses_list);
                for(var i in houses){
                    // $('#state'+houses[i]["ID"]).bootstrapToggle('render');
                    var d1 = document.createElement('div');
                    houses_list.appendChild(d1);
                    d1.className = "col-12 col-md-6 col-lg-4";
                    var d2 = document.createElement('div');
                    d1.appendChild(d2);
                    d2.className = "card card-outline-success";
                    var img = document.createElement('img');
                    d2.appendChild(img);
                    img.src = houses[i]["photo"];
                    img.className = "card-img-top";
                    var d3 = document.createElement("div");
                    var h5 = document.createElement("h5");
                    var h6 = document.createElement("h6");
                    var s1 = document.createElement("strong");
                    var s2 = document.createElement("strong");
                    var s3 = document.createElement("span");
                    var s4 = document.createElement("span");
                    d2.appendChild(d3);
                    d3.appendChild(h5);
                    d3.appendChild(h6);
                    h5.className = "card-title";
                    h6.className = "card-title";
                    d3.className = "card-img-overlay white-shadow text-center";
                    h5.appendChild(new Text(houses[i]["type"]));
                    h6.appendChild(s1);
                    h6.appendChild(document.createElement("br"));
                    h6.appendChild(s3);
                    h6.appendChild(document.createElement("br"));
                    h6.appendChild(s2);
                    h6.appendChild(document.createElement("br"));
                    h6.appendChild(s4);
                    s1.appendChild(new Text("Monthly Rent: "));
                    s2.appendChild(new Text("Reservation Fee: "));
                    s3.appendChild(new Text(houses[i]["monthly_rent"]));
                    s4.appendChild(new Text(houses[i]["booking_amount"]));
                    var d4 = document.createElement("div");
                    var d5 = document.createElement("div");
                    d2.appendChild(d4);
                    d2.appendChild(d5);
                    d4.className = "card-block text-black";
                    d5.className = "card-footer text-center";
                    var a1 = document.createElement("a");
                    a1.className = "btn btn-sm btn-success tenant";
                    a1.href = "#";
                    a1.setAttribute("onclick", "reserve_house("+houses[i]["ID"]+","+houses[i]["booking_amount"]+")");
                    a1.appendChild(new Text("Reserve"));
                    d5.appendChild(a1);
                    var p1 = document.createElement("p");
                    p1.className = "card-text";
                    p1.appendChild(new Text(houses[i]["description"]));
                    d4.appendChild(p1);
                    var select = document.createElement("select");
                    var opt1 = document.createElement("option");
                    var opt2 = document.createElement("option");
                    var opt3 = document.createElement("option");
                    opt1.value = "vacant";
                    opt2.value = "occupied";
                    opt3.value = "booked";
                    opt1.appendChild(new Text("Vacant"));
                    opt2.appendChild(new Text("Occupied"));
                    opt3.appendChild(new Text("Booked"));
                    select.appendChild(opt1);
                    select.appendChild(opt2);
                    select.appendChild(opt3);
                    if(houses[i]["status"] === 'vacant')
                        opt1.setAttribute("selected","selected");
                    else if(houses[i]["status"] === 'booked')
                        opt2.setAttribute("selected","selected");
                    else
                        opt3.setAttribute("selected","selected");
                    d5.appendChild(select);
                    select.className = "form-control landlord";
                    select.setAttribute("onchange","change_status("+houses[i]["ID"]+", this.value)");
                    d5.style.zIndex = "500";
                }
                // Show controls depending on the user
                display_controls();
            }else{
                Toast(response.error);
                console.log(response);
            }
        },
        error: function (error) {
            Toast("Unknown error occurred");
            console.log(error);
        }
    });
}

function member() {
    menu("#m_member");
    hide_all();
    document.querySelector("#member").style.display = "block";
    var memberstate = sessionStorage.getItem("state");
    if (memberstate === undefined || memberstate === null) {
        memberstate = "guest";
    }
    if (memberstate === "guest") {
        document.querySelector("#registration-form").style.display = "none";
        document.querySelector("#login-form").style.display = "block";
        document.querySelector("#reset-password").style.display = "none";
        document.querySelector("#user-dash").style.display = "none";
    } else if (memberstate === "register") {
        document.querySelector("#registration-form").style.display = "block";
        document.querySelector("#login-form").style.display = "none";
        document.querySelector("#reset-password").style.display = "none";
        document.querySelector("#user-dash").style.display = "none";
    } else if (memberstate === "reset-password") {
        document.querySelector("#registration-form").style.display = "none";
        document.querySelector("#login-form").style.display = "none";
        document.querySelector("#reset-password").style.display = "block";
        document.querySelector("#user-dash").style.display = "none";
    } else if (memberstate === "normal") {
        // update profile and display it
        personal_profile();
        document.querySelector("#registration-form").style.display = "none";
        document.querySelector("#login-form").style.display = "none";
        document.querySelector("#reset-password").style.display = "none";
        document.querySelector("#user-dash").style.display = "block";
    }
    display_controls();
}

var display_controls = function () {
    var user_type = sessionStorage.getItem("user_type");
    if (user_type === undefined || user_type === null) {
        user_type = "tenant";
    }
    // Get all the items with class landlord and tenant
    var landlord_items = document.querySelectorAll(".landlord");
    var tenant_items = document.querySelectorAll(".tenant");
    // Hide landlord or tenant items accordingly
    var i;
    var item;
    if (user_type === "tenant") {
        // Hide all items with the class landlord
        for (i in landlord_items) {
            item = landlord_items[i];
            // Confirm that the item really exists. Javascript can be mad sometimes
            if (item.classList !== undefined) {
                // Hide the items
                item.classList.add('d-none');
            }
        }
        // Show all tenants
        for (i in tenant_items) {
            item = tenant_items[i];
            if (item.classList !== undefined) {
                // Check whether the item was hidden and show it
                if (item.classList.contains('d-none')) {
                    item.classList.remove('d-none');
                }
            }
        }
    }
    if (user_type === "landlord") {
        // Hide all items with the class tenant
        for (i in tenant_items) {
            item = tenant_items[i];
            if (item.classList !== undefined) {
                // Hide the items
                item.classList.add('d-none');
            }
        }
        // Show all landlord items
        for (i in landlord_items) {
            item = landlord_items[i];
            if (item.classList !== undefined) {
                // Check whether the item was hidden and show it
                if (item.classList.contains('d-none')) {
                    item.classList.remove('d-none');
                }
            }
        }
    }
};

function add_house(){
    try {
        var form = document.forms.new_house;
        // Convert the form to multipart formdata for submission
        var data = new FormData(form);
        data.append('action', 'add_house');
        member();
        $.ajax({
            type: "POST",
            url: "api/?debug",
            data: data,
            processData: false,
            contentType: false,
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    $('#new_house_modal').modal('hide');
                    open_plot(document.getElementById("plot_id").value);
                    Toast(response.message, TOAST_LONG);
                } else {
                    Add_error(response.error, "add_house_errors", false);
                }
            },
            error: function (error) {
                Add_error("Unknown error occurred", "add_house_errors", false);
                console.log(error);
            }
        });
    }catch(e){
        console.log(e.message);
        console.log(e.stackTrace);
    }
}

function add_plot(){
    try {
        var form = document.forms.add_plot;
        // Convert the form to multipart formdata for submission
        var data = new FormData(form);
        data.append('action', 'add_plot');
        member();
        $.ajax({
            type: "POST",
            url: "api/",
            data: data,
            processData: false,
            contentType: false,
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    $('#new_property_modal').modal('hide');
                    plots();
                    Toast(response.message, TOAST_LONG);
                } else {
                    Add_error(response.error, "add_property_errors", false);
                }
            },
            error: function (error) {
                Add_error("Unknown error occurred", "add_property_errors", false);
                console.log(error);
            }
        });
    }catch(e){
        console.log(e.message);
        console.log(e.stackTrace);
    }
}

var loaded_plots = []; 

function plots() {
    hide_all();
    menu("#m_plots");
    document.querySelector("#plots").style.display = "block";
    var search = document.getElementById("search").value;
    var county = document.getElementById("search_county").value;
    $.ajax({
        url: "api/",
        type: "GET",
        data: {
            action: "plots",
            search: search,
            county: county
        },
        dataType: 'json',
        success: function (response) {
            if(response.success){
                if(response.plots.length > 0){
                    loaded_plots = response.plots;
                    var plots_list = document.querySelector("#all_plots");
                    Clear(plots_list);
                    for(var i in loaded_plots){
                        var row = document.createElement("tr");
                        var cell = document.createElement("td");
                        var img_div = document.createElement("div");
                        var detail_div = document.createElement("div");
                        var img_a = document.createElement("a");
                        var det_a = document.createElement("a");
                        var title = document.createElement("h4");
                        var desc = document.createElement("p");
                        var loc = document.createElement("small");
                        var img = document.createElement("img");
                        row.appendChild(cell);
                        cell.appendChild(img_div);
                        img_div.appendChild(img_a);
                        img_a.appendChild(img);
                        cell.appendChild(detail_div);
                        detail_div.appendChild(det_a);
                        det_a.appendChild(title);
                        detail_div.appendChild(desc);
                        detail_div.appendChild(loc);
                        cell.className = 'row';
                        img_div.className = 'text-center col-sm-12 col-md-4 col-lg-3';
                        img_a.href = '#'+loaded_plots[i]["name"];
                        img.className = 'plot-thumb';
                        detail_div.className = 'text-center text-md-left col-sm-12 col-md-8 col-lg-9';
                        desc.className = 'small';
                        loc.className = 'text-muted';
                        det_a.href = '#'+loaded_plots[i]["name"];
                        det_a.setAttribute("onclick", "open_plot("+i+")");
                        img_a.setAttribute("onclick", "open_plot("+i+")");
                        img.src = loaded_plots[i]["photo"];
                        desc.appendChild(new Text(loaded_plots[i]["description"]));
                        title.appendChild(new Text(loaded_plots[i]["name"]));
                        loc.appendChild(new Text("Location: "+loaded_plots[i]["Town"]+", "+loaded_plots[i]["Ward"]+", "+loaded_plots[i]["Constituency"]));
                        plots_list.appendChild(row);
                    }
                }else{
                    Toast("No places found for current search criteria");
                }
            }else{
                Toast(response.error, TOAST_LONG);
            }
        },
        error: function (error) {
            Toast("Unknown error occurred",TOAST_LONG);
            console.log(error);
        }
    });
}

function menu(choice) {
    if (document.querySelector("#m_plots").classList.contains("active"))
        document.querySelector("#m_plots").classList.remove("active");
    if (document.querySelector("#m_member").classList.contains("active"))
        document.querySelector("#m_member").classList.remove("active");
    document.querySelector(choice).classList.add("active");
}

function setup_locations() {
    $.ajax({
        url: "api/?action=location",
        dataType: "json",
        success: function (response) {
            if(response.success){
                var counties = response.location["counties"];
                var constituency = response.location["constituencies"];
                var wards = response.location["wards"];
                // sort by name
                counties.sort(function(a, b) {
                    var nameA = a.County.toUpperCase(); // ignore upper and lowercase
                    var nameB = b.County.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB)
                        return -1;
                    if (nameA > nameB)
                        return 1;
                    // names must be equal
                    return 0;
                });
                constituency.sort(function(a, b) {
                    var nameA = a.SubCounty.toUpperCase(); // ignore upper and lowercase
                    var nameB = b.SubCounty.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB)
                        return -1;
                    if (nameA > nameB)
                        return 1;
                    // names must be equal
                    return 0;
                });
                wards.sort(function(a, b) {
                    var nameA = a.Ward.toUpperCase(); // ignore upper and lowercase
                    var nameB = b.Ward.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB)
                        return -1;
                    if (nameA > nameB)
                        return 1;
                    // names must be equal
                    return 0;
                });
                var county_loc = document.getElementById("county");
                var county_loc_2 = document.getElementById("search_county");
                var const_loc = document.getElementById("constituency");
                var ward_loc = document.getElementById("ward");
                Clear(county_loc);
                Clear(const_loc);
                Clear(ward_loc);
                var i;
                var opt;
                for(i in counties){
                    opt = document.createElement("option");
                    opt.value = counties[i]["id"];
                    opt.appendChild(new Text(counties[i]["County"]));
                    county_loc.appendChild(opt);
                }
                // Add a blank county to the search box
                opt = document.createElement("option");
                opt.value = "";
                opt.appendChild(new Text("All Counties"));
                county_loc_2.appendChild(opt);
                for(i in counties){
                    opt = document.createElement("option");
                    opt.value = counties[i]["id"];
                    opt.appendChild(new Text(counties[i]["County"]));
                    county_loc_2.appendChild(opt);
                }
                for(i in constituency){
                    opt = document.createElement("option");
                    opt.value = constituency[i]["id"];
                    opt.appendChild(new Text(constituency[i]["SubCounty"]));
                    const_loc.appendChild(opt);
                }
                for(i in wards){
                    opt = document.createElement("option");
                    opt.value = wards[i]["id"];
                    opt.appendChild(new Text(wards[i]["Ward"]));
                    ward_loc.appendChild(opt);
                }
            }
        },
        error: function (error) {
            Add_error("Unknown error occurred", "sign_in_errors", false);
            console.log(error);
        }
    });
}

function init() {

    // refresh_logged();
    plots();
    setup_locations();
    display_controls();
    // get_questions();
}