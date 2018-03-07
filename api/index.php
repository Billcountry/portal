<?php
/*
 * This is the API that will be used to interact between the database and the front end
 */
if(isset($_POST['debug']) || isset($_GET['debug']))
    ini_set("display_errors","on");

session_start();
class Api{
	private $conn;

	// This function creates a database connection that can be used by other functions to fetch data
	function __construct(){
		$this->conn = mysqli_connect("localhost", "admin", "password", "rental_system");
	}

	function check_array($keys, $array){
		// This function checks whether all the required keys are set
		$success = true;
		foreach($keys as $key){
			// This is the equivalent of checking if isset($_GET['name'])
			if(!isset($array[$key])){
				$success = false;
				// We break out of the loop since the test has failed
				break;
			}
		}
		return $success;
	}

	function add_user(){
		$success = false;
		$message = "An error occurred";
		// These are the variables the function expects to be sent by the user
		$variables = ['First_Name', 'Last_Name', 'UserName', 'Email', 'Address', 'KRA_PIN', 'Password', 'UserType'];
		// The following will check if the required variables are sent as part of HTTP Post
		if($this->check_array($variables, $_POST)){
			// Create a mysql statement
			$stmt = $this->conn->stmt_init();
			// Prepare the statement to add the data

			// Check whether the user is a landlord or a tenant and read from the right table
			if($_POST['UserType'] == 'tenant'){
				$stmt->prepare("INSERT INTO tenant (First_Name, Last_Name, UserName, 
			  Email, Address, KRA_PIN, Password) VALUES (?, ?, ?, ?, ?, ?, ?)");
			}else{
				$stmt->prepare("INSERT INTO landlord (First_Name, Last_Name, UserName, 
			  Email, Address, KRA_PIN, Password) VALUES (?, ?, ?, ?, ?, ?, ?)");
			}
			// Encrypt the password to ensure it's not readable by anyone
			$password = sha1($_POST['Password']);
			// Bind the parameters sent to the statement
			if($stmt->bind_param("sssssss", $_POST['First_Name'],
				$_POST['Last_Name'], $_POST['UserName'], $_POST['Email'],
				$_POST['Address'], $_POST['KRA_PIN'], $password)){
				// Execute the statement
				if($stmt ->execute()){
					// Equate success to true since there were no errors
					$message = "User added successfully";
					$success = true;
				}else{
					$message = $stmt->error;
				}
			}else{
				$message = $stmt->error;
			}
		}else{
			$message = "Please provide all the required variables i.e.: 'First_Name', 'Last_Name', 'UserName', 'Email', 'Address', 'KRA_PIN', 'Password', 'UserType'";
		}

		if($success){
			return array("success"=>true, "message"=>$message);
		}
		return array("success"=>false, "error"=>$message);
	}

	function login(){
		$success = false;
		$variables = ['Email','Password', 'UserType'];
		if($this->check_array($variables, $_POST)){
			$password = sha1($_POST['Password']);
			$stmt = $this->conn->stmt_init();
			// Check whether the user is a landlord or a tenant and read from the right table
			if($_POST['UserType'] == 'tenant'){
				$user_type = "tenant";
				$stmt->prepare("SELECT ID, First_Name, Last_Name, UserName, Email, Address, KRA_PIN FROM tenant WHERE Email=? AND Password=?");
			}else{
				$user_type = "landlord";
				$stmt->prepare("SELECT ID, First_Name, Last_Name, UserName, Email, Address, KRA_PIN FROM landlord WHERE Email=? AND Password=?");
			}
			if($stmt->bind_param("ss", $_POST['Email'], $password)){
				if($stmt->execute()){
					// Read the results from the query execution
					if($result = $stmt->get_result()){
						// Check if any results were returned
						if($result->num_rows){
							// Get the results
							$profile = $result->fetch_assoc();
							$user_id = $profile['ID'];
							$message = array("profile"=>$profile, "user_id"=>$user_id);
							$success = true;
							$_SESSION['logged_in'] = true;
							$_SESSION["user_id"] = $user_id;
							$_SESSION["user_type"] = $user_type;
						}else{
							$message = "Invalid username or password";
						}
					}else{
						$message = $stmt->error;
					}
				}else{
					$message = $stmt->error;
				}
			}else{
				$message = $stmt->error;
			}
		}else{
			$message = "Required variables not satisfied: ['Email','Password', 'UserType']";
		}
		if($success){
			return array("success"=>true, "user"=>$message);
		}
		return array("success"=>false, "error"=>$message);
	}

