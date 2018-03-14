<?php
/**
 * Created by PhpStorm.
 * User: country
 * Date: 3/14/18
 * Time: 8:16 PM
 */

$api_key = "7b9e472073508520c31aaff4074961bd";
$api_sign = "gUNNFPcF8FTdwH5kGhJ883izj1ijrBUjRssg/MmByna51kUHoKyzGLtO2Jvb6FyIEnVvDmCZ6wN8Ae3zXTCuQUErN5so/yz3opOwmKwxG/YDExrsLyPpvbvl3tfYNnjE7FOIDOD7TYRGdrSP85OcIVaLmgusuma923h704RDnPs=";
// For now just dump the sent data to the db
$conn = mysqli_connect("localhost", "rentalpo_user", "5trongPass", "rentalpo_db");
$data = json_encode($_POST, JSON_PRETTY_PRINT);
$stmt = $conn->prepare("INSERT INTO temp_data (DATA) VALUES (?)");
$stmt->bind_param('s',$data);
$stmt->execute();

// Keys sent by lipisha
$initiate = ['api_key','api_signature','api_version','api_type(Initiate)','transaction','transaction_reference','transaction_type','transaction_country','transaction_method','transaction_date','transaction_currency','transaction_amount','transaction_paybill','transaction_paybill_type','transaction_account','transaction_account_number','transaction_account_name','transaction_merchant_reference','transaction_name','transaction_mobile','transaction_email','transaction_code','transaction_status'];

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