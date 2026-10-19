<?php
/**
 * Bilva Tech - Contact Form Server Configuration
 *
 * Keep this file private on the server.
 * To override settings without modifying this file, you can create a `contact-config.local.php`
 * or set corresponding environment variables in your server/hosting control panel.
 */

$config = [
    // -------------------------------------------------------------
    // Recipient Configuration (Client Handover)
    // -------------------------------------------------------------
    // Change this single email address during handover to direct all website enquiries.
    'recipient_email' => getenv('BILVA_RECIPIENT_EMAIL') ?: 'chinmaysganiga2005@gmail.com',
    'recipient_name'  => getenv('BILVA_RECIPIENT_NAME')  ?: 'Bilva Tech Inquiries',

    // -------------------------------------------------------------
    // SMTP Server Credentials
    // -------------------------------------------------------------
    // Supported providers:
    // - Gmail: Host 'smtp.gmail.com', Port 587 (tls) or 465 (ssl), use a 16-character Google App Password.
    // - cPanel / Hosting Mail: Host 'mail.yourdomain.com', Port 465 (ssl) or 587 (tls).
    // - Brevo / SendGrid / Postmark / Mailgun: Dedicated transactional SMTP account.
    'smtp_host'       => getenv('SMTP_HOST')       ?: 'smtp.gmail.com',
    'smtp_port'       => (int)(getenv('SMTP_PORT') ?: 587),
    'smtp_encryption' => getenv('SMTP_SECURE')     ?: 'tls', // 'tls' (587) or 'ssl' (465)
    'smtp_username'   => getenv('SMTP_USER')       ?: '',    // e.g. 'notifications@bilvatech.com' or Gmail address
    'smtp_password'   => getenv('SMTP_PASS')       ?: '',    // SMTP account password or Gmail App Password

    // Sender Identity (Must be an allowed sender on your SMTP account)
    'from_email'      => getenv('SMTP_FROM_EMAIL') ?: '',    // Leave empty to automatically use smtp_username
    'from_name'       => getenv('SMTP_FROM_NAME')  ?: 'Bilva Tech Enquiries',

    // Validation & Security Limits
    'max_name_length'    => 120,
    'max_phone_length'   => 40,
    'max_message_length' => 5000,
    'max_body_bytes'     => 65536, // 64 KB maximum POST body size
];

// Load local overrides if present (contact-config.local.php is excluded from Git)
$localConfigFile = __DIR__ . '/contact-config.local.php';
if (file_exists($localConfigFile)) {
    $localConfig = require $localConfigFile;
    if (is_array($localConfig)) {
        $config = array_merge($config, $localConfig);
    }
}

return $config;
