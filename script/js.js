/**
 * Created by Zuhura on 4/10/2017.
 */

var timer;

var position = 0;

function change_password() {
    var old = document.querySelector("#old_pass").value;
    var newp = document.querySelector("#new_pass").value;
    var conf = document.querySelector("#conf_pass").value;
    if(newp.length >= 8) {
        if(newp === conf) {
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
        }else{
            Add_error("Passwords do not match", "pass_change_errors", false);
        }
    }else{
        Add_error("Password too short", "pass_change_errors", false);
    }
}

function Toast(message,length)
{
    clearTimeout(timer);
    document.getElementById("message").innerHTML = message;
    document.getElementById("toast").style.display = "block";
    timer = setInterval(function() {
        document.getElementById("message").innerHTML = "";
        document.getElementById("toast").style.display = "none";
        clearTimeout(timer);
    },(length*1000));
    var a = {a:1, b:2};
}

function Add_error(error, location, append) 
{
    var close = document.createElement("button");
    close.setAttribute("type","button");
    close.setAttribute("class","close");
    close.setAttribute("data-dismiss","alert");
    close.setAttribute("aria-label","Close");
    var span = document.createElement("span");
    span.setAttribute("aria-hidden","true");
    span.setAttribute("class","material material-close-circle");
    close.appendChild(span);

    var div = document.createElement("div");
    var text = document.createTextNode(error);
    div.appendChild(close);
    div.appendChild(text);
    div.setAttribute("class","alert alert-danger alert-dismissible fade show");
    div.setAttribute("role","alert");

    location = document.querySelector("#"+location);
    if(append){

        location.appendChild(div);
    }else{
        while (location.hasChildNodes()) {
            location.removeChild(location.lastChild);
        }
        location.appendChild(div);
    }
}

function Add_success(message, location, append)
{
    var close = document.createElement("button");
    close.setAttribute("type","button");
    close.setAttribute("class","close");
    close.setAttribute("data-dismiss","alert");
    close.setAttribute("aria-label","Close");
    var span = document.createElement("span");
    span.setAttribute("aria-hidden","true");
    span.setAttribute("class","material material-close-circle");
    close.appendChild(span);

    var div = document.createElement("div");
    var text = document.createTextNode(message);
    div.appendChild(close);
    div.appendChild(text);
    div.setAttribute("class","alert alert-success alert-dismissible fade show");
    div.setAttribute("role","alert");

    location = document.querySelector("#"+location);
    if(append){

        location.appendChild(div);
    }else{
        while (location.hasChildNodes()) {
            location.removeChild(location.lastChild);
        }
        location.appendChild(div);
    }
}

var working = 0;

function add_job(desc) 
{
    var loader = document.querySelector("#loader");
    var span = document.createElement("span");
    span.appendChild(document.createTextNode(desc));
    loader.appendChild(span);
    working += 1;
    loader.style.visibility = "visible";
    return loader.childNodes.length -1;
}

function remove_job(id)
{
    var loader = document.querySelector("#loader");
    var span = loader.childNodes[id];
    span.style.display = "none";
    working -= 1;
    if(working===0){
        loader.style.visibility = "hidden";
    }
}

function Clear(location)
{
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
    }catch(e){
        window.open("http://stackoverflow.com/search?q=[js]+"+e.message,'_blank');
    }
}

function Resendconf(){
    var token = sessionStorage.getItem("token");
    var job = add_job("Sending mail...");
    $.ajax({
        url: "api.php",
        type: "POST",
        data: {token: token, action: "resend-code"},
        dataType: "json",
        success: function (response) {
            if(response.success){
                Add_success(response.message,"email_confirm_error", false);
            }else{
                Add_error(response.message,"email_confirm_error",false);
            }
            remove_job(job);
        },
        error: function (response) {
            remove_job(job);
        }
    });
}

function refresh_logged() {
    var token = sessionStorage.getItem("token");
    if(token !== undefined && token !== null){
        $.ajax({
            url: "api.php",
            type: "POST",
            data: {
                token: token,
                action: "current"
            },
            success: function (response) {
                if(response.success){
                    sessionStorage.setItem("token", response.user.token);
                    sessionStorage.setItem("user_id", response.user.user_id);
                    sessionStorage.setItem("user", response.user.user);
                    sessionStorage.setItem("email", response.user.email);
                    sessionStorage.setItem("state", response.user.state);
                    document.querySelector("#mlink").innerHTML = response.user.user;
                }else{
                    sessionStorage.clear();
                    console.log(response.message);
                    document.querySelector("#mlink").innerHTML = "Members";
                }
            }
        });
    }else{
        sessionStorage.clear();
        document.querySelector("#mlink").innerHTML = "Members";
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
            if(response.success){
                sessionStorage.setItem('state','normal');
                sessionStorage.setItem('user_type',user_type);
                var profile = response.user.profile;
                var dash_form = document.forms.user_dash;
                for(var key in profile){
                    // Save the profile sent as part of the browser's data
                    sessionStorage.setItem(key, profile[key]);
                    // Check whether they key is part of the profile form then fill it accordingly
                    if(dash_form[key] !== undefined){
                        dash_form[key].value = profile[key];
                    }
                }
                member();
            }else{
                Add_error(response.error, "sign_in_errors",false);
            }
        },
        error: function (error) {
            Add_error("Anknown error occured", "sign_in_errors",false);
            console.log(error);
        }
    });
}

function Numbersonly(evt){
    evt = (evt)? evt:window.event;
    var charcode = (evt.which)?evt.which:evt.keyCode;
    return !(charcode>31 && (charcode<48 || charcode>57));
}

