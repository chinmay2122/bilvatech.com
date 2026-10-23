<?php
/**
 * Bilva Tech - Contact Enquiry Submission Endpoint
 *
 * Handles form validation, spam protection, HTML email rendering,
 * and authenticated SMTP dispatch using PHPMailer.
 */

// 1. Set JSON response header & CORS headers
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 2. Load Configuration and Autoloader
$baseDir = dirname(__DIR__);
$configFile = $baseDir . '/contact-config.php';
$autoloader = $baseDir . '/vendor/autoload.php';

if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server configuration missing: contact-config.php not found.'
    ]);
    exit;
}

$config = require $configFile;

if (!file_exists($autoloader)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'PHPMailer dependency missing. Please run composer install on the server.'
    ]);
    exit;
}

require_once $autoloader;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Provide a friendly status check on GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $hasSmtpUser = !empty($config['smtp_username']);
    $hasSmtpPass = !empty($config['smtp_password']);
    $isConfigured = $hasSmtpUser && $hasSmtpPass;

    http_response_code(200);
    echo json_encode([
        'service'          => 'Bilva Tech Contact API',
        'status'           => 'online',
        'smtp_configured'  => $isConfigured,
        'recipient_email'  => $config['recipient_email'] ?? 'Not set',
        'smtp_host'        => $config['smtp_host'] ?? 'Not set',
        'smtp_port'        => $config['smtp_port'] ?? 'Not set',
    ]);
    exit;
}

// Only allow POST for submissions
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed. Submissions must use POST.'
    ]);
    exit;
}

// 3. Enforce Request Size Limit
$maxBytes = (int)($config['max_body_bytes'] ?? 65536);
$contentLength = isset($_SERVER['CONTENT_LENGTH']) ? (int)$_SERVER['CONTENT_LENGTH'] : 0;
if ($contentLength > $maxBytes) {
    http_response_code(413);
    echo json_encode([
        'success' => false,
        'message' => 'Payload too large. Maximum allowed size is ' . round($maxBytes / 1024) . 'KB.'
    ]);
    exit;
}

// 4. Parse Submission Data (Support both JSON and Form-Encoded)
$rawInput = file_get_contents('php://input');
$data = [];

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== false) {
    $parsed = json_decode($rawInput, true);
    if (is_array($parsed)) {
        $data = $parsed;
    }
}

if (empty($data)) {
    $data = $_POST;
}

// 5. Spam Protection: Honeypot Detection
// If hidden honeypot fields are filled, silently drop the submission without sending an email.
$honeypotFields = ['_gotcha', 'website', 'honeypot', 'company_fax'];
foreach ($honeypotFields as $trap) {
    if (!empty($data[$trap])) {
        // Return success response to fool spam bots
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Thank you! Your enquiry has been received.'
        ]);
        exit;
    }
}

// 6. Backend Field Sanitization & Validation
$name    = isset($data['name']) ? trim(strip_tags((string)$data['name'])) : '';
$phone   = isset($data['phone']) ? trim(strip_tags((string)$data['phone'])) : '';
$email   = isset($data['email']) ? trim((string)$data['email']) : '';
$message = isset($data['message']) ? trim(strip_tags((string)$data['message'])) : '';

$maxNameLength    = (int)($config['max_name_length'] ?? 120);
$maxPhoneLength   = (int)($config['max_phone_length'] ?? 40);
$maxMessageLength = (int)($config['max_message_length'] ?? 5000);

// Validate Name
if ($name === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'field' => 'name', 'message' => 'Please enter your name.']);
    exit;
}
if (mb_strlen($name) > $maxNameLength) {
    http_response_code(422);
    echo json_encode(['success' => false, 'field' => 'name', 'message' => "Name cannot exceed {$maxNameLength} characters."]);
    exit;
}

// Validate Phone
if ($phone === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'field' => 'phone', 'message' => 'Please enter your mobile number.']);
    exit;
}
if (mb_strlen($phone) > $maxPhoneLength || !preg_match('/^[0-9+\-\s()]{6,40}$/', $phone)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'field' => 'phone', 'message' => 'Please enter a valid mobile number (digits, optional country code +, dashes, spaces).']);
    exit;
}