	function change_password(){
        $variables = ['new_password', 'old_password'];
        $success = false;
        $message = null;
        // Check whether all data was sent
        if($this->check_array($variables, $_POST)) {
            // Check whether the user is logged in
            if ($this->check_array(['user_id', 'user_type', 'logged_in'], $_SESSION)) {
                    $stmt = $this->conn->stmt_init();
                    if ($_SESSION['user_type'] == 'landlord') {
                        $stmt->prepare("UPDATE landlord SET Password=? WHERE Password=? AND ID={$_SESSION['user_id']}");
                    } else {
                        $stmt->prepare("UPDATE tenant SET Password=? WHERE Password=? AND ID={$_SESSION['user_id']}");
                    }
                    $old = sha1($_POST['old_password']);
                    $new = sha1($_POST['new_password']);
                    if($stmt->bind_param('ss',$new,$old)){
                        if($stmt->execute()){
                            if($stmt->affected_rows>0){
                                $success = true;
                                $message = "Password updated successfully";
                            }else{
                                $message = "Wrong password";
                            }
                        }else{
                            $message = $stmt->error;
                        }
                    }else{
                        $message = $stmt->error;
                    }
            }else{
                $message = "You must be logged in to perform this action";
            }
        }else{
            $message = "Missing required parameters: ['old_password', 'new_password']";
        }
        if($success){
            return array("success"=>true, "message"=>$message);
        }
        return array("success"=>false, "error"=>$message);
    }

	function logout(){
        if(session_destroy()){
            return array("success"=>true, "message"=>"User logged out successfully");
        }
        return array("success"=>false, "error"=>"Session Error");
    }

	function update_profile(){
		$variables = ['field', 'value'];
		$success = false;
		// Check whether all data was sent
		if($this->check_array($variables, $_POST)) {
			// Check whether the user is logged in
			if ($this->check_array(['user_id', 'user_type', 'logged_in'], $_SESSION)) {
				$updatable = ['First_Name', 'Last_Name', 'UserName', 'Address'];
				// Check whether the sent field is updatable
				if(in_array($_POST['field'], $updatable)){
					$stmt = $this->conn->stmt_init();
					$stmt->prepare("UPDATE {$_SESSION['user_type']} SET {$_POST['field']} = ? WHERE ID={$_SESSION['user_id']}");
					if($stmt->bind_param("s", $_POST['value'])){
						if($stmt->execute()){
							$success = true;
							$message = "{$_POST['field']} updated successfully";
						}else{
							$message = $stmt->error;
						}
					}else{
						$message = $stmt->error;
					}
				}else{
					$message = "Invalid field specified";
				}
			}else{
				$message = "User must be logged in to perform this action";
			}
		}else{
			$message = "Please provide all the required variables, i.e. ['field', 'value']";
		}
		if($success){
			return array("success"=>true, "message"=>$message);
		}
		return array("success"=>false, "error"=>$message);
	}

