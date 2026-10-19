<?php
/**
 * Local Contact Configuration Example
 *
 * Copy this file to `contact-config.local.php` and fill in your actual credentials.
 * `contact-config.local.php` is ignored by Git to keep passwords secure.
 */

return [
    // Recipient email address for enquiries
    'recipient_email' => 'chinmaysganiga2005@gmail.com',
    'recipient_name'  => 'Bilva Tech Inquiries',

    // SMTP Credentials
    'smtp_host'       => 'smtp.gmail.com',
    'smtp_port'       => 587,
    'smtp_encryption' => 'tls', // 'tls' for 587 or 'ssl' for 465
    'smtp_username'   => 'your-email@gmail.com',
    'smtp_password'   => 'your-16-character-app-password',

    // Sender details
    'from_email'      => 'your-email@gmail.com',
    'from_name'       => 'Bilva Tech Website',
];