function reset_password(){
    var job = add_job("Resetting Password...");
    var mail = document.querySelector("#reset_email").value;
    $.ajax({
        url: "api.php",
        type: "POST",
        data: {
            action: "reset-password",
            email: mail
        },
        dataType: "json",
        success: function (response) {
            if(response.success){
                Add_success(response.message,"password_reset_error",false);
            }else{
                Add_error(response.message,"password_reset_error",false);
            }
            remove_job(job);
        },
        error: function (error) {
            remove_job(job);
            console.log(error.responseText);
        }
    });
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
            if(response.success) {
                sessionStorage.clear();
                Toast(response.message, 6);
                sessionStorage.setItem('state','guest');
                member();
            }else{
                Toast(response.error, 6);
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function confirm_email() {
    var job = add_job("Confiming email...");
    console.log("Confiming email...");
    var c_code = document.querySelector("#confirmation_code").value;
    var token = sessionStorage.getItem("token");
    $.ajax({
        url: "api.php",
        type: "POST",
        data: {
            token: token,
            code: c_code,
            action: "confirm-code"
        },
        dataType: "json",
        success: function (response) {
            if(response.success){
                sessionStorage.setItem("token", response.user.token);
                sessionStorage.setItem("user_id", response.user.user_id);
                sessionStorage.setItem("user", response.user.user);
                sessionStorage.setItem("email", response.user.email);
                sessionStorage.setItem("state", response.user.state);
                member();
            }else{
                Add_error(response.message,"email_confirm_error",false);
            }
            remove_job(job);
        },
        error: function () {
            remove_job(job);
        }
    });
}

var p_extra = {};
var TOAST_LONG = 10;
var TOAST_SHORT = 5;

function update_profile(field, value){
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
            if(response.success){
                Toast(response.message,TOAST_SHORT);
                sessionStorage.setItem(field, value);
            }else{
                Toast(response.error,TOAST_SHORT);
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

function personal_profile(){
    var id = sessionStorage.getItem('ID');
    if(id !== null && id !== undefined){
        // Update the profile form
        var form = document.forms.user_dash;
        var fields = ['First_Name', 'Last_Name', 'UserName', 'Email', 'Address', 'KRA_PIN'];
        for(var i in fields){
            var key = fields[i];
            form[key].value = sessionStorage.getItem(key);
        }
    }else{
        // User is not logged in
        sessionStorage.setItem('state','guest');
        member();
    }
}

function hide_all() {
    document.querySelector("#member").style.display = "none";
    document.querySelector("#home").style.display = "none";
}

function member() {
    menu("#m_member");
    hide_all();
    document.querySelector("#member").style.display = "block";
    var memberstate = sessionStorage.getItem("state");
    if(memberstate === undefined || memberstate === null){
        memberstate = "guest";
    }
    if(memberstate === "guest"){
        document.querySelector("#registration-form").style.display = "none";
        document.querySelector("#login-form").style.display = "block";
        document.querySelector("#reset-password").style.display = "none";
        document.querySelector("#user-dash").style.display = "none";
    }else if(memberstate === "register"){
        document.querySelector("#registration-form").style.display = "block";
        document.querySelector("#login-form").style.display = "none";
        document.querySelector("#reset-password").style.display = "none";
        document.querySelector("#user-dash").style.display = "none";
    }else if(memberstate === "reset-password"){
        document.querySelector("#registration-form").style.display = "none";
        document.querySelector("#login-form").style.display = "none";
        document.querySelector("#reset-password").style.display = "block";
        document.querySelector("#user-dash").style.display = "none";
    }else if(memberstate === "normal"){
        // update profile and display it
        personal_profile();
        document.querySelector("#registration-form").style.display = "none";
        document.querySelector("#login-form").style.display = "none";
        document.querySelector("#reset-password").style.display = "none";
        document.querySelector("#user-dash").style.display = "block";
    }
    display_controls();
}

var display_controls = function(){
    var user_type = sessionStorage.getItem("user_type");
    if(user_type === undefined || user_type === null){
        user_type = "tenant";
    }
    // Get all the items with class landlord and tenant
    var landlord_items = document.querySelectorAll(".landlord");
    var tenant_items = document.querySelectorAll(".tenant");
    // Hide landlord or tenant items accordingly
    var i;
    var item;
    if(user_type === "tenant"){
        // Hide all items with the class landlord
        for(i in landlord_items){
            item = landlord_items[i];
            // Confirm that the item really exists. Javascript can be mad sometimes
            if(item.classList !== undefined){
                // Hide the items
                item.classList.add('d-none');
            }
        }
        // Show all tenants
        for(i in tenant_items){
            item = tenant_items[i];
            if(item.classList !== undefined){
                // Check whether the item was hidden and show it
                if(item.classList.contains('d-none')){
                    item.classList.remove('d-none');
                }
            }
        }
    }
    if(user_type === "landlord"){
        // Hide all items with the class tenant
        for(i in tenant_items){
            item = tenant_items[i];
            if(item.classList !== undefined){
                // Hide the items
                item.classList.add('d-none');
            }
        }
        // Show all landlord items
        for(i in landlord_items){
            item = landlord_items[i];
            if(item.classList !== undefined){
                // Check whether the item was hidden and show it
                if(item.classList.contains('d-none')){
                    item.classList.remove('d-none');
                }
            }
        }
    }
};

function home() {
    hide_all();
    menu("#m_home");
    document.querySelector("#home").style.display = "block";
}

function menu(choice) {
    if(document.querySelector("#m_home").classList.contains("active"))
        document.querySelector("#m_home").classList.remove("active");
    if(document.querySelector("#m_member").classList.contains("active"))
        document.querySelector("#m_member").classList.remove("active");
    document.querySelector(choice).classList.add("active");
}

function init(){

    // refresh_logged();
    home();
    display_controls();
    // get_questions();
}