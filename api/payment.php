<?php
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

$api_key = "7b9e472073508520c31aaff4074961bd";
$api_sign = "gUNNFPcF8FTdwH5kGhJ883izj1ijrBUjRssg/MmByna51kUHoKyzGLtO2Jvb6FyIEnVvDmCZ6wN8Ae3zXTCuQUErN5so/yz3opOwmKwxG/YDExrsLyPpvbvl3tfYNnjE7FOIDOD7TYRGdrSP85OcIVaLmgusuma923h704RDnPs=";
$conn = mysqli_connect("localhost", "rentalpo_user", "5trongPass", "rentalpo_db");
// Keys sent by lipisha
$initiate = ['api_key','api_signature','api_version','api_type(Initiate)','transaction','transaction_reference','transaction_type','transaction_country','transaction_method','transaction_date','transaction_currency','transaction_amount','transaction_paybill','transaction_paybill_type','transaction_account','transaction_account_number','transaction_account_name','transaction_merchant_reference','transaction_name','transaction_mobile','transaction_email','transaction_code','transaction_status'];
if(check_array(['api_key','api_signature','api_version','api_type','transaction_amount','transaction_mobile','transaction_code'],$_POST)){
    if($_POST['api_type'] == 'Initiate'){
        // Confirm that the request is authentic
        if($_POST['api_key']==$api_key && $_POST['api_signature']==$api_sign){
            $data = json_encode($_POST, JSON_PRETTY_PRINT);
            $stmt = $conn->prepare("INSERT INTO transactions (transaction_no, details, amount) VALUES (?,?,?)");
            $stmt->bind_param('ssd',$_POST['transaction_code'],$data,$_POST['transaction_amount']);
            $stmt->execute();
            // Response
            echo json_encode(array(
                'api_key'=>$api_key,
                'api_signature'=>$api_sign,
                'api_version'=>$_POST['api_version'],
                'api_type'=>'Receipt',
                'transaction'=>$_POST['transaction'],
                'transaction_reference'=>$_POST['transaction_reference'],
                'transaction_status_code'=>'001',
                'transaction_status'=>'SUCCESS',
                'transaction_status_description'=>"Payment for house booking",
                'transaction_status_action'=>'ACCEPT',
                'transaction_status_reason'=>'VALID_TRANSACTION'
            ), JSON_PRETTY_PRINT);
        }else{
            echo "Sorry, we don't know you";
        }
    }else{
        echo "Done";
    }
}else{
    echo "Done";
}