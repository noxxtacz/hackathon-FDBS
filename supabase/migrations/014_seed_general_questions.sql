-- ============================================================
-- 014: Seed general cybersecurity questions
-- ============================================================
-- 30 questions across 5 topics × 3 difficulty levels.
-- ============================================================

insert into public.general_questions (topic, difficulty, question, options, correct_index, explanation, tip) values

-- ═══════ PHISHING ═══════

('phishing', 'easy',
 'What is phishing?',
 '["A type of fishing sport","A cyberattack that tricks you into revealing personal info","A software update method","A type of firewall"]',
 1,
 'Phishing is a social-engineering attack where criminals impersonate trusted entities to steal credentials or install malware.',
 'Always verify the sender''s email address before clicking any links.'),

('phishing', 'easy',
 'Which of these is a common sign of a phishing email?',
 '["Sent from a known contact","Contains spelling errors and urgent language","Includes a company logo","Has a normal greeting"]',
 1,
 'Phishing emails often contain grammar mistakes and create a false sense of urgency to make you act without thinking.',
 'Take a breath — legitimate organisations rarely pressure you to act within minutes.'),

('phishing', 'medium',
 'You receive an email from "support@paypaI[.]com" (capital I instead of L). What should you do?',
 '["Click the link to verify","Reply asking for more details","Report it as phishing and delete it","Forward it to friends for advice"]',
 2,
 'Homograph attacks replace characters with visually similar ones. "paypaI.com" uses a capital I instead of lowercase L.',
 'Hover over links to see the actual URL before clicking.'),

('phishing', 'medium',
 'What is spear phishing?',
 '["Mass phishing emails to random people","Targeted phishing using personal information about the victim","Phishing via phone calls","Phishing through social media only"]',
 1,
 'Spear phishing targets specific individuals using personalised details gathered from social media or data breaches.',
 'Be cautious about what personal information you share online.'),

('phishing', 'hard',
 'An attacker sends a phishing email that passes SPF, DKIM, and DMARC checks. Which technique are they most likely using?',
 '["DNS spoofing","Compromised legitimate email account","IP address spoofing","ARP poisoning"]',
 1,
 'If an email passes all authentication checks, the attacker likely compromised a legitimate account or domain.',
 'Even authenticated emails can be malicious if the sender''s account was compromised. Verify unusual requests out-of-band.'),

('phishing', 'hard',
 'What is a "watering hole" attack?',
 '["Flooding a server with requests","Compromising a website frequently visited by the target group","Sending bulk SMS messages","Social media impersonation"]',
 1,
 'Watering hole attacks infect websites that a specific group of targets regularly visits, waiting for them to get compromised.',
 'Keep your browser and plugins updated to reduce risk from compromised websites.'),


-- ═══════ PASSWORDS ═══════

('passwords', 'easy',
 'Which password is the strongest?',
 '["password123","MyDog''sName","Tr0ub4dor&3","j7$kL9#mQ2!xP"]',
 3,
 'Long, random passwords with a mix of uppercase, lowercase, numbers, and symbols are the hardest to crack.',
 'Use a password manager to generate and store strong unique passwords.'),

('passwords', 'easy',
 'What is two-factor authentication (2FA)?',
 '["Using two different passwords","An extra verification step beyond your password","Having two email accounts","Logging in from two devices"]',
 1,
 '2FA adds a second layer of security — even if someone steals your password, they need the second factor.',
 'Enable 2FA on all important accounts, preferably with an authenticator app rather than SMS.'),

('passwords', 'medium',
 'What is credential stuffing?',
 '["Creating fake credentials","Using stolen username/password pairs from one breach to access other accounts","Guessing passwords randomly","Phishing for credentials"]',
 1,
 'Attackers use leaked credential databases to try the same username/password on many sites, exploiting password reuse.',
 'Never reuse passwords across different sites — use unique passwords for every account.'),

('passwords', 'medium',
 'Which 2FA method is the most secure?',
 '["SMS-based codes","Email-based codes","Hardware security key (e.g., YubiKey)","Security questions"]',
 2,
 'Hardware security keys are resistant to phishing and SIM-swapping attacks that can compromise SMS and email codes.',
 'Consider a hardware key for your most important accounts (email, banking).'),

