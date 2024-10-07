# CTFCRB2024

### **Web Framework Vulnerabilities Room Overview:**

The room focuses on common vulnerabilities within modern web applications, especially those built using popular web frameworks. Here’s a step-by-step breakdown of the topics and objectives covered.

#### **1. Session Modification:**

**Concept:**  
Session management is critical for maintaining user authentication and interaction across different pages. A session is established when a user logs into a web application, and it is identified by a session token (often a cookie).

**Key Vulnerabilities:**  
- **Session Fixation:** This occurs when an attacker can set or control the session ID before the user authenticates.
- **Session Hijacking:** This involves intercepting or guessing a user’s session token to gain unauthorized access to their session.

**Tasks:**
- Use session cookies to hijack or manipulate user sessions.
- Test if the application is vulnerable by logging into different accounts using fixed session identifiers.
  
**Exploitation Tips:**
- **Session Fixation:** Try forcing a session ID via URL parameters or cookies before authentication.
- **Session Hijacking:** Use tools like Burp Suite to capture and reuse session cookies after logging out as a victim user.

---

#### **2. SQL Injection:**

**Concept:**  
SQL Injection is one of the most widespread and dangerous vulnerabilities, where an attacker injects malicious SQL code into queries made to a database.

**Key Vulnerabilities:**  
- **Classic SQL Injection:** Directly inserting SQL code through input fields (e.g., login forms, search bars).
- **Blind SQL Injection:** In this case, the application does not directly return SQL query results, but clues can be derived from error messages or response behavior.
  
**Tasks:**
- Find vulnerable input points (e.g., login forms, query strings).
- Execute SQL queries to retrieve data like usernames, passwords, or admin credentials.

**Exploitation Tips:**
- For simple cases, use `' OR 1=1 --` or `admin' --` to bypass login forms.
- For blind SQL injections, use timing attacks (`SLEEP`) or Boolean-based queries (e.g., `AND 1=1`, `AND 1=2`).
- Use tools like **SQLmap** to automate SQLi testing and exploit data retrieval.

---

#### **3. DOM-Based XSS (Cross-Site Scripting):**

**Concept:**  
DOM-Based XSS occurs entirely on the client side (within the browser) when an attacker can manipulate the Document Object Model (DOM) to execute malicious scripts.

**Key Vulnerabilities:**  
- **Client-Side JavaScript Manipulation:** Vulnerable code can execute attacker-controlled input, causing the browser to run malicious scripts.
  
**Tasks:**
- Identify how user input is handled in the client-side code (JavaScript).
- Inject scripts that could execute on another user's browser when they load the manipulated page.

**Exploitation Tips:**
- Review the page’s source code to find places where untrusted data is dynamically inserted into the DOM (e.g., `innerHTML`, `document.write`).
- Inject payloads like `<script>alert(1)</script>` or more advanced scripts that exfiltrate cookies, tokens, or other sensitive data.
- Tools like **Burp Suite** or browser developer tools can help you intercept and modify client-side requests and responses.

---

#### **4. JWT Authentication:**

**Concept:**  
JSON Web Tokens (JWT) are commonly used for user authentication in modern web applications. A JWT typically consists of a header, payload, and signature, and is used to verify the authenticity of the token.

**Key Vulnerabilities:**
- **Weak Signature Algorithms:** Using weak algorithms like `None` or poorly implemented `HS256` can allow attackers to forge or manipulate tokens.
- **Token Tampering:** If the JWT is not properly signed or verified, an attacker could tamper with it to escalate privileges or impersonate another user.

**Tasks:**
- Identify JWT tokens used in the application.
- Try modifying the payload (e.g., changing `user_role` to `admin`) and see if the server validates it.
- Look for weak signing algorithms or missing verification checks.

**Exploitation Tips:**
- Decode JWT tokens using online tools (JWT.io) or local scripts to inspect their contents.
- If the `alg` field is set to `None`, try removing the signature and passing the token as-is.
- For HMAC-based tokens, attempt to brute-force or guess the secret key used to sign the token (try common keys like "secret", "admin").
- Use tools like **JWT Cracker** to automate key cracking for weak tokens.

---

### **General Tools You May Use:**
- **Burp Suite** for intercepting requests, modifying parameters, and testing injection points.
- **SQLmap** for automating SQL injection attacks.
- **Developer tools (Browser DevTools)** for analyzing DOM-based vulnerabilities and client-side scripting.
- **JWT.io** for decoding JWTs and analyzing token content.
  
---

### **Summary of Objectives:**
By completing this room, you'll gain practical hands-on experience with common web vulnerabilities:
- **Session Management Issues** like fixation and hijacking.
- **SQL Injection** for database compromise.
- **DOM-Based XSS** to exploit client-side scripts.
- **JWT Manipulation** to bypass authentication mechanisms.

This room will enhance your skills in identifying and exploiting weaknesses within web frameworks, giving you a better understanding of how to defend web applications against such attacks.

Get ready to sharpen your skills and dive deep into the world of web application security!