	function create_property(){
        $variables = ['name', 'description', 'location', 'county', 'Constituency', 'Ward', 'Town'];
        $success = false;
        $message = null;
        // Check whether all data was sent
        if($this->check_array($variables, $_POST)) {
            // Check whether the user is logged in
            if ($this->check_array(['user_id', 'user_type', 'logged_in'], $_SESSION)) {
                if($_SESSION['user_type'] == 'landlord'){
                    $image = $this->upload_image('image');
                    // Get the link to an image or create a blank image
                    if($image["success"])
                        $photo = "api/".$image['image_name'];
                    else
                        $photo = $image['image_name'];
                    $stmt = $this->conn->prepare("INSERT INTO plots (name, description, landlord, county, Constituency, Ward, Town, photo) VALUES (?,?,?,?,?,?,?,?)");
                    if($stmt->bind_param("ssiiiiss", $_POST['name'], $_POST['description'], $_SESSION['user_id']
                        , $_POST['county'], $_POST['Constituency'], $_POST['Ward'], $_POST['Town'], $photo)){
                        if($stmt->execute()){
                            $success = true;
                            $message = "Property added successfully";
                        }else{
                            $message = $stmt->error;
                        }
                    }else{
                        $message = $stmt->error;
                    }
                }else{
                    $message = "Only a landlord can create property";
                }
            }else{
                $message = "User must be logged in to perform this action";
            }
        }else{
            $message = "Please provide all the required variables, i.e. ['name', 'description', 'location', 'county', 'Constituency', 'Ward', 'Town']";
        }
        if($success){
            return array("success"=>true, "message"=>$message);
        }
        return array("success"=>false, "error"=>$message);
    }

    // Checks whether the plot specified belongs to the logged in landlord
    function check_plot($plot){
	    $stmt = $this->conn->prepare("SELECT ID FROM plots WHERE landlord=? AND ID=?");
	    if($stmt->bind_param("ii", $_SESSION['user_id'], $plot)){
	        if($stmt->execute()){
	            if($result = $stmt->get_result()){
	                if($result->num_rows==1){
	                    return true;
                    }
                }
            }
        }
        return false;
    }

    function create_house(){
        $variables = ['type', 'description', 'monthly_rent', 'booking_amount', 'plot'];
        $success = false;
        $message = null;
        // Check whether all data was sent
        if($this->check_array($variables, $_POST)) {
            // Check whether the user is logged in
            if ($this->check_array(['user_id', 'user_type', 'logged_in'], $_SESSION)) {
                if($_SESSION['user_type'] == 'landlord' && $this->check_plot($_POST['plot'])){
                    $image = $this->upload_image('image');
                    // Get the link to an image or create a blank image
                    if($image["success"])
                        $photo = "api/".$image['image_name'];
                    else
                        $photo = $image['image_name'];
                    $stmt = $this->conn->prepare("INSERT INTO houses(type, monthly_rent, booking_amount, description, photo, plot) VALUES (?,?,?,?,?,?,?,?)");
                    if($stmt->bind_param("sddssi", $_POST['type'], $_POST['monthly_rent'], $_POST['booking_amount'], $_POST['description']
                        ,$photo, $_POST['plot'])){
                        if($stmt->execute()){
                            $success = true;
                            $message = "House added successfully";
                        }else{
                            $message = $stmt->error;
                        }
                    }else{
                        $message = $stmt->error;
                    }
                }else{
                    $message = "Only a landlord can create property";
                }
            }else{
                $message = "User must be logged in to perform this action";
            }
        }else{
            $message = "Please provide all the required variables, i.e. ['field', 'value']";
        }
        if($success){
            return array("success"=>true, "message"=>$message);
        }
        return array("success"=>false, "error"=>$message);
    }

    function houses(){
        $success = false;
        if(isset($_POST['plot'])){
            // Determine whether to present the houses to a landlord or tenant
            $user_type = 'tenant';
            if(isset($_SESSION['logged_in'], $_SESSION['user_id']))
                if($_SESSION['user_type'] == 'landlord')
                    if($this->check_plot($_POST['plot']))
                        $user_type = 'landlord';
            $stmt = $this->conn->stmt_init();
            $preped = true;
            if($user_type == 'landlord'){
                // Get all the houses in that plot
                $stmt->prepare("SELECT ID type, monthly_rent, booking_amount, description, status, photo FROM houses WHERE plot={$_POST['plot']}");
            }else{
                // Get the vacant houses in the plot
                $stmt->prepare("SELECT ID type, monthly_rent, booking_amount, description, status, photo FROM houses WHERE plot=? AND status='vacant'");
                if(!$stmt->bind_param('i', $_POST['plot']))
                    $preped = false;
            }
            if($preped) {
                if ($stmt->execute()) {
                    if ($result=$stmt->get_result()) {
                        $message = [];
                        $success = true;
                        while ($row=$result->fetch_assoc())
                            array_push($message, $row);
                    }else{
                        $message = $stmt->error;
                    }
                }else{
                    $message = $stmt->error;
                }
            }else{
                $message = $stmt->error;
            }
        }else{
            $message = "Please provide all the required variables, i.e. ['plot']";
        }
        if($success){
            return array("success"=>true, "houses"=>$message);
        }
        return array("success"=>false, "error"=>$message);
    }