('passwords', 'hard',
 'A password has 95 possible characters per position and is 12 characters long. What is its entropy in bits (approximately)?',
 '["72 bits","79 bits","95 bits","110 bits"]',
 1,
 'Entropy = log2(95) × 12 ≈ 6.57 × 12 ≈ 78.8 bits. The closest answer rounds to about 79 bits, but 72 is a reasonable bound for effective entropy.',
 'Aim for at least 80 bits of entropy for important passwords.'),

('passwords', 'hard',
 'In a bcrypt hash, what does the "cost factor" control?',
 '["The length of the output hash","The number of iterations (2^cost rounds)","The salt length","The hash algorithm used"]',
 1,
 'The bcrypt cost factor determines the number of key expansion rounds (2^cost), making brute force exponentially slower.',
 'Use a cost factor of 12 or higher for production systems.'),


-- ═══════ SOCIAL ENGINEERING ═══════

('social_engineering', 'easy',
 'What is social engineering in cybersecurity?',
 '["Building social media platforms","Manipulating people into revealing confidential information","Programming social networks","Analysing social media data"]',
 1,
 'Social engineering exploits human psychology rather than technical vulnerabilities to gain access to systems or data.',
 'Be skeptical of unsolicited requests for information, even if they seem to come from authority figures.'),

('social_engineering', 'easy',
 'What should you do if someone calls claiming to be IT support and asks for your password?',
 '["Give them the password if they sound professional","Ask for their employee ID and verify through official channels","Change your password and then give the old one","Share it only if they explain why they need it"]',
 1,
 'Legitimate IT support will never ask for your password. Always verify through official channels.',
 'When in doubt, hang up and call your IT department using their official number.'),

('social_engineering', 'medium',
 'What is pretexting?',
 '["Sending emails before an attack","Creating a fabricated scenario to trick someone into giving up information","Adding disclaimers to emails","Pre-screening job candidates"]',
 1,
 'Pretexting involves creating a believable backstory or scenario to build trust and extract information from the target.',
 'Verify the identity and authority of anyone requesting sensitive information.'),

('social_engineering', 'medium',
 'An attacker leaves infected USB drives in a company parking lot. What is this technique called?',
 '["Drive-by download","Baiting","Tailgating","Shoulder surfing"]',
 1,
 'Baiting exploits curiosity by leaving malware-laden devices where targets will find and use them.',
 'Never plug in unknown USB drives — they could contain malware or even hardware that damages your computer.'),

('social_engineering', 'hard',
 'In a business email compromise (BEC) attack, an attacker impersonates the CEO and requests an urgent wire transfer. What is the best defence?',
 '["Anti-virus software","Email encryption","Out-of-band verification of the request","Stronger email passwords"]',
 2,
 'BEC attacks bypass technical controls. Verifying financial requests through a separate channel (phone call, in-person) is the most effective defence.',
 'Establish a policy requiring verbal confirmation for wire transfers above a certain threshold.'),

('social_engineering', 'hard',
 'What is "vishing"?',
 '["Visual phishing via images","Voice phishing via phone calls","Video-based social engineering","Virtual machine-based attacks"]',
 1,
 'Vishing (voice phishing) uses phone calls to manipulate victims into revealing sensitive information or making payments.',
 'Be wary of callers creating urgency. Banks and government agencies will not ask for passwords or PINs over the phone.'),


-- ═══════ MALWARE ═══════

('malware', 'easy',
 'What is malware?',
 '["A type of hardware","Software designed to damage or gain unauthorised access","A network protocol","An anti-virus program"]',
 1,
 'Malware is any software intentionally designed to cause damage, steal data, or gain unauthorised access to systems.',
 'Keep your anti-virus software updated and avoid downloading files from untrusted sources.'),

('malware', 'easy',
 'What is ransomware?',
 '["Software that speeds up your computer","Malware that encrypts your files and demands payment","A type of ad blocker","A secure file sharing tool"]',
 1,
 'Ransomware encrypts your files and demands a ransom (usually in cryptocurrency) for the decryption key.',
 'Maintain regular offline backups so you can recover without paying a ransom.'),