// Validate Email & Prevent Header Injection
if ($email === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'field' => 'email', 'message' => 'Please enter your email address.']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 254 || preg_match("/[\r\n]/", $email)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'field' => 'email', 'message' => 'Please enter a valid email address.']);
    exit;
}

// Validate Enquiry Message
if ($message === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'field' => 'message', 'message' => 'Please share details about your enquiry.']);
    exit;
}
if (mb_strlen($message) < 5) {
    http_response_code(422);
    echo json_encode(['success' => false, 'field' => 'message', 'message' => 'Enquiry message is too short. Please provide more details.']);
    exit;
}
if (mb_strlen($message) > $maxMessageLength) {
    http_response_code(422);
    echo json_encode(['success' => false, 'field' => 'message', 'message' => "Enquiry message cannot exceed {$maxMessageLength} characters."]);
    exit;
}

// 7. Verify SMTP Configuration Before Attempting Transmission
$smtpHost = trim((string)($config['smtp_host'] ?? ''));
$smtpPort = (int)($config['smtp_port'] ?? 587);
$smtpUser = trim((string)($config['smtp_username'] ?? ''));
$smtpPass = trim((string)($config['smtp_password'] ?? ''));
$smtpSecure = strtolower(trim((string)($config['smtp_encryption'] ?? 'tls')));
$recipientEmail = trim((string)($config['recipient_email'] ?? ''));
$recipientName = trim((string)($config['recipient_name'] ?? 'Bilva Tech Inquiries'));

if (empty($smtpUser) || empty($smtpPass)) {
    http_response_code(503);
    echo json_encode([
        'success'          => false,
        'error_code'       => 'SMTP_NOT_CONFIGURED',
        'message'          => 'SMTP credentials are not configured on the server yet. Please add your SMTP username and password in contact-config.php or contact-config.local.php.',
        'recipient_target' => $recipientEmail,
    ]);
    exit;
}

if (empty($recipientEmail) || !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error_code' => 'INVALID_RECIPIENT',
        'message' => 'Server error: Invalid recipient email in contact-config.php.'
    ]);
    exit;
}

// 8. Timestamps
$nowUtc = new DateTime('now', new DateTimeZone('UTC'));
$utcString = $nowUtc->format('d M Y, H:i') . ' UTC';

$nowIst = clone $nowUtc;
$nowIst->setTimezone(new DateTimeZone('Asia/Kolkata'));
$istString = $nowIst->format('d M Y, h:i A') . ' IST';
$submissionTimestamp = "{$istString} ({$utcString})";

// 9. Render Branded HTML Email Template
$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safePhone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
$safeTimestamp = htmlspecialchars($submissionTimestamp, ENT_QUOTES, 'UTF-8');

