/**
 * Created by Zuhura on 4/10/2017.
 */

var timer;

var position = 0;

function change_password() {
    var old = document.querySelector("#old_pass").value;
    var newp = document.querySelector("#new_pass").value;
    var conf = document.querySelector("#conf_pass").value;
    if(newp.length <8) {
        if(newp === conf) {
            $.ajax({
                url: "/api?action=change_password",
                type: "POST",
                data: {
                    old_password: old,
                    new_password: newp
                },
                dataType: "json",
                success: function (response) {
                    if (response.success) {
                        $('#password_modal').modal('hide');
                        Add_success(response.message, "pass_change_errors", false);
                    } else {
                        Add_error(response.error, "pass_change_errors", false);
                    }
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

// Prevent the default action when the form submits and do your own
$("form[name='sign_up_form']").submit(function(e){
    e.preventDefault();
    try {
        var form = document.querySelector("#registration-form");
        var formdata = new FormData(form);
        formdata.append("action","register");
        console.log(formdata);
        console.log(formdata.getAll('UserType'));
        var pass = form.Password.value;
        var pass_conf = form.confirmation_pw.value;
        var terms = form.accept_terms.checked;
        if (terms) {
            if (pass === pass_conf) {
                $.ajax({
                    type: "POST",
                    url: "api",
                    data: formdata,
                    enctype: 'multipart/form-data',
                    cache: false,
                    processData: false, // Required when using formdata
                    contentType: false, // Required when using formdata
                    dataType: "json",
                    success: function (response) {
                        if (response.success) {
                            Toast(response.message, TOAST_SHORT);
                            // Redirect the user to login
                            sessionStorage.setItem('state', 'guest');
                            member();
                        } else {
                            console.log(response);
                            Add_error(response.error, "sign_up_errors", false);
                        }
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
});

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
    var formdata = new FormData(form);
    var user_type = form.UserType.value;
    member();
    $.ajax({
        type: "POST",
        url: "/api?action=login",
        data: formdata,
        dataType: "json",
        success: function (response) {
            if(response.success){
                sessionStorage.setItem('state','normal');
                var profile = response.user.profile;
                for(var key in profile){
                    // Save the profile sent as part of the browser's data
                    sessionStorage.setItem(key, profile[key]);
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
    console.log("Logging out");
    var token = sessionStorage.getItem("token");
    sessionStorage.setItem('state','guest');
    member();
    /*
    $.ajax({
        url: "api.php",
        type: "POST",
        data: {
            action: "logout",
            token: token
        },
        dataType: "json",
        success: function (response) {
            sessionStorage.clear();
            Toast(response.message,6);
            document.querySelector("#mlink").innerHTML = "Member";
                member();
            console.log("Logged out");
        },
        error: function (error) {
            console.log(error);
        }
    });
    */
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
    console.log("Why???");
    $.ajax({
        url: "api.php",
        type: "POST",
        data: {
            action: "update-profile",
            token: sessionStorage.getItem("token"),
            field: field,
            value: value
        },
        dataType: "json",
        success: function (response) {
            Toast(response.message,TOAST_SHORT);
            personal_profile();
        },
        error: function (error) {
            console.log(error.responseText);
        }
    });
}

function personal_profile(){
    $.ajax({
        url: "api.php",
        type: "POST",
        data: {
            token: sessionStorage.getItem("token"),
            action: "personal-profile"
        },
        dataType: "json",
        success: function (response) {
            if(response.success){
                var profile = document.forms.user_dash;
                profile.pr_uname.value = response.user.user_name;
                profile.pr_email.value = response.user.email_address;
                profile.pr_fname.value = response.user.full_name;
                profile.pr_address.value = response.user.address;
                profile.pr_org.value = response.user.organization;
                document.querySelector("#mlink").innerHTML = response.user.user_name;
                var about = response.user.extras;
                if(about !== null && about !==undefined) {
                    if (about.length > 5) {
                        p_extra = JSON.parse(about);
                        if (p_extra.about !== undefined) {
                            profile.pr_about.value = p_extra.about;
                        }
                    }
                }
                sessionStorage.setItem("user", response.user.user_name);
            }else{
                console.log(response.message);
            }
        },
        error:function (error) {
            console.log(error);
        }
    });
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
        document.querySelector("#registration-form").style.display = "none";
        document.querySelector("#login-form").style.display = "none";
        document.querySelector("#reset-password").style.display = "none";
        document.querySelector("#user-dash").style.display = "block";
    }
}

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
    // get_questions();
}