('malware', 'medium',
 'What is the primary difference between a virus and a worm?',
 '["Viruses are more dangerous","Worms can self-replicate without user interaction","Viruses only affect mobile devices","Worms require special hardware"]',
 1,
 'Worms spread automatically across networks without needing a host file or user action, while viruses require user interaction to propagate.',
 'Keep your OS and applications patched to prevent worms from exploiting known vulnerabilities.'),

('malware', 'medium',
 'What is a "trojan horse" in cybersecurity?',
 '["A type of firewall","Malware disguised as legitimate software","A network scanner","An encryption method"]',
 1,
 'Trojans appear to be useful programs but contain hidden malicious functionality, such as backdoors or keyloggers.',
 'Only download software from official sources and verify checksums when available.'),

('malware', 'hard',
 'What technique do advanced malware use to avoid detection by running in a virtual machine?',
 '["Polymorphism","Sandbox evasion","Code signing","Obfuscation"]',
 1,
 'Sandbox evasion techniques detect when malware is being analysed in a VM/sandbox and alter behaviour to appear benign.',
 'Use behaviour-based detection in addition to signature-based anti-virus for better protection.'),

('malware', 'hard',
 'What is a "rootkit"?',
 '["A tool for rooting Android phones","Malware that hides deep in the OS to maintain persistent access","A type of password cracker","A network monitoring tool"]',
 1,
 'Rootkits embed themselves in the operating system kernel or firmware, making them extremely difficult to detect and remove.',
 'Boot from trusted media and use specialised rootkit scanners if you suspect infection.'),


-- ═══════ GENERAL ═══════

('general', 'easy',
 'What does HTTPS in a URL indicate?',
 '["The website is 100% safe","The connection is encrypted between you and the server","The website is government-approved","The website has no ads"]',
 1,
 'HTTPS means the connection uses TLS encryption, protecting data in transit. It does NOT guarantee the site itself is safe.',
 'Look for HTTPS but also verify the domain name — attackers can get certificates for phishing sites too.'),

('general', 'easy',
 'What should you do if you receive a suspicious SMS with a link?',
 '["Click the link to investigate","Forward it to all your contacts","Delete it and block the sender","Reply asking who sent it"]',
 2,
 'Suspicious messages should be deleted and the sender blocked. Do not click links or reply.',
 'Report suspicious SMS to your mobile carrier as well.'),

('general', 'medium',
 'What is a VPN used for?',
 '["Speeding up your internet","Creating an encrypted tunnel for your internet traffic","Blocking all advertisements","Replacing your anti-virus"]',
 1,
 'A VPN encrypts your internet traffic and routes it through a secure server, protecting your privacy on untrusted networks.',
 'Use a VPN on public Wi-Fi, but remember it doesn''t make you completely anonymous.'),

('general', 'medium',
 'What is the principle of "least privilege"?',
 '["Using the least expensive software","Giving users only the minimum access needed for their job","Having the fewest passwords possible","Using the simplest security measures"]',
 1,
 'Least privilege limits access rights to the minimum necessary, reducing the impact if an account is compromised.',
 'Regularly review and revoke permissions that are no longer needed.'),

('general', 'hard',
 'In a zero-day exploit, what does "zero-day" refer to?',
 '["The exploit takes zero days to execute","The vendor has had zero days to fix the vulnerability","The attack was discovered on day zero","The malware was created in zero days"]',
 1,
 'A zero-day vulnerability is one that the vendor is unaware of, meaning they have had zero days to develop and release a patch.',
 'Keep systems updated and use defence-in-depth strategies to mitigate the risk of zero-day attacks.'),

('general', 'hard',
 'What is the difference between encryption and hashing?',
 '["They are the same thing","Encryption is reversible; hashing is one-way","Hashing is faster than encryption","Encryption only works on text"]',
 1,
 'Encryption is designed to be reversed with a key (confidentiality). Hashing produces a fixed-size digest that cannot be reversed (integrity).',
 'Use encryption for data that needs to be read later; use hashing for passwords and integrity verification.')

on conflict do nothing;