$htmlEmail = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Contact Enquiry — Bilva Tech</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e8e2dc; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b0b0d; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #141417; border: 1px solid #26262b; border-radius: 8px; overflow: hidden;">
          
          <!-- Header with Dark Brand Accent -->
          <tr>
            <td style="padding: 32px 36px 24px 36px; background: linear-gradient(180deg, #18181c 0%, #141417 100%); border-bottom: 1px solid #232328;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #a49f98; margin-bottom: 6px;">
                      BILVA TECH BUSINESS SOLUTIONS
                    </div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: -0.01em;">
                      New Contact Enquiry
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Meta Summary Strip -->
          <tr>
            <td style="padding: 14px 36px; background-color: #0e0e11; border-bottom: 1px solid #202025; font-size: 12px; color: #87827b;">
              Submitted on: <strong style="color: #c9c4be;">{$safeTimestamp}</strong>
            </td>
          </tr>

          <!-- Content Fields -->
          <tr>
            <td style="padding: 32px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                
                <!-- Name -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #87827b; margin-bottom: 4px;">
                      Name
                    </div>
                    <div style="font-size: 16px; font-weight: 500; color: #ffffff;">
                      {$safeName}
                    </div>
                  </td>
                </tr>

                <!-- Mobile Number -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #87827b; margin-bottom: 4px;">
                      Mobile Number
                    </div>
                    <div style="font-size: 15px; color: #ffffff;">
                      <a href="tel:{$safePhone}" style="color: #ffffff; text-decoration: none;">{$safePhone}</a>
                    </div>
                  </td>
                </tr>

                <!-- Email Address -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #87827b; margin-bottom: 4px;">
                      Email Address
                    </div>
                    <div style="font-size: 15px; color: #ffffff;">
                      <a href="mailto:{$safeEmail}" style="color: #ffffff; text-decoration: underline;">{$safeEmail}</a>
                    </div>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="border-top: 1px solid #232328; padding-top: 24px; padding-bottom: 8px;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #87827b; margin-bottom: 8px;">
                      Enquiry Message
                    </div>
                    <div style="background-color: #0b0b0d; border: 1px solid #26262b; border-radius: 6px; padding: 18px 20px; font-size: 14px; line-height: 1.6; color: #eae5df;">
                      {$safeMessage}
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Direct Reply Action Callout -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #19191d; border: 1px dashed #303036; border-radius: 6px;">
                <tr>
                  <td style="padding: 14px 18px; font-size: 12px; color: #a49f98; line-height: 1.5;">
                    💡 <strong>Quick Reply:</strong> Clicking <em>Reply</em> in your email client will respond directly to <strong>{$safeEmail}</strong>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 22px 36px; background-color: #0e0e11; border-top: 1px solid #202025; text-align: center;">
              <div style="font-size: 12px; color: #6b6762; margin-bottom: 4px;">
                Bilva Tech Business Solutions — Secure Systems Architecture
              </div>
              <div style="font-size: 11px; color: #524f4b;">
                This notification was dispatched automatically by the Bilva Tech website contact form.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

// 10. Render Plain Text Alternative
$textEmail = <<<TEXT
BILVA TECH — NEW CONTACT ENQUIRY
=========================================

Submission Time: {$submissionTimestamp}

VISITOR DETAILS
-----------------------------------------
Name:          {$name}
Mobile Number: {$phone}
Email Address: {$email}

ENQUIRY MESSAGE
-----------------------------------------
{$message}

=========================================
You can reply directly to this email to respond to {$name} ({$email}).
Dispatched by Bilva Tech website contact form.
TEXT;

// 11. Dispatch Email via PHPMailer
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = $smtpHost;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtpUser;
    $mail->Password   = $smtpPass;
    $mail->Port       = $smtpPort;
    $mail->CharSet    = 'UTF-8';

    if ($smtpSecure === 'ssl') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } else {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    }

    // Sender identity
    $fromEmail = !empty($config['from_email']) ? trim($config['from_email']) : $smtpUser;
    $fromName  = !empty($config['from_name']) ? trim($config['from_name']) : 'Bilva Tech Website';
    $mail->setFrom($fromEmail, $fromName);

    // Recipient & Reply-To
    $mail->addAddress($recipientEmail, $recipientName);
    $mail->addReplyTo($email, $name);

    // Email Content
    $mail->isHTML(true);
    $mail->Subject = 'New Contact Enquiry: ' . $name . ' | Bilva Tech';
    $mail->Body    = $htmlEmail;
    $mail->AltBody = $textEmail;

    // Send
    $mail->send();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Thank you! Your enquiry has been received. Our team will review your requirements and respond shortly.'
    ]);
} catch (Exception $e) {
    // Catch PHPMailer / SMTP Exceptions
    $rawError = $mail->ErrorInfo ?: $e->getMessage();
    error_log("BilvaTech Contact SMTP Error: " . $rawError);

    http_response_code(500);
    echo json_encode([
        'success'    => false,
        'error_code' => 'SMTP_TRANSMISSION_FAILED',
        'message'    => 'Unable to deliver your enquiry at this moment due to a mail server connection issue. Please try again or reach out to us directly.',
        'details'    => $rawError
    ]);
}