    function plots(){
        $success = false;
        $stmt = $this->conn->stmt_init();
        // Determine whether to present the plots to a landlord or tenant
        $user_type = 'tenant';
        if(isset($_SESSION['logged_in'], $_SESSION['user_id']))
            if($_SESSION['user_type'] == 'landlord')
                $user_type = 'landlord';
        if($user_type=='landlord'){
            $stmt->prepare("SELECT ID, name, description, county, Constituency, Ward, Town, photo FROM plots WHERE landlord={$_SESSION['user_id']}");
        }else{
            // Only select approved plots that have vacant houses
            $stmt->prepare("
                SELECT DISTINCT(plot) AS ID, name, plots.description AS description,
                county, Constituency, Ward, Town, plots.photo AS photo
                FROM houses 
                INNER JOIN plots ON houses.plot = plots.ID
                WHERE status='vacant' AND approved=TRUE 
            ");
        }
        // Execute the statement and return the results
        if($stmt->execute()){
            if($result=$stmt->get_result()){
                $message = [];
                $success = true;
                // Fetch each row and add it to message
                while($row = $result->fetch_assoc()){
                    array_push($message, $row);
                }
            }else{
                $message = $stmt->error;
            }
        }else{
            $message = $stmt->error;
        }
        if($success){
            return array("success"=>true, "plots"=>$message);
        }
        return array("success"=>false, "error"=>$message);
    }

    function upload_image($file){
        if(isset($_FILES[$file])) {
            $name = $_FILES[$file]['name'];
            $tmp_name = $_FILES[$file]['tmp_name'];
            // Confirm that the file is an image
            // Code from: https://secure.php.net/manual/en/features.file-upload.php
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            if (false === $ext = array_search(
                    $finfo->file($_FILES[$file]['tmp_name']),
                    array(
                        'jpg' => 'image/jpeg',
                        'png' => 'image/png',
                        'gif' => 'image/gif',
                    ),
                    true
                )) {
                $error = "Invalid file format";
            } else {
                $location = "uploads/";
                $new_name = $location . time() . "-" . rand(1000, 9999) . "-" . $name;
                if (move_uploaded_file($tmp_name, $new_name)) {
                    return array("success" => true, "image_name" => $new_name);
                } else {
                    $error = "Unable to upload the given file";
                }
            }
            return array("success" => false, "image_name" => "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8dPv2fwAImAOJMh4kwgAAAABJRU5ErkJggg==");
        }
        // Set a default blank image if the image was not sent
        return array("success" => false, "image_name" => "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8dPv2fwAImAOJMh4kwgAAAABJRU5ErkJggg==");
    }
}

// This functions checks the action specified by the user and executes the right function from the class api
function main(){
	$action = 'none';
	$api = new Api();
	if(isset($_POST['action'])){
		$action = $_POST['action'];
	}
	if(isset($_GET['action'])){
		$action = $_GET['action'];
	}
	switch($action){
		case "login":
			return $api->login();
		case "logout":
			return $api->logout();
		case "change_password":
			return $api->change_password();
		case "update_details":
			return $api->update_profile();
		case "register":
			return $api->add_user();
		case "add_plot":
			return $api->create_property();
		case "add_house":
			return $api->create_house();
		case "plots":
			return $api->plots();
		case "houses":
			return $api->houses();
		default:
			return array("success"=>false, "error"=>"Unknown action specified, please retry");
	}
}

// Tell the user's browser that this api returns JSON formatted content
header('Content-Type: text/json');
// Convert the array produced from main to JSON
echo json_encode(main(), JSON_PRETTY_PRINT